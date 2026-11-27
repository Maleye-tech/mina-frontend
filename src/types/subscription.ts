export type SubscriptionPlan = {
  id: string;
  name: string;
  tagline?: string;
  price?: number;
  price_monthly?: number;
  price_yearly?: number;
  currency?: string;
  is_popular?: boolean;
  features?: string[];
  duration_days?: number;
};

export type SubscriptionPlansResponse = {
  trial_days?: number;
  plans: SubscriptionPlan[];
};

export type UserSubscription = {
  id: number;
  user_id?: number;
  plan_name?: string;
  plan_id?: string | number;
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid" | "expired" | string;
  status_label?: string;
  is_valid?: boolean;
  is_trial?: boolean;
  price?: number;
  currency?: string;
  interval?: "month" | "year";
  trial_ends_at?: string | null;
  current_period_start?: string;
  current_period_end?: string;
  starts_at?: string | null;
  ends_at?: string | null;
  auto_renew?: boolean;
  cancel_at_period_end?: boolean;
  created_at?: string;
  plan?: {
    id: number | string;
    name: string;
    slug?: string;
    price?: number;
    currency?: string;
  } | null;
  partner?: {
    id: number | string;
    name: string;
    type?: string;
    covers_mina_care?: boolean;
  } | null;
};

export type CurrentSubscriptionStatus = {
  has_active_access: boolean;
  can_start_trial: boolean;
  subscription: UserSubscription | null;
};

export type CheckoutInput = {
  plan_id: string;
  provider?: string;
  return_url?: string;
};

export type CheckoutResponse = {
  checkout_url?: string;
  payment_id?: number;
  message?: string;
};

export type PaymentRecord = {
  id: number;
  user_id?: number;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed" | "refunded";
  payment_method?: string;
  invoice_number?: string;
  receipt_url?: string | null;
  created_at: string;
};
