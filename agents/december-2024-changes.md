# December 2024 Changes Overview

## 1. Word Export Fix

### Problem
Caption and image were appearing on separate pages in Word exports.

### Solution
Changed from separate paragraphs to a **table-based approach**. Each step with an image is now wrapped in a 2-row table:
- Row 1: Caption text
- Row 2: Image

Tables in Word naturally keep their rows together on the same page.

### File
`apps/data-service/src/helpers/generateExportDocx.ts`

---

## 2. Pricing Deals System

### Purpose
Store all subscription types in the database instead of hardcoding in env vars.

### Table: `pricing_deals`

```sql
CREATE TABLE pricing_deals (
  id UUID PRIMARY KEY,
  name TEXT,              -- "Lifetime Deal", "Team Plan"
  slug TEXT UNIQUE,       -- "lifetime-us", "team-eu"
  type TEXT,              -- "lifetime" | "team" | "monthly" | "yearly"
  region TEXT,            -- "US" | "EU"
  environment TEXT,       -- "production" | "development"
  product_id TEXT,        -- Creem product ID for checkout
  price_amount INTEGER,   -- Price in cents (14900 = $149)
  team_size INTEGER,      -- 3 for team plans, NULL for individual
  features JSONB,         -- ["Feature 1", "Feature 2"]
  badge TEXT,             -- "BEST VALUE"
  is_active INTEGER,      -- 1 or 0
  display_order INTEGER   -- Sort order
);
```

### Usage
```typescript
// One query fetches all deals for a region
const deals = await getPricingDeals("US", "production");

// Frontend filters by type
const lifetimeDeal = deals.find(d => d.type === "lifetime");
const teamDeal = deals.find(d => d.type === "team");
```

---

## 3. Team/Organization System

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         TEAM OWNER                               │
│                                                                  │
│  1. Buys "Team Plan" ($249) via Creem checkout                  │
│  2. Gets productId stored in creem_subscription                  │
│  3. Can invite up to 3 team members                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      creem_subscription                          │
│                                                                  │
│  id: "abc123"                                                   │
│  reference_id: "owner-user-id"   ← Links to team owner          │
│  product_id: "team_product_xxx"  ← Identifies as team plan      │
│  status: "active"                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       team_members                               │
│                                                                  │
│  Row 1: owner_id="owner", member_id="user1", status="accepted"  │
│  Row 2: owner_id="owner", member_id="user2", status="accepted"  │
│  Row 3: owner_id="owner", member_id="user3", status="pending"   │
└─────────────────────────────────────────────────────────────────┘
```

### Tables Involved

**1. `creem_subscription`** - Stores who bought what
```
reference_id  → User ID (the team owner)
product_id    → Which product they bought (lifetime vs team)
status        → "active", "cancelled", etc.
```

**2. `team_members`** - Links owners to members
```
owner_id   → The user who bought the team plan
member_id  → The invited user
status     → "pending" | "accepted"
role       → "editor" | "admin"
```

### How 3-Member Limit is Enforced

```typescript
// In team.ts router - addMember mutation

// 1. Check if user has a team product
const access = await checkUserAccess(userId);
const maxMembers = getTeamLimit(access.productId, env);
// → Returns 3 if productId matches team products, 0 otherwise

// 2. Count current accepted members
const currentCount = await countActiveTeamMembers(userId);

// 3. Reject if at limit
if (currentCount >= maxMembers) {
  return { error: "Team limit reached (3 members)" };
}
```

### How Team Members Get Access

When a user logs in, `checkUserAccess()` runs:

```typescript
// 1. Check if user has their OWN subscription
const subscription = await getSubscriptionByUserId(userId);
if (subscription?.status === "active") {
  return { hasAccess: true };
}

// 2. If not, check if they're a team MEMBER
const teamMembership = await db
  .select({ ownerId: teamMembers.ownerId })
  .from(teamMembers)
  .where(
    memberId = userId AND
    status = "accepted"
  );

// 3. If they are, check if the OWNER has access
if (teamMembership) {
  const ownerSubscription = await getSubscriptionByUserId(ownerId);
  if (ownerSubscription?.status === "active") {
    return { hasAccess: true, viaTeam: true };
  }
}

return { hasAccess: false };
```

### Invitation Flow

1. **Owner invites** → `team.addMember({ email: "user@example.com" })`
   - Creates row in `team_members` with `status: "pending"`

2. **Member sees invitation** → `team.getPendingInvitations()`
   - Shows in their dashboard

3. **Member accepts** → `team.acceptInvitation({ teamMemberId })`
   - Updates `status` to `"accepted"`
   - Member now has access through owner's subscription

---

## 4. Upgrade Page Changes

### Before
- Only showed $149 lifetime deal
- No team option visible

### After
- Shows plan selector: **Individual** | **Team (3 seats)**
- Individual: $149 - single user
- Team: $249 - owner + 3 team members
- Selector only appears if `teamProductId` exists in config

### File
`apps/user-application/src/routes/app/upgrade.tsx`

---

## 5. 404 Routing Fix

### Problem
Unknown routes like `/webinars` showed "Page not found"

### Solution
Created catch-all route that redirects to `/`

### File
`apps/user-application/src/routes/$.tsx`

---

## Files Changed Summary

| Area | Files |
|------|-------|
| Word Export | `generateExportDocx.ts` |
| Pricing DB | `schema.ts`, `pricing-deals.ts`, `pricing.ts` |
| Team System | `team-members.ts`, `team.ts`, `subscriptions.ts` |
| Upgrade Page | `upgrade.tsx` |
| Routing | `$.tsx` |

---

## Setup Checklist

1. Push schema: `pnpm --filter @repo/data-ops push`
2. Insert pricing deals into `pricing_deals` table
3. Add team product IDs to wrangler.toml:
   ```
   VITE_CREEM_TEAM_PRODUCT_US_PRODUCTION = "prod_xxx"
   VITE_CREEM_TEAM_PRODUCT_EU_PRODUCTION = "prod_yyy"
   ```
4. Rebuild: `pnpm build-package`
