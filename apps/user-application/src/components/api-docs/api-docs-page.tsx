import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Copy,
  Moon,
  PlayCircle,
  Rocket,
  Server,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { Navbar } from "@/components/home-page/Navbar";
import { cn } from "@/lib/utils";
import {
  API_REFERENCE_BASE_URL,
  agentApiEndpoints,
  agentApiSections,
  quickstartPrompt,
  type ApiCodeLanguage,
  type ApiEndpointDoc,
  type ApiFieldDoc,
  type ApiMethod,
} from "@/lib/agent-api-docs";

/* ─── types ─── */
type NavItem = {
  id: string;
  label: string;
  level: 1 | 2;
  method?: ApiMethod;
  icon?: "rocket" | "book";
};

/* ─── constants ─── */
const LANGUAGES: ApiCodeLanguage[] = ["curl", "typescript", "python"];

const languageLabels: Record<ApiCodeLanguage, string> = {
  curl: "cURL",
  typescript: "TypeScript",
  python: "Python",
};

const methodColors: Record<ApiMethod, { light: string; dark: string }> = {
  GET: {
    light: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dark: "dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800",
  },
  POST: {
    light: "bg-blue-100 text-blue-700 border-blue-200",
    dark: "dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800",
  },
  DELETE: {
    light: "bg-rose-100 text-rose-700 border-rose-200",
    dark: "dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800",
  },
};

function methodCn(method: ApiMethod) {
  return `${methodColors[method].light} ${methodColors[method].dark}`;
}

const endpointById = new Map(agentApiEndpoints.map((e) => [e.id, e]));

