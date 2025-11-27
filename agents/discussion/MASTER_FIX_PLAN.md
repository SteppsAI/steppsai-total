# Recording Flow Architecture

## Nieuwe Flow

```
Start Recording
    └─> POST /guides/start
        └─> Insert guide row (status: 'recording')
        └─> Return { guideId, userId }

Per Click
    └─> Screenshot capture
    └─> Upload naar screenshots/{guideId}/{userId}/{uuid}.webp
    └─> Store step in local storage

End Recording
    └─> POST /guides/{guideId}/complete
        └─> Update guide (status: 'processing')
        └─> Send { guideId, steps } to Queue
        └─> Queue inserts steps + sets status: 'draft'

Delete Recording
    └─> DELETE /guides/{guideId}
        └─> Delete steps from DB
        └─> Delete guide from DB
        └─> Delete all images from R2 (prefix: screenshots/{guideId}/)
```

## Routes

| Method | Route | Beschrijving |
|--------|-------|--------------|
| POST | `/guides/start` | Maakt draft guide, returned guideId |
| POST | `/guides/:guideId/complete` | Updates title, stuurt steps naar queue |
| DELETE | `/guides/:guideId` | Verwijdert guide, steps, en R2 images |

## Queue Message

```typescript
{
    type: "STEPS_INSERT",
    guideId: string,
    steps: Step[]
}
```

## R2 Path Structure

```
screenshots/{guideId}/{userId}/{stepId}.webp
```

## Local Storage (Extension)

```typescript
{
    isRecording: boolean,
    guideId: string,
    userId: string,
    recordingStartTime: number,
    steps: Step[]
}
```
