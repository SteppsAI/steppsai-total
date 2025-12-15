import { t } from "@/worker/trpc/trpc-instance";
import { guidesRouter } from "@/worker/trpc/routers/guides";
import { foldersRouter } from "@/worker/trpc/routers/folders";
import { imagesRouter } from "@/worker/trpc/routers/images";
import { usersRouter } from "@/worker/trpc/routers/users";
import { guideExportsRouter } from "@/worker/trpc/routers/exports";
import { editorRouter } from "@/worker/trpc/routers/editor";
import { recordingRouter } from "@/worker/trpc/routers/recording";
import { notificationsRouter } from "@/worker/trpc/routers/notifications";
import { publicGuidesRouter } from "@/worker/trpc/routers/public-guides";
import { configRouter } from "@/worker/trpc/routers/config";

/**
 * tRPC Router
 * 
 * All operations go through tRPC:
 * - DB operations use data-ops directly
 * - R2/DO/Workflow operations use BACKEND_SERVICE RPC
 * - R2/DO/Workflow operations use BACKEND_SERVICE RPC
 */
export const appRouter = t.router({
  guides: guidesRouter,
  folders: foldersRouter,
  images: imagesRouter,
  users: usersRouter,
  guideExports: guideExportsRouter,
  editor: editorRouter,
  recording: recordingRouter,
  notifications: notificationsRouter,
  publicGuides: publicGuidesRouter,
  config: configRouter,
});

export type AppRouter = typeof appRouter;


