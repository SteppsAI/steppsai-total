import { initDatabase } from "@repo/data-ops/database";
import { App } from "./hono/app";

export default {
  async fetch(request, env, ctx) {
    await initDatabase(env.DATABASE_URL);
    return App.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<ServiceBindings>;
