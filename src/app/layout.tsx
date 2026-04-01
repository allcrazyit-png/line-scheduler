import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
    title: "LINE 訊息排程器",
    description: "LINE Business 訊息自動排程發送管理系統",
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-TW" suppressHydrationWarning>
            <head>
                <meta name="theme-color" content="#06C755" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) document.documentElement.classList.add('dark');
                } catch(e) {}
              })();
            `,
                    }}
                />
            </head>
            <body className="antialiased">
                <ThemeProvider>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto relative">
                        <main className="pb-20">{children}</main>
                        <BottomNav />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
