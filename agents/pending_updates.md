# Pending Updates for User Application

The browser extension has been updated to record "Navigate to" steps and capture click coordinates as percentages. The User Application needs to be updated to support these new features.

## 1. Update `apps/user-application/src/components/editor/canvas.tsx`

The `Canvas` component needs to render a visual indicator for the click action based on the `x` and `y` coordinates stored in the step.

**Changes Required:**

1.  Update `CanvasProps` interface to include optional `x` and `y` properties (numbers, representing percentages).
2.  Inside the `Canvas` component, if `x` and `y` are provided:
    *   Calculate the pixel coordinates based on the image dimensions (or stage dimensions).
    *   Render a visual indicator (e.g., a `Circle` or `Arrow` from `react-konva`) at that location.
    *   This indicator should be distinct from user-created annotations (e.g., maybe a pulsing circle or a specific color).
    *   Ensure it scales correctly if the image is resized.

**Example Implementation Logic:**

```typescript
// Inside Canvas component
const clickIndicator = x && y && image ? (
  <Circle
    x={(x / 100) * dimensions.width}
    y={(y / 100) * dimensions.height}
    radius={20}
    stroke="#F43F5E" // Rose-500
    strokeWidth={3}
    fill="rgba(244, 63, 94, 0.2)"
    listening={false} // Should not be interactive
  />
) : null;

// Add {clickIndicator} to the <Layer>
```

## 2. Update `apps/user-application/src/routes/app/_authed/editor/$guideId.tsx`

The editor page needs to handle the new step types and pass the coordinates to the `Canvas`.

**Changes Required:**

1.  **Pass Coordinates**: In the `Canvas` component usage, pass the `x` and `y` properties from the `currentStep`.
    ```tsx
    <Canvas
      // ... existing props
      x={currentStep?.x}
      y={currentStep?.y}
    />
    ```
2.  **Handle Navigation Steps**:
    *   Navigation steps (`type: 'navigate'`) might not have an `imageKey`.
    *   If `currentStep.type === 'navigate'`, the `Canvas` might show a placeholder or the URL instead of a broken image.
    *   Ensure the UI doesn't break if `imageKey` is missing.

## 3. Verify `Step` Type

Ensure the `Step` type imported in these files includes the new fields:
*   `type: 'click' | 'navigate'`
*   `x?: number`
*   `y?: number`
*   `pageUrl: string`

(The Zod schema in `packages/data-ops` has already been updated, so the types should be available if packages are linked correctly).

## 4. Reference Files for Research

To understand how to implement this perfectly, your partner should look at these files:

*   **`apps/browser-extension/src/sidepanel/SidePanelApp.tsx`**:
    *   *Why*: This file already implements the logic for rendering the click indicator using percentage coordinates (`left: ${step.x}%`, `top: ${step.y}%`) and handling "Navigate to" steps. It serves as the perfect reference for the UI logic.
*   **`packages/data-ops/src/zod/steps.ts`**:
    *   *Why*: Defines the exact shape of the `Step` object, including the new `type`, `x`, and `y` fields.
*   **`apps/user-application/src/components/editor/canvas.tsx`**:
    *   *Why*: The file that needs to be modified. Understanding how `react-konva` is currently used for annotations is crucial.
*   **`apps/user-application/src/routes/app/_authed/editor/$guideId.tsx`**:
    *   *Why*: Manages the guide state. Needs to be updated to pass the new data to the Canvas.
