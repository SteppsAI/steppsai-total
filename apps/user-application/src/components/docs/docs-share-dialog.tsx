import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, ExternalLink, Link as LinkIcon, Shield, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface DocsShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guideTitle: string;
  guideId: string;
  isPublished: boolean;
}

export function DocsShareDialog({
  open,
  onOpenChange,
  guideTitle,
  guideId,
  isPublished,
}: DocsShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return `/shared/docs/${guideId}`;
    }

    return `${window.location.origin}/shared/docs/${guideId}`;
  }, [guideId]);

  async function handleCopy() {
    if (!isPublished) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Docs link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy docs link");
    }
  }

  function handleOpenPublicDocs() {
    if (!isPublished || typeof window === "undefined") return;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share docs for "{guideTitle}"</DialogTitle>
          <DialogDescription>
            {isPublished
              ? "Share this documentation page with anyone who has the link."
              : "Publish the docs first to make the documentation page public."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-4">
          {!isPublished ? (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <Shield className="size-4 text-amber-600" />
              <span className="text-sm text-amber-800">
                These docs are still private. Publish first to unlock the shareable docs link.
              </span>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Docs Link</Label>
              {isPublished ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                  <ShieldCheck className="size-3" />
                  Published
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  readOnly
                  value={shareUrl}
                  className={isPublished ? "bg-muted/50 pl-9" : "bg-muted/30 pl-9"}
                  placeholder={isPublished ? shareUrl : "Publish docs to get a shareable link"}
                />
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
                disabled={!isPublished}
                title={isPublished ? "Copy docs link" : "Publish docs first"}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>

          <Button variant="outline" onClick={handleOpenPublicDocs} disabled={!isPublished}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open public docs
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
