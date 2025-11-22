// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { getDb } from "@repo/data-ops/database";
// import * as authSchema from "@repo/data-ops/drizzle-out/auth-schema";
// import * as schema from "@repo/data-ops/drizzle-out/schema";
// 
// export const getAuth = (env: { clientId: string; clientSecret: string }) => {
//     return betterAuth({
//         database: drizzleAdapter(getDb(), {
//             provider: "pg",
//             schema: { ...schema, ...authSchema },
//         }),
//         socialProviders: {
//             google: {
//                 clientId: env.clientId,
//                 clientSecret: env.clientSecret,
//             },
//         },
//         emailAndPassword: {
//             enabled: true,
//         },
//     });
// };
