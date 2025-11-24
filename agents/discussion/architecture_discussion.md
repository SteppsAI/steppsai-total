# Architecture Plan: Recording Workflow

This document outlines the definitive architecture for the SteppsAI recording workflow, chosen for its performance, data integrity, and simplicity.

## Core Architecture: Client-Side Batching + Queues

We are implementing a **Client-Side Batching** strategy reinforced by **Cloudflare Queues** and **R2** for robust and efficient data handling.

### 1. The Recording Flow
*   **State Management**: The Chrome Extension maintains the recording state (list of steps, metadata) in `chrome.storage.local`. This serves as a crash-proof buffer.
*   **Image Handling (Fire & Forget)**:
    *   Screenshots are uploaded *immediately* during recording to a Worker endpoint (`PUT /images/:key`).
    *   The Worker stores these directly in **R2**.
    *   The Extension only stores the generated `stepId` (which acts as the R2 key) in its local state.
*   **Completion**: When the user clicks "Stop Recording", the Extension sends a single JSON payload containing all metadata (steps, timestamps, selectors, image keys) to the API.
*   **Ingestion**: The API (`POST /guides/ingest`) pushes this payload directly into a **Cloudflare Queue** and immediately returns `200 OK`. The user does not wait for database operations.

### 2. Data Persistence & Integrity
*   **Queue Consumer**: A background Worker consumes messages from the Queue.
*   **Transaction**: It performs a single transaction to insert the Guide and all its Steps into **Postgres**.
*   **Reliability**: Cloudflare Queues provide automatic retries, ensuring no data is lost if the database experiences momentary hiccups.

### 3. Image Security & Retrieval
We utilize a **Proxy Strategy** for secure image access.

*   **Storage**: Postgres stores the relative path/key (e.g., `guides/{guideId}/{stepId}.png`).
*   **Retrieval**: A `GET /images/:key` endpoint acts as a proxy.
    *   It authenticates the request (e.g., checking team membership).
    *   It streams the image directly from R2 using `env.BUCKET.get()`.
    *   *Benefit:* This ensures strict access control for sensitive screenshots.

## Implementation Details

### Cloudflare Configuration
*   **Queue Name**: `stepps-recording-ingest-queue` (Stage/Prod)
*   **R2 Bucket**: Existing `smart-links-eval` bucket (reused or new `stepps-assets` bucket if preferred).

### Code Structure
*   **Extension**:
    *   `storage.local` for buffering.
    *   `fetch` loop for R2 uploads.
*   **Data Service**:
    *   `src/hono/routes/images.ts`: `PUT` (Upload) and `GET` (Proxy).
    *   `src/hono/routes/guides.ts`: `POST /ingest` (Queue Producer).
    *   `src/queue-handlers/recording-ingest.ts`: Queue Consumer (DB Insert).

This architecture ensures a responsive user experience (no waiting for uploads/DB) and a clean, scalable backend.
