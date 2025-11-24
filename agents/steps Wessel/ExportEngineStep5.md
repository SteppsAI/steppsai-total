*Focus: PDF Generation.*

- **Service: Browser Rendering Helper**
    - **Action:** Create a service to handle taking "pretty" screenshots.
    - **Logic:**
        - Use puppeteer-core (connect to c.env.BROWSER).
        - Inject HTML (generated from your step data).
        - page.pdf() or page.screenshot() for the carousel.
        - Upload result to R2.