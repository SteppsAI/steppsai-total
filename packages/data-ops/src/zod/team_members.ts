import { z } from "zod";

export const teamMembersSchema = z.object({
	id: z.string().uuid(),
	ownerId: z.string(),
	memberId: z.string(),
	role: z.enum(["editor", "admin"]).optional(),
	status: z.enum(["pending", "accepted"]).optional(),
	createdAt: z.string().optional(),
});

export const createTeamMemberSchema = teamMembersSchema.omit({ id: true, createdAt: true });

export type TeamMembersSchemaType = z.infer<typeof teamMembersSchema>;
export type CreateTeamMemberSchemaType = z.infer<typeof createTeamMemberSchema>;