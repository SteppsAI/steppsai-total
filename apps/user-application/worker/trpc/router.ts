import { t } from "@/worker/trpc/trpc-instance";
import { guidesRouter } from "@/worker/trpc/routers/guides";
import { stepsRouter } from "@/worker/trpc/routers/steps";
import { recordingRouter } from "@/worker/trpc/routers/recording";
import { imagesRouter } from "@/worker/trpc/routers/images";

export const appRouter = t.router({
  guides: guidesRouter,
  steps: stepsRouter,
  recording: recordingRouter,
  images: imagesRouter,
});

export type AppRouter = typeof appRouter;
