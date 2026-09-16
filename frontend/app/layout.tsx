import type { Metadata } from "next"
import "./globals.css"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Sunborne",
  description: "RPG Strategic Board Card Game for Web Browsers",
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers()
  const language = headersList.get('accept-language')
  const userLanguage = language?.split(',')[0] || 'en-US'

  return (
    <html lang={userLanguage}>
      <body className='antialiased min-h-dvh w-dvw flex flex-col justify-center items-center overflow-x-hidden'>
        {children}
      </body>
    </html>
  )
}