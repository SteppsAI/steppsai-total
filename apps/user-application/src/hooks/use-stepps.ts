import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Guide } from "@/types/db";
import { TEST_GUIDES } from "@/types/test-data";
import { Annotation } from "@/components/editor/annotation-types";

// Mock steps for detailed view
const MOCK_STEPS = [
  {
    id: "step-1",
    title: "Click on 'Create New'",
    orderIndex: 0,
    screenshotUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop",
    finalCaption: "Start by clicking the 'Create New' button in the top right corner.",
    overlays: []
  },
  {
    id: "step-2",
    title: "Select Project Type",
    orderIndex: 1,
    screenshotUrl: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1974&auto=format&fit=crop",
    finalCaption: "Choose 'Web Application' from the dropdown menu.",
    overlays: []
  },
  {
    id: "step-3",
    title: "Configure Settings",
    orderIndex: 2,
    screenshotUrl: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=1974&auto=format&fit=crop",
    finalCaption: "Fill in the project details and click 'Next'.",
    overlays: []
  }
];

// Mock API calls
const fetchStepps = async (): Promise<Guide[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return TEST_GUIDES as unknown as Guide[];
};

const fetchStepp = async (id: string): Promise<Guide & { steps: any[] }> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const guide = TEST_GUIDES.find((g) => g.id === id);
  if (!guide) throw new Error("Stepp not found");
  
  // Return guide with mock steps
  return {
    ...guide,
    steps: MOCK_STEPS
  } as unknown as Guide & { steps: any[] };
};

const createStepp = async (data: Partial<Guide>): Promise<Guide> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    id: Math.random().toString(36).substring(7),
    title: data.title || "Untitled Stepp",
    description: data.description || "",
    status: "draft",
    visibility: "private",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...data,
  } as Guide;
};

const updateStepp = async ({ id, ...data }: { id: string } & Partial<Guide>): Promise<Guide> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    id,
    ...data,
    updated_at: new Date().toISOString(),
  } as Guide;
};

const deleteStepp = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  // void
};

// Hooks
export function useStepps() {
  return useQuery({
    queryKey: ["stepps"],
    queryFn: fetchStepps,
  });
}

export function useStepp(id: string) {
  return useQuery({
    queryKey: ["stepps", id],
    queryFn: () => fetchStepp(id),
    enabled: !!id,
  });
}

export function useCreateStepp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStepp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stepps"] });
    },
  });
}

export function useUpdateStepp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStepp,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stepps"] });
      queryClient.invalidateQueries({ queryKey: ["stepps", data.id] });
    },
  });
}

export function useDeleteStepp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStepp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stepps"] });
    },
  });
}
