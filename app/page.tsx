"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    const newMessage = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const aiReply = {
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error("Error:", err);
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      const errorReply = {
        role: "assistant",
        content: `⚠️ Error: ${errorMsg}`,
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-md px-6 py-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI Chat</h1>
        <p className="text-sm text-slate-400">Powered by Groq</p>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full flex-col gap-4">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">ChatBot</h1>
              <p className="text-xl text-slate-300">Start a conversation</p>
              <p className="text-sm text-slate-500 mt-2">Powered by Groq AI</p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-2xl px-6 py-4 rounded-xl break-words group relative ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none"
                      : "bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600"
                  }`}
                >
                  <div className="leading-relaxed text-base markdown-content">
                    <ReactMarkdown
                      components={{
                        code: ({ inline, ...props }: any) => 
                          inline ? (
                            <code className="bg-slate-600 px-2 py-1 rounded text-cyan-300 font-mono text-sm" {...props} />
                          ) : (
                            <code className="bg-slate-800 px-4 py-3 rounded-lg block text-slate-100 font-mono text-sm overflow-x-auto" {...props} />
                          ),
                        pre: ({ ...props }: any) => (
                          <pre className="bg-slate-800 px-4 py-3 rounded-lg overflow-x-auto" {...props} />
                        ),
                        p: ({ ...props }: any) => (
                          <p className="mb-2" {...props} />
                        ),
                        ul: ({ ...props }: any) => (
                          <ul className="list-disc list-inside mb-2 space-y-1" {...props} />
                        ),
                        ol: ({ ...props }: any) => (
                          <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />
                        ),
                        li: ({ ...props }: any) => (
                          <li className="ml-2" {...props} />
                        ),
                        strong: ({ ...props }: any) => (
                          <strong className="font-bold text-cyan-300" {...props} />
                        ),
                        em: ({ ...props }: any) => (
                          <em className="italic text-slate-200" {...props} />
                        ),
                        h1: ({ ...props }: any) => (
                          <h1 className="text-2xl font-bold mb-2 text-cyan-300" {...props} />
                        ),
                        h2: ({ ...props }: any) => (
                          <h2 className="text-xl font-bold mb-2 text-cyan-300" {...props} />
                        ),
                        h3: ({ ...props }: any) => (
                          <h3 className="text-lg font-bold mb-2 text-cyan-300" {...props} />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => copyToClipboard(msg.content, i)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded text-xs text-white transition-all duration-200"
                    >
                      {copiedId === i ? "✓ Copied!" : "Copy"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 px-6 py-4 rounded-xl rounded-bl-none border border-slate-600">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700 bg-slate-900/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <textarea
              rows={3}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:bg-slate-750 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
              placeholder="Type your message... (Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />

            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg font-semibold transition disabled:cursor-not-allowed h-fit"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}