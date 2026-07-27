"use client";

import { useState } from "react";
import { AIChatPanel } from "./ai-assistant-chat";

export function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-ms-red px-5 py-3 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:bg-ms-red-dark hover:scale-105 hover:shadow-2xl active:scale-100"
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <span>?Any question</span>
      </button>

      {/* Chat panel */}
      {isOpen && <AIChatPanel onClose={() => setIsOpen(false)} />}
    </>
  );
}

