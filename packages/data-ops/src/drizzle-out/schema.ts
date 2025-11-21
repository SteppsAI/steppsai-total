import { pgTable, uuid, timestamp, text, foreignKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authUsers } from "./auth-schema";

export const users = pgTable("users", {
	userId: uuid("user_id").defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	name: text("name"),
	email: text("email"),
},
	(table) => {
		return {
			usersUserIdFkey: foreignKey({
				columns: [table.userId],
				foreignColumns: [authUsers.id],
				name: "users_user_id_fkey"
			}).onUpdate("cascade").onDelete("cascade"),
		}
	});
