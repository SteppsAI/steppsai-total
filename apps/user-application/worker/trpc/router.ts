import { t } from "@/worker/trpc/trpc-instance";
import { guidesRouter } from "@/worker/trpc/routers/guides";
import { foldersRouter } from "@/worker/trpc/routers/folders";
import { recordingRouter } from "@/worker/trpc/routers/recording";
import { imagesRouter } from "@/worker/trpc/routers/images";
import { usersRouter } from "@/worker/trpc/routers/users";

export const appRouter = t.router({
  guides: guidesRouter,
  folders: foldersRouter,
  recording: recordingRouter,
  images: imagesRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
