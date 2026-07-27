"use client";

import dynamic from "next/dynamic";

const AIAssistantButton = dynamic(
  () => import("./ai-assistant-button").then((mod) => ({ default: mod.AIAssistantButton })),
  { ssr: false }
);

export function AIAssistantProvider() {
  return <AIAssistantButton />;
}

