# Plan: Image URL Handling Strategy

## Context
We are currently storing full URLs for images (screenshots) in the database. This creates issues when moving data between environments (Stage <-> Prod) or if the domain changes.

## Strategy
**Store Keys, Serve URLs.**

1.  **Database**: Store only the relative path (the "Key") in the database.
    *   Example: `screenshots/guide-123/step-1.webp`
    *   *Not*: `https://assets.stepps.ai/screenshots/guide-123/step-1.webp`

2.  **Environment Configuration**: Define the base URL for assets in the environment configuration (`wrangler.jsonc`).
    *   Stage: `https://stepps-assets-stage.stepps.ai` (or R2 dev URL)
    *   Prod: `https://assets.stepps.ai`

3.  **API (Data Service)**:
    *   When **saving** (POST): Save the key as received from the client.
    *   When **fetching** (GET): Dynamically prepend the `ASSETS_URL` to the `imageKey` before sending the response to the frontend.

## Implementation Steps

### 1. Configure Environment Variables
Update `apps/data-service/wrangler.jsonc` to include `ASSETS_URL` for each environment.

```jsonc
// apps/data-service/wrangler.jsonc
"env": {
  "stage": {
    "vars": {
      "ASSETS_URL": "https://stepps-assets-stage.stepps.ai" // or your R2 worker URL
    }
    // ...
  },
  "production": {
    "vars": {
      "ASSETS_URL": "https://assets.stepps.ai"
    }
    // ...
  }
}
```

### 2. Implement `GET /guides/:id` Endpoint
Create a new endpoint in `apps/data-service/src/hono/routes/guides.ts` to retrieve a single guide. This endpoint will handle the URL generation.

```typescript
// apps/data-service/src/hono/routes/guides.ts

guidesRouter.get('/:guideId', async (c) => {
    const guideId = c.req.param('guideId');
    
    // 1. Fetch guide from DB
    const guide = await getGuideWithSteps(guideId);
    
    if (!guide) {
        return c.json({ error: 'Guide not found' }, 404);
    }

    // 2. Prepend ASSETS_URL to image keys in steps
    const assetsUrl = c.env.ASSETS_URL;
    
    const stepsWithUrls = guide.steps.map(step => ({
        ...step,
        imageUrl: step.imageKey ? `${assetsUrl}/${step.imageKey}` : null
    }));

    // 3. Return guide with full URLs
    return c.json({
        ...guide,
        steps: stepsWithUrls
    });
});
```

### 3. Update Types
Ensure the `Env` interface in `apps/data-service/src/types.ts` (or where defined) includes `ASSETS_URL`.

```typescript
interface Env {
    // ... existing bindings
    ASSETS_URL: string;
}
```

## Verification
1.  **Deploy to Stage**: Deploy the changes to the stage environment.
2.  **Create a Guide**: Use the extension to create a guide (which saves keys).
3.  **Fetch the Guide**: Call `GET /guides/:id` and verify that the `imageUrl` fields in the response are full URLs starting with the configured `ASSETS_URL`.
