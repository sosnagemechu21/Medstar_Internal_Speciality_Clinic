"use client";

import { useState, useRef, useEffect } from "react";
import { brochureData, type BrochureData } from "@/data/brochure";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function searchKnowledgeBase(query: string, data: BrochureData): string {
  const q = query.toLowerCase().trim();

  // Check for introduction
  if (
    q.includes("introduction") ||
    q.includes("about") ||
    q.includes("what is") ||
    q.includes("tell me about the clinic") ||
    q.includes("clinic")
  ) {
    return data.introduction.text;
  }

  // Check for mission
  if (
    q.includes("mission") ||
    q.includes("goal") ||
    q.includes("purpose")
  ) {
    return data.mission.text;
  }

  // Check for vision
  if (
    q.includes("vision") ||
    q.includes("future") ||
    q.includes("aspire")
  ) {
    return data.vision.text;
  }

  // Check for working hours / 24 hours
  if (
    q.includes("hour") ||
    q.includes("24") ||
    q.includes("open") ||
    q.includes("weekend") ||
    q.includes("time")
  ) {
    return "MED-STAR is open 24 hours and 7 days a week, including weekends and holidays.";
  }

  // Check for address / location / contact
  if (
    q.includes("address") ||
    q.includes("location") ||
    q.includes("where") ||
    q.includes("contact") ||
    q.includes("phone") ||
    q.includes("telephone") ||
    q.includes("email") ||
    q.includes("find")
  ) {
    return `Location: ${data.whyDifferent.address.location}\nTelephone: ${data.whyDifferent.address.telephone}\nEmail: ${data.whyDifferent.address.email}`;
  }

  // Check for services / laboratory
  if (
    q.includes("service") ||
    q.includes("laboratory") ||
    q.includes("lab") ||
    q.includes("diagnostic") ||
    q.includes("test") ||
    q.includes("radiology") ||
    q.includes("x-ray") ||
    q.includes("ultrasound") ||
    q.includes("doppler") ||
    q.includes("endoscopy") ||
    q.includes("colonoscopy") ||
    q.includes("eeg") ||
    q.includes("spirometry") ||
    q.includes("ecg") ||
    q.includes("emg") ||
    q.includes("ncs")
  ) {
    return `MED-STAR offers the following services:\n\nGeneral Services:\n- Inpatient & Outpatient Care\n- Advanced Diagnostic Laboratory:\n  • Bacteriology And Parasitology\n  • Chemistry And Electrolytes\n  • Cancer markers and hormonal assay\n  • Pathology Cytology And Histology\n- Diagnostic Radiology:\n  • Colour Doppler Ultrasound And Echocardiography\n  • Digital X-Ray\n  • HSG CUG And IVP\n  • Video Endoscopy And Colonoscopy\n  • EEG and Spirometry Test\n\nAdditional Services:\n${data.whyDifferent.additionalServices.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
  }

  // Check for specialty / specialist / doctor
  if (
    q.includes("specialty") ||
    q.includes("specialist") ||
    q.includes("cardiology") ||
    q.includes("neurology") ||
    q.includes("nephrology") ||
    q.includes("pulmonology") ||
    q.includes("endocrinology") ||
    q.includes("gastroenterology") ||
    q.includes("dermatology") ||
    q.includes("urology") ||
    q.includes("gynecology") ||
    q.includes("psychology") ||
    q.includes("pathology") ||
    q.includes("physiotherapy") ||
    q.includes("hepatology")
  ) {
    return `MED-STAR offers the following specialty services:\n${data.whyDifferent.specialtyServices.join(", ")}\n\nWe have the following specialists available:\n${data.staff.filter((s) => !s.title.includes("Internist") && !s.title.includes("GP")).map((s) => `${s.name} - ${s.title} (${s.schedule || "Office Hour"})`).join("\n")}`;
  }

  // Check for doctor / staff / who works
  if (
    q.includes("doctor") ||
    q.includes("staff") ||
    q.includes("who") ||
    q.includes("physician") ||
    q.includes("dr.")
  ) {
    const staffInfo = data.staff.map((s) => `${s.name} | ${s.title}${s.schedule ? ` | ${s.schedule}` : ""}`).join("\n");
    return `MED-STAR Staff Directory:\n\n${staffInfo}`;
  }

  // Check for medical certificate
  if (
    q.includes("medical certificate") ||
    q.includes("certificate") ||
    q.includes("expat") ||
    q.includes("document")
  ) {
    return "Yes, MED-STAR provides Medical certificate services for Expats as one of our additional services.";
  }

  // Check for minor surgery
  if (
    q.includes("surgery") ||
    q.includes("minor") ||
    q.includes("procedure") ||
    q.includes("operation")
  ) {
    return "Yes, MED-STAR offers minor surgery services as part of our additional services.";
  }

  // Check for why choose / why different
  if (
    q.includes("why choose") ||
    q.includes("why different") ||
    q.includes("difference") ||
    q.includes("what makes")
  ) {
    return `Why MED-STAR is Different:\n${data.whyDifferent.highlights.map((h) => `• ${h}`).join("\n")}\n\nWe also offer:\n- Specialty Services: ${data.whyDifferent.specialtyServices.join(", ")}\n- Radiology Diagnostic Services: ${data.whyDifferent.radiologyServices.join(", ")}`;
  }

  // Check for gynecologist or specific doctor queries
  for (const member of data.staff) {
    if (q.includes(member.name.toLowerCase().replace(/^dr\.?\s*/, "").split(" ")[0])) {
      return `${member.name} - ${member.title}${member.schedule ? `\nSchedule: ${member.schedule}` : ""}`;
    }
  }

  return "";
}

export function AIChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm MedStar AI Assistant. I can answer questions about our clinic, services, doctors, working hours, and more. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

    const answer = searchKnowledgeBase(userMessage, brochureData);

    if (answer) {
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I couldn't find specific information about that. Please try asking about our services, doctors, working hours, location, or any other clinic information. You can also visit our Brochure page for complete details.",
        },
      ]);
    }

    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="bg-ms-blue px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <div>
            <p className="text-sm font-bold text-white">MedStar AI</p>
            <p className="text-[10px] text-white/60">Ask me anything</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Close chat"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="w-3.5 h-3.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-ms-blue text-white rounded-br-md"
                  : "bg-white text-slate-700 border border-slate-200 shadow-sm rounded-bl-md"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-500 border border-slate-200 shadow-sm rounded-2xl rounded-bl-md px-4 py-2.5 text-sm">
              <span className="flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                  .
                </span>
                <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
                  .
                </span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={isTyping}
            className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ms-blue/25 focus:border-ms-blue/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex items-center justify-center rounded-full bg-ms-red px-4 py-2 text-white transition-colors hover:bg-ms-red-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="w-4 h-4"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

