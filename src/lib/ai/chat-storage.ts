// Chat Storage -- localStorage persistence for copilot conversations
// Immutable operations, SSR-safe, defensive copies

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatMessage {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly timestamp: string;
}

export interface ChatConversation {
  readonly id: string;
  readonly messages: readonly ChatMessage[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ChatState {
  readonly conversations: readonly ChatConversation[];
  readonly activeConversationId: string | null;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const STORAGE_KEY = "stockpilot_copilot_chat";
const MAX_CONVERSATIONS = 20;
const MAX_MESSAGES_PER_CONVERSATION = 100;

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadChatState(): ChatState {
  const storage = getStorage();
  if (!storage) return { conversations: [], activeConversationId: null };

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { conversations: [], activeConversationId: null };
    const parsed = JSON.parse(raw) as ChatState;
    return {
      ...parsed,
      conversations: parsed.conversations.map((c) => ({
        ...c,
        messages: c.messages.map((m) => ({ ...m })),
      })),
    };
  } catch {
    return { conversations: [], activeConversationId: null };
  }
}

function saveChatState(state: ChatState): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full -- fail silently
  }
}

// ---------------------------------------------------------------------------
// Operations (immutable)
// ---------------------------------------------------------------------------

function generateId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createConversation(state: ChatState): ChatState {
  const now = new Date().toISOString();
  const newConv: ChatConversation = {
    id: generateId(),
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  // Trim to max conversations (drop oldest)
  const existing = state.conversations.slice(0, MAX_CONVERSATIONS - 1);

  const updated: ChatState = {
    conversations: [newConv, ...existing],
    activeConversationId: newConv.id,
  };
  saveChatState(updated);
  return updated;
}

export function addMessage(
  state: ChatState,
  conversationId: string,
  role: "user" | "assistant",
  content: string
): ChatState {
  const now = new Date().toISOString();
  const newMessage: ChatMessage = {
    id: generateId(),
    role,
    content,
    timestamp: now,
  };

  const updated: ChatState = {
    ...state,
    conversations: state.conversations.map((c) => {
      if (c.id !== conversationId) return c;
      const messages = [...c.messages, newMessage].slice(
        -MAX_MESSAGES_PER_CONVERSATION
      );
      return { ...c, messages, updatedAt: now };
    }),
  };

  saveChatState(updated);
  return updated;
}

export function updateLastAssistantMessage(
  state: ChatState,
  conversationId: string,
  content: string
): ChatState {
  const updated: ChatState = {
    ...state,
    conversations: state.conversations.map((c) => {
      if (c.id !== conversationId) return c;
      const messages = [...c.messages];
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "assistant") {
          messages[i] = { ...messages[i], content };
          break;
        }
      }
      return { ...c, messages, updatedAt: new Date().toISOString() };
    }),
  };

  saveChatState(updated);
  return updated;
}

export function deleteConversation(
  state: ChatState,
  conversationId: string
): ChatState {
  const remaining = state.conversations.filter(
    (c) => c.id !== conversationId
  );
  const updated: ChatState = {
    conversations: remaining,
    activeConversationId:
      state.activeConversationId === conversationId
        ? remaining[0]?.id ?? null
        : state.activeConversationId,
  };

  saveChatState(updated);
  return updated;
}

export function setActiveConversation(
  state: ChatState,
  conversationId: string
): ChatState {
  const updated: ChatState = {
    ...state,
    activeConversationId: conversationId,
  };
  saveChatState(updated);
  return updated;
}

export function getActiveConversation(
  state: ChatState
): ChatConversation | null {
  if (!state.activeConversationId) return null;
  return (
    state.conversations.find(
      (c) => c.id === state.activeConversationId
    ) ?? null
  );
}

export function getConversationHistory(
  conversation: ChatConversation
): Array<{ role: "user" | "assistant"; content: string }> {
  return conversation.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}
