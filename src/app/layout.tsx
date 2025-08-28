import { Inconsolata } from "next/font/google";
import { Toaster } from "@/components/sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import { CalendarProvider } from "@/components/calendar-context";
import { PomodoroProvider } from "@/contexts/pomodoro-context";
import { Metadata } from "next";
import "./globals.css";

const fontSans = Inconsolata({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const fontMono = Inconsolata({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Flowly - CRM Dashboard",
  description: "A modern CRM dashboard for managing customer relationships",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} bg-sidebar font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PomodoroProvider>
            <CalendarProvider>{children}</CalendarProvider>
          </PomodoroProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
