*Focus: Offloading AI to Queues.*

- **Worker: Queue Consumer (AI Processing)**
    - **Action:** Process the job sent by the /stop route.
    - **Logic:**
        - In your Worker's export default: add async queue(batch, env) handler.
        - Loop through messages.
        - Fetch all steps for sessionId from DB.
        - **AI Request:** Send images + metadata to Gemini/OpenAI.
        - **DB Update:** Bulk update steps table with ai_caption.