package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// --- Config ---

const holdDuration = 60 * time.Second

var (
	nextjsURL      = getenv("NEXTJS_URL", "http://localhost:3000")
	internalSecret = getenv("WS_INTERNAL_SECRET", "")
	port           = getenv("PORT", "4000")
)

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// --- Message protocol ---

type Msg struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

func msg(typ string, payload any) []byte {
	p, _ := json.Marshal(payload)
	b, _ := json.Marshal(Msg{Type: typ, Payload: p})
	return b
}

// --- Client ---

type Client struct {
	conn   *websocket.Conn
	mu     sync.Mutex
	userId string
}

func (c *Client) send(data []byte) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.conn.WriteMessage(websocket.TextMessage, data)
}

// --- Global state ---

type Hold struct {
	client *Client
	timer  *time.Timer
}

var (
	state sync.RWMutex
	// slotId → seatCode → Hold
	holdsBySlot = map[string]map[string]*Hold{}
	// slotId → set of clients in that room
	rooms = map[string]map[*Client]bool{}
)

func broadcast(slotId string, sender *Client, data []byte) {
	state.RLock()
	defer state.RUnlock()
	for c := range rooms[slotId] {
		if c != sender {
			c.send(data)
		}
	}
}

func broadcastAll(slotId string, data []byte) {
	state.RLock()
	defer state.RUnlock()
	for c := range rooms[slotId] {
		c.send(data)
	}
}

func releaseSeat(slotId, code string, notify bool) {
	state.Lock()
	slotMap := holdsBySlot[slotId]
	if slotMap == nil {
		state.Unlock()
		return
	}
	h, ok := slotMap[code]
	if !ok {
		state.Unlock()
		return
	}
	if h.timer != nil {
		h.timer.Stop()
	}
	delete(slotMap, code)
	userId := h.client.userId
	state.Unlock()

	if notify {
		broadcastAll(slotId, msg("seat:deleted", map[string]string{"userId": userId}))
	} else {
		broadcastAll(slotId, msg("seat:unlocked", map[string]any{"code": code, "slotId": slotId}))
	}
}

func removeClient(c *Client) {
	state.Lock()
	// Release all holds by this client
	var toRelease [][2]string
	for slotId, slotMap := range holdsBySlot {
		for code, h := range slotMap {
			if h.client == c {
				if h.timer != nil {
					h.timer.Stop()
				}
				delete(slotMap, code)
				toRelease = append(toRelease, [2]string{slotId, code})
			}
		}
	}
	// Remove from all rooms
	for _, clients := range rooms {
		delete(clients, c)
	}
	state.Unlock()

	for _, pair := range toRelease {
		broadcastAll(pair[0], msg("seat:unlocked", map[string]any{"code": pair[1], "slotId": pair[0]}))
	}
}

// --- Booking API call ---

func confirmBooking(userId, slotId string, seats []string, amount float64) (map[string]any, error) {
	body, _ := json.Marshal(map[string]any{
		"userId":        userId,
		"slotId":        slotId,
		"selectedSeats": seats,
		"amount":        amount,
	})
	req, _ := http.NewRequest("POST", nextjsURL+"/api/booking/movie", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-Secret", internalSecret)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result map[string]any
	json.NewDecoder(resp.Body).Decode(&result)

	if resp.StatusCode != 200 {
		if errMsg, ok := result["error"].(string); ok {
			return nil, fmt.Errorf("%s", errMsg)
		}
		return nil, fmt.Errorf("booking failed (status %d)", resp.StatusCode)
	}
	return result, nil
}

// --- WebSocket handler ---

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // CORS handled by Next.js
}

