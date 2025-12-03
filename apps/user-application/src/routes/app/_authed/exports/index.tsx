import { createFileRoute } from "@tanstack/react-router";
import {
    FileText,
    Download,
    CheckCircle2,
    Loader2,
    AlertCircle,
    MoreVertical,
    Trash,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { trpc } from "@/router";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/app/_authed/exports/")({
    component: ExportsPage,
    loader: async ({ context }) => {
        await context.queryClient.prefetchQuery(context.trpc.guideExports.getAll.queryOptions());
    },
});

function ExportsPage() {
    const { data: exports } = useSuspenseQuery(trpc.guideExports.getAll.queryOptions());
    const [searchQuery, setSearchQuery] = useState("");

    // Listen for search query changes from sessionStorage (from header search)
    useState(() => { // Using useState initializer for initial check
        const savedSearchQuery = sessionStorage.getItem('searchQuery');
        if (savedSearchQuery) {
            setSearchQuery(savedSearchQuery);
        }
    });

    // Poll for changes to sync with header search
    useEffect(() => {
        const checkSearch = () => {
            const savedSearchQuery = sessionStorage.getItem('searchQuery');
            if (savedSearchQuery !== null) {
                setSearchQuery(savedSearchQuery);
            } else {
                setSearchQuery("");
            }
        };

        const interval = setInterval(checkSearch, 500);
        return () => clearInterval(interval);
    }, []);

    const filteredExports = exports.filter(item =>
        (item.guideTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateInput: Date | string | null) => {
        if (!dateInput) return "N/A";
        const date = new Date(dateInput);
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        }).format(date);
    };

    const getStatusIcon = (status: string | null) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="size-4 text-green-500 shrink-0" />;
            case "processing":
            case "pending":
                return <Loader2 className="size-4 text-blue-500 animate-spin shrink-0" />;
            case "failed":
                return <AlertCircle className="size-4 text-destructive shrink-0" />;
        }
    };

    return (
        <div className="flex flex-col gap-4 sm:gap-6 w-full mx-auto pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 max-w-[90rem]">
            {/* Header Section matching FolderPage */}
            <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Optional back button if deep navigation is expected, kept for consistency if desired, 
                        but for a top-level page it might be redundant. FolderPage has it to go back to 'My Stepps'. 
                        Here we are at 'Exports'. */}
                    {/* <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate({ to: "/app" })}
                        className="shrink-0"
                    >
                        <ArrowLeft className="size-5" />
                    </Button> */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <Download className="size-5 sm:size-6 text-muted-foreground shrink-0" />
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">Exports</h1>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                            {filteredExports.length} {filteredExports.length === 1 ? "export" : "exports"} found
                        </p>
                    </div>
                </div>
                {/* No 'New Export' button here as exports are generated from guides */}
            </div>

            {/* Exports List Section */}
            <section className="space-y-3 sm:space-y-4">
                {searchQuery && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Found {filteredExports.length} export{filteredExports.length !== 1 ? 's' : ''} matching "{searchQuery}"
                    </p>
                )}

                {/* Desktop Table View - matching hidden xl:block */}
                <div className="hidden xl:block border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="min-w-[200px] lg:w-auto">Guide Title</TableHead>
                                    <TableHead className="w-24 lg:w-28">Type</TableHead>
                                    <TableHead className="w-32 lg:w-40">Status</TableHead>
                                    <TableHead className="min-w-[160px] lg:w-auto">Date Created</TableHead>
                                    <TableHead className="w-24 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredExports.length > 0 ? (
                                    filteredExports.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-muted/50 transition-colors group">
                                            <TableCell className="font-medium cursor-pointer" onClick={() => {
                                                if (item.status === "completed" && item.fileUrl) {
                                                    window.open(item.fileUrl, "_blank");
                                                }
                                            }}>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="size-4 text-muted-foreground shrink-0" />
                                                    <span className="hover:underline hover:text-primary truncate cursor-pointer">
                                                        {item.guideTitle || "Untitled Guide"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="uppercase text-xs font-mono">
                                                    {item.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(item.status)}
                                                    <span className="capitalize text-sm text-muted-foreground">
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {formatDate(item.createdAt || null)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="size-8 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                        >
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {item.status === "completed" && item.fileUrl && (
                                                            <DropdownMenuItem asChild className="cursor-pointer">
                                                                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                    <Download className="mr-2 size-4" />
                                                                    Download
                                                                </a>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            className="text-destructive cursor-pointer"
                                                            onClick={() => {
                                                                // Handle delete export
                                                                // toast.error("Not implemented yet");
                                                            }}
                                                        >
                                                            <Trash className="mr-2 size-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No exports found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Mobile Card View - matching xl:hidden */}
                <div className="xl:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredExports.map((item) => (
                        <div
                            key={item.id}
                            className="group relative flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0 cursor-pointer" onClick={() => {
                                    if (item.status === "completed" && item.fileUrl) {
                                        window.open(item.fileUrl, "_blank");
                                    }
                                }}>
                                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                                    <span className="font-semibold truncate hover:underline">
                                        {item.guideTitle || "Untitled Guide"}
                                    </span>
                                </div>
                                <Badge variant="outline" className="uppercase text-[10px] font-mono shrink-0">
                                    {item.type}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    {getStatusIcon(item.status)}
                                    <span className="capitalize text-xs">{item.status}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs">
                                    {formatDate(item.createdAt || null)}
                                </div>
                            </div>

                            {item.status === "completed" && item.fileUrl && (
                                <Button variant="secondary" size="sm" className="w-full mt-1" asChild>
                                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                                        <Download className="size-3.5 mr-2" />
                                        Download
                                    </a>
                                </Button>
                            )}
                        </div>
                    ))}
                    {filteredExports.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 text-center border border-dashed rounded-xl bg-muted/30">
                            <p className="text-muted-foreground text-sm">No exports found.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
