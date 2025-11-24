*Focus: Connecting your Partner's UI.*

- **tRPC: session.getById Query**
    - **Action:** Fetch data for the Editor.
    - **Logic:**
        - Input: sessionId.
        - Query: db.query.sessions.findFirst({ with: { steps: true } }).
        - *Result:* Your partner gets the full JSON tree to render the UI.
- **tRPC: step.updateOverlay Mutation**
    - **Action:** Save the arrows/boxes drawn in the UI.
    - **Logic:**
        - Input: { stepId, overlayJson }.
        - DB: Update the specific step row.