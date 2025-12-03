import { t } from "@/worker/trpc/trpc-instance";
import { guidesRouter } from "@/worker/trpc/routers/guides";
import { foldersRouter } from "@/worker/trpc/routers/folders";
import { recordingRouter } from "@/worker/trpc/routers/recording";
import { imagesRouter } from "@/worker/trpc/routers/images";
import { usersRouter } from "@/worker/trpc/routers/users";
import { guideExportsRouter } from "@/worker/trpc/routers/exports";
import { editorRouter } from "@/worker/trpc/routers/editor";

export const appRouter = t.router({
  guides: guidesRouter,
  folders: foldersRouter,
  recording: recordingRouter,
  images: imagesRouter,
  users: usersRouter,
  guideExports: guideExportsRouter,
  editor: editorRouter,
});

export type AppRouter = typeof appRouter;
