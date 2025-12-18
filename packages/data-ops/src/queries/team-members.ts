import { getDb } from "@/db/database";
import { teamMembers } from "@/drizzle-out/schema";
import { user } from "@/drizzle-out/auth-schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type { TeamMember } from "@/zod/team_members";

/**
 * Get team members for an owner
 */
export async function getTeamMembers(ownerId: string): Promise<TeamMember[]> {
	const db = getDb();
	const result = await db
		.select({
			teamMemberId: teamMembers.teamMemberId,
			ownerId: teamMembers.ownerId,
			memberId: teamMembers.memberId,
			role: teamMembers.role,
			status: teamMembers.status,
			createdAt: teamMembers.createdAt,
			memberEmail: user.email,
			memberName: user.name,
			memberAvatar: user.avatarUrl,
		})
		.from(teamMembers)
		.leftJoin(user, eq(teamMembers.memberId, user.id))
		.where(eq(teamMembers.ownerId, ownerId));

	return result as TeamMember[];
}

/**
 * Count accepted team members for limit check
 */
export async function countActiveTeamMembers(ownerId: string): Promise<number> {
	const db = getDb();
	const result = await db
		.select({ teamMemberId: teamMembers.teamMemberId })
		.from(teamMembers)
		.where(and(eq(teamMembers.ownerId, ownerId), eq(teamMembers.status, "accepted")));
	return result.length;
}

/**
 * Add team member by email
 */
export async function addTeamMemberByEmail(
	ownerId: string,
	email: string,
	role: "editor" | "admin" = "editor"
): Promise<{ success: boolean; error?: string; teamMemberId?: string }> {
	const db = getDb();

	const [memberUser] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, email.toLowerCase()))
		.limit(1);

	if (!memberUser) return { success: false, error: "User not found" };
	if (memberUser.id === ownerId) return { success: false, error: "Cannot add yourself" };

	const existing = await db
		.select({ teamMemberId: teamMembers.teamMemberId })
		.from(teamMembers)
		.where(and(eq(teamMembers.ownerId, ownerId), eq(teamMembers.memberId, memberUser.id)))
		.limit(1);

	if (existing.length > 0) return { success: false, error: "Already a member" };

	const teamMemberId = uuidv4();
	await db.insert(teamMembers).values({
		teamMemberId,
		ownerId,
		memberId: memberUser.id,
		role,
		status: "pending",
	});

	return { success: true, teamMemberId };
}

/**
 * Remove team member
 */
export async function removeTeamMember(ownerId: string, teamMemberId: string): Promise<boolean> {
	const db = getDb();
	const result = await db
		.delete(teamMembers)
		.where(and(eq(teamMembers.teamMemberId, teamMemberId), eq(teamMembers.ownerId, ownerId)))
		.returning();
	return result.length > 0;
}

/**
 * Accept invitation
 */
export async function acceptTeamInvitation(memberId: string, teamMemberId: string): Promise<boolean> {
	const db = getDb();
	const result = await db
		.update(teamMembers)
		.set({ status: "accepted" })
		.where(
			and(
				eq(teamMembers.teamMemberId, teamMemberId),
				eq(teamMembers.memberId, memberId),
				eq(teamMembers.status, "pending")
			)
		)
		.returning();
	return result.length > 0;
}

/**
 * Decline invitation
 */
export async function declineTeamInvitation(memberId: string, teamMemberId: string): Promise<boolean> {
	const db = getDb();
	const result = await db
		.delete(teamMembers)
		.where(
			and(
				eq(teamMembers.teamMemberId, teamMemberId),
				eq(teamMembers.memberId, memberId),
				eq(teamMembers.status, "pending")
			)
		)
		.returning();
	return result.length > 0;
}

/**
 * Get pending invitations for a user
 */
export async function getPendingInvitations(userId: string): Promise<TeamMember[]> {
	const db = getDb();
	const result = await db
		.select({
			teamMemberId: teamMembers.teamMemberId,
			ownerId: teamMembers.ownerId,
			memberId: teamMembers.memberId,
			role: teamMembers.role,
			status: teamMembers.status,
			createdAt: teamMembers.createdAt,
		})
		.from(teamMembers)
		.where(and(eq(teamMembers.memberId, userId), eq(teamMembers.status, "pending")));

	return result as TeamMember[];
}

/**
 * Get teams where user is a member
 */
export async function getTeamsAsMember(userId: string): Promise<TeamMember[]> {
	const db = getDb();
	const result = await db
		.select({
			teamMemberId: teamMembers.teamMemberId,
			ownerId: teamMembers.ownerId,
			memberId: teamMembers.memberId,
			role: teamMembers.role,
			status: teamMembers.status,
			createdAt: teamMembers.createdAt,
		})
		.from(teamMembers)
		.where(eq(teamMembers.memberId, userId));

	return result as TeamMember[];
}

/**
 * Update team member role
 */
export async function updateTeamMemberRole(
	ownerId: string,
	teamMemberId: string,
	role: "editor" | "admin"
): Promise<boolean> {
	const db = getDb();
	const result = await db
		.update(teamMembers)
		.set({ role })
		.where(and(eq(teamMembers.teamMemberId, teamMemberId), eq(teamMembers.ownerId, ownerId)))
		.returning();
	return result.length > 0;
}
