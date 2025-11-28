# Steps Table → JSONB Migration Plan

## Doel
- Verwijder `steps` table
- Voeg `steps` JSONB column toe aan `guides` table
- Vereenvoudig domSelector → simpele caption

---

## Nieuwe Step Type

```typescript
type Step = {
    id: string;              // UUID
    orderIndex: number;
    imageKey: string;        // R2 path: screenshots/{guideId}/{userId}/{stepId}.webp
    pageUrl: string;
    caption: string;         // "Step 1", "Step 2" (user kan editen)
    overlays?: {
        blur?: { x: number; y: number; w: number; h: number }[];
        arrow?: { x1: number; y1: number; x2: number; y2: number };
        circle?: { x: number; y: number; r: number };
        highlight?: { color: string; opacity: number };
    };
    isExcluded?: boolean;
};
```

**Verwijderd:**
- `domSelector` - nutteloos
- `aiCaption` - later toevoegen
- `finalCaption` → `caption`
- `screenshotUrl` → `imageKey`

---

## Migratie Stappen

### 1. Schema Update (data-ops)

**File:** `packages/data-ops/src/drizzle-out/schema.ts`

```diff
export const guides = pgTable("guides", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    folderId: uuid("folder_id"),
    title: text("title").default('Untitled Guide'),
    description: text("description"),
    slug: text("slug").notNull().unique(),
    status: text("status").default('draft'),
    visibility: text("visibility"),
+   steps: jsonb("steps").$type<Step[]>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

- export const steps = pgTable("steps", { ... });
```

### 2. Zod Schema Update (data-ops)

**File:** `packages/data-ops/src/zod/steps.ts` → Vervangen

```typescript
import { z } from "zod";

// Overlay schemas
export const blurOverlaySchema = z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
});

export const arrowOverlaySchema = z.object({
    x1: z.number(),
    y1: z.number(),
    x2: z.number(),
    y2: z.number(),
});

export const circleOverlaySchema = z.object({
    x: z.number(),
    y: z.number(),
    r: z.number(),
});

export const highlightOverlaySchema = z.object({
    color: z.string(),
    opacity: z.number(),
});

export const overlaysSchema = z.object({
    blur: z.array(blurOverlaySchema).optional(),
    arrow: arrowOverlaySchema.optional(),
    circle: circleOverlaySchema.optional(),
    highlight: highlightOverlaySchema.optional(),
}).optional();

// Step schema (embedded in guide)
export const stepSchema = z.object({
    id: z.string().uuid(),
    orderIndex: z.number(),
    imageKey: z.string(),
    pageUrl: z.string(),
    caption: z.string(),
    overlays: overlaysSchema,
    isExcluded: z.boolean().optional(),
});

export type Step = z.infer<typeof stepSchema>;

// For creating steps from extension
export const createStepFromExtensionSchema = z.object({
    id: z.string().uuid(),
    orderIndex: z.number(),
    imageKey: z.string(),
    pageUrl: z.string(),
});

export type CreateStepFromExtension = z.infer<typeof createStepFromExtensionSchema>;
```

### 3. Queue Schema Update (data-ops)

**File:** `packages/data-ops/src/zod/queue.ts`

```typescript
import { z } from "zod";
import { createStepFromExtensionSchema } from "./steps";

export const stepsInsertMessageSchema = z.object({
    type: z.literal("STEPS_INSERT"),
    guideId: z.string(),
    steps: z.array(createStepFromExtensionSchema),
});

export const queueMessageSchema = z.discriminatedUnion("type", [
    stepsInsertMessageSchema,
]);

export type QueueMessage = z.infer<typeof queueMessageSchema>;
```

### 4. Guides Query Update (data-ops)

**File:** `packages/data-ops/src/queries/guides.ts`

```typescript
// Add function to update steps
export async function updateGuideSteps(guideId: string, steps: Step[]): Promise<void> {
    const db = getDb();
    await db
        .update(guides)
        .set({ 
            steps: JSON.stringify(steps),
            updatedAt: new Date().toISOString()
        })
        .where(eq(guides.id, guideId));
}

// Add function to get guide with parsed steps
export async function getGuideWithSteps(guideId: string): Promise<GuideWithSteps | null> {
    const db = getDb();
    const result = await db.select().from(guides).where(eq(guides.id, guideId)).limit(1);
    
    if (!result.length) return null;
    
    const guide = result[0];
    return {
        ...guide,
        steps: guide.steps ? JSON.parse(guide.steps as string) : [],
    };
}
```

### 5. Delete Steps Queries (data-ops)

**Delete:** `packages/data-ops/src/queries/steps.ts`

**Update:** `packages/data-ops/src/queries/index.ts`
```diff
export * from "./guides";
- export * from "./steps";
export * from "./exports";
```

