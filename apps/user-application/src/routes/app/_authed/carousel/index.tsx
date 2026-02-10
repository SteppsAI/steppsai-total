import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CarouselCreationModal } from "@/components/carousel/carousel-creation-modal";
import { useState } from "react";

export const Route = createFileRoute("/app/_authed/carousel/")({
  component: CarouselIndexPage,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(context.trpc.guides.getAll.queryOptions()),
      context.queryClient.prefetchQuery(context.trpc.folders.getAll.queryOptions()),
    ]);
  },
});

function CarouselIndexPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      navigate({ to: "/app" });
    }
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">Carousel Creator</p>
          <p className="text-sm">Select a source to get started</p>
        </div>
      </div>

      <CarouselCreationModal open={isModalOpen} onOpenChange={handleModalOpenChange} />
    </div>
  );
}
