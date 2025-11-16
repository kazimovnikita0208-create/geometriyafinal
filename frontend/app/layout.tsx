import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
