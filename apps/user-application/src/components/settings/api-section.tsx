import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Copy, Check, Loader2, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/router";
import { Link } from "@tanstack/react-router";

interface ApiKey {
    apiKeyId: string;
    ownerUserId: string;
    label?: string | null;
    keyPrefix?: string | null;
    keyLast4?: string | null;
    createdAt?: string | null;
    lastUsedAt?: string | null;
    revokedAt?: string | null;
}

export function ApiSection() {
    const queryClient = useQueryClient();
    const [label, setLabel] = useState("");
    const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Fetch API keys via tRPC
    const settingsQuery = useQuery(trpc.agentKeys.getSettings.queryOptions());
    const apiKeys: ApiKey[] = (settingsQuery.data?.apiKeys ?? []) as ApiKey[];
    const canManage = settingsQuery.data?.canManage !== false;
    const reason = settingsQuery.data?.reason;

    const createMutation = useMutation({
        ...trpc.agentKeys.create.mutationOptions(),
        onSuccess: (data: any) => {
            setJustCreatedKey(data.key);
            setLabel("");
            queryClient.invalidateQueries({
                queryKey: trpc.agentKeys.getSettings.queryOptions().queryKey,
            });
            toast.success("API key created");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create API key");
        },
    });

    const revokeMutation = useMutation({
        ...trpc.agentKeys.revoke.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: trpc.agentKeys.getSettings.queryOptions().queryKey,
            });
            toast.success("API key revoked");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to revoke API key");
        },
    });

    const handleCreate = () => {
        setJustCreatedKey(null);
        createMutation.mutate({ label: label || undefined });
    };

    const handleCopy = async () => {
        if (!justCreatedKey) return;
        try {
            await navigator.clipboard.writeText(justCreatedKey);
            setCopied(true);
            toast.success("API key copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    const handleRevoke = (apiKeyId: string) => {
        revokeMutation.mutate({ apiKeyId });
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Loading state
    if (settingsQuery.isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">API</h3>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (settingsQuery.isError) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">API</h3>
                    <p className="text-sm text-destructive">
                        Failed to load API settings. Please try again.
                    </p>
                </div>
            </div>
        );
    }

    // Access denied (team member)
    if (!canManage) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">API</h3>
                    <p className="text-sm text-muted-foreground">
                        {reason || "Only the workspace owner can manage API keys."}
                    </p>
                </div>
            </div>
        );
    }

    const activeKeys = apiKeys.filter((k) => !k.revokedAt);
    const revokedKeys = apiKeys.filter((k) => k.revokedAt);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">API</h3>
                <p className="text-sm text-muted-foreground">
                    Create and manage Stepps agent API keys for browser runs and integrations.
                </p>
            </div>

            <Separator />

            {/* Create API Key */}
            <div className="space-y-3">
                <Label htmlFor="api-key-label" className="text-sm font-medium">
                    Create new API key
                </Label>
                <div className="flex gap-2">
                    <Input
                        id="api-key-label"
                        placeholder="Optional label (e.g. My integration)"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreate();
                        }}
                    />
                    <Button
                        onClick={handleCreate}
                        disabled={createMutation.isPending}
                        className="gap-2 shrink-0"
                    >
                        {createMutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <KeyRound className="size-4" />
                        )}
                        Create API key
                    </Button>
                </div>
            </div>

            {/* Just-Created Key (one-time reveal) */}
            {justCreatedKey && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800">
                        <AlertTriangle className="size-4" />
                        <span className="text-sm font-medium">
                            Store this now. You will not be able to see it again.
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 rounded bg-white px-3 py-2 font-mono text-sm border text-foreground break-all">
                            {justCreatedKey}
                        </code>
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={handleCopy}
                            className="shrink-0"
                        >
                            {copied ? (
                                <Check className="size-4 text-green-600" />
                            ) : (
                                <Copy className="size-4" />
                            )}
                        </Button>
                    </div>
                </div>
            )}

            <Separator />

            {/* Active Keys */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">
                    Active keys{activeKeys.length > 0 && ` (${activeKeys.length})`}
                </h4>
                {activeKeys.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                        No active API keys. Create one above to get started.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {activeKeys.map((key) => (
                            <div
                                key={key.apiKeyId}
                                className="flex items-center gap-3 rounded-lg border p-3"
                            >
                                <KeyRound className="size-4 text-muted-foreground shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium truncate">
                                            {key.label || "Unnamed key"}
                                        </span>
                                        <Badge variant="secondary" className="text-xs font-mono">
                                            {key.keyPrefix}...{key.keyLast4}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        Created {formatDate(key.createdAt)}
                                        {key.lastUsedAt && ` · Last used ${formatDate(key.lastUsedAt)}`}
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                    onClick={() => handleRevoke(key.apiKeyId)}
                                    disabled={revokeMutation.isPending}
                                >
                                    <Trash2 className="size-3.5 mr-1" />
                                    Revoke
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Revoked Keys */}
            {revokedKeys.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">
                        Revoked keys ({revokedKeys.length})
                    </h4>
                    <div className="space-y-2">
                        {revokedKeys.map((key) => (
                            <div
                                key={key.apiKeyId}
                                className="flex items-center gap-3 rounded-lg border border-dashed p-3 opacity-60"
                            >
                                <KeyRound className="size-4 text-muted-foreground shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium truncate line-through">
                                            {key.label || "Unnamed key"}
                                        </span>
                                        <Badge variant="outline" className="text-xs font-mono">
                                            {key.keyPrefix}...{key.keyLast4}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        Revoked {formatDate(key.revokedAt)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Separator />

            {/* Docs Link */}
            <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="size-4 text-muted-foreground" />
                <Link
                    to="/docs"
                    className="text-primary hover:underline font-medium"
                >
                    Read the API reference
                </Link>
            </div>
        </div>
    );
}
