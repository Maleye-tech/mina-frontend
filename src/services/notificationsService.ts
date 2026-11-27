import { qs, request } from "../lib/api";
import type {
  NotificationItem,
  NotificationPreferences,
  NotificationsPage,
} from "../types/notification";

type ApiNotificationItem = {
  id: string | number;
  type: string;
  data?: { title?: string; message?: string } & Record<string, unknown>;
  read_at?: string | null;
  created_at: string;
};

function mapItem(item: ApiNotificationItem): NotificationItem {
  return {
    id: item.id,
    type: item.type,
    title: item.data?.title ?? "Notification",
    message: item.data?.message ?? "",
    data: item.data,
    read_at: item.read_at,
    created_at: item.created_at,
  };
}

export const notificationsService = {
  async list(
    params: { per_page?: number; page?: number } = {}
  ): Promise<NotificationsPage> {
    const res = await request<{ unread_count: number; preferences: NotificationPreferences; data: ApiNotificationItem[]; pagination: NotificationsPage["pagination"] }>(
      `/v1/notifications${qs(params)}`
    );
    return {
      unread_count: res.unread_count,
      preferences: res.preferences,
      data: (res.data ?? []).map(mapItem),
      pagination: res.pagination,
    };
  },

  async markAsRead(id: number | string): Promise<{ message: string }> {
    return request<{ message: string }>(`/v1/notifications/${id}/read`, {
      method: "POST",
    });
  },

  async markAllAsRead(): Promise<{ message: string }> {
    return request<{ message: string }>("/v1/notifications/read-all", {
      method: "POST",
    });
  },

  async updatePreferences(
    data: NotificationPreferences
  ): Promise<{ message: string; preferences: NotificationPreferences }> {
    return request<{ message: string; preferences: NotificationPreferences }>(
      "/v1/notifications/preferences",
      {
        method: "PUT",
        body: data,
      }
    );
  },
};
