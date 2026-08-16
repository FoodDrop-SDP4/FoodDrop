"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User as UserIcon, Loader2, X } from "lucide-react";
import { User, Role } from "@prisma/client";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    name: string;
    role: Role;
  };
}

interface ChatBoxProps {
  orderId: string;
  currentUser: { id: string; name: string; role: Role };
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatBox({ orderId, currentUser, isOpen, onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, orderId]);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: currentUser.id, content: newMessage }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-[360px] flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 text-white">
        <div>
          <h3 className="font-bold">Order Chat</h3>
          <p className="text-xs text-slate-300">Live conversation</p>
        </div>
        <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/10 transition">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <p className="text-sm">No messages yet.</p>
            <p className="text-xs">Say hi to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-end gap-2 max-w-[85%]">
                  {!isMe && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200">
                      <UserIcon className="h-3 w-3 text-slate-500" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      isMe
                        ? "bg-orange-500 text-white rounded-br-sm"
                        : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm"
                    }`}
                  >
                    {!isMe && (
                      <p className="text-[10px] font-bold text-slate-400 mb-0.5">
                        {msg.sender.name} ({msg.sender.role.toLowerCase()})
                      </p>
                    )}
                    <p>{msg.content}</p>
                    <p className={`text-[9px] mt-1 text-right ${isMe ? "text-orange-100" : "text-slate-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="bg-white p-3 border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500/50"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || isSending}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white disabled:opacity-50 transition hover:bg-orange-600"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 -ml-0.5" />}
        </button>
      </form>
    </div>
  );
}
