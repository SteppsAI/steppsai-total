# December 2024 Changes

## 1. Word Export Fix

Caption and image now stay on the same page using a table-based approach in `generateExportDocx.ts`.

---

## 2. Pricing Deals Table

### Schema (simplified)
```sql
CREATE TABLE pricing_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,        -- 'lifetime' | 'team'
  region TEXT NOT NULL,      -- 'US' | 'EU'
  environment TEXT NOT NULL, -- 'production' | 'development'
  product_id TEXT NOT NULL,
  price_amount INTEGER NOT NULL,
  team_size INTEGER,
  is_active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0
);
```

### SQL Insert (run after `pnpm --filter @repo/data-ops push`)

```sql
-- DEVELOPMENT
INSERT INTO pricing_deals (name, slug, type, region, environment, product_id, price_amount, team_size, is_active, display_order)
VALUES
('Lifetime Deal', 'lifetime-eu-dev', 'lifetime', 'EU', 'development', 'prod_4vYeqb4GliF45ShZtj5v4z', 14900, NULL, 1, 1),
('Lifetime Deal', 'lifetime-us-dev', 'lifetime', 'US', 'development', 'prod_6KA7T37qW1NqzrdIzY4KPC', 14900, NULL, 1, 1);

-- PRODUCTION
INSERT INTO pricing_deals (name, slug, type, region, environment, product_id, price_amount, team_size, is_active, display_order)
VALUES
('Lifetime Deal', 'lifetime-eu-prod', 'lifetime', 'EU', 'production', 'prod_7lYJ3I4faEQkaZuntOnV7E', 14900, NULL, 1, 1),
('Lifetime Deal', 'lifetime-us-prod', 'lifetime', 'US', 'production', 'prod_1f68HplUNotde3bINTGPiH', 14900, NULL, 1, 1);

-- TEAM
INSERT INTO pricing_deals (name, slug, type, region, environment, product_id, price_amount, team_size, is_active, display_order)
VALUES 
('Team Plan', 'team-us-dev', 'team', 'US', 'development', 'prod_4jyRA99A5sf29bcShAQzKk', 24900, 3, 1, 2),
('Team Plan', 'team-eu-dev', 'team', 'EU', 'development', 'prod_4xt2tyu3pgRfTkDz012zKo', 24900, 3, 1, 2),
('Team Plan', 'team-us-prod', 'team', 'US', 'production', 'prod_7N2fLGpeREpxWs5jpac4ua', 24900, 3, 1, 2),
('Team Plan', 'team-eu-prod', 'team', 'EU', 'production', 'prod_kqcb36vCT1lqNMALqdfTw', 24900, 3, 1, 2);
```

---

## 3. Team System

### How 3-Member Limit Works

```
Owner buys Team Plan ($249)
        ↓
creem_subscription.product_id = team product ID
        ↓
team.ts checks: is product_id a team product?
        ↓
If yes → maxMembers = 3
        ↓
countActiveTeamMembers(ownerId) checks current count
        ↓
If count >= 3 → reject new invites
```

### Tables
- `creem_subscription` - stores who bought what product
- `team_members` - links owner to members (status: pending/accepted)

### Team Members Query Functions (`packages/data-ops/src/queries/team-members.ts`)

| Function | Purpose |
|----------|---------|
| `getTeamMembers(ownerId)` | Get all team members for an owner (with user info) |
| `countActiveTeamMembers(ownerId)` | Count accepted members for limit check |
| `addTeamMemberByEmail(ownerId, email, role)` | Invite user by email |
| `removeTeamMember(ownerId, teamMemberId)` | Remove a member |
| `acceptTeamInvitation(memberId, teamMemberId)` | Accept pending invite |
| `declineTeamInvitation(memberId, teamMemberId)` | Decline pending invite |
| `getPendingInvitations(userId)` | Get invites for a user |
| `getTeamsAsMember(userId)` | Get teams where user is member |
| `updateTeamMemberRole(ownerId, teamMemberId, role)` | Change member role |

### Access Check Flow
1. User logs in
2. `checkUserAccess(userId)` runs
3. First checks own subscription
4. If none, checks if user is accepted member of a team
5. If team member, checks if owner has active subscription

---

## 4. Files Changed

| File | Purpose |
|------|---------|
| `schema.ts` | Added `pricing_deals` table |
| `pricing-deals.ts` | One query: `getPricingDeals()` |
| `team-members.ts` | Simplified to essential functions |
| `team_members.ts` (zod) | Type definition |
| `pricing.ts` (tRPC) | One endpoint: `getDeals` |
| `upgrade.tsx` | Plan selector (individual/team) |
| `generateExportDocx.ts` | Table-based layout |
| `$.tsx` | Catch-all redirect to `/` |

---

## 5. Setup

```bash
# 1. Push schema
pnpm --filter @repo/data-ops push

# 2. Run SQL inserts above in Supabase/database

# 3. Rebuild
pnpm build-package
```
