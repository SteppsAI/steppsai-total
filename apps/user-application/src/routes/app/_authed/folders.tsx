import { createFileRoute } from "@tanstack/react-router";
import {
    Folder,
    Plus,
    Search,
    MoreVertical,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/app/_authed/folders")({
    component: FoldersPage,
});

// Mock Data
const MOCK_FOLDERS = [
    { id: "1", name: "Onboarding", count: 5, updatedAt: "2 days ago", color: "bg-blue-500" },
    { id: "2", name: "Product Demos", count: 12, updatedAt: "1 week ago", color: "bg-purple-500" },
    { id: "3", name: "Internal SOPs", count: 8, updatedAt: "3 days ago", color: "bg-green-500" },
    { id: "4", name: "Marketing Assets", count: 3, updatedAt: "1 day ago", color: "bg-orange-500" },
];

const MOCK_GUIDES = [
    {
        id: "101",
        title: "Searching using Google",
        image: "https://placehold.co/600x400/png",
    },
    {
        id: "102",
        title: "Setting up Render account",
        image: "https://placehold.co/600x400/png",
    },
    {
        id: "103",
        title: "How to send email",
        image: "https://placehold.co/600x400/png",
    },
    {
        id: "104",
        title: "Q4 Sales Report Export",
        image: "https://placehold.co/600x400/png",
    },
];

function FoldersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    const handleCreateFolder = () => {
        console.log("Creating folder:", newFolderName);
        setIsCreateFolderOpen(false);
        setNewFolderName("");
    };

    return (
        <div className="flex flex-col gap-12 w-full max-w-[1400px] mx-auto pb-8">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Stepps</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your guides and organize them into folders.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full max-w-xs hidden md:block mr-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 bg-muted/50 border-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Folder className="size-4" />
                                New Folder
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Folder</DialogTitle>
                                <DialogDescription>
                                    Organize your Stepps by creating a new folder.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Folder Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Onboarding, Marketing..."
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateFolderOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateFolder}>Create Folder</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button className="gap-2">
                        <Plus className="size-4" />
                        New Stepp
                    </Button>
                </div>
            </div>

            {/* Folders Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-normal text-foreground">Folders</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {MOCK_FOLDERS.map((folder) => (
                        <FolderCard key={folder.id} folder={folder} />
                    ))}
                </div>
            </section>

            {/* All Stepps Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-normal text-foreground">All Stepps</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_GUIDES.map((guide) => (
                        <DashboardCard
                            key={guide.id}
                            title={guide.title}
                            image={guide.image}
                            onEdit={() => console.log("Edit", guide.id)}
                            onShare={() => console.log("Share", guide.id)}
                            onDelete={() => console.log("Delete", guide.id)}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}

function FolderCard({ folder }: { folder: typeof MOCK_FOLDERS[0] }) {
    return (
        <div className="group relative flex flex-col justify-between p-4 h-32 rounded-xl border border-border bg-card hover:shadow-md transition-all cursor-pointer">
            <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg ${folder.color} bg-opacity-10 text-opacity-100`}>
                    <Folder className={`size-6 ${folder.color.replace('bg-', 'text-')}`} fill="currentColor" fillOpacity={0.2} />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="size-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="size-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div>
                <h3 className="font-medium truncate" title={folder.name}>{folder.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                    Opened {folder.updatedAt}
                </p>
            </div>
        </div>
    );
}
