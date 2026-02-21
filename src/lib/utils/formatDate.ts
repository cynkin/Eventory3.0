/**
 * Formats an ISO date string to a short, human-readable format.
 * Example: "2025-07-23" → "Wed, 23 Jul"
 */
export function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const weekday = date.toLocaleString('en-US', { weekday: 'short' });
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });

    return `${weekday}, ${day} ${month}`;
}
