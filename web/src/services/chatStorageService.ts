import { getDB } from './fileService';
import type { Conversation } from '../types/chat';

export const chatStorageService = {
  async getAllConversations(): Promise<Conversation[]> {
    const db = await getDB();
    return db.getAll('conversations');
  },

  async saveConversation(conversation: Conversation): Promise<void> {
    const db = await getDB();
    await db.put('conversations', conversation);
  },

  async deleteConversation(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('conversations', id);
  },
};