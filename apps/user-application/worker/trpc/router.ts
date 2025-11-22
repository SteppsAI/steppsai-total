import { t } from "@/worker/trpc/trpc-instance";
import { guidesRouter } from "@/worker/trpc/routers/guides";
import { stepsRouter } from "@/worker/trpc/routers/steps";

export const appRouter = t.router({
  guides: guidesRouter,
  steps: stepsRouter,
});

export type AppRouter = typeof appRouter;
