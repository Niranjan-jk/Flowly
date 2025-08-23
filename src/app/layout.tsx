import { Architects_Daughter } from "next/font/google";
import { Toaster } from "@/components/sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import { CalendarProvider } from "@/components/calendar-context";
import { Metadata } from "next";
import "./globals.css";

const fontSans = Architects_Daughter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400"],
});

const fontMono = Architects_Daughter({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
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
          <CalendarProvider>{children}</CalendarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