/* ─── snippet builders ─── */
function stringifyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function stringifyPythonLiteral(value: unknown, indent = 0): string {
  const space = " ".repeat(indent);
  if (value === null) return "None";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "True" : "False";
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return `[\n${value
      .map((item) => `${" ".repeat(indent + 4)}${stringifyPythonLiteral(item, indent + 4)}`)
      .join(",\n")}\n${space}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!entries.length) return "{}";
    return `{\n${entries
      .map(
        ([key, item]) =>
          `${" ".repeat(indent + 4)}${JSON.stringify(key)}: ${stringifyPythonLiteral(item, indent + 4)}`
      )
      .join(",\n")}\n${space}}`;
  }
  return JSON.stringify(value);
}

function resolveApiReferenceBaseUrl() {
  if (typeof window === "undefined") {
    return API_REFERENCE_BASE_URL;
  }

  const hostname = window.location.hostname.toLowerCase();
  if (hostname === "stage.stepps.ai") {
    return "https://api.stage.stepps.ai";
  }

  return API_REFERENCE_BASE_URL;
}

function endpointUrl(endpoint: ApiEndpointDoc) {
  const pathPart = endpoint.pathExample || endpoint.path.replace(/:([A-Za-z]+)/g, (_m, name) => `{${name}}`);
  return `${resolveApiReferenceBaseUrl()}${pathPart}`;
}

function buildCurlSnippet(endpoint: ApiEndpointDoc) {
  const lines = [`curl -X ${endpoint.method} ${endpointUrl(endpoint)}`];
  if (endpoint.authMode === "bearer") {
    lines.push(`  -H "Authorization: Bearer stpk_your_agent_api_key"`);
  } else {
    lines.push(`  -H "Cookie: stepps_session=<your_session_cookie>"`);
  }
  lines.push(`  -H "Content-Type: application/json"`);
  if (endpoint.bodyExample) {
    lines.push(`  -d '${stringifyJson(endpoint.bodyExample)}'`);
  }
  return lines.join(" \\\n");
}

function buildTypeScriptSnippet(endpoint: ApiEndpointDoc) {
  const url = endpoint.authMode === "session"
    ? endpoint.path.replace(/:([A-Za-z]+)/g, (_m, name) => `{${name}}`)
    : endpointUrl(endpoint);
  const options: string[] = [`method: "${endpoint.method}"`];
  if (endpoint.authMode === "bearer") {
    options.push(`headers: {\n    "Authorization": "Bearer stpk_your_agent_api_key",\n    "Content-Type": "application/json",\n  }`);
  } else {
    options.push(`credentials: "include"`);
    options.push(`headers: {\n    "Content-Type": "application/json",\n  }`);
  }
  if (endpoint.bodyExample) {
    options.push(`body: JSON.stringify(${stringifyJson(endpoint.bodyExample)})`);
  }
  return `const response = await fetch("${url}", {\n  ${options.join(",\n  ")}\n});\n\nconst data = await response.json();\nconsole.log(data);`;
}

function buildPythonSnippet(endpoint: ApiEndpointDoc) {
  const url = endpointUrl(endpoint);
  const bodyLiteral = endpoint.bodyExample ? stringifyPythonLiteral(endpoint.bodyExample, 4) : null;
  if (endpoint.authMode === "bearer") {
    return `import requests\n\nresponse = requests.${endpoint.method.toLowerCase()}(\n    "${url}",\n    headers={\n        "Authorization": "Bearer stpk_your_agent_api_key",\n        "Content-Type": "application/json",\n    },${bodyLiteral ? `\n    json=${bodyLiteral},` : ""}\n)\n\nprint(response.json())`;
  }
  return `import requests\n\nsession = requests.Session()\nsession.cookies.set("stepps_session", "<your_session_cookie>", domain="stepps.ai")\n\nresponse = session.${endpoint.method.toLowerCase()}(\n    "${url}",\n    headers={"Content-Type": "application/json"},${bodyLiteral ? `\n    json=${bodyLiteral},` : ""}\n)\n\nprint(response.json())`;
}

/* ─── hooks ─── */
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("stepps-docs-dark");
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("stepps-docs-dark", String(dark));
  }, [dark]);

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return [dark, setDark] as const;
}

function useCopyClipboard() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!copiedKey) return;
    const t = window.setTimeout(() => setCopiedKey(null), 1800);
    return () => window.clearTimeout(t);
  }, [copiedKey]);

  const copy = useCallback((key: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => setCopiedKey(key)).catch(() => setCopiedKey(null));
  }, []);

  return { copiedKey, copy };
}

/* ─── sub-components ─── */

function DarkModeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function SidebarNav({
  items,
  activeId,
  onSelect,
}: {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="space-y-0.5">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[13px] transition-colors",
            item.level === 2 && "pl-6",
            activeId === item.id
              ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          )}
        >
          {item.icon === "rocket" ? (
            <Rocket className="h-3.5 w-3.5 shrink-0" />
          ) : item.icon === "book" ? (
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
          ) : null}
          {item.method ? (
            <span
              className={cn(
                "inline-flex shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold leading-none",
                methodCn(item.method)
              )}
            >
              {item.method}
            </span>
          ) : null}
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

/** Code block with language tabs built in (cURL | TypeScript | Python) */
function TabbedCodeBlock({
  snippets,
  language,
  onLanguageChange,
  copiedKey,
  copyId,
  onCopy,
}: {
  snippets: Record<ApiCodeLanguage, string>;
  language: ApiCodeLanguage;
  onLanguageChange: (l: ApiCodeLanguage) => void;
  copiedKey: string | null;
  copyId: string;
  onCopy: (key: string, value: string) => void;
}) {
  const code = snippets[language];
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 dark:border-slate-700">
      <div className="flex items-center justify-between border-b border-slate-800 px-1 dark:border-slate-700">
        <div className="flex">
          {LANGUAGES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onLanguageChange(l)}
              className={cn(
                "relative px-3.5 py-2.5 text-[13px] font-medium transition-colors",
                language === l
                  ? "text-indigo-400"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {languageLabels[l]}
              {language === l ? (
                <span className="absolute inset-x-3.5 bottom-0 h-0.5 rounded-full bg-indigo-400" />
              ) : null}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onCopy(copyId, code)}
          className="mr-3 flex items-center gap-1.5 text-[12px] text-slate-500 transition-colors hover:text-slate-300"
        >
          {copiedKey === copyId ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="custom-scrollbar overflow-x-auto p-4 text-[13px] leading-6 text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** Simple code block for response JSON (no language tabs) */
function ResponseBlock({
  code,
  copiedKey,
  copyId,
  onCopy,
}: {
  code: string;
  copiedKey: string | null;
  copyId: string;
  onCopy: (key: string, value: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 dark:border-slate-700">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 dark:border-slate-700">
        <span className="text-[12px] font-medium text-slate-500">Response</span>
        <button
          type="button"
          onClick={() => onCopy(copyId, code)}
          className="flex items-center gap-1.5 text-[12px] text-slate-500 transition-colors hover:text-slate-300"
        >
          {copiedKey === copyId ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="custom-scrollbar overflow-x-auto p-4 text-[13px] leading-6 text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function DocFieldTable({ title, fields }: { title: string; fields?: ApiFieldDoc[] }) {
  if (!fields?.length) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </h4>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Field
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Type
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr
                key={field.name}
                className="border-b border-slate-100 last:border-b-0 dark:border-slate-700/50"
              >
                <td className="px-4 py-3">
                  <code className="text-[13px] font-medium text-slate-900 dark:text-slate-200">
                    {field.name}
                  </code>
                  <div className="mt-0.5 text-[11px] text-slate-400">
                    {field.required ? "Required" : "Optional"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {field.type}
                  </code>
                </td>
                <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-400">
                  {field.description}
                  {field.defaultValue ? (
                    <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      Default: <code>{field.defaultValue}</code>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── two-column endpoint view ─── */

function EndpointView({
  endpoint,
  language,
  onLanguageChange,
  copiedKey,
  onCopy,
  breadcrumb,
}: {
  endpoint: ApiEndpointDoc;
  language: ApiCodeLanguage;
  onLanguageChange: (l: ApiCodeLanguage) => void;
  copiedKey: string | null;
  onCopy: (key: string, value: string) => void;
  breadcrumb?: string;
}) {
  const snippets: Record<ApiCodeLanguage, string> = {
    curl: buildCurlSnippet(endpoint),
    typescript: buildTypeScriptSnippet(endpoint),
    python: buildPythonSnippet(endpoint),
  };
  const responseCode = stringifyJson(endpoint.responseExample);

  return (
    <div>
      {breadcrumb ? (
        <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span>{breadcrumb}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-slate-700 dark:text-slate-300">{endpoint.title}</span>
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={cn("rounded-md border px-2 py-0.5 text-xs font-bold", methodCn(endpoint.method))}>
          {endpoint.method}
        </span>
        <code className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {endpoint.path}
        </code>
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-medium",
            endpoint.authMode === "bearer"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
              : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          )}
        >
          {endpoint.authMode === "bearer" ? "Bearer auth" : "Website session"}
        </span>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{endpoint.title}</h2>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{endpoint.summary}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{endpoint.description}</p>

      {/* Two-column: left = fields/notes, right = code */}
      <div className="mt-6 grid gap-8 xl:grid-cols-[1fr_minmax(380px,1fr)]">
        <div className="space-y-5">
          <DocFieldTable title="Path parameters" fields={endpoint.pathFields} />
          <DocFieldTable title="Request body" fields={endpoint.bodyFields} />

          {endpoint.notes?.length ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-400">
                <AlertCircle className="h-3.5 w-3.5" />
                Notes
              </div>
              <ul className="space-y-1 text-xs leading-5 text-amber-900 dark:text-amber-300">
                {endpoint.notes.map((note) => (
                  <li key={note}>• {note}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <TabbedCodeBlock
            snippets={snippets}
            language={language}
            onLanguageChange={onLanguageChange}
            copiedKey={copiedKey}
            copyId={`${endpoint.id}:req`}
            onCopy={onCopy}
          />
          <ResponseBlock
            code={responseCode}
            copiedKey={copiedKey}
            copyId={`${endpoint.id}:res`}
            onCopy={onCopy}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Quickstart section (default landing) ─── */

function QuickstartSection({
  language,
  onLanguageChange,
  copiedKey,
  onCopy,
}: {
  language: ApiCodeLanguage;
  onLanguageChange: (l: ApiCodeLanguage) => void;
  copiedKey: string | null;
  onCopy: (key: string, value: string) => void;
}) {
  const endpoint = endpointById.get("create-run")!;
  const snippets: Record<ApiCodeLanguage, string> = {
    curl: buildCurlSnippet(endpoint),
    typescript: buildTypeScriptSnippet(endpoint),
    python: buildPythonSnippet(endpoint),
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Getting Started</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        The Stepps Agent API turns a natural-language prompt into a recorded browser workflow,
        screenshot set, and shared Stepps guide. Get started in 5 steps.
      </p>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_minmax(380px,1fr)]">
        {/* Left: starter flow + server/auth info */}
        <div className="space-y-6">
          {/* Starter flow */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Starter Flow</h3>
            <ol className="space-y-3">
              {[
                { step: "1", text: "Create an agent API key in Settings -> API" },
                { step: "2", text: "Create a browser pairing token and pair the extension" },
                { step: "3", text: "POST /agent/v1/runs with your prompt" },
                { step: "4", text: "Poll GET /agent/v1/runs/:runId until completion" },
                { step: "5", text: "Open the returned shared guide URL" },
              ].map((item) => (
                <li key={item.step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
                    {item.step}
                  </span>
                  <span className="text-sm leading-6 text-slate-600 dark:text-slate-400">{item.text}</span>
                </li>
              ))}
            </ol>
            <Link
              to="/app/settings"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Open settings
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Server */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Server className="h-3.5 w-3.5" />
              Base URL
            </div>
            <code className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {resolveApiReferenceBaseUrl()}
            </code>
          </div>

          {/* Auth modes */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Authentication
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">Settings</span>
                <span className="ml-2 text-slate-500 dark:text-slate-400">— create and revoke API keys in Settings -&gt; API</span>
              </div>
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">Bearer token</span>
                <span className="ml-2 text-slate-500 dark:text-slate-400">
                  — <code className="text-xs">Authorization: Bearer stpk_...</code> for browser sessions, runs, and artifacts
                </span>
              </div>
            </div>
          </div>

          {/* Example prompt */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-800/30 dark:bg-indigo-900/20">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <PlayCircle className="h-3.5 w-3.5" />
              Example prompt
            </div>
            <p className="text-sm italic text-indigo-700 dark:text-indigo-300">
              &ldquo;{quickstartPrompt}&rdquo;
            </p>
          </div>
        </div>

        {/* Right: quickstart code */}
        <div>
          <TabbedCodeBlock
            snippets={snippets}
            language={language}
            onLanguageChange={onLanguageChange}
            copiedKey={copiedKey}
            copyId="quickstart"
            onCopy={onCopy}
          />
        </div>
      </div>
    </div>
  );
}

/** Find parent section for an endpoint id, or return the section itself */
function resolveSection(id: string): { section: typeof agentApiSections[number] | null; scrollTo: string | null } {
  // Is it a section?
  const section = agentApiSections.find((s) => s.id === id);
  if (section) return { section, scrollTo: null };

  // Is it an endpoint? → resolve to parent section and scroll to endpoint
  const parent = agentApiSections.find((s) => s.endpointIds?.includes(id));
  if (parent) return { section: parent, scrollTo: id };

  return { section: null, scrollTo: null };
}

/* ─── section content (for non-quickstart, non-endpoint sections) ─── */

function SectionContent({
  sectionId,
  language,
  onLanguageChange,
  copiedKey,
  onCopy,
}: {
  sectionId: string;
  scrollToId?: string | null;
  language: ApiCodeLanguage;
  onLanguageChange: (l: ApiCodeLanguage) => void;
  copiedKey: string | null;
  onCopy: (key: string, value: string) => void;
}) {
  // Quickstart is the special first section
  if (sectionId === "quickstart") {
    return (
      <QuickstartSection
        language={language}
        onLanguageChange={onLanguageChange}
        copiedKey={copiedKey}
        onCopy={onCopy}
      />
    );
  }

  // Regular section (e.g. Authentication, Models, Examples, API keys, Runs)
  const section = agentApiSections.find((s) => s.id === sectionId);
  if (!section) return null;

  const sectionEndpoints = (section.endpointIds || [])
    .map((eid) => endpointById.get(eid))
    .filter((ep): ep is ApiEndpointDoc => !!ep);

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{section.title}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{section.summary}</p>
      </div>

      {section.paragraphs?.map((p) => (
        <p key={p} className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {p}
        </p>
      ))}

      {section.bullets?.length ? (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-5 py-4 dark:border-indigo-800/30 dark:bg-indigo-900/20">
          <ul className="space-y-2.5 text-sm leading-relaxed text-indigo-800 dark:text-indigo-300">
            {section.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {sectionEndpoints.map((ep) => (
        <div key={ep.id} id={`endpoint-${ep.id}`}>
          <EndpointView
            endpoint={ep}
            language={language}
            onLanguageChange={onLanguageChange}
            copiedKey={copiedKey}
            onCopy={onCopy}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── main page ─── */

export function ApiDocsPage() {
  const [dark, setDark] = useDarkMode();
  const [language, setLanguage] = useState<ApiCodeLanguage>("python");
  const { copiedKey, copy } = useCopyClipboard();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // activeId = the section being rendered (always a section id or "quickstart")
  // scrollToId = optional endpoint to scroll to within that section
  const [activeId, setActiveId] = useState<string>("quickstart");
  const [scrollToId, setScrollToId] = useState<string | null>(null);

  // Initialize from URL hash
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const { section, scrollTo } = resolveSection(hash);
      if (section) {
        setActiveId(section.id);
        setScrollToId(scrollTo);
      } else if (hash === "quickstart") {
        setActiveId("quickstart");
      }
    }
  }, []);

  // Scroll to target endpoint after render
  useEffect(() => {
    if (!scrollToId) return;
    // Small delay to let the DOM render
    const timer = setTimeout(() => {
      const el = document.getElementById(`endpoint-${scrollToId}`);
      if (el && mainRef.current) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      // Clear after scrolling so re-clicking same item works
      setScrollToId(null);
    }, 50);
    return () => clearTimeout(timer);
  }, [scrollToId, activeId]);

  // Build nav items: quickstart first, then all sections
  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      { id: "quickstart", label: "Getting Started", level: 1, icon: "rocket" },
    ];
    for (const section of agentApiSections) {
      items.push({ id: section.id, label: section.title, level: 1 });
      for (const eid of section.endpointIds || []) {
        const ep = endpointById.get(eid);
        if (!ep) continue;
        items.push({ id: ep.id, label: ep.title, level: 2, method: ep.method });
      }
    }
    return items;
  }, []);

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace("#", "");
      if (!h) return;
      const { section, scrollTo } = resolveSection(h);
      if (section) {
        setActiveId(section.id);
        setScrollToId(scrollTo);
      } else if (h === "quickstart") {
        setActiveId("quickstart");
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const handleSelect = useCallback((id: string) => {
    const { section, scrollTo } = resolveSection(id);
    if (section) {
      const isSameSection = activeId === section.id;
      setActiveId(section.id);
      window.history.replaceState(null, "", `#${id}`);
      setMobileSidebarOpen(false);

      if (scrollTo) {
        // If switching to a new section, wait for render then scroll
        // If same section, scroll immediately
        if (isSameSection) {
          const el = document.getElementById(`endpoint-${scrollTo}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          setScrollToId(scrollTo);
        }
      } else {
        // Clicked a section header — scroll content to top
        if (mainRef.current) mainRef.current.scrollTop = 0;
      }
    } else if (id === "quickstart") {
      setActiveId("quickstart");
      window.history.replaceState(null, "", `#quickstart`);
      setMobileSidebarOpen(false);
      if (mainRef.current) mainRef.current.scrollTop = 0;
    }
  }, [activeId]);

  return (
    <div className="flex h-screen flex-col bg-white font-sans transition-colors dark:bg-slate-950">
      <Navbar />

      {/* Top bar: breadcrumb + dark toggle — fixed strip below navbar */}
      <div className="shrink-0 border-b border-slate-200 bg-white/80 pt-16 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-900 dark:text-white">API Reference</span>
            <span className="ml-2 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
              v1.0
            </span>
          </div>
          <DarkModeToggle dark={dark} onToggle={() => setDark(!dark)} />
        </div>
      </div>

      {/* Below the top bar: sidebar + scrollable content fill remaining height */}
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1">
        {/* ─── Sidebar: fixed, own scroll ─── */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-slate-200 custom-scrollbar lg:block dark:border-slate-800">
          <div className="px-3 py-6">
            <SidebarNav items={navItems} activeId={scrollToId || activeId} onSelect={handleSelect} />
          </div>
        </aside>

        {/* ─── Mobile sidebar toggle ─── */}
        <div className="fixed bottom-4 right-4 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700"
          >
            <BookOpen className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-4 shadow-xl dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Navigation</span>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="text-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  &times;
                </button>
              </div>
              <SidebarNav items={navItems} activeId={activeId} onSelect={handleSelect} />
            </div>
          </div>
        ) : null}

        {/* ─── Main content: scrollable panel ─── */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-6 py-8 sm:px-8 lg:px-12"
        >
          <div className="mx-auto max-w-5xl pb-24">
            <SectionContent
              sectionId={activeId}
              scrollToId={scrollToId}
              language={language}
              onLanguageChange={setLanguage}
              copiedKey={copiedKey}
              onCopy={copy}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
