"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { supportApi, type SupportTicket, type SupportMessage } from "@/lib/api";
import { ArrowLeft, Send, CheckCircle2, Clock, X, MessageCircle, Lock } from "lucide-react";

function statusConfig(status: SupportTicket["status"]) {
  switch (status) {
    case "OPEN":        return { label: "Open",        color: "text-green-600",  bg: "bg-green-50",  icon: MessageCircle };
    case "IN_PROGRESS": return { label: "In progress", color: "text-blue-600",   bg: "bg-blue-50",   icon: Clock };
    case "RESOLVED":    return { label: "Resolved",    color: "text-purple-600", bg: "bg-purple-50", icon: CheckCircle2 };
    case "CLOSED":      return { label: "Closed",      color: "text-[#AAAAAA]",  bg: "bg-gray-50",   icon: X };
  }
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) +
    " · " + d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function TicketPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const isClosed = ticket?.status === "CLOSED" || ticket?.status === "RESOLVED";

  const fetchTicket = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await supportApi.getTicket(id);
      const t = res.data.data as SupportTicket;
      setTicket(t);
      setMessages(t.messages ?? []);
    } catch {
      setError("Could not load this conversation.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll every 5 seconds when ticket is open
  useEffect(() => {
    if (isClosed) return;
    const interval = setInterval(() => fetchTicket(true), 5000);
    return () => clearInterval(interval);
  }, [isClosed, fetchTicket]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending || isClosed) return;
    setSending(true);
    const optimistic: SupportMessage = {
      id: `tmp-${Date.now()}`,
      ticketId: id,
      senderId: "me",
      senderRole: "CUSTOMER",
      body: text,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    try {
      await supportApi.postMessage(id, text);
      await fetchTicket(true);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(text);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleClose() {
    if (!ticket || closing) return;
    setClosing(true);
    try {
      await supportApi.closeTicket(id);
      setTicket((t) => t ? { ...t, status: "CLOSED" } : t);
    } catch {
      setError("Could not close ticket.");
    } finally {
      setClosing(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto lg:max-w-none h-full flex flex-col">
        <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-8 text-white">
          <div className="h-5 w-32 bg-white/20 rounded-full animate-pulse mb-2" />
          <div className="h-7 w-48 bg-white/20 rounded-full animate-pulse" />
        </div>
        <div className="flex-1 px-4 py-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-12 rounded-2xl bg-[#F0F0F0] animate-pulse ${i % 2 === 0 ? "ml-12" : "mr-12"}`} />
          ))}
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-sm text-[#DB0011]">{error || "Ticket not found."}</p>
        <button onClick={() => router.push("/support")} className="mt-4 text-sm text-[#DB0011] underline">Back to support</button>
      </div>
    );
  }

  const sc = statusConfig(ticket.status);
  const StatusIcon = sc.icon;

  return (
    <div className="max-w-lg mx-auto lg:max-w-none flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-5 pb-5 text-white flex-shrink-0">
        <button
          onClick={() => router.push("/support")}
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-3 transition-colors"
        >
          <ArrowLeft size={16} /> All conversations
        </button>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xs text-white/50 uppercase tracking-widest mb-0.5">Support ticket</p>
            <h1 className="text-base font-bold leading-snug">{ticket.subject}</h1>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold flex-shrink-0 ${sc.bg} ${sc.color} border-transparent`}>
            <StatusIcon size={11} />
            {sc.label}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F8F8F8]">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-2">
            <p className="text-xs text-[#DB0011]">{error}</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderRole === "CUSTOMER";
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                {!isMe && (
                  <p className="text-[10px] font-semibold text-[#AAAAAA] px-1">Support team</p>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? "bg-[#DB0011] text-white rounded-br-md"
                    : "bg-white text-[#333] border border-[#E8E8E8] rounded-bl-md shadow-sm"
                }`}>
                  {msg.body}
                </div>
                <p className="text-[10px] text-[#CCCCCC] px-1">{formatTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}

        {/* Waiting indicator */}
        {!isClosed && messages.length > 0 && messages[messages.length - 1]?.senderRole === "CUSTOMER" && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#E8E8E8] rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#AAAAAA] animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-1.5 w-1.5 rounded-full bg-[#AAAAAA] animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-1.5 w-1.5 rounded-full bg-[#AAAAAA] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 bg-white border-t border-[#E8E8E8] px-4 py-3">
        {isClosed ? (
          <div className="flex items-center justify-center gap-2 py-2">
            <Lock size={14} className="text-[#AAAAAA]" />
            <p className="text-xs text-[#AAAAAA]">This conversation is {ticket.status === "RESOLVED" ? "resolved" : "closed"}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message…"
                rows={1}
                className="flex-1 border border-[#E8E8E8] rounded-xl px-3.5 py-2.5 text-sm text-[#333] placeholder-[#BBBBBB] focus:outline-none focus:border-[#DB0011] resize-none"
                style={{ maxHeight: "100px", overflowY: "auto" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="h-10 w-10 rounded-xl bg-[#DB0011] text-white flex items-center justify-center hover:bg-[#b0000d] transition-colors disabled:opacity-40 flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
            <button
              onClick={handleClose}
              disabled={closing}
              className="w-full py-2 text-xs text-[#AAAAAA] hover:text-[#DB0011] transition-colors"
            >
              {closing ? "Closing…" : "Close this conversation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
