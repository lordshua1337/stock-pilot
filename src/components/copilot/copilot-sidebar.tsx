"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Trash2,
  Plus,
  Bot,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { CopilotTrigger } from "./copilot-trigger";
import {
  gatherCopilotContext,
  buildSystemPromptContext,
} from "@/lib/ai/copilot-context";
import {
  loadChatState,
  createConversation,
  addMessage,
  updateLastAssistantMessage,
  deleteConversation,
  getActiveConversation,
  getConversationHistory,
  type ChatState,
  type ChatMessage,
} from "@/lib/ai/chat-storage";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CopilotSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatState, setChatState] = useState<ChatState>({
    conversations: [],
    activeConversationId: null,
  });
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pathname = usePathname();

  // Load chat state on mount + abort on unmount
  useEffect(() => {
    setChatState(loadChatState());
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const activeConversation = getActiveConversation(chatState);
  const messages: readonly ChatMessage[] =
    activeConversation?.messages ?? [];

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const handleNewConversation = useCallback(() => {
    setChatState((prev) => createConversation(prev));
    setError(null);
  }, []);

  const handleDeleteConversation = useCallback(() => {
    if (!activeConversation) return;
    setChatState((prev) => deleteConversation(prev, activeConversation.id));
    setError(null);
  }, [activeConversation]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    setError(null);
    setInput("");

    // Ensure we have an active conversation
    let currentState = chatState;
    let convId = activeConversation?.id;

    if (!convId) {
      currentState = createConversation(currentState);
      convId = currentState.activeConversationId!;
      setChatState(currentState);
    }

    // Add user message
    currentState = addMessage(currentState, convId, "user", trimmed);
    setChatState(currentState);

    // Add placeholder assistant message
    currentState = addMessage(currentState, convId, "assistant", "");
    setChatState(currentState);

    // Build context and history
    const ctx = gatherCopilotContext(pathname);
    const systemContext = buildSystemPromptContext(ctx);
    const conv = currentState.conversations.find((c) => c.id === convId);
    const history = conv
      ? getConversationHistory(conv)
          .slice(0, -1) // exclude the empty assistant placeholder
          .slice(-20) // last 20 messages for context window
      : [];

    // Stream response
    setIsStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history,
          systemContext,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errData.error || `Error ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullText += parsed.text;
              setChatState((prev) =>
                updateLastAssistantMessage(prev, convId!, fullText)
              );
            }
          } catch {
            // Skip unparseable chunks
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      // Remove empty assistant message on error
      setChatState((prev) =>
        updateLastAssistantMessage(prev, convId!, `[Error: ${msg}]`)
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, chatState, activeConversation, pathname]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <CopilotTrigger isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed top-0 right-0 z-40 h-full w-full sm:w-[400px] bg-surface border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-green/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-green" />
                </div>
                <span className="text-sm font-semibold">AI Copilot</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleNewConversation}
                  className="p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-alt transition-colors"
                  title="New conversation"
                >
                  <Plus className="w-4 h-4" />
                </button>
                {activeConversation && (
                  <button
                    onClick={handleDeleteConversation}
                    className="p-2 rounded-lg text-text-muted hover:text-red hover:bg-red/10 transition-colors"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-green/10 flex items-center justify-center mb-4">
                    <Bot className="w-6 h-6 text-green" />
                  </div>
                  <p className="text-sm font-medium text-text-primary mb-1">
                    StockPilot Copilot
                  </p>
                  <p className="text-xs text-text-muted max-w-[260px]">
                    Your AI thinking partner. Ask about your portfolio,
                    research a stock, or get personalized insights based on
                    your investor identity.
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {isStreaming && messages[messages.length - 1]?.content === "" && (
                <div className="flex items-center gap-2 text-text-muted text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error banner */}
            {error && (
              <div className="mx-4 mb-2 px-3 py-2 rounded-lg bg-red/10 border border-red/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red shrink-0" />
                <p className="text-xs text-red">{error}</p>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border px-4 py-3 shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your copilot..."
                  rows={1}
                  className="flex-1 resize-none bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/50 transition-colors"
                  disabled={isStreaming}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  className="p-2 rounded-lg bg-green text-white hover:bg-green/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                >
                  {isStreaming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-text-muted mt-1.5">
                AI thinking partner -- not financial advice
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ---------------------------------------------------------------------------
// Message Bubble
// ---------------------------------------------------------------------------

function MessageBubble({ message }: { readonly message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-green/10 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5 text-green" />
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-green/10 border border-green/20 text-text-primary"
            : "bg-surface-alt border border-border text-text-primary"
        }`}
      >
        {message.content ? (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        ) : null}
      </div>

      {isUser && (
        <div className="w-6 h-6 rounded-full bg-blue/10 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-blue" />
        </div>
      )}
    </div>
  );
}
