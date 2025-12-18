import { z } from "zod";

export const teamMemberSchema = z.object({
	teamMemberId: z.string().uuid(),
	ownerId: z.string(),
	memberId: z.string(),
	role: z.string().nullable(),
	status: z.string().nullable(),
	createdAt: z.string().nullable(),
	// Joined user info
	memberEmail: z.string().optional(),
	memberName: z.string().optional(),
	memberAvatar: z.string().optional(),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;