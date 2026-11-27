import { listOf, qs, request } from "../lib/api";
import type {
  CheckoutInput,
  CheckoutResponse,
  CurrentSubscriptionStatus,
  PaymentRecord,
  SubscriptionPlansResponse,
  UserSubscription,
} from "../types/subscription";

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlansResponse> {
    const res = await request<SubscriptionPlansResponse | { data: SubscriptionPlansResponse }>(
      "/v1/subscriptions/plans"
    );
    if ("data" in res && res.data && "plans" in res.data) {
      return res.data;
    }
    return res as SubscriptionPlansResponse;
  },

  async getCurrentStatus(): Promise<CurrentSubscriptionStatus> {
    try {
      const res = await request<
        | CurrentSubscriptionStatus
        | { data: CurrentSubscriptionStatus }
        | { subscription?: UserSubscription | null }
      >("/v1/subscriptions/current");

      const payload = (("data" in res && res.data) ? res.data : res) as Record<string, unknown>;
      const rawSub = (payload.subscription !== undefined
        ? payload.subscription
        : ("id" in payload ? payload : null)) as UserSubscription | null;

      let sub: UserSubscription | null = null;
      if (rawSub && typeof rawSub === "object" && rawSub.id) {
        sub = {
          ...rawSub,
          plan_name: rawSub.plan_name || rawSub.plan?.name || (rawSub.is_trial ? "Période d'essai" : "Abonnement"),
          current_period_end: rawSub.current_period_end || rawSub.ends_at || undefined,
          current_period_start: rawSub.current_period_start || rawSub.starts_at || undefined,
        };
      }

      return {
        has_active_access: Boolean(payload.has_active_access ?? sub?.is_valid),
        can_start_trial: Boolean(payload.can_start_trial ?? !sub),
        subscription: sub,
      };
    } catch {
      return {
        has_active_access: false,
        can_start_trial: true,
        subscription: null,
      };
    }
  },

  async getCurrent(): Promise<UserSubscription | null> {
    const status = await this.getCurrentStatus();
    return status.subscription;
  },

  async startTrial(): Promise<{ message: string; subscription?: UserSubscription }> {
    return request<{ message: string; subscription?: UserSubscription }>(
      "/v1/subscriptions/trial",
      {
        method: "POST",
      }
    );
  },

  async redeemCode(code: string): Promise<{ message: string; subscription?: UserSubscription }> {
    return request<{ message: string; subscription?: UserSubscription }>(
      "/v1/subscriptions/redeem-code",
      {
        method: "POST",
        body: { code },
      }
    );
  },

  async cancel(reason?: string): Promise<{ message: string }> {
    return request<{ message: string }>("/v1/subscriptions/cancel", {
      method: "POST",
      body: { reason },
    });
  },

  async checkout(input: CheckoutInput): Promise<CheckoutResponse> {
    return request<CheckoutResponse>("/v1/payments/checkout", {
      method: "POST",
      body: input,
    });
  },

  async listPayments(params: { per_page?: number; page?: number } = {}): Promise<PaymentRecord[]> {
    const res = await request<PaymentRecord[] | { data: PaymentRecord[] }>(
      `/v1/payments/history${qs(params)}`
    );
    return listOf(res);
  },

  async getReceipt(paymentId: number | string): Promise<{ receipt_url: string }> {
    return request<{ receipt_url: string }>(`/v1/payments/${paymentId}/receipt`);
  },

  async requestRefund(paymentId: number | string, reason?: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/v1/payments/${paymentId}/refund`, {
      method: "POST",
      body: { reason },
    });
  },
};
