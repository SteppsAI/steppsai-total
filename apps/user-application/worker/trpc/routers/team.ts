import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import {
    getTeamMembers,
    getTeamsAsMember,
    countActiveTeamMembers,
    addTeamMemberByEmail,
    removeTeamMember,
    updateTeamMemberRole,
    acceptTeamInvitation,
    declineTeamInvitation,
    getPendingInvitations,
} from "@repo/data-ops/queries";
import { checkUserAccess } from "@repo/data-ops/queries/subscriptions";

// Team size for team plans (3 members)
const TEAM_PLAN_SIZE = 3;

// Helper to get team limits based on product ID and environment
function getTeamLimit(productId: string | null, env: any): number {
    if (!productId) return 0;

    // Get team product IDs from environment
    const teamProductIds = [
        env.VITE_CREEM_TEAM_PRODUCT_EU_PRODUCTION,
        env.VITE_CREEM_TEAM_PRODUCT_US_PRODUCTION,
        env.VITE_CREEM_TEAM_PRODUCT_EU_DEVELOPMENT,
        env.VITE_CREEM_TEAM_PRODUCT_US_DEVELOPMENT,
        env.VITE_CREEM_TEAM_PRODUCT_EU,
        env.VITE_CREEM_TEAM_PRODUCT_US,
    ].filter(Boolean);

    // Check if this product is a team product
    if (teamProductIds.includes(productId)) {
        return TEAM_PLAN_SIZE;
    }

    // Individual plans have no team access
    return 0;
}

export const teamRouter = router({
    /**
     * Get team members owned by the current user
     */
    getMyTeam: publicProcedure.query(async ({ ctx }) => {
        const members = await getTeamMembers(ctx.userInfo.userId);
        return members;
    }),

    /**
     * Get teams where current user is a member
     */
    getMyMemberships: publicProcedure.query(async ({ ctx }) => {
        const teams = await getTeamsAsMember(ctx.userInfo.userId);
        return teams;
    }),

    /**
     * Get pending invitations for current user
     */
    getPendingInvitations: publicProcedure.query(async ({ ctx }) => {
        const invitations = await getPendingInvitations(ctx.userInfo.userId);
        return invitations;
    }),

    /**
     * Get team stats (member count, max allowed)
     */
    getTeamStats: publicProcedure.query(async ({ ctx }) => {
        const userId = ctx.userInfo.userId;
        const access = await checkUserAccess(userId);

        const memberCount = await countActiveTeamMembers(userId);
        const maxMembers = getTeamLimit(access.productId, ctx.env);
        const hasTeamPlan = maxMembers > 0;

        return {
            memberCount,
            maxMembers,
            hasTeamPlan,
            canAddMembers: hasTeamPlan && memberCount < maxMembers,
            productId: access.productId,
        };
    }),

    /**
     * Add a team member by email
     */
    addMember: publicProcedure
        .input(z.object({
            email: z.string().email(),
            role: z.enum(["editor", "admin"]).default("editor"),
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.userInfo.userId;
            const access = await checkUserAccess(userId);

            // Check if user has team plan
            const maxMembers = getTeamLimit(access.productId, ctx.env);
            if (maxMembers === 0) {
                return { success: false, error: "Team features require a team plan" };
            }

            // Check member limit
            const currentCount = await countActiveTeamMembers(userId);
            if (currentCount >= maxMembers) {
                return { success: false, error: `Team limit reached (${maxMembers} members)` };
            }

            const result = await addTeamMemberByEmail(userId, input.email, input.role);
            return result;
        }),

    /**
     * Remove a team member
     */
    removeMember: publicProcedure
        .input(z.object({
            teamMemberId: z.string().uuid(),
        }))
        .mutation(async ({ input, ctx }) => {
            await removeTeamMember(ctx.userInfo.userId, input.teamMemberId);
            return { success: true };
        }),

    /**
     * Update team member role
     */
    updateMemberRole: publicProcedure
        .input(z.object({
            teamMemberId: z.string().uuid(),
            role: z.enum(["editor", "admin"]),
        }))
        .mutation(async ({ input, ctx }) => {
            await updateTeamMemberRole(ctx.userInfo.userId, input.teamMemberId, input.role);
            return { success: true };
        }),

    /**
     * Accept a team invitation
     */
    acceptInvitation: publicProcedure
        .input(z.object({
            teamMemberId: z.string().uuid(),
        }))
        .mutation(async ({ input, ctx }) => {
            await acceptTeamInvitation(ctx.userInfo.userId, input.teamMemberId);
            return { success: true };
        }),

    /**
     * Decline a team invitation
     */
    declineInvitation: publicProcedure
        .input(z.object({
            teamMemberId: z.string().uuid(),
        }))
        .mutation(async ({ input, ctx }) => {
            await declineTeamInvitation(ctx.userInfo.userId, input.teamMemberId);
            return { success: true };
        }),
});