### 6. Queue Handler Update (data-service)

**File:** `apps/data-service/src/queue-handlers/recording-ingest.ts`

```typescript
import { updateGuideSteps, updateGuide } from '@repo/data-ops/queries/guides';
import { Step } from '@repo/data-ops/zod-schema';

export async function handleStepsInsert(env: Env, event: StepsInsertMessage) {
    const { guideId, steps: rawSteps } = event;
    
    // Transform extension steps to full steps with captions
    const steps: Step[] = rawSteps.map((step, index) => ({
        id: step.id,
        orderIndex: step.orderIndex,
        imageKey: step.imageKey,
        pageUrl: step.pageUrl,
        caption: `Step ${index + 1}`,  // Simple caption
        isExcluded: false,
    }));
    
    // Update guide with steps
    await updateGuideSteps(guideId, steps);
    
    // Set status to draft
    await updateGuide(guideId, { status: 'draft' });
    
    console.log(`Inserted ${steps.length} steps into guide ${guideId}`);
}
```

### 7. Extension Update (browser-extension)

**File:** `apps/browser-extension/src/content/index.ts`

```typescript
// Simplified - no more domSelector
document.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return;
    
    if (!chrome.runtime?.id) return;

    chrome.runtime.sendMessage({
        type: 'STEP_ACTION',
        payload: {
            url: window.location.href,
            timestamp: Date.now()
        }
    }).catch(() => {});
}, true);
```

**File:** `apps/browser-extension/src/background/index.ts`

```typescript
// In handleStepAction - simplified step object
const newStep = {
    id: stepId,           // was: stepId
    orderIndex: steps.length,
    imageKey,
    pageUrl: payload.url || '',
    // No domSelector, no generated description
};
```

### 8. Recording Router Update (user-application)

**File:** `apps/user-application/worker/trpc/routers/recording.ts`

Update step schema in complete mutation to match new format.

### 9. Delete Steps Router (user-application)

**Delete or simplify:** `apps/user-application/worker/trpc/routers/steps.ts`

Steps worden nu via guides.update bijgewerkt.

**File:** `apps/user-application/worker/trpc/router.ts`

```diff
import { guidesRouter } from "@/worker/trpc/routers/guides";
- import { stepsRouter } from "@/worker/trpc/routers/steps";
import { recordingRouter } from "@/worker/trpc/routers/recording";
import { imagesRouter } from "@/worker/trpc/routers/images";

export const appRouter = t.router({
  guides: guidesRouter,
- steps: stepsRouter,
  recording: recordingRouter,
  images: imagesRouter,
});
```

---

## Checklist

### data-ops (packages)
- [ ] Update schema.ts - add steps JSONB to guides
- [ ] Update schema.ts - remove steps table (comment out first)
- [ ] Update zod/steps.ts - new Step type
- [ ] Update zod/queue.ts - simplified step schema
- [ ] Update queries/guides.ts - add updateGuideSteps
- [ ] Remove/update queries/steps.ts
- [ ] Update index exports
- [ ] Run `pnpm build` in data-ops

### data-service
- [ ] Update queue-handlers/recording-ingest.ts
- [ ] Test queue processing

### user-application
- [ ] Update routers/recording.ts - new step schema
- [ ] Remove/simplify routers/steps.ts
- [ ] Update router.ts
- [ ] Deploy: `pnpm run stage:deploy`

### browser-extension
- [ ] Simplify content/index.ts - remove domSelector
- [ ] Simplify background/index.ts - new step format
- [ ] Remove helpers.ts generateStepDescription function
- [ ] Build: `pnpm run build`

### Database
- [ ] Run migration SQL
- [ ] Verify data migrated correctly
- [ ] (Later) Drop steps table

---

## Files to Modify

| Package | File | Action |
|---------|------|--------|
| data-ops | schema.ts | Add steps JSONB, remove steps table |
| data-ops | zod/steps.ts | New Step type |
| data-ops | zod/queue.ts | Update step schema |
| data-ops | queries/guides.ts | Add updateGuideSteps |
| data-ops | queries/steps.ts | DELETE |
| data-ops | queries/index.ts | Remove steps export |
| data-service | queue-handlers/recording-ingest.ts | Use updateGuideSteps |
| user-application | routers/recording.ts | New step schema |
| user-application | routers/steps.ts | DELETE or simplify |
| user-application | router.ts | Remove steps router |
| browser-extension | content/index.ts | Remove domSelector |
| browser-extension | background/index.ts | Simplified step |
| browser-extension | lib/helpers.ts | Remove generateStepDescription |

---

## Rollback Plan

Als iets misgaat:
1. Steps table bestaat nog (niet gedropped)
2. Revert code changes
3. Re-deploy

