-- Only handle subscriptions → creem_subscription transition.
-- Assumes all other tables already exist and are correct.

-- 1) Drop old Stripe-based subscriptions table if it exists
DROP TABLE IF EXISTS "subscriptions" CASCADE;

-- 2) Create Creem subscription table used by Better Auth plugin
CREATE TABLE IF NOT EXISTS "creem_subscription" (
  "id" text PRIMARY KEY,
  "product_id" text NOT NULL,
  "reference_id" text NOT NULL,
  "creem_customer_id" text,
  "creem_subscription_id" text,
  "creem_order_id" text,
  "status" text DEFAULT 'pending',
  "period_start" timestamp,
  "period_end" timestamp,
  "cancel_at_period_end" boolean DEFAULT false
);


