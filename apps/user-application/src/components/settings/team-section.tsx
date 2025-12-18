import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Trash2, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/router";

export function TeamSection() {
    const queryClient = useQueryClient();
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"editor" | "admin">("editor");

    // Queries
    const { data: teamStats } = useQuery(trpc.team.getTeamStats.queryOptions());
    const { data: teamMembers } = useQuery(trpc.team.getMyTeam.queryOptions());
    const { data: pendingInvitations } = useQuery(trpc.team.getPendingInvitations.queryOptions());

    // Mutations
    const addMemberMutation = useMutation({
        ...trpc.team.addMember.mutationOptions(),
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Invitation sent!");
                setInviteEmail("");
                queryClient.invalidateQueries({ queryKey: trpc.team.getMyTeam.queryOptions().queryKey });
                queryClient.invalidateQueries({ queryKey: trpc.team.getTeamStats.queryOptions().queryKey });
            } else {
                toast.error(result.error || "Failed to add member");
            }
        },
        onError: () => {
            toast.error("Failed to send invitation");
        },
    });

    const removeMemberMutation = useMutation({
        ...trpc.team.removeMember.mutationOptions(),
        onSuccess: () => {
            toast.success("Member removed");
            queryClient.invalidateQueries({ queryKey: trpc.team.getMyTeam.queryOptions().queryKey });
            queryClient.invalidateQueries({ queryKey: trpc.team.getTeamStats.queryOptions().queryKey });
        },
        onError: () => {
            toast.error("Failed to remove member");
        },
    });

    const acceptInvitationMutation = useMutation({
        ...trpc.team.acceptInvitation.mutationOptions(),
        onSuccess: () => {
            toast.success("Invitation accepted!");
            // Invalidate all team-related queries after accepting
            queryClient.invalidateQueries({ queryKey: trpc.team.getPendingInvitations.queryOptions().queryKey });
            queryClient.invalidateQueries({ queryKey: trpc.team.getMyTeam.queryOptions().queryKey });
            queryClient.invalidateQueries({ queryKey: trpc.team.getTeamStats.queryOptions().queryKey });
            queryClient.invalidateQueries({ queryKey: trpc.team.getMyMemberships.queryOptions().queryKey });
        },
        onError: () => {
            toast.error("Failed to accept invitation");
        },
    });

    const declineInvitationMutation = useMutation({
        ...trpc.team.declineInvitation.mutationOptions(),
        onSuccess: () => {
            toast.success("Invitation declined");
            queryClient.invalidateQueries({ queryKey: trpc.team.getPendingInvitations.queryOptions().queryKey });
        },
        onError: () => {
            toast.error("Failed to decline invitation");
        },
    });

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        addMemberMutation.mutate({ email: inviteEmail.trim(), role: inviteRole });
    };

    const hasTeamPlan = teamStats?.hasTeamPlan ?? false;

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="space-y-1">
                <h2 className="text-lg md:text-xl font-medium">Team</h2>
                <p className="text-sm text-muted-foreground">
                    Manage your team members and invitations.
                </p>
            </div>
            <Separator />

            {/* Pending Invitations (if any) */}
            {pendingInvitations && pendingInvitations.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium">Pending Invitations</h3>
                    <div className="space-y-2">
                        {pendingInvitations.map((invitation) => (
                            <div
                                key={invitation.teamMemberId}
                                className="flex items-center justify-between p-3 rounded-lg border bg-muted/20"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Users className="size-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Team Invitation</p>
                                        <p className="text-xs text-muted-foreground">
                                            Role: {invitation.role || "editor"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => acceptInvitationMutation.mutate({ teamMemberId: invitation.teamMemberId })}
                                        disabled={acceptInvitationMutation.isPending}
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => declineInvitationMutation.mutate({ teamMemberId: invitation.teamMemberId })}
                                        disabled={declineInvitationMutation.isPending}
                                    >
                                        Decline
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Separator />
                </div>
            )}

            {!hasTeamPlan ? (
                /* No Team Plan */
                <div className="rounded-lg border p-6 text-center space-y-4">
                    <div className="size-12 rounded-full bg-muted mx-auto flex items-center justify-center">
                        <Users className="size-6 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="font-medium">Team features require a team plan</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Upgrade to a team plan to invite members and collaborate.
                        </p>
                    </div>
                    <Button asChild>
                        <a href="/payments">View Team Plans</a>
                    </Button>
                </div>
            ) : (
                /* Team Management UI */
                <div className="space-y-6">
                    {/* Team Stats */}
                    <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/20">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Crown className="size-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">Team Plan</p>
                            <p className="text-sm text-muted-foreground">
                                {teamStats?.memberCount ?? 0} / {teamStats?.maxMembers ?? 0} members
                            </p>
                        </div>
                    </div>

                    {/* Invite Form */}
                    {teamStats?.canAddMembers && (
                        <form onSubmit={handleInvite} className="space-y-3">
                            <Label>Invite a team member</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    placeholder="Enter email address"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="flex-1"
                                />
                                <Select
                                    value={inviteRole}
                                    onValueChange={(v) => setInviteRole(v as "editor" | "admin")}
                                >
                                    <SelectTrigger className="w-28">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="editor">Editor</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button type="submit" disabled={addMemberMutation.isPending || !inviteEmail.trim()}>
                                    {addMemberMutation.isPending ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <UserPlus className="size-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                The invited user must have a Stepps.ai account.
                            </p>
                        </form>
                    )}

                    {/* Team Members List */}
                    <div className="space-y-3">
                        <Label>Team Members</Label>
                        {teamMembers && teamMembers.length > 0 ? (
                            <div className="space-y-2">
                                {teamMembers.map((member) => (
                                    <div
                                        key={member.teamMemberId}
                                        className="flex items-center justify-between p-3 rounded-lg border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-8">
                                                <AvatarImage src={member.memberAvatar || undefined} />
                                                <AvatarFallback className="text-xs">
                                                    {member.memberName?.charAt(0).toUpperCase() || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {member.memberName || member.memberEmail}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {member.memberEmail} • {member.role || "editor"} • {member.status}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() => removeMemberMutation.mutate({ teamMemberId: member.teamMemberId })}
                                            disabled={removeMemberMutation.isPending}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground border rounded-lg">
                                <p>No team members yet</p>
                                <p className="text-xs mt-1">Invite team members using the form above</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
