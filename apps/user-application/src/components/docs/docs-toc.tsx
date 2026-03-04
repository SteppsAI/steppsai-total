import { cn } from "@/lib/utils";

export interface DocsTocItem {
  id: string;
  label: string;
  level?: number;
}

interface DocsTocProps {
  items: DocsTocItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function DocsToc({ items, activeId, onSelect, className }: DocsTocProps) {
  return (
    <nav className={cn("space-y-1", className)}>
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item.id)}
            className={cn(
              "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
              item.level === 2 ? "pl-6 text-muted-foreground" : "font-medium",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