func handleConn(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	client := &Client{conn: conn}
	defer func() {
		removeClient(client)
		conn.Close()
		log.Println("Disconnected:", conn.RemoteAddr())
	}()
	log.Println("Connected:", conn.RemoteAddr())

	for {
		_, raw, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var m Msg
		if err := json.Unmarshal(raw, &m); err != nil {
			continue
		}

		switch m.Type {

		case "auth:user":
			var userId string
			json.Unmarshal(m.Payload, &userId)
			client.userId = userId

		case "join-room":
			var p struct{ SlotId string `json:"slotId"` }
			json.Unmarshal(m.Payload, &p)
			slotId := p.SlotId

			state.Lock()
			if rooms[slotId] == nil {
				rooms[slotId] = map[*Client]bool{}
			}
			rooms[slotId][client] = true
			// Collect currently held seats
			var held []string
			for code := range holdsBySlot[slotId] {
				held = append(held, code)
			}
			state.Unlock()

			client.send(msg("seats:init-held", map[string]any{"slotId": slotId, "heldSeats": held}))

		case "seat:select":
			var p struct {
				Code   string `json:"code"`
				SlotId string `json:"slotId"`
			}
			json.Unmarshal(m.Payload, &p)
			if client.userId == "" || p.Code == "" || p.SlotId == "" {
				continue
			}

			state.Lock()
			if holdsBySlot[p.SlotId] == nil {
				holdsBySlot[p.SlotId] = map[string]*Hold{}
			}
			if _, exists := holdsBySlot[p.SlotId][p.Code]; exists {
				state.Unlock()
				continue // already held
			}
			h := &Hold{client: client}
			holdsBySlot[p.SlotId][p.Code] = h
			state.Unlock()

			// TTL: auto-release after holdDuration
			h.timer = time.AfterFunc(holdDuration, func() {
				releaseSeat(p.SlotId, p.Code, true)
			})

			broadcast(p.SlotId, client, msg("seat:locked", map[string]any{"code": p.Code, "slotId": p.SlotId}))

		case "seat:unselect":
			var p struct {
				Code   string `json:"code"`
				SlotId string `json:"slotId"`
			}
			json.Unmarshal(m.Payload, &p)
			releaseSeat(p.SlotId, p.Code, false)

		case "seat:confirm":
			var p struct {
				SlotId        string   `json:"slotId"`
				Amount        float64  `json:"amount"`
				SelectedSeats []string `json:"selectedSeats"`
			}
			json.Unmarshal(m.Payload, &p)
			userId := client.userId

			if userId == "" || len(p.SelectedSeats) == 0 || p.Amount <= 0 {
				client.send(msg("seat:confirm:error", map[string]any{"errors": []string{"Invalid request"}}))
				continue
			}

			// Validate that this client holds all selected seats
			state.RLock()
			var errs []string
			for _, code := range p.SelectedSeats {
				h, ok := holdsBySlot[p.SlotId][code]
				if !ok || h.client != client {
					errs = append(errs, fmt.Sprintf("Seat %s is not held by you", code))
				}
			}
			state.RUnlock()

			if len(errs) > 0 {
				client.send(msg("seat:confirm:error", map[string]any{"errors": errs}))
				continue
			}

			// Call Next.js to run the DB transaction
			result, err := confirmBooking(userId, p.SlotId, p.SelectedSeats, p.Amount)
			if err != nil {
				client.send(msg("seat:confirm:error", map[string]any{"errors": []string{err.Error()}}))
				continue
			}

			// Clear holds for booked seats
			state.Lock()
			for _, code := range p.SelectedSeats {
				if h, ok := holdsBySlot[p.SlotId][code]; ok {
					h.timer.Stop()
					delete(holdsBySlot[p.SlotId], code)
				}
			}
			state.Unlock()

			// Broadcast seat:booked to everyone in the room
			for _, code := range p.SelectedSeats {
				broadcastAll(p.SlotId, msg("seat:booked", map[string]any{"code": code, "slotId": p.SlotId}))
			}

			client.send(msg("seat:confirm:success", result))
		}
	}
}

func main() {
	http.HandleFunc("/ws", handleConn)
	addr := ":" + port
	log.Printf("Go WebSocket server listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}
