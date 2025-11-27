import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { Canvas } from "@/components/editor/canvas";
import { StepSidebar } from "@/components/editor/step-sidebar";
import { SteppSelectionModal } from "@/components/editor/stepp-selection-modal";
import { useState } from "react";

export const Route = createFileRoute("/app/_authed/editor/")({
    component: EditorIndexPage,
});

function EditorIndexPage() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(true);

    // Dummy handlers for the background UI
    const noop = () => { };

    const handleModalOpenChange = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            // If modal is closed without selection, redirect back to stepps
            navigate({ to: "/app/stepps" });
        }
    };

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden bg-background relative">
            {/* Background Editor UI (Blurred or just present) */}
            <div className="absolute inset-0 flex flex-col pointer-events-none opacity-50 filter blur-[2px]">
                <EditorHeader
                    title="Select a Stepp..."
                    status="saved"
                    onTitleChange={noop}
                />

                <div className="flex-1 flex overflow-hidden relative">
                    <EditorToolbar
                        activeTool="pointer"
                        onToolChange={noop}
                    />

                    <Canvas
                        screenshotUrl={undefined}
                        overlays={[]}
                        activeTool="pointer"
                        onAnnotationsChange={noop}
                    />

                    <StepSidebar
                        steps={[]}
                        activeStepId=""
                        onStepSelect={noop}
                        onUpdateStep={noop}
                        onDeleteStep={noop}
                        onReorderSteps={noop}
                    />
                </div>
            </div>

            {/* Selection Modal */}
            <SteppSelectionModal
                open={isModalOpen}
                onOpenChange={handleModalOpenChange}
            />
        </div>
    );
}
