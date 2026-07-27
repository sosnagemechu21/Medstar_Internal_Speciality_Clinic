import "../../app/globals.css"
import { AuthProvider } from "@/providers/auth-provider"
import { AIAssistantProvider } from "@/components/ai-assistant/ai-assistant-provider"

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <html lang={locale}>
      <head>
        <title>Medstar Specialty Clinic — Your Health Matters</title>
        <meta
          name="description"
          content="Book specialist appointments at Medstar Specialty Clinic, Addis Ababa. World-class care, compassionate doctors, instant online booking."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans bg-background text-foreground antialiased">
        <AuthProvider>
          {children}
          <AIAssistantProvider />
        </AuthProvider>
      </body>
    </html>
  )
}
