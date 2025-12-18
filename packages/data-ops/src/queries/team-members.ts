import { getDb } from "@/db/database";
import { teamMembers } from "@/drizzle-out/schema";
import { user } from "@/drizzle-out/auth-schema";
import { eq, and, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export interface TeamMember {
	teamMemberId: string;
	ownerId: string;
	memberId: string;
	role: string | null;
	status: string | null;
	createdAt: string | null;
	// Joined user info
	memberEmail?: string;
	memberName?: string;
	memberAvatar?: string;
}

/**
 * Get all team members for an owner (team they own)
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
 * Get teams where user is a member (not owner)
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
 * Count active team members for an owner
 */
export async function countActiveTeamMembers(ownerId: string): Promise<number> {
	const db = getDb();

	const result = await db
		.select({ teamMemberId: teamMembers.teamMemberId })
		.from(teamMembers)
		.where(
			and(
				eq(teamMembers.ownerId, ownerId),
				eq(teamMembers.status, "accepted")
			)
		);

	return result.length;
}

/**
 * Add a team member by email
 */
export async function addTeamMemberByEmail(
	ownerId: string,
	email: string,
	role: "editor" | "admin" = "editor"
): Promise<{ success: boolean; error?: string; teamMemberId?: string }> {
	const db = getDb();

	// Find user by email
	const [memberUser] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, email.toLowerCase()))
		.limit(1);

	if (!memberUser) {
		return { success: false, error: "User not found with that email" };
	}

	if (memberUser.id === ownerId) {
		return { success: false, error: "Cannot add yourself as a team member" };
	}

	// Check if already a member
	const existing = await db
		.select({ teamMemberId: teamMembers.teamMemberId })
		.from(teamMembers)
		.where(
			and(
				eq(teamMembers.ownerId, ownerId),
				eq(teamMembers.memberId, memberUser.id)
			)
		)
		.limit(1);

	if (existing.length > 0) {
		return { success: false, error: "User is already a team member" };
	}

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
 * Remove a team member
 */
export async function removeTeamMember(
	ownerId: string,
	teamMemberId: string
): Promise<boolean> {
	const db = getDb();

	const result = await db
		.delete(teamMembers)
		.where(
			and(
				eq(teamMembers.teamMemberId, teamMemberId),
				eq(teamMembers.ownerId, ownerId)
			)
		);

	return true;
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

	await db
		.update(teamMembers)
		.set({ role })
		.where(
			and(
				eq(teamMembers.teamMemberId, teamMemberId),
				eq(teamMembers.ownerId, ownerId)
			)
		);

	return true;
}

/**
 * Accept team invitation (called by invited member)
 */
export async function acceptTeamInvitation(
	memberId: string,
	teamMemberId: string
): Promise<boolean> {
	const db = getDb();

	await db
		.update(teamMembers)
		.set({ status: "accepted" })
		.where(
			and(
				eq(teamMembers.teamMemberId, teamMemberId),
				eq(teamMembers.memberId, memberId),
				eq(teamMembers.status, "pending")
			)
		);

	return true;
}

/**
 * Decline team invitation (called by invited member)
 */
export async function declineTeamInvitation(
	memberId: string,
	teamMemberId: string
): Promise<boolean> {
	const db = getDb();

	await db
		.delete(teamMembers)
		.where(
			and(
				eq(teamMembers.teamMemberId, teamMemberId),
				eq(teamMembers.memberId, memberId),
				eq(teamMembers.status, "pending")
			)
		);

	return true;
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
		.where(
			and(
				eq(teamMembers.memberId, userId),
				eq(teamMembers.status, "pending")
			)
		);

	return result as TeamMember[];
}

/**
 * Check if user has access through team membership
 * Returns ownerId if user is a member of a team with active subscription
 */
export async function getTeamOwnerWithAccess(userId: string): Promise<string | null> {
	const db = getDb();

	// Get all teams where user is an accepted member
	const teams = await db
		.select({ ownerId: teamMembers.ownerId })
		.from(teamMembers)
		.where(
			and(
				eq(teamMembers.memberId, userId),
				eq(teamMembers.status, "accepted")
			)
		);

	if (teams.length === 0) {
		return null;
	}

	// Return the first owner (a user could be part of multiple teams)
	return teams[0].ownerId;
}
