import { create } from 'zustand';
import type { ChatMessage, Conversation } from '../types/chat';
import { generateId } from '../types/file';
import { chatStorageService } from '../services/chatStorageService';
import { sendChatMessageStream } from '../services/aiService';
import { useSettingsStore } from './settingsStore';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
  error: string | null;
  abortController: AbortController | null;

  // Actions
  loadConversations: () => Promise<void>;
  createConversation: (title?: string) => Conversation;
  deleteConversation: (id: string) => Promise<void>;
  setActiveConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  stopStreaming: () => void;
  getActiveConversation: () => Conversation | undefined;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isStreaming: false,
  error: null,
  abortController: null,

  loadConversations: async () => {
    const conversations = await chatStorageService.getAllConversations();
    set({ conversations });
    if (conversations.length > 0) {
      set({ activeConversationId: conversations[0].id });
    } else {
      const initial = get().createConversation('Welcome Chat');
      chatStorageService.saveConversation(initial);
    }
  },

  createConversation: (title = 'New Conversation') => {
    const newConv: Conversation = {
      id: generateId(),
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      conversations: [newConv, ...state.conversations],
      activeConversationId: newConv.id,
      error: null,
    }));

    chatStorageService.saveConversation(newConv);
    return newConv;
  },

  deleteConversation: async (id: string) => {
    await chatStorageService.deleteConversation(id);
    set((state) => {
      const nextConvs = state.conversations.filter((c) => c.id !== id);
      return {
        conversations: nextConvs,
        activeConversationId:
          state.activeConversationId === id ? (nextConvs[0]?.id || null) : state.activeConversationId,
      };
    });
  },

  setActiveConversation: (id: string) => {
    set({ activeConversationId: id, error: null });
  },

  sendMessage: async (content: string) => {
    let conv = get().getActiveConversation();
    if (!conv) {
      conv = get().createConversation(content.slice(0, 30));
    }

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
      conversationId: conv.id,
    };

    const assistantMsgId = generateId();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      conversationId: conv.id,
    };

    const updatedMessages = [...conv.messages, userMsg, assistantMsg];
    const updatedConv = {
      ...conv,
      messages: updatedMessages,
      title: conv.messages.length === 0 ? content.slice(0, 30) : conv.title,
      updatedAt: Date.now(),
    };

    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === conv!.id ? updatedConv : c)),
      isStreaming: true,
      error: null,
    }));

    const abortController = new AbortController();
    set({ abortController });

    const aiSettings = useSettingsStore.getState().aiSettings;
    const historyPayload = updatedMessages
      .slice(0, -1) // omit empty pending assistant message
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      await sendChatMessageStream(
        aiSettings,
        historyPayload,
        (chunk) => {
          set((state) => {
            const currentConv = state.conversations.find((c) => c.id === updatedConv.id);
            if (!currentConv) return {};

            const msgs = currentConv.messages.map((m) =>
              m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m
            );

            const latestConv = { ...currentConv, messages: msgs, updatedAt: Date.now() };
            chatStorageService.saveConversation(latestConv);

            return {
              conversations: state.conversations.map((c) => (c.id === updatedConv.id ? latestConv : c)),
            };
          });
        },
        abortController.signal
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Stream manually stopped
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Unknown AI streaming error';
        set({ error: errorMsg });
      }
    } finally {
      set({ isStreaming: false, abortController: null });
    }
  },

  stopStreaming: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ isStreaming: false, abortController: null });
    }
  },

  getActiveConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find((c) => c.id === activeConversationId);
  },
}));