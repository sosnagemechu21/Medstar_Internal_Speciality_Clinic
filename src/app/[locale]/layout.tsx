import { Inter, Merriweather } from "next/font/google"
import "../../app/globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["700"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
})

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <html lang={locale} className={`${inter.variable} ${merriweather.variable}`}>
      <head>
        <title>Medstar Specialty Clinic — Your Health Matters</title>
        <meta
          name="description"
          content="Book specialist appointments at Medstar Specialty Clinic, Addis Ababa. World-class care, compassionate doctors, instant online booking."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
