import "../../app/globals.css"
import { AuthProvider } from "@/providers/auth-provider"
import { AIAssistantButton } from "@/components/ai-assistant/ai-assistant-button"
import { resolveLocale } from "@/lib/i18n-utils"

const metadataDict = {
  en: {
    title: "Medstar Specialty Clinic — Your Health Matters",
    description: "Book specialist appointments at Medstar Specialty Clinic, Addis Ababa. World-class care, compassionate doctors, instant online booking.",
  },
  am: {
    title: "የሜድስታር ስፔሻሊቲ ክሊኒክ — ጤናዎ ቅድሚያ የሚሰጠው ጉዳይ ነው",
    description: "በአዲስ አበባ በሚገኘው ሜድስታር ስፔሻሊቲ ክሊኒክ ከልዩ ባለሙያዎች ጋር ቀጠሮ ይያዙ።",
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const resolvedParams = await params
  const locale = resolveLocale(resolvedParams?.locale)
  const meta = metadataDict[locale as keyof typeof metadataDict] || metadataDict.en

  return (
    <html lang={locale} dir={locale === "am" ? "ltr" : "ltr"}>
      <head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans bg-background text-foreground antialiased">
        <AuthProvider>
          {children}
          <AIAssistantButton />
        </AuthProvider>
      </body>
    </html>
  )
}