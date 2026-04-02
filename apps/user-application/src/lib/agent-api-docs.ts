export type ApiCodeLanguage = "curl" | "typescript" | "python";
export type ApiAuthMode = "session" | "bearer";
export type ApiMethod = "GET" | "POST" | "DELETE";

export interface ApiFieldDoc {
  name: string;
  type: string;
  required?: boolean;
  description: string;
  defaultValue?: string;
}

export interface ApiEndpointDoc {
  id: string;
  title: string;
  method: ApiMethod;
  path: string;
  pathExample?: string;
  summary: string;
  description: string;
  authMode: ApiAuthMode;
  pathFields?: ApiFieldDoc[];
  bodyFields?: ApiFieldDoc[];
  bodyExample?: Record<string, unknown>;
  responseExample: unknown;
  notes?: string[];
}

export interface ApiSectionDoc {
  id: string;
  title: string;
  summary: string;
  paragraphs?: string[];
  bullets?: string[];
  endpointIds?: string[];
}

export const API_REFERENCE_BASE_URL = "https://api.stepps.ai";

export const agentApiEndpoints: ApiEndpointDoc[] = [
  {
    id: "create-pairing-token",
    title: "Create browser session pairing token",
    method: "POST",
    path: "/agent/v1/browser-sessions/pairing-tokens",
    summary: "Create a short-lived pairing token for a Stepps browser runtime.",
    description:
      "Use this with your agent API key to connect a browser extension session to your workspace.",
    authMode: "bearer",
    bodyFields: [
      {
        name: "displayName",
        type: "string",
        required: false,
        description: "Optional human-readable label for the browser session shown in the dashboard.",
      },
    ],
    bodyExample: {
      displayName: "Werner MacBook Pro",
    },
    responseExample: {
      browserSessionId: "2d5cc4df-6d74-4d84-9d93-c462f3061fd7",
      status: "awaiting_pair",
      displayName: "Werner MacBook Pro",
      expiresAt: "2026-03-13T09:36:00.000Z",
      pairingToken: "stpair_1b4a51f15fca43749afbb6dc8b3c6f2d",
    },
    notes: [
      "The pairing token is consumed by the extension and should be treated as short-lived setup material.",
    ],
  },
  {
    id: "list-browser-sessions",
    title: "List browser sessions",
    method: "GET",
    path: "/agent/v1/browser-sessions",
    summary: "List browser sessions currently registered to the workspace.",
    description:
      "Use this to see which paired browsers are available to receive autonomous prompt-to-guide runs.",
    authMode: "bearer",
    responseExample: {
      browserSessions: [
        {
          browserSessionId: "2d5cc4df-6d74-4d84-9d93-c462f3061fd7",
          ownerUserId: "user_123",
          extensionUserId: "user_123",
          displayName: "Werner MacBook Pro",
          status: "active",
          capabilities: {
            platform: "MacIntel",
            browser: "chrome",
            extensionVersion: "1.0.0",
            actions: [
              "open_tab",
              "focus_tab",
              "navigate",
              "click",
              "type",
              "press",
              "wait_for",
              "scroll",
              "capture",
              "extract_text",
            ],
            supportsLiveBroker: false,
            supportsManualRecording: true,
          },
          currentRunId: null,
          lastSeenAt: "2026-03-13T09:24:00.000Z",
          pairingCodeExpiresAt: null,
          createdAt: "2026-03-13T09:21:00.000Z",
          updatedAt: "2026-03-13T09:24:00.000Z",
        },
      ],
    },
  },
  {
    id: "create-run",
    title: "Create run",
    method: "POST",
    path: "/agent/v1/runs",
    summary: "Create a prompt-to-guide agent run for a paired browser session.",
    description:
      "This is the primary orchestration endpoint. It compiles the prompt into a bounded browser plan and queues the run for the paired Stepps browser runtime.",
    authMode: "bearer",
    bodyFields: [
      {
        name: "prompt",
        type: "string",
        required: true,
        description: "Natural-language instruction for the browser recording workflow.",
      },
      {
        name: "browserSessionId",
        type: "string",
        required: true,
        description: "The paired browser session that should execute the run.",
      },
      {
        name: "output.shareGuide",
        type: "boolean",
        required: false,
        description: "Publish the final guide as a shared Stepps URL.",
        defaultValue: "true",
      },
      {
        name: "output.generateDocs",
        type: "boolean",
        required: false,
        description: "Generate the structured docs layer after the guide completes.",
        defaultValue: "false",
      },
      {
        name: "output.publishDocs",
        type: "boolean",
        required: false,
        description: "Publish the generated docs layer when available.",
        defaultValue: "false",
      },
      {
        name: "output.reactExport",
        type: "boolean",
        required: false,
        description: "Include a React export artifact if docs generation is enabled.",
        defaultValue: "false",
      },
      {
        name: "runtime.maxSteps",
        type: "number",
        required: false,
        description: "Maximum number of browser actions to execute.",
        defaultValue: "40",
      },
      {
        name: "runtime.maxDurationSec",
        type: "number",
        required: false,
        description: "Hard timeout for the autonomous run.",
        defaultValue: "900",
      },
      {
        name: "runtime.screenshotPolicy",
        type: "\"after_each_step\"",
        required: false,
        description: "Screenshot capture policy for the run.",
        defaultValue: "\"after_each_step\"",
      },
      {
        name: "runtime.stopOnAuthWall",
        type: "boolean",
        required: false,
        description: "Pause when a login wall or CAPTCHA is detected.",
        defaultValue: "true",
      },
    ],
    bodyExample: {
      prompt: "Record me how to integrate Claude + Shopify using the Stepps skill",
      browserSessionId: "2d5cc4df-6d74-4d84-9d93-c462f3061fd7",
      output: {
        shareGuide: true,
        generateDocs: false,
        publishDocs: false,
        reactExport: false,
      },
      runtime: {
        maxSteps: 40,
        maxDurationSec: 900,
        screenshotPolicy: "after_each_step",
        stopOnAuthWall: true,
      },
    },
    responseExample: {
      agentRunId: "dc7bc2a4-b581-4e30-b50e-42d22486987f",
      status: "waiting_for_browser",
      guideId: "64f2da29-7db3-470b-a96d-dcdabc2de2e5",
      sharedGuideUrl: null,
      browserSessionId: "2d5cc4df-6d74-4d84-9d93-c462f3061fd7",
      failureCode: null,
      failureMessage: null,
      stepCount: 0,
      title: "Integrate Claude + Shopify using the Stepps skill",
      prompt: "Record me how to integrate Claude + Shopify using the Stepps skill",
      output: {
        shareGuide: true,
        generateDocs: false,
        publishDocs: false,
        reactExport: false,
      },
      runtime: {
        maxSteps: 40,
        maxDurationSec: 900,
        screenshotPolicy: "after_each_step",
        stopOnAuthWall: true,
      },
      plannerOutput: {
        title: "Integrate Claude + Shopify using the Stepps skill",
        summary: "Open Claude Code and Shopify, then record the exact integration flow with screenshots.",
        actions: [
          {
            id: "action_1",
            type: "open_tab",
            title: "Open Claude",
            url: "https://claude.ai",
          },
        ],
      },
      artifacts: {
        guideId: "64f2da29-7db3-470b-a96d-dcdabc2de2e5",
      },
      createdAt: "2026-03-13T09:30:00.000Z",
      updatedAt: "2026-03-13T09:30:01.000Z",
      completedAt: null,
    },
  },
  {
    id: "get-run",
    title: "Get run",
    method: "GET",
    path: "/agent/v1/runs/:runId",
    pathExample: "/agent/v1/runs/dc7bc2a4-b581-4e30-b50e-42d22486987f",
    summary: "Fetch the latest state for an agent run.",
    description:
      "Poll this endpoint to drive your UI or agent loop until the run completes, pauses, fails, or is cancelled.",
    authMode: "bearer",
    pathFields: [
      {
        name: "runId",
        type: "string",
        required: true,
        description: "The agent run identifier returned by create run.",
      },
    ],
    responseExample: {
      agentRunId: "dc7bc2a4-b581-4e30-b50e-42d22486987f",
      status: "completed",
      guideId: "64f2da29-7db3-470b-a96d-dcdabc2de2e5",
      sharedGuideUrl: "https://stepps.ai/shared/64f2da29-7db3-470b-a96d-dcdabc2de2e5",
      browserSessionId: "2d5cc4df-6d74-4d84-9d93-c462f3061fd7",
      failureCode: null,
      failureMessage: null,
      stepCount: 18,
      title: "Integrate Claude + Shopify using the Stepps skill",
      prompt: "Record me how to integrate Claude + Shopify using the Stepps skill",
      output: {
        shareGuide: true,
        generateDocs: false,
        publishDocs: false,
        reactExport: false,
      },
      runtime: {
        maxSteps: 40,
        maxDurationSec: 900,
        screenshotPolicy: "after_each_step",
        stopOnAuthWall: true,
      },
      plannerOutput: {
        title: "Integrate Claude + Shopify using the Stepps skill",
        summary: "Open Claude Code and Shopify, then record the exact integration flow with screenshots.",
        actions: [],
      },
      artifacts: {
        guideId: "64f2da29-7db3-470b-a96d-dcdabc2de2e5",
        sharedGuideUrl: "https://stepps.ai/shared/64f2da29-7db3-470b-a96d-dcdabc2de2e5",
      },
      createdAt: "2026-03-13T09:30:00.000Z",
      updatedAt: "2026-03-13T09:37:10.000Z",
      completedAt: "2026-03-13T09:37:10.000Z",
    },
  },
  {
    id: "resume-run",
    title: "Resume run",
    method: "POST",
    path: "/agent/v1/runs/:runId/resume",
    pathExample: "/agent/v1/runs/dc7bc2a4-b581-4e30-b50e-42d22486987f/resume",
    summary: "Resume a run after user intervention on an auth wall or similar blocker.",
    description:
      "Use this when the extension paused because the user needed to sign in, clear a CAPTCHA, or otherwise unblock the flow.",
    authMode: "bearer",
    pathFields: [
      {
        name: "runId",
        type: "string",
        required: true,
        description: "The paused run identifier to resume.",
      },
    ],
    responseExample: {
      agentRunId: "dc7bc2a4-b581-4e30-b50e-42d22486987f",
      status: "waiting_for_browser",
      guideId: "64f2da29-7db3-470b-a96d-dcdabc2de2e5",
      sharedGuideUrl: null,
      browserSessionId: "2d5cc4df-6d74-4d84-9d93-c462f3061fd7",
      failureCode: null,
      failureMessage: null,
      stepCount: 7,
      title: "Integrate Claude + Shopify using the Stepps skill",
      prompt: "Record me how to integrate Claude + Shopify using the Stepps skill",
      output: {
        shareGuide: true,
        generateDocs: false,
        publishDocs: false,
        reactExport: false,
      },
      runtime: {
        maxSteps: 40,
        maxDurationSec: 900,
        screenshotPolicy: "after_each_step",
        stopOnAuthWall: true,
      },
      plannerOutput: {
        title: "Integrate Claude + Shopify using the Stepps skill",
        summary: "Resume after the login wall is cleared.",
        actions: [],
      },
      artifacts: {
        guideId: "64f2da29-7db3-470b-a96d-dcdabc2de2e5",
      },
      createdAt: "2026-03-13T09:30:00.000Z",
      updatedAt: "2026-03-13T09:34:00.000Z",
      completedAt: null,
    },
  },
  {
    id: "cancel-run",
    title: "Cancel run",
    method: "POST",
    path: "/agent/v1/runs/:runId/cancel",
    pathExample: "/agent/v1/runs/dc7bc2a4-b581-4e30-b50e-42d22486987f/cancel",
    summary: "Cancel an in-flight or paused run.",
    description:
      "Use this to stop execution and release the paired browser session for other work.",
    authMode: "bearer",
    pathFields: [
      {
        name: "runId",
        type: "string",
        required: true,
        description: "The active or paused run identifier to cancel.",
      },
    ],
    responseExample: {
      agentRunId: "dc7bc2a4-b581-4e30-b50e-42d22486987f",
      status: "cancelled",
      guideId: "64f2da29-7db3-470b-a96d-dcdabc2de2e5",
      sharedGuideUrl: null,
      browserSessionId: "2d5cc4df-6d74-4d84-9d93-c462f3061fd7",
      failureCode: null,
      failureMessage: null,
      stepCount: 4,
      title: "Integrate Claude + Shopify using the Stepps skill",
      prompt: "Record me how to integrate Claude + Shopify using the Stepps skill",
      output: {
        shareGuide: true,
        generateDocs: false,
        publishDocs: false,
        reactExport: false,
      },
      runtime: {
        maxSteps: 40,
        maxDurationSec: 900,
        screenshotPolicy: "after_each_step",
        stopOnAuthWall: true,
      },
      plannerOutput: {
        title: "Integrate Claude + Shopify using the Stepps skill",
        summary: "Open Claude Code and Shopify, then record the exact integration flow with screenshots.",
        actions: [],
      },
      artifacts: {
        guideId: "64f2da29-7db3-470b-a96d-dcdabc2de2e5",
      },
      createdAt: "2026-03-13T09:30:00.000Z",
      updatedAt: "2026-03-13T09:32:18.000Z",
      completedAt: "2026-03-13T09:32:18.000Z",
    },
  },
  {
    id: "get-run-artifacts",
    title: "Get run artifacts",
    method: "GET",
    path: "/agent/v1/runs/:runId/artifacts",
    pathExample: "/agent/v1/runs/dc7bc2a4-b581-4e30-b50e-42d22486987f/artifacts",
    summary: "Fetch the durable output artifacts for a run.",
    description:
      "Use this when you only need final links or exported content without re-fetching the entire run payload.",
    authMode: "bearer",
    pathFields: [
      {
        name: "runId",
        type: "string",
        required: true,
        description: "The run identifier whose artifacts should be returned.",
      },
    ],
    responseExample: {
      guideId: "64f2da29-7db3-470b-a96d-dcdabc2de2e5",
      sharedGuideUrl: "https://stepps.ai/shared/64f2da29-7db3-470b-a96d-dcdabc2de2e5",
      docsPageId: null,
      publishedDocsUrl: null,
      reactExportSource: null,
    },
  },
];

export const agentApiSections: ApiSectionDoc[] = [
  {
    id: "introduction",
    title: "Introduction",
    summary: "Prompt-to-guide API for browser-first autonomous Stepps runs.",
    paragraphs: [
      "The Stepps Agent API turns a natural-language prompt into a recorded browser workflow, screenshot set, and shared Stepps guide.",
      "Use the website session endpoints to manage API keys and pair browser sessions. Use bearer-authenticated endpoints to orchestrate runs from your own systems, agents, or internal automations.",
    ],
    bullets: [
      "Browser-first scope for v1",
      "Bounded execution plan under the hood",
      "Screenshots uploaded through the existing Stepps image pipeline",
      "Shared guide URL returned as the durable artifact",
    ],
  },
  {
    id: "authentication",
    title: "Authentication",
    summary: "The public Agent API uses bearer API keys.",
    paragraphs: [
      "Create and rotate API keys in Settings -> API inside the Stepps app.",
      "The public Agent API on api.stepps.ai uses bearer API keys for browser session setup, run orchestration, and artifact retrieval.",
    ],
    bullets: [
      "Create keys in Settings -> API",
      "Bearer token: `/agent/v1/browser-sessions/*` and `/agent/v1/runs/*`",
      "Use `Authorization: Bearer <agent_api_key>` for browser session setup and run orchestration",
    ],
  },
  {
    id: "api-keys",
    title: "API keys",
    summary: "Manage workspace-scoped agent credentials from the Stepps app.",
    paragraphs: [
      "API keys are created and revoked in Settings -> API in the authenticated Stepps app.",
      "The public Agent API itself does not expose session-based key-management endpoints on api.stepps.ai.",
    ],
    bullets: [
      "Plaintext keys are shown only once on creation",
      "Revoked keys remain visible in Settings for auditability",
      "Use the created key as a bearer token against the public Agent API",
    ],
  },
  {
    id: "browser-sessions",
    title: "Browser sessions",
    summary: "Prepare a paired browser runtime that can execute prompt-to-guide runs.",
    endpointIds: ["create-pairing-token", "list-browser-sessions"],
  },
  {
    id: "runs",
    title: "Runs",
    summary: "Create, inspect, resume, cancel, and harvest artifacts from autonomous runs.",
    endpointIds: ["create-run", "get-run", "resume-run", "cancel-run", "get-run-artifacts"],
  },
  {
    id: "models",
    title: "Models",
    summary: "Reference values used by the runtime lifecycle.",
    bullets: [
      "Run statuses: queued, planning, waiting_for_browser, running, paused_for_user, processing_guide, generating_docs, completed, failed, cancelled",
      "Failure codes: auth_required, captcha_required, selector_not_found, browser_disconnected, run_timeout, upload_failed, planner_failed",
      "Screenshot policy: after_each_step",
    ],
  },
  {
    id: "examples",
    title: "Examples",
    summary: "Typical end-to-end flow for prompt-to-guide automation.",
    bullets: [
      "Create an API key in Settings -> API",
      "Use that API key to create a browser pairing token and pair the extension",
      "List browser sessions with bearer auth and pick an active browserSessionId",
      "Create a run with a prompt like: Record me how to integrate Claude + Shopify using the Stepps skill",
      "Poll the run until it completes or pauses for user input",
      "Open the returned shared guide URL",
    ],
  },
];

export const quickstartPrompt = "Record me how to integrate Claude + Shopify using the Stepps skill";
