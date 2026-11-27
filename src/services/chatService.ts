import { listOf, qs, request } from "../lib/api";
import type { ChatMessage, Conversation, RequestAmbassadorInput } from "../types/chat";

export const chatService = {
  async listConversations(params: { type?: string; per_page?: number; page?: number } = {}): Promise<Conversation[]> {
    const res = await request<Conversation[] | { data: Conversation[] }>(
      `/v1/conversations${qs(params)}`
    );
    return listOf(res);
  },

  async createConversation(data: { recipient_id?: number; title?: string; type?: string; initial_message?: string }): Promise<Conversation> {
    const res = await request<{ data: Conversation } | Conversation>("/v1/conversations", {
      method: "POST",
      body: data,
    });
    return "data" in res ? (res.data as Conversation) : (res as Conversation);
  },

  async getConversation(id: number | string): Promise<Conversation> {
    const res = await request<{ data: Conversation } | Conversation>(`/v1/conversations/${id}`);
    return "data" in res ? (res.data as Conversation) : (res as Conversation);
  },

  async listMessages(conversationId: number | string, params: { per_page?: number; page?: number } = {}): Promise<ChatMessage[]> {
    const res = await request<ChatMessage[] | { data: ChatMessage[] }>(
      `/v1/conversations/${conversationId}/messages${qs(params)}`
    );
    return listOf(res);
  },

  async sendMessage(conversationId: number | string, message: string): Promise<ChatMessage> {
    const res = await request<{ data: ChatMessage } | ChatMessage>(
      `/v1/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: { body: message },
      }
    );
    return "data" in res ? (res.data as ChatMessage) : (res as ChatMessage);
  },

  async deleteMessage(conversationId: number | string, messageId: number | string): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/v1/conversations/${conversationId}/messages/${messageId}`,
      {
        method: "DELETE",
      }
    );
  },

  async reportMessage(
    conversationId: number | string,
    messageId: number | string,
    reason?: string
  ): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/v1/conversations/${conversationId}/messages/${messageId}/report`,
      {
        method: "POST",
        body: { reason },
      }
    );
  },

  async requestAmbassador(data: RequestAmbassadorInput): Promise<{ message: string; conversation?: Conversation }> {
    return request<{ message: string; conversation?: Conversation }>(
      "/v1/chat/request-ambassador",
      {
        method: "POST",
        body: data,
      }
    );
  },
};
