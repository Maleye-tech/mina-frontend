export type NotificationItem = {
  id: string | number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read_at?: string | null;
  created_at: string;
};

export type NotificationPreferences = {
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  push_notifications?: boolean;
};

export type NotificationsPage = {
  unread_count: number;
  preferences: NotificationPreferences;
  data: NotificationItem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};
