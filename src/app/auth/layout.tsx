'use client';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return (
        <main>
            <div className="flex justify-center items-center">
                <div className="w-[460px]">
                    <div className="flex flex-col items-center ">
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
}
