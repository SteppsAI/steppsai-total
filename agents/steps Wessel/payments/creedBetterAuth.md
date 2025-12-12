# Creem

Better Auth Plugin for Payment and Subscriptions using Creem

***

title: Creem
description: Better Auth Plugin for Payment and Subscriptions using Creem
-------------------------------------------------------------------------

[Creem](https://creem.io) is a financial OS that enables teams and individuals selling software globally to split revenue and collaborate on financial workflows without any tax compliance headaches. This plugin integrates Creem with Better Auth, bringing payment processing and subscription management directly into your authentication layer.

<Card href="https://discord.gg/q3GKZs92Av" title="Get support on Creem Discord or in our in-app live-chat">
  This plugin is maintained by the Creem team.<br />
  Need help? Reach out to our team anytime on Discord.
</Card>

## Features

* **Database Persistence** - Automatically synchronize customer and subscription data with your database
* **Access Management** - Automatically grant or revoke access to users based on their subscription status
* **Customer Synchronization** - Synchronize Creem customer IDs with your database users
* **Checkout Integration** - Create checkout sessions either automatically for authenticated users or manually for unauthenticated users
* **Customer Portal** - Enable users to manage subscriptions, view invoices, and update payment methods
* **Subscription Management** - Cancel, retrieve, and track subscription details for authenticated users or manually for unauthenticated users
* **Transaction History** - Search and filter transaction records for authenticated users or manually for unauthenticated users
* **Webhook Processing** - Handle Creem webhooks securely with signature verification
* **Flexible Architecture** - Use Better Auth endpoints or direct server-side functions
* **Trial Abuse Prevention** - Users can only get one trial per account across all plans (when using database mode)

## Installation

<Steps>
  <Step>
    ### Install the plugin

    <CodeBlockTabs defaultValue="npm">
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="npm">
          npm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="pnpm">
          pnpm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="yarn">
          yarn
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="bun">
          bun
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>

      <CodeBlockTab value="npm">
        ```bash
        npm install @creem_io/better-auth
        ```
      </CodeBlockTab>

      <CodeBlockTab value="pnpm">
        ```bash
        pnpm add @creem_io/better-auth
        ```
      </CodeBlockTab>

      <CodeBlockTab value="yarn">
        ```bash
        yarn add @creem_io/better-auth
        ```
      </CodeBlockTab>

      <CodeBlockTab value="bun">
        ```bash
        bun add @creem_io/better-auth
        ```
      </CodeBlockTab>
    </CodeBlockTabs>

    <Callout>
      If you're using a separate client and server setup, make sure to install the plugin in both parts of your project.
    </Callout>
  </Step>

  <Step>
    ### Get your API Key

    Get your Creem API Key from the [Creem dashboard](https://creem.io/dashboard/developers), under the 'Developers' menu and add it to your environment variables:

    ```bash
    # .env
    CREEM_API_KEY=your_api_key_here
    ```

    <Callout type="warn">
      Test Mode and Production have different API keys. Make sure you're using the correct one for your environment.
    </Callout>
  </Step>
</Steps>

## Configuration

### Server Configuration

Configure Better Auth with the Creem plugin:

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { creem } from "@creem_io/better-auth";

export const auth = betterAuth({
  database: {
    // your database config
  },
  plugins: [
    creem({
      apiKey: process.env.CREEM_API_KEY!,
      webhookSecret: process.env.CREEM_WEBHOOK_SECRET, // Optional, webhooks are automatically enabled when passing a signing secret
      testMode: true, // Optional, use test mode for development
      defaultSuccessUrl: "/success", // Optional, redirect to this URL after successful payments
      persistSubscriptions: true, // Optional, enable database persistence (default: true)
    }),
  ],
});
```

### Client Configuration

### Standard Setup

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { creemClient } from "@creem_io/better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [creemClient()],
});
```

### Enhanced TypeScript Support (React-Only)

For improved TypeScript IntelliSense and autocomplete:

```typescript
// lib/auth-client.ts
import { createCreemAuthClient } from "@creem_io/better-auth/create-creem-auth-client";
import { creemClient } from "@creem_io/better-auth/client";

export const authClient = createCreemAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [creemClient()],
});
```

<Callout>
  The `createCreemAuthClient` wrapper provides enhanced TypeScript support and cleaner parameter types. It's optimized for use with the Creem plugin.
</Callout>

### Database Migration

If you're using database persistence (`persistSubscriptions: true`), generate and run the database schema:

<Tabs items={["migrate", "generate"]}>
  <Tab value="migrate">
    <CodeBlockTabs defaultValue="npm">
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="npm">
          npm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="pnpm">
          pnpm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="yarn">
          yarn
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="bun">
          bun
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>

      <CodeBlockTab value="npm">
        ```bash
        npx @better-auth/cli migrate
        ```
      </CodeBlockTab>

      <CodeBlockTab value="pnpm">
        ```bash
        pnpm dlx @better-auth/cli migrate
        ```
      </CodeBlockTab>

      <CodeBlockTab value="yarn">
        ```bash
        yarn dlx @better-auth/cli migrate
        ```
      </CodeBlockTab>

      <CodeBlockTab value="bun">
        ```bash
        bun x @better-auth/cli migrate
        ```
      </CodeBlockTab>
    </CodeBlockTabs>
  </Tab>

  <Tab value="generate">
    <CodeBlockTabs defaultValue="npm">
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="npm">
          npm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="pnpm">
          pnpm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="yarn">
          yarn
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="bun">
          bun
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>

      <CodeBlockTab value="npm">
        ```bash
        npx @better-auth/cli generate
        ```
      </CodeBlockTab>

      <CodeBlockTab value="pnpm">
        ```bash
        pnpm dlx @better-auth/cli generate
        ```
      </CodeBlockTab>

      <CodeBlockTab value="yarn">
        ```bash
        yarn dlx @better-auth/cli generate
        ```
      </CodeBlockTab>

      <CodeBlockTab value="bun">
        ```bash
        bun x @better-auth/cli generate
        ```
      </CodeBlockTab>
    </CodeBlockTabs>
  </Tab>
</Tabs>

<Callout type="info">
  Depending on your database adapter, additional setup steps may be required. Refer to the [Better Auth adapter documentation](https://www.better-auth.com/docs/adapters/mysql) for details.
</Callout>

### Webhook Setup

<Steps>
  <Step>
    ### Create Webhook Endpoint

    In your [Creem dashboard](https://creem.io/dashboard/developers/webhooks), create a webhook endpoint pointing to your local or production server pointing to:

    ```text
    https://your-domain.com/api/auth/creem/webhook
    ```

    (`/api/auth` is the default Better Auth server path)

    <Callout type="info">
      Check step 3 if local development.
    </Callout>
  </Step>

  <Step>
    ### Configure Webhook Secret

    Copy the webhook signing secret from Creem and add it to your environment:

    ```bash
    CREEM_WEBHOOK_SECRET=your_webhook_secret_here
    ```

    Update your server configuration:

    ```typescript
    creem({
      apiKey: process.env.CREEM_API_KEY!,
      webhookSecret: process.env.CREEM_WEBHOOK_SECRET,
      testMode: true,
    })
    ```
  </Step>

  <Step>
    ### Local Development (Optional)

    For local testing, use a tool like [ngrok](https://ngrok.com) to expose your local server:

    ```bash
    ngrok http 3000
    ```

    Add the ngrok URL to your Creem webhook settings.
  </Step>
</Steps>

## Database Schema

When `persistSubscriptions: true`, the plugin creates the following schema:

### Creem Subscription Table

Table Name: `creem_subscription`

| Field                 | Type    | Description                      |
| --------------------- | ------- | -------------------------------- |
| `id`                  | string  | Primary key                      |
| `productId`           | string  | Creem product ID                 |
| `referenceId`         | string  | Your user/organization ID        |
| `creemCustomerId`     | string  | Creem customer ID                |
| `creemSubscriptionId` | string  | Creem subscription ID            |
| `creemOrderId`        | string  | Creem order ID                   |
| `status`              | string  | Subscription status              |
| `periodStart`         | date    | Billing period start date        |
| `periodEnd`           | date    | Billing period end date          |
| `cancelAtPeriodEnd`   | boolean | Whether subscription will cancel |

### User Table Extension

| Field             | Type   | Description                  |
| ----------------- | ------ | ---------------------------- |
| `creemCustomerId` | string | Links user to Creem customer |

## Usage

### Checkout

Create a checkout session to process payments:

```typescript
"use client";

import { authClient } from "@/lib/auth-client";

export function SubscribeButton({ productId }: { productId: string }) {
  const handleCheckout = async () => {
    const { data, error } = await authClient.creem.createCheckout({
      productId,
      successUrl: "/dashboard",
      discountCode: "LAUNCH50", // Optional
      metadata: { planType: "pro" }, // Optional
    });

    if (data?.url) {
      window.location.href = data.url;
    }
  };

  return <button onClick={handleCheckout}>Subscribe Now</button>;
}
```

#### Checkout Options

* `productId` (required) - The Creem product ID
* `units` - Number of units (default: 1)
* `successUrl` - Redirect URL after successful payment
* `discountCode` - Discount code to apply
* `customer` - Customer information (auto-populated from session)
* `metadata` - Additional metadata (auto-includes user ID as `referenceId`)
* `requestId` - Idempotency key for duplicate prevention

### Customer Portal

Redirect users to manage their subscriptions:

```typescript
const handlePortal = async () => {
  // No need to redirect, the portal will be opened in the same tab
  const { data, error } = await authClient.creem.createPortal();
};
```

### Subscription Management

### Cancel Subscription

When database persistence is enabled, the subscription is found automatically for the authenticated user:

```typescript
const handleCancel = async () => {
  const { data, error } = await authClient.creem.cancelSubscription();

  if (data?.success) {
    console.log(data.message);
  }
};
```

If database persistence is disabled, provide the subscription ID:

```typescript
const { data } = await authClient.creem.cancelSubscription({
  id: "sub_123456",
});
```

### Retrieve Subscription

Get subscription details for the authenticated user:

```typescript
const getSubscription = async () => {
  const { data } = await authClient.creem.retrieveSubscription();

  if (data) {
    console.log(`Status: ${data.status}`);
    console.log(`Product: ${data.product.name}`);
    console.log(`Price: ${data.product.price} ${data.product.currency}`);
  }
};
```

### Check Access

Verify if the user has an active subscription (requires database mode):

```typescript
const { data } = await authClient.creem.hasAccessGranted();

if (data?.hasAccess) {
  // User has active subscription access
  console.log(`Expires: ${data.expiresAt}`);
}
```

<Callout type="info">
  This function checks if the user has access for the current billing period. For example, if a user purchases a yearly plan and cancels after one month, they still have access until the year ends.
</Callout>

### Transaction History

Search transaction records for the authenticated user:

```typescript
const { data } = await authClient.creem.searchTransactions({
  productId: "prod_xyz789", // Optional filter
  pageNumber: 1,
  pageSize: 50,
});

if (data?.transactions) {
  data.transactions.forEach((tx) => {
    console.log(`${tx.type}: ${tx.amount} ${tx.currency}`);
  });
}
```

## Webhook Handling

The plugin provides flexible webhook handling with both granular event handlers and high-level access control handlers.

### High-Level Access Control Handlers (Recommended)

These handlers provide the simplest and most powerful way to manage user access. They automatically handle all payment scenarios and subscription states, so you don't need to manage individual subscription events.

<strong> Database Persistence Required:</strong> These handlers require the database persistence option to be enabled in your plugin configuration.

| Handler Name         | Data Parameter Type       | Description                                                                                                                                                                                    |
| -------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`onGrantAccess`**  | **`GrantAccessContext`**  | **Called when a user should be granted access.** Handles successful payments, active subscriptions, and trial periods. Use this to enable features, add user to groups, or update permissions. |
| **`onRevokeAccess`** | **`RevokeAccessContext`** | **Called when a user's access should be revoked.** Handles cancellations, expirations, refunds, and failed payments. Use this to disable features, remove from groups, or revoke permissions.  |

**Why use these handlers?**

* Single source of truth for access control
* Handles all payment scenarios automatically
* Reduces code complexity and potential bugs
* Works for both one-time purchases and subscriptions
* Takes current billing period and access expiration dates into consideration

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { creem } from "@creem_io/better-auth";

export const auth = betterAuth({
  database: {
    // your database config
  },
  plugins:[ 
    creem({
      apiKey: process.env.CREEM_API_KEY!,
      webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

      onGrantAccess: async ({ reason, product, customer, metadata }) => {
        const userId = metadata?.referenceId as string;

        // Update your database specific logic
        await db.user.update({
          where: { id: userId },
          data: { 
            hasAccess: true, 
            subscriptionTier: product.name,
            accessReason: reason 
          },
        });

        console.log(`Granted ${reason} access to ${customer.email}`);
      },

      onRevokeAccess: async ({ reason, product, customer, metadata }) => {
        const userId = metadata?.referenceId as string;

        // Update your database specific logic
        await db.user.update({
          where: { id: userId },
          data: { 
            hasAccess: false, 
            revokeReason: reason 
          },
        });

        console.log(`Revoked access (${reason}) from ${customer.email}`);
      },
    }),
  ],
})
```

### Grant Access Reasons

* `subscription_active` - Subscription is active
* `subscription_trialing` - Subscription is in trial period
* `subscription_paid` - Subscription payment received

### Revoke Access Reasons

* `subscription_paused` - Subscription paused by user or admin
* `subscription_expired` - Subscription expired without renewal
* `subscription_period_end` - Current subscription period ended without renewal

***

### Granular Event Handlers

For advanced use cases where you need fine-grained control over specific events, use these handlers:

| Handler Name             | Data Parameter Type     | Description                                           |
| ------------------------ | ----------------------- | ----------------------------------------------------- |
| `onCheckoutCompleted`    | `FlatCheckoutCompleted` | Called when a checkout is completed successfully.     |
| `onRefundCreated`        | `FlatRefundCreated`     | Triggered when a refund is issued for a payment.      |
| `onDisputeCreated`       | `FlatDisputeCreated`    | Invoked when a payment dispute/chargeback is created. |
| `onSubscriptionActive`   | `FlatSubscriptionEvent` | Fired when a subscription becomes active.             |
| `onSubscriptionTrialing` | `FlatSubscriptionEvent` | Subscription enters a trial period.                   |
| `onSubscriptionCanceled` | `FlatSubscriptionEvent` | Called when a subscription is canceled.               |
| `onSubscriptionPaid`     | `FlatSubscriptionEvent` | Subscription payment is received.                     |
| `onSubscriptionExpired`  | `FlatSubscriptionEvent` | Subscription has expired (no renewal/payment).        |
| `onSubscriptionUnpaid`   | `FlatSubscriptionEvent` | Payment for a subscription failed or remains unpaid.  |
| `onSubscriptionUpdate`   | `FlatSubscriptionEvent` | Subscription settings/details updated.                |
| `onSubscriptionPastDue`  | `FlatSubscriptionEvent` | Subscription payment is late or overdue.              |
| `onSubscriptionPaused`   | `FlatSubscriptionEvent` | Subscription has been paused (by user or admin).      |

### How to use a Webhook Handler

Handle individual webhook events with all properties flattened for easy access:

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { creem } from "@creem_io/better-auth";

export const auth = betterAuth({
  database: {
    // your database config
  },
  plugins: [
    creem({
      apiKey: process.env.CREEM_API_KEY!,
      webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

      onCheckoutCompleted: async (data) => {
        const { customer, product, order, webhookEventType } = data;
        console.log(`${customer.email} purchased ${product.name}`);
        
        // Perfect for one-time payments
        await sendThankYouEmail(customer.email);
      },

      onSubscriptionActive: async (data) => {
        const { customer, product, status } = data;
        // Handle active subscription
      },

      onSubscriptionTrialing: async (data) => {
        // Handle trial period
      },

      onSubscriptionCanceled: async (data) => {
        // Handle cancellation
      },

      onSubscriptionExpired: async (data) => {
        // Handle expiration
      },

      onRefundCreated: async (data) => {
        // Handle refunds
      },

      onDisputeCreated: async (data) => {
        // Handle disputes
      },
    }),
  ],
});
```

### Custom Webhook Handler

Create your own webhook endpoint with signature verification:

```typescript
// app/api/webhooks/custom/route.ts
import { validateWebhookSignature } from "@creem_io/better-auth/server";

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("creem-signature");

  if (
    !validateWebhookSignature(
      payload,
      signature,
      process.env.CREEM_WEBHOOK_SECRET!
    )
  ) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(payload);
  // Your custom webhook handling logic

  return Response.json({ received: true });
}
```

## Server-Side Functions

Use these utilities directly in Server Components, Server Actions, or API routes without going through Better Auth endpoints.

### Import Server Utilities

```typescript
import {
  createCheckout,
  createPortal,
  cancelSubscription,
  retrieveSubscription,
  searchTransactions,
  checkSubscriptionAccess,
  isActiveSubscription,
  formatCreemDate,
  getDaysUntilRenewal,
  validateWebhookSignature,
} from "@creem_io/better-auth/server";
```

### Server Component Example

```typescript
import { checkSubscriptionAccess } from "@creem_io/better-auth/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const status = await checkSubscriptionAccess(
    {
      apiKey: process.env.CREEM_API_KEY!,
      testMode: true,
    },
    {
      database: auth.options.database,
      userId: session.user.id,
    }
  );

  if (!status.hasAccess) {
    redirect("/subscribe");
  }

  return (
    <div>
      <h1>Welcome to Dashboard</h1>
      <p>Subscription Status: {status.status}</p>
      {status.expiresAt && (
        <p>Renews: {status.expiresAt.toLocaleDateString()}</p>
      )}
    </div>
  );
}
```

### Server Action Example

```typescript
"use server";

import { createCheckout } from "@creem_io/better-auth/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function startCheckout(productId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  const { url } = await createCheckout(
    {
      apiKey: process.env.CREEM_API_KEY!,
      testMode: true,
    },
    {
      productId,
      customer: { email: session.user.email },
      successUrl: "/success",
      metadata: { userId: session.user.id },
    }
  );

  redirect(url);
}
```

### Middleware Example

Protect routes based on subscription status:

```typescript
import { checkSubscriptionAccess } from "@creem_io/better-auth/server";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const status = await checkSubscriptionAccess(
    {
      apiKey: process.env.CREEM_API_KEY!,
      testMode: true,
    },
    {
      database: auth.options.database,
      userId: session.user.id,
    }
  );

  if (!status.hasAccess) {
    return NextResponse.redirect(new URL("/subscribe", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

### Utility Functions

```typescript
import {
  isActiveSubscription,
  formatCreemDate,
  getDaysUntilRenewal,
} from "@creem_io/better-auth/server";

// Check if status grants access
if (isActiveSubscription(subscription.status)) {
  // User has access
}

// Format Creem timestamps
const renewalDate = formatCreemDate(subscription.next_billing_date);
console.log(renewalDate.toLocaleDateString());

// Calculate days until renewal
const days = getDaysUntilRenewal(subscription.current_period_end_date);
console.log(`Renews in ${days} days`);
```

### Database Mode vs API Mode

The plugin supports two operational modes:

### Database Mode (Recommended)

When `persistSubscriptions: true` (default), subscription data is stored in your database.

**Benefits:**

* Fast access checks without API calls
* Offline access to subscription data
* Query subscriptions with SQL
* Automatic synchronization via webhooks
* Trial abuse prevention

**Usage:**

```typescript
creem({
  apiKey: process.env.CREEM_API_KEY!,
  persistSubscriptions: true, // Default
})
```

### API Mode

When `persistSubscriptions: false`, all data comes directly from the Creem API.

**Benefits:**

* No database schema required
* Simpler initial setup

**Limitations:**

* Requires API call for each access check
* Some features require custom implementation
* No built-in trial abuse prevention

**Usage:**

```typescript
creem({
  apiKey: process.env.CREEM_API_KEY!,
  persistSubscriptions: false,
})
```

<Callout type="warn">
  In API mode, functions like `checkSubscriptionAccess` and `hasAccessGranted` have limited functionality and may require custom implementation using the Creem SDK directly.
</Callout>

## Type Exports

### Server-Side Types

| Type Name               | Description                                                                                    | Typical Usage                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `CreemOptions`          | Configuration options for the Creem plugin, such as API keys and persistence settings.         | Used to configure the plugin on the server.   |
| `GrantAccessContext`    | Context passed to custom access control hooks when granting access to a user.                  | Used in custom access logic.                  |
| `RevokeAccessContext`   | Context passed to hooks when revoking user access due to subscription status changes.          | Used in custom access logic.                  |
| `GrantAccessReason`     | Enum or type describing reasons for granting access (e.g., payment received, trial activated). | Returned in access-related hooks and events.  |
| `RevokeAccessReason`    | Enum or type describing reasons for revoking access (e.g., canceled, payment failed).          | Returned in access-related hooks and events.  |
| `FlatCheckoutCompleted` | Event object type for webhook payload when a checkout completes successfully.                  | Used in webhook handlers and event listeners. |
| `FlatRefundCreated`     | Event object type for webhook payload when a refund is created.                                | Used in webhook handlers and event listeners. |
| `FlatDisputeCreated`    | Event object type for webhook payload when a dispute is created.                               | Used in webhook handlers and event listeners. |
| `FlatSubscriptionEvent` | Event object type for generic subscription events (created, updated, canceled, etc).           | Used in webhook handlers and event listeners. |

### Client-Side Types

| Type Name                    | Description                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| `CreateCheckoutInput`        | Input parameters for creating a checkout session.                                                  |
| `CreateCheckoutResponse`     | Response shape for a checkout session creation request.                                            |
| `CheckoutCustomer`           | Customer information type used in a checkout session.                                              |
| `CreatePortalInput`          | Input parameters for creating a customer portal session.                                           |
| `CreatePortalResponse`       | Response data for a request to create a customer portal.                                           |
| `CancelSubscriptionInput`    | Input parameters when cancelling a subscription.                                                   |
| `CancelSubscriptionResponse` | Response data for a subscription cancellation request.                                             |
| `RetrieveSubscriptionInput`  | Input for retrieving a specific subscription's details.                                            |
| `SubscriptionData`           | Subscription information structure as returned by the API.                                         |
| `SearchTransactionsInput`    | Filters and parameters for searching transactions.                                                 |
| `SearchTransactionsResponse` | Response structure for a transaction search query.                                                 |
| `TransactionData`            | Data relating to individual transactions (e.g., payment, refund, etc).                             |
| `HasAccessGrantedResponse`   | The shape of the response indicating whether a user has access based on subscription status/rules. |

## Trial Abuse Prevention

When using database mode (`persistSubscriptions: true`), the plugin automatically prevents trial abuse. Users can only receive one trial across all subscription plans.

**Example Scenario:**

1. User subscribes to "Starter" plan with 7-day trial
2. User cancels subscription during the trial period
3. User attempts to subscribe to "Premium" plan
4. No trial is offered - user is charged immediately

This protection is automatic and requires no configuration. Trial eligibility is determined when the subscription is created and cannot be overridden.

## Troubleshooting

### Webhook Issues

If webhooks aren't being processed correctly:

1. Verify the webhook URL is correct in your Creem dashboard
2. Check that the webhook signing secret matches
3. Ensure all necessary events are selected in the Creem dashboard
4. Review server logs for webhook processing errors
5. Test webhook delivery using Creem's webhook testing tool

### Subscription Status Issues

If subscription statuses aren't updating:

1. Confirm webhooks are being received and processed
2. Verify `creemCustomerId` and `creemSubscriptionId` fields are populated
3. Check that reference IDs match between your application and Creem
4. Review webhook handler logs for errors

### Database Mode Not Working

If database persistence isn't functioning:

1. Ensure `persistSubscriptions: true` is set (it's the default)
2. Run migrations: `npx @better-auth/cli migrate`
3. Verify database connection is working
4. Check that schema tables were created successfully
5. Review database adapter configuration

### API Mode Limitations

Some functionalities are only available in database mode or require extra parameters to be passed:

* `checkSubscriptionAccess` requires passing the `userId` parameter
* `getActiveSubscriptions` requires passing the `userId` parameter
* No automatic trial abuse prevention
* No access to `hasAccessGranted` client method

To use these features, either enable database mode or implement custom logic using the Creem SDK directly.

## Additional Resources

* [Creem Documentation](https://docs.creem.io)
* [Creem Dashboard](https://creem.io/dashboard)
* [Better Auth Documentation](https://better-auth.com)
* [Plugin GitHub Repository Additional Documentation](https://github.com/armitage-labs/creem-betterauth)

## Support

For issues or questions:

* Open an issue on [GitHub](https://github.com/armitage-labs/creem-betterauth/issues)
* Contact Creem support at [support@creem.io](mailto:support@creem.io)
* Join our [Discord community](https://discord.gg/q3GKZs92Av) for real-time support and discussion.
* Chat with us directly using the in-app live chat on the [Creem dashboard](https://creem.io/dashboard).

# Webhooks

> Use webhooks to notify your application about payment events.

## What is a webhook?

Creem uses webhooks to push real-time notifications to you about your payments and subscriptions. All webhooks use HTTPS and deliver a JSON payload that can be used by your application. You can use webhook feeds to do things like:

* Automatically enable access to a user after a successful payment
* Automatically remove access to a user after a canceled subscription
* Confirm that a payment has been received by the same customer that initiated it.

In case webhooks are not successfully received by your endpoint, creem automatically retries to send the request with a progressive backoff period of 30 seconds, 1 minute, 5 minutes and 1 hour.

## Steps to receive a webhook

You can start receiving real-time events in your app using the steps:

* Create a local endpoint to receive requests
* Register your development webhook endpoint on the Developers tab of the Creem dashboard
* Test that your webhook endpoint is working properly using the test environment
* Deploy your webhook endpoint to production
* Register your production webhook endpoint on Creem live dashboard

<Info>
  On Next.js projects, the{" "}
  <a href="/code/sdks/nextjs">@creem\_io/nextjs adapter</a> exports a `Webhook`
  helper that verifies signatures and surfaces typed lifecycle callbacks. Use it
  as your default implementation before falling back to manual parsing.
</Info>

### 1. Create a local endpoint to receive requests

In your local application, create a new route that can accept POST requests.

<CodeGroup>
  ```ts Next.js theme={null}
  // app/api/webhook/creem/route.ts
  import { Webhook } from "@creem_io/nextjs";

  export const POST = Webhook({
    webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,
    onCheckoutCompleted: async ({ customer, product }) => {
      console.log(`${customer.email} purchased ${product.name}`);
    },
    onGrantAccess: async ({ customer, metadata }) => {
      const userId = metadata?.referenceId as string;
      await grantAccess(userId, customer.email);
    },
    onRevokeAccess: async ({ customer, metadata }) => {
      const userId = metadata?.referenceId as string;
      await revokeAccess(userId, customer.email);
    },
  });
  ```

  ```ts Node.js theme={null}
  import type { NextApiRequest, NextApiResponse } from "next";

  export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if (req.method !== "POST") {
      return res.status(405).end();
    }

    const payload = req.body;
    console.log(payload);
    res.status(200).end();
  }
  ```
</CodeGroup>

On receiving an event, you should respond with an HTTP 200 OK to signal to Creem that the event was successfully delivered.

### 2. Register your development webhook endpoint

Register your publicly accessible HTTPS URL in the Creem dashboard.

<Tip>
  You can create a tunnel to your localhost server using a tool like ngrok. For
  example: [https://8733-191-204-177-89.sa.ngrok.io/api/webhooks](https://8733-191-204-177-89.sa.ngrok.io/api/webhooks)
</Tip>

<img style={{ borderRadius: "0.5rem" }} src="https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/test-webhook-yBodvIWasxCmgr4bYqZJBlWg8qbUD2.png" />

### 3. Test that your webhook endpoint is working properly

Create a few test payments to check that your webhook endpoint is receiving the events.

### 4. Deploy your webhook endpoint

After you're done testing, deploy your webhook endpoint to production.

### 5. Register your production webhook endpoint

Once your webhook endpoint is deployed to production, you can register it in the Creem dashboard.

## Webhook Signatures

### How to verify Creem signature?

Creem signature is sent in the `creem-signature` header of the webhook request. The signature is generated using the HMAC-SHA256 algorithm with the webhook secret as the key, and the request payload as the message.

<AccordionGroup>
  <Accordion title="Sample Webhook Header">
    ```json  theme={null}
    {
    'creem-signature': 'dd7bdd2cf1f6bac6e171c6c508c157b7cd3cc1fd196394277fb59ba0bdd9b87b'
    }
    ```
  </Accordion>
</AccordionGroup>

To verify the signature, you need to generate the signature using the same algorithm and compare it with the signature sent in the header. If the two signatures match, the request is authentic.

<Tip>
  You can find your webhook secret on the Developers>Webhook page.
</Tip>

<img style={{ borderRadius: '0.5rem' }} src="https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/Screenshot%202024-10-03%20at%2014.26.39-MtSMvooQi4OrZoh9eMyFZngfc0CrQn.png" />

To generate the signature, you can use the following code snippet:

```typescript  theme={null}
import * as crypto from 'crypto';

  generateSignature(payload: string, secret: string): string {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return computedSignature;
  }
```

In the code snippet above, the `payload` is the request body, and the `secret` is the webhook secret.
Simply compare the generated Signature with the one received on the header to complete the verification process.

## Event Types

List of supported event types and their payloads.

### checkout.completed

A checkout session was completed, returning all the information about the payment and the order created.

<AccordionGroup>
  <Accordion title="Sample Request Body">
    ```json  theme={null}
    {
      "id": "evt_5WHHcZPv7VS0YUsberIuOz",
      "eventType": "checkout.completed",
      "created_at": 1728734325927,
      "object": {
        "id": "ch_4l0N34kxo16AhRKUHFUuXr",
        "object": "checkout",
        "request_id": "my-request-id",
        "order": {
          "id": "ord_4aDwWXjMLpes4Kj4XqNnUA",
          "customer": "cust_1OcIK1GEuVvXZwD19tjq2z",
          "product": "prod_d1AY2Sadk9YAvLI0pj97f",
          "amount": 1000,
          "currency": "EUR",
          "status": "paid",
          "type": "recurring",
          "created_at": "2024-10-12T11:58:33.097Z",
          "updated_at": "2024-10-12T11:58:33.097Z",
          "mode": "local"
        },
        "product": {
          "id": "prod_d1AY2Sadk9YAvLI0pj97f",
          "name": "Monthly",
          "description": "Monthly",
          "image_url": null,
          "price": 1000,
          "currency": "EUR",
          "billing_type": "recurring",
          "billing_period": "every-month",
          "status": "active",
          "tax_mode": "exclusive",
          "tax_category": "saas",
          "default_success_url": "",
          "created_at": "2024-10-11T11:50:00.182Z",
          "updated_at": "2024-10-11T11:50:00.182Z",
          "mode": "local"
        },
        "customer": {
          "id": "cust_1OcIK1GEuVvXZwD19tjq2z",
          "object": "customer",
          "email": "customer@emaildomain",
          "name": "Tester Test",
          "country": "NL",
          "created_at": "2024-10-11T09:16:48.557Z",
          "updated_at": "2024-10-11T09:16:48.557Z",
          "mode": "local"
        },
        "subscription": {
          "id": "sub_6pC2lNB6joCRQIZ1aMrTpi",
          "object": "subscription",
          "product": "prod_d1AY2Sadk9YAvLI0pj97f",
          "customer": "cust_1OcIK1GEuVvXZwD19tjq2z",
          "collection_method": "charge_automatically",
          "status": "active",
          "canceled_at": null,
          "created_at": "2024-10-12T11:58:45.425Z",
          "updated_at": "2024-10-12T11:58:45.425Z",
          "metadata": {
            "custom_data": "mycustom data",
            "internal_customer_id": "internal_customer_id"
          },
          "mode": "local"
        },
        "custom_fields": [],
        "status": "completed",
        "metadata": {
          "custom_data": "mycustom data",
          "internal_customer_id": "internal_customer_id"
        },
        "mode": "local"
      }
    }
    ```
  </Accordion>
</AccordionGroup>

### subscription.active

Received when a new subscription is created, the payment was successful and Creem collected the payment creating a new subscription object in your account.
Use only for synchronization, we encourage using `subscription.paid` for activating access.

<AccordionGroup>
  <Accordion title="Sample Request Body">
    ```json  theme={null}
    {
      "id": "evt_6EptlmjazyGhEPiNQ5f4lz",
      "eventType": "subscription.active",
      "created_at": 1728734325927,
      "object": {
          "id": "sub_21lfZb67szyvMiXnm6SVi0",
          "object": "subscription",
          "product": {
              "id": "prod_AnVJ11ujp7x953ARpJvAF",
              "name": "My Product - Product 01",
              "description": "Test my product",
              "image_url": null,
              "price": 10000,
              "currency": "EUR",
              "billing_type": "recurring",
              "billing_period": "every-month",
              "status": "active",
              "tax_mode": "inclusive",
              "tax_category": "saas",
              "default_success_url": "",
              "created_at": "2024-09-16T16:12:09.813Z",
              "updated_at": "2024-09-16T16:12:09.813Z",
              "mode": "local"
          },
          "customer": {
              "id": "cust_3biFPNt4Cz5YRDSdIqs7kc",
              "object": "customer",
              "email": "customer@emaildomain",
              "name": "Tester Test",
              "country": "SE",
              "created_at": "2024-09-16T16:13:39.265Z",
              "updated_at": "2024-09-16T16:13:39.265Z",
              "mode": "local"
          },
          "collection_method": "charge_automatically",
          "status": "active",
          "canceled_at": "2024-09-16T19:40:41.984Z",
          "created_at": "2024-09-16T19:40:41.984Z",
          "updated_at": "2024-09-16T19:40:42.121Z",
          "mode": "local"
      }
    }
    ```
  </Accordion>
</AccordionGroup>

### subscription.paid

A subscription transaction was paid by the customer

<AccordionGroup>
  <Accordion title="Sample Request Body">
    ```json  theme={null}
    {
      "id": "evt_21mO1jWmU2QHe7u2oFV7y1",
      "eventType": "subscription.paid",
      "created_at": 1728734327355,
      "object": {
        "id": "sub_6pC2lNB6joCRQIZ1aMrTpi",
        "object": "subscription",
        "product": {
          "id": "prod_d1AY2Sadk9YAvLI0pj97f",
          "name": "Monthly",
          "description": "Monthly",
          "image_url": null,
          "price": 1000,
          "currency": "EUR",
          "billing_type": "recurring",
          "billing_period": "every-month",
          "status": "active",
          "tax_mode": "exclusive",
          "tax_category": "saas",
          "default_success_url": "",
          "created_at": "2024-10-11T11:50:00.182Z",
          "updated_at": "2024-10-11T11:50:00.182Z",
          "mode": "local"
        },
        "customer": {
          "id": "cust_1OcIK1GEuVvXZwD19tjq2z",
          "object": "customer",
          "email": "customer@emaildomain",
          "name": "Tester Test",
          "country": "NL",
          "created_at": "2024-10-11T09:16:48.557Z",
          "updated_at": "2024-10-11T09:16:48.557Z",
          "mode": "local"
        },
        "collection_method": "charge_automatically",
        "status": "active",
        "last_transaction_id": "tran_5yMaWzAl3jxuGJMCOrYWwk",
        "last_transaction_date": "2024-10-12T11:58:47.109Z",
        "next_transaction_date": "2024-11-12T11:58:38.000Z",
        "current_period_start_date": "2024-10-12T11:58:38.000Z",
        "current_period_end_date": "2024-11-12T11:58:38.000Z",
        "canceled_at": null,
        "created_at": "2024-10-12T11:58:45.425Z",
        "updated_at": "2024-10-12T11:58:45.425Z",
        "metadata": {
          "custom_data": "mycustom data",
          "internal_customer_id": "internal_customer_id"
        },
        "mode": "local"
      }
    }
    ```
  </Accordion>
</AccordionGroup>

### subscription.canceled

The subscription was canceled by the merchant or by the customer.

<AccordionGroup>
  <Accordion title="Sample Request Body">
    ```json  theme={null}
    {
      "id": "evt_2iGTc600qGW6FBzloh2Nr7",
      "eventType": "subscription.canceled",
      "created_at": 1728734337932,
      "object": {
        "id": "sub_6pC2lNB6joCRQIZ1aMrTpi",
        "object": "subscription",
        "product": {
          "id": "prod_d1AY2Sadk9YAvLI0pj97f",
          "name": "Monthly",
          "description": "Monthly",
          "image_url": null,
          "price": 1000,
          "currency": "EUR",
          "billing_type": "recurring",
          "billing_period": "every-month",
          "status": "active",
          "tax_mode": "exclusive",
          "tax_category": "saas",
          "default_success_url": "",
          "created_at": "2024-10-11T11:50:00.182Z",
          "updated_at": "2024-10-11T11:50:00.182Z",
          "mode": "local"
        },
        "customer": {
          "id": "cust_1OcIK1GEuVvXZwD19tjq2z",
          "object": "customer",
          "email": "customer@emaildomain",
          "name": "Tester Test",
          "country": "NL",
          "created_at": "2024-10-11T09:16:48.557Z",
          "updated_at": "2024-10-11T09:16:48.557Z",
          "mode": "local"
        },
        "collection_method": "charge_automatically",
        "status": "canceled",
        "last_transaction_id": "tran_5yMaWzAl3jxuGJMCOrYWwk",
        "last_transaction_date": "2024-10-12T11:58:47.109Z",
        "current_period_start_date": "2024-10-12T11:58:38.000Z",
        "current_period_end_date": "2024-11-12T11:58:38.000Z",
        "canceled_at": "2024-10-12T11:58:57.813Z",
        "created_at": "2024-10-12T11:58:45.425Z",
        "updated_at": "2024-10-12T11:58:57.827Z",
        "metadata": {
          "custom_data": "mycustom data",
          "internal_customer_id": "internal_customer_id"
        },
        "mode": "local"
      }
    }
    ```
  </Accordion>
</AccordionGroup>

### subscription.expired

The subscription was expired, given that the `current_end_period` has been reached without a new payment.
Payment retries can happen at this stage, and the subscription status will be terminal only when status is changed to `canceled`.

<AccordionGroup>
  <Accordion title="Sample Request Body">
    ```json  theme={null}
    {
      "id": "evt_V5CxhipUu10BYonO2Vshb",
      "eventType": "subscription.expired",
      "created_at": 1734463872058,
      "object": {
          "id": "sub_7FgHvrOMC28tG5DEemoCli",
          "object": "subscription",
          "product": {
              "id": "prod_3ELsC3Lt97orn81SOdgQI3",
              "name": "Subs",
              "description": "Subs",
              "image_url": null,
              "price": 1200,
              "currency": "EUR",
              "billing_type": "recurring",
              "billing_period": "every-year",
              "status": "active",
              "tax_mode": "exclusive",
              "tax_category": "saas",
              "default_success_url": "",
              "created_at": "2024-12-11T17:33:32.186Z",
              "updated_at": "2024-12-11T17:33:32.186Z",
              "mode": "local"
          },
          "customer": {
              "id": "cust_3y4k2CELGsw7n9Eeeiw2hm",
              "object": "customer",
              "email": "customer@emaildomain",
              "name": "Alec Erasmus",
              "country": "NL",
              "created_at": "2024-12-09T16:09:20.709Z",
              "updated_at": "2024-12-09T16:09:20.709Z",
              "mode": "local"
          },
          "collection_method": "charge_automatically",
          "status": "active",
          "last_transaction_id": "tran_6ZeTvMqMkGdAIIjw5aAcnh",
          "last_transaction_date": "2024-12-16T12:40:12.658Z",
          "next_transaction_date": "2025-12-16T12:39:47.000Z",
          "current_period_start_date": "2024-12-16T12:39:47.000Z",
          "current_period_end_date": "2024-12-16T12:39:47.000Z",
          "canceled_at": null,
          "created_at": "2024-12-16T12:40:05.058Z",
          "updated_at": "2024-12-16T12:40:05.058Z",
          "mode": "local"
      }
    }
    ```
  </Accordion>
</AccordionGroup>

### refund.created

A refund was created by the merchant

<AccordionGroup>
  <Accordion title="Sample Request Body">
    ```json  theme={null}
    {
    "id": "evt_61eTsJHUgInFw2BQKhTiPV",
    "eventType": "refund.created",
    "created_at": 1728734351631,
    "object": {
      "id": "ref_3DB9NQFvk18TJwSqd0N6bd",
      "object": "refund",
      "status": "succeeded",
      "refund_amount": 1210,
      "refund_currency": "EUR",
      "reason": "requested_by_customer",
      "transaction": {
        "id": "tran_5yMaWzAl3jxuGJMCOrYWwk",
        "object": "transaction",
        "amount": 1000,
        "amount_paid": 1210,
        "currency": "EUR",
        "type": "invoice",
        "tax_country": "NL",
        "tax_amount": 210,
        "status": "refunded",
        "refunded_amount": 1210,
        "order": "ord_4aDwWXjMLpes4Kj4XqNnUA",
        "subscription": "sub_6pC2lNB6joCRQIZ1aMrTpi",
        "description": "Subscription payment",
        "period_start": 1728734318000,
        "period_end": 1731412718000,
        "created_at": 1728734327109,
        "mode": "local"
      },
      "subscription": {
        "id": "sub_6pC2lNB6joCRQIZ1aMrTpi",
        "object": "subscription",
        "product": "prod_d1AY2Sadk9YAvLI0pj97f",
        "customer": "cust_1OcIK1GEuVvXZwD19tjq2z",
        "collection_method": "charge_automatically",
        "status": "canceled",
        "last_transaction_id": "tran_5yMaWzAl3jxuGJMCOrYWwk",
        "last_transaction_date": "2024-10-12T11:58:47.109Z",
        "current_period_start_date": "2024-10-12T11:58:38.000Z",
        "current_period_end_date": "2024-11-12T11:58:38.000Z",
        "canceled_at": "2024-10-12T11:58:57.813Z",
        "created_at": "2024-10-12T11:58:45.425Z",
        "updated_at": "2024-10-12T11:58:57.827Z",
        "metadata": {
          "custom_data": "mycustom data",
          "internal_customer_id": "internal_customer_id"
        },
        "mode": "local"
      },
      "checkout": {
        "id": "ch_4l0N34kxo16AhRKUHFUuXr",
        "object": "checkout",
        "request_id": "my-request-id",
        "custom_fields": [],
        "status": "completed",
        "metadata": {
          "custom_data": "mycustom data",
          "internal_customer_id": "internal_customer_id"
        },
        "mode": "local"
      },
      "order": {
        "id": "ord_4aDwWXjMLpes4Kj4XqNnUA",
        "customer": "cust_1OcIK1GEuVvXZwD19tjq2z",
        "product": "prod_d1AY2Sadk9YAvLI0pj97f",
        "amount": 1000,
        "currency": "EUR",
        "status": "paid",
        "type": "recurring",
        "created_at": "2024-10-12T11:58:33.097Z",
        "updated_at": "2024-10-12T11:58:33.097Z",
        "mode": "local"
      },
      "customer": {
        "id": "cust_1OcIK1GEuVvXZwD19tjq2z",
        "object": "customer",
        "email": "customer@emaildomain",
        "name": "Tester Test",
        "country": "NL",
        "created_at": "2024-10-11T09:16:48.557Z",
        "updated_at": "2024-10-11T09:16:48.557Z",
        "mode": "local"
      },
      "created_at": 1728734351525,
      "mode": "local"
    }
    }
    ```
  </Accordion>
</AccordionGroup>

### dispute.created

A dispute was created by the customer

<AccordionGroup>
  <Accordion title="Sample Request Body">
    ```json  theme={null}
    {
      "id": "evt_6mfLDL7P0NYwYQqCrICvDH",
      "eventType": "dispute.created",
      "created_at": 1750941264812,
      "object": {
        "id": "disp_6vSsOdTANP5PhOzuDlUuXE",
        "object": "dispute",
        "amount": 1331,
        "currency": "EUR",
        "transaction": {
          "id": "tran_4Dk8CxWFdceRUQgMFhCCXX",
          "object": "transaction",
          "amount": 1100,
          "amount_paid": 1331,
          "currency": "EUR",
          "type": "invoice",
          "tax_country": "NL",
          "tax_amount": 231,
          "status": "chargeback",
          "refunded_amount": 1331,
          "order": "ord_57bf8042UmG8fFypxZrfnj",
          "subscription": "sub_5sD6zM482uwOaEoyEUDDJs",
          "customer": "cust_OJPZd2GMxgo1MGPNXXBSN",
          "description": "Subscription payment",
          "period_start": 1750941201000,
          "period_end": 1753533201000,
          "created_at": 1750941205659,
          "mode": "sandbox"
        },
        "subscription": {
          "id": "sub_5sD6zM482uwOaEoyEUDDJs",
          "object": "subscription",
          "product": "prod_3EFtQRQ9SNIizK3xwfxZHu",
          "customer": "cust_OJPZd2GMxgo1MGPNXXBSN",
          "collection_method": "charge_automatically",
          "status": "active",
          "current_period_start_date": "2025-06-26T12:33:21.000Z",
          "current_period_end_date": "2025-07-26T12:33:21.000Z",
          "canceled_at": null,
          "created_at": "2025-06-26T12:33:23.589Z",
          "updated_at": "2025-06-26T12:33:26.102Z",
          "mode": "sandbox"
        },
        "checkout": {
          "id": "ch_1bJMvqGGzHIftf4ewLXJeq",
          "object": "checkout",
          "product": "prod_3EFtQRQ9SNIizK3xwfxZHu",
          "units": 1,
          "custom_fields": [
            {
              "key": "testing",
              "text": {
                "value": "asdfasdf",
                "max_length": 255
              },
              "type": "text",
              "label": "Testing",
              "optional": false
            }
          ],
          "status": "completed",
          "mode": "sandbox"
        },
        "order": {
          "object": "order",
          "id": "ord_57bf8042UmG8fFypxZrfnj",
          "customer": "cust_OJPZd2GMxgo1MGPNXXBSN",
          "product": "prod_3EFtQRQ9SNIizK3xwfxZHu",
          "amount": 1100,
          "currency": "EUR",
          "sub_total": 1100,
          "tax_amount": 231,
          "amount_due": 1331,
          "amount_paid": 1331,
          "status": "paid",
          "type": "recurring",
          "transaction": "tran_4Dk8CxWFdceRUQgMFhCCXX",
          "created_at": "2025-06-26T12:32:41.395Z",
          "updated_at": "2025-06-26T12:32:41.395Z",
          "mode": "sandbox"
        },
        "customer": {
          "id": "cust_OJPZd2GMxgo1MGPNXXBSN",
          "object": "customer",
          "email": "customer@emaildomain",
          "name": "Alec Erasmus",
          "country": "NL",
          "created_at": "2025-02-05T10:11:01.146Z",
          "updated_at": "2025-02-05T10:11:01.146Z",
          "mode": "sandbox"
        },
        "created_at": 1750941264728,
        "mode": "local"
      }
    }
    ```
  </Accordion>
</AccordionGroup>

### subscription.update

A subscription object was updated

<AccordionGroup>
  <Accordion title="Sample Request Body">
    ```json  theme={null}
    {
    "id": "evt_5pJMUuvqaqvttFVUvtpY32",
    "eventType": "subscription.update",
    "created_at": 1737890536421,
    "object": {
      "id": "sub_2qAuJgWmXhXHAuef9k4Kur",
      "object": "subscription",
      "product": {
        "id": "prod_1dP15yoyogQe2seEt1Evf3",
        "name": "Monthly Sub",
        "description": "Test Test",
        "image_url": null,
        "price": 1000,
        "currency": "EUR",
        "billing_type": "recurring",
        "billing_period": "every-month",
        "status": "active",
        "tax_mode": "exclusive",
        "tax_category": "saas",
        "default_success_url": "",
        "created_at": "2025-01-26T11:17:16.082Z",
        "updated_at": "2025-01-26T11:17:16.082Z",
        "mode": "local"
      },
      "customer": {
        "id": "cust_2fQZKKUZqtNhH2oDWevQkW",
        "object": "customer",
        "email": "customer@emaildomain",
        "name": "John Doe",
        "country": "NL",
        "created_at": "2025-01-26T11:18:24.071Z",
        "updated_at": "2025-01-26T11:18:24.071Z",
        "mode": "local"
      },
      "items": [
        {
          "object": "subscription_item",
          "id": "sitem_3QWlqRbAat2eBRakAxFtt9",
          "product_id": "prod_5jnudVkLGZWF4AqMFBs5t5",
          "price_id": "pprice_4W0mJK6uGiQzHbVhfaFTl1",
          "units": 1,
          "created_at": "2025-01-26T11:20:40.296Z",
          "updated_at": "2025-01-26T11:20:40.296Z",
          "mode": "local"
        }
      ],
      "collection_method": "charge_automatically",
      "status": "active",
      "current_period_start_date": "2025-01-26T11:20:36.000Z",
      "current_period_end_date": "2025-02-26T11:20:36.000Z",
      "canceled_at": null,
      "created_at": "2025-01-26T11:20:40.292Z",
      "updated_at": "2025-01-26T11:22:16.388Z",
      "mode": "local"
    }
    }
    ```
  </Accordion>
</AccordionGroup>

### subscription.trialing

A subscription started a trial period

<AccordionGroup>
  <Accordion title="Sample Request Body">
    ```json  theme={null}
    {
    "id": "evt_2ciAM8ABYtj0pVueeJPxUZ",
    "eventType": "subscription.trialing",
    "created_at": 1739963911073,
    "object": {
      "id": "sub_dxiauR8zZOwULx5QM70wJ",
      "object": "subscription",
      "product": {
        "id": "prod_3kpf0ZdpcfsSCQ3kDiwg9m",
        "name": "trail",
        "description": "asdfasf",
        "image_url": null,
        "price": 1100,
        "currency": "EUR",
        "billing_type": "recurring",
        "billing_period": "every-month",
        "status": "active",
        "tax_mode": "exclusive",
        "tax_category": "saas",
        "default_success_url": "",
        "created_at": "2025-02-19T11:18:07.570Z",
        "updated_at": "2025-02-19T11:18:07.570Z",
        "mode": "test"
      },
      "customer": {
        "id": "cust_4fpU8kYkQmI1XKBwU2qeME",
        "object": "customer",
        "email": "customer@emaildomain",
        "name": "Alec Erasmus",
        "country": "NL",
        "created_at": "2024-11-07T23:21:11.763Z",
        "updated_at": "2024-11-07T23:21:11.763Z",
        "mode": "test"
      },
      "items": [
        {
          "object": "subscription_item",
          "id": "sitem_1xbHCmIM61DHGRBCFn0W1L",
          "product_id": "prod_3kpf0ZdpcfsSCQ3kDiwg9m",
          "price_id": "pprice_517h9CebmM3P079bGAXHnE",
          "units": 1,
          "created_at": "2025-02-19T11:18:30.690Z",
          "updated_at": "2025-02-19T11:18:30.690Z",
          "mode": "test"
        }
      ],
      "collection_method": "charge_automatically",
      "status": "trialing",
      "current_period_start_date": "2025-02-19T11:18:25.000Z",
      "current_period_end_date": "2025-02-26T11:18:25.000Z",
      "canceled_at": null,
      "created_at": "2025-02-19T11:18:30.674Z",
      "updated_at": "2025-02-19T11:18:30.674Z",
      "mode": "test"
      }
    }
    ```
  </Accordion>
</AccordionGroup>

### subscription.paused

A checkout session was completed, returning all the information about the payment and the order created.

<AccordionGroup>
  <Accordion title="Sample Request Body">
    ```json  theme={null}
    {
    "id": "evt_5veN2cn5N9Grz8u7w3yJuL",
    "eventType": "subscription.paused",
    "created_at": 1754041946898,
    "object": {
      "id": "sub_3ZT1iYMeDBpiUpRTqq4veE",
      "object": "subscription",
      "product": {
        "id": "prod_sYwbyE1tPbsqbLu6S0bsR",
        "object": "product",
        "name": "Prod",
        "description": "My Product Description",
        "price": 2000,
        "currency": "EUR",
        "billing_type": "recurring",
        "billing_period": "every-month",
        "status": "active",
        "tax_mode": "exclusive",
        "tax_category": "saas",
        "default_success_url": "",
        "created_at": "2025-08-01T09:51:26.277Z",
        "updated_at": "2025-08-01T09:51:26.277Z",
        "mode": "test"
      },
      "customer": {
        "id": "cust_4fpU8kYkQmI1XKBwU2qeME",
        "object": "customer",
        "email": "customer@emaildomain",
        "name": "Test Test",
        "country": "NL",
        "created_at": "2024-11-07T23:21:11.763Z",
        "updated_at": "2024-11-07T23:21:11.763Z",
        "mode": "test"
      },
      "items": [
        {
          "object": "subscription_item",
          "id": "sitem_1ZIqcUuxKKDTj5WZPNsN6C",
          "product_id": "prod_sYwbyE1tPbsqbLu6S0bsR",
          "price_id": "pprice_1uM3Pi1vJJ3xkhwQuZiM42",
          "units": 1,
          "created_at": "2025-08-01T09:51:50.497Z",
          "updated_at": "2025-08-01T09:51:50.497Z",
          "mode": "test"
        }
      ],
      "collection_method": "charge_automatically",
      "status": "paused",
      "current_period_start_date": "2025-08-01T09:51:47.000Z",
      "current_period_end_date": "2025-09-01T09:51:47.000Z",
      "canceled_at": null,
      "created_at": "2025-08-01T09:51:50.488Z",
      "updated_at": "2025-08-01T09:52:26.822Z",
      "mode": "test"
    }
    }
    ```
  </Accordion>
</AccordionGroup>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.creem.io/llms.txt