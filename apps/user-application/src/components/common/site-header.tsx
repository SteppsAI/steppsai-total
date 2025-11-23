import { Unlock, Search, User, Settings } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-4 w-full bg-transparent gap-4">
      {/* Left: Sidebar Trigger & Unlock Pro */}
      <div className="flex items-center gap-3 shrink-0">
        <SidebarTrigger className="md:hidden text-slate-500 hover:text-indigo-600" />

        <div className="flex items-center gap-2 bg-cyan-500 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:bg-cyan-600 transition-colors cursor-pointer">
          <Unlock className="size-4" />
          <span className="hidden sm:inline">Unlock Pro</span>
        </div>
      </div>

      {/* Middle: Search Bar */}
      <div className="flex-1 max-w-xl mx-auto relative">
        {/* Desktop Search */}
        <div className="relative w-full group hidden md:block">
          <input
            type="text"
            placeholder="Search Stepps..."
            className="w-full px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 placeholder:text-slate-400 shadow-sm transition-all group-hover:border-slate-300"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 group-hover:text-slate-500 transition-colors" />
        </div>

        {/* Mobile Search Icon (Right aligned in this section if needed, or just hidden) */}
        {/* We can actually just show the full input on mobile if we want, or a button. 
            Let's keep the button for now to save space on very small screens. */}
      </div>

      {/* Mobile Search Trigger (Visible only on small screens) */}
      <button className="md:hidden text-slate-500 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-full ml-auto">
        <Search className="size-5" />
      </button>

      {/* Right: Icons */}
      <div className="flex items-center gap-2 shrink-0">
        <button className="text-slate-500 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-full">
          <User className="size-5" />
        </button>
        <button className="text-slate-500 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-full">
          <Settings className="size-5" />
        </button>
      </div>
    </header>
  );
}
