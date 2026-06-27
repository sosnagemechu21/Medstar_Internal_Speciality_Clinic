import { getMessages } from "next-intl/server";

export default async function HomePage() {
  // Fetch translation tokens securely on the server
  const messages: any = await getMessages();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="max-w-xl p-8 bg-card rounded-xl border shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          {messages.welcome}
        </h1>
        <p className="text-muted-foreground mb-6">
          Medstar Clinic Website Enhancement Foundations Operational.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors">
            {messages.bookNow}
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors">
            {messages.portal}
          </button>
        </div>
      </div>
    </div>
  );
}
