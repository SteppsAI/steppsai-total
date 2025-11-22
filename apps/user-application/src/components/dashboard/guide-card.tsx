import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Calendar, Edit } from "lucide-react";

interface GuideCardProps {
  guide: {
    id: string;
    title?: string;
    description?: string;
    status?: string;
    updatedAt?: string;
    createdAt?: string;
  };
}

export function GuideCard({ guide }: GuideCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "recording":
        return "bg-red-500 hover:bg-red-600";
      case "processing":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "published":
        return "bg-green-500 hover:bg-green-600";
      case "draft":
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "recording":
        return "Recording";
      case "processing":
        return "Processing";
      case "published":
        return "Published";
      case "draft":
        return "Draft";
      default:
        return "Draft";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative aspect-video bg-muted">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary/20">
                {guide.title?.charAt(0) || "G"}
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <Badge className={getStatusColor(guide.status)}>
              {getStatusText(guide.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {guide.title || "Untitled Guide"}
        </h3>
        {guide.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {guide.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(guide.updatedAt || guide.createdAt)}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button size="sm" className="flex-1" onClick={() => console.log('Edit guide:', guide.id)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
