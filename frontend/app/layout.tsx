import type { Metadata } from "next";
import "./globals.css";
import BottomNavigation from "@/components/BottomNavigation";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Геометрия - Студия танцев",
  description: "Запись на занятия по танцам и растяжке",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </head>
      <body className="antialiased bg-gradient-to-br from-black via-purple-950 to-black bg-fixed">
        <AuthProvider>
          {children}
          <BottomNavigation />
        </AuthProvider>
      </body>
    </html>
  );
}
