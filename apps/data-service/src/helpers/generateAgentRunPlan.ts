import { generateObject } from "ai";
import { agentPlanSchema, type AgentPlan } from "@repo/data-ops/zod-schema";
import { getOpenRouterModel } from "./openrouter";

function truncatePrompt(prompt: string) {
	return prompt.trim().replace(/\s+/g, " ").slice(0, 400);
}

function buildPlanningPrompt(prompt: string, maxSteps: number) {
	return {
		system: [
			"You are Stepps.ai's browser-run planner.",
			"Your job is to turn a user prompt into a bounded, browser-only execution plan for a recorded workflow.",
			"Only use these actions: open_tab, focus_tab, navigate, click, type, press, wait_for, scroll, capture, extract_text.",
			"Do not include any desktop or OS-level actions.",
			"Prefer explicit https URLs when the target web product is obvious from the prompt.",
			`Keep the plan to at most ${maxSteps} actions.`,
			"Each action title must read like a visible user step in a Stepps guide.",
			"Stop before login, 2FA, payment confirmation, or CAPTCHA. Reflect those as stopConditions rather than trying to bypass them.",
			"Return concise, implementation-ready action data only.",
		].join("\n"),
		user: `User request:\n${prompt.trim()}`,
	};
}

function normalizePlan(plan: AgentPlan, maxSteps: number, prompt: string): AgentPlan {
	const title = plan.title?.trim() || truncatePrompt(prompt) || "Recorded workflow";
	return {
		...plan,
		title,
		summary: plan.summary?.trim() || `Record the workflow for: ${title}`,
		actions: plan.actions.slice(0, maxSteps).map((action, index) => ({
			...action,
			id: action.id?.trim() || `action_${index + 1}`,
			title: action.title?.trim() || `${action.type} step ${index + 1}`,
		})),
	};
}

export async function generateAgentRunPlan(
	env: Env,
	prompt: string,
	maxSteps: number
): Promise<AgentPlan> {
	const model = getOpenRouterModel(env);
	const planningPrompt = buildPlanningPrompt(prompt, maxSteps);
	const result = await generateObject({
		model,
		mode: "json",
		system: planningPrompt.system,
		prompt: planningPrompt.user,
		temperature: 0.2,
		maxRetries: 1,
		schema: agentPlanSchema,
	});

	return normalizePlan(result.object, maxSteps, prompt);
}
