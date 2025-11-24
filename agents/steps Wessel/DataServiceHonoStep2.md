*Focus: Ingestion API (REST) vs Editor API (tRPC).*

*Note: Extensions hate complex tRPC clients due to bundle size/CORS. Use standard REST Hono routes for the recording phase.*

- **Infrastructure: wrangler.json bindings**
    - **Action:** Bind your R2 bucket and Queues.
    - **Config:**
        
        ```
        {
          "r2_buckets": [{ "binding": "SCREENSHOTS", "bucket_name": "your-bucket" }],
          "queues": { "producers": [{ "binding": "AI_JOB_QUEUE", "queue": "ai-jobs" }] }
        }
        
        ```
        
- **Route: POST /api/recording/start (Hono)**
    - **Action:** Initialize session.
    - **Logic:**
        - Input: { userId, domainUrl }
        - DB: Insert into sessions table.
        - Return: { sessionId: "uuid" }.
- **Route: POST /api/recording/step (Hono)**
    - **Action:** The heavy lifting—uploading the image.
    - **Logic:**
        - Input: FormData containing file (blob) + sessionId + selector + meta.
        - **Step 1 (R2):**await c.env.SCREENSHOTS.put(key, file)
        - **Step 2 (DB):** Insert into steps table (using Drizzle) with the R2 public URL.
        - *Why Hono here?* Easier to handle raw file uploads than tRPC.
- **Route: POST /api/recording/stop (Hono)**
    - **Action:** Trigger the async magic.
    - **Logic:**
        - Input: { sessionId }.
        - DB: Update session status to processing.
        - **Queue:**await c.env.AI_JOB_QUEUE.send({ sessionId }).
        - Return: { redirectUrl: "/editor/:sessionId" }.