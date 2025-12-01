import { useQuery } from "@tanstack/react-query";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Search, X, FileText, Folder as FolderIcon, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/router";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


export function DashboardHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch data for previews
  // We use useQuery instead of useSuspenseQuery to avoid suspending the layout if data isn't ready
  // and to handle loading state gracefully in the search box
  const { data: guides, isLoading: isLoadingGuides } = useQuery(trpc.guides.getAll.queryOptions());
  const { data: folders, isLoading: isLoadingFolders } = useQuery(trpc.folders.getAll.queryOptions());

  // Check if we're on an editor route or guide view route
  // Note: This logic was in _authed.tsx, but now we might not need it if we only render this component in _authed.tsx
  // and _authed.tsx handles the conditional rendering of the header.
  // checking shouldShowSearch logic
  const shouldShowSearch = pathname === '/app' || pathname === '/app/stepps' || pathname.startsWith('/app/folder');

  // Handle search submission (Enter key)
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setOpen(false); // Close preview
      // Always update session storage for page filtering
      sessionStorage.setItem('searchQuery', searchQuery);

      // If not already on stepps or folder page, navigate to stepps
      if (!pathname.startsWith("/app/stepps") && !pathname.startsWith("/app/folder")) {
        navigate({
          to: "/app/stepps",
        });
      }

      setIsMobileSearchOpen(false);
      inputRef.current?.blur();
    }
  };

  // Sync search query with session storage
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    sessionStorage.setItem('searchQuery', newValue);
    if (newValue.trim().length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  // Filter results for preview
  const filteredGuides = guides?.filter(g => g.title?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5) || [];
  const filteredFolders = folders?.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3) || [];
  const hasResults = filteredGuides.length > 0 || filteredFolders.length > 0;

  const handleSelectGuide = (guideId: string) => {
    navigate({ to: "/app/stepps/$guideId", params: { guideId } });
    setOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleSelectFolder = (folderId: string) => {
    navigate({ to: "/app/folder/$folderId", params: { folderId } });
    setOpen(false);
    setIsMobileSearchOpen(false);
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10 relative">
      {isMobileSearchOpen ? (
        <div className="flex w-full items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Search className="size-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search stepps..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearch}
            className="flex-1 border-none bg-transparent focus-visible:ring-0 px-2 h-9"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSearchOpen(false)}
            className="shrink-0"
          >
            <X className="size-5" />
          </Button>
        </div>
      ) : (
        <>
          <SidebarTrigger className="-ml-1" />

          {/* Mobile Centered Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
            <img src="/brand/logo-symbol.svg" alt="Stepps.ai" className="size-8" />
          </div>

          <div className="flex-1" /> {/* Spacer */}

          {/* Search Bar - Show on Dashboard and My Stepps */}
          {shouldShowSearch && (
            <>
              {/* Desktop Search */}
              <div className="relative w-full max-w-[400px] lg:max-w-[480px] hidden md:block">
                <Popover open={open && searchQuery.length > 0} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10" />
                      <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Search stepps..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearch}
                        onFocus={() => {
                          if (searchQuery.length > 0) setOpen(true);
                        }}
                        className="pl-9 pr-3 h-9 bg-muted/40 border border-border/50 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-200 rounded-lg"
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0 w-[400px] lg:w-[480px] border-border/50 shadow-lg"
                    align="start"
                    sideOffset={8}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <Command shouldFilter={false} className="rounded-lg">
                      <CommandList className="max-h-[320px]">
                        {isLoadingGuides || isLoadingFolders ? (
                          <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Loader2 className="size-4 animate-spin" />
                            <span>Searching...</span>
                          </div>
                        ) : !hasResults ? (
                          <CommandEmpty>No results found.</CommandEmpty>
                        ) : (
                          <>
                            {filteredFolders.length > 0 && (
                              <CommandGroup heading="Folders">
                                {filteredFolders.map((folder) => (
                                  <CommandItem
                                    key={folder.id}
                                    onSelect={() => handleSelectFolder(folder.id)}
                                    className="cursor-pointer mx-1 my-0.5 rounded-md px-3 py-2.5 data-[selected=true]:bg-muted/80 hover:bg-muted/60 transition-colors"
                                  >
                                    <FolderIcon className="mr-3 size-4 text-muted-foreground shrink-0" />
                                    <span className="text-sm font-medium truncate">{folder.name}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                            {filteredGuides.length > 0 && (
                              <CommandGroup heading="Stepps">
                                {filteredGuides.map((guide) => (
                                  <CommandItem
                                    key={guide.id}
                                    onSelect={() => handleSelectGuide(guide.id)}
                                    className="cursor-pointer mx-1 my-0.5 rounded-md px-3 py-2.5 data-[selected=true]:bg-muted/80 hover:bg-muted/60 transition-colors"
                                  >
                                    <FileText className="mr-3 size-4 text-muted-foreground shrink-0" />
                                    <span className="text-sm font-medium truncate">{guide.title || "Untitled"}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Mobile Search Trigger */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileSearchOpen(true)}
              >
                <Search className="size-5" />
              </Button>
            </>
          )}
        </>
      )}
    </header>
  );
}

