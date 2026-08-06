import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/app/context/AuthContext"
import { ToastProvider } from "@/app/context/ToastContext"
import { ThemeProvider } from "@/app/context/ThemeContext"
import { RouteProgress } from "@/app/components/navigation/RouteProgress"

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "GSU - General Services Unit",
  description: "Job Request System for GSU",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem("gsu-theme")==="dark"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${dmSans.variable} antialiased`}>
        <RouteProgress />
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}