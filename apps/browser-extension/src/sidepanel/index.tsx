import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import SidePanelApp from "./SidePanelApp.tsx";
import { AuthWrapper } from "../components/AuthWrapper";
import "../styles/globals.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthWrapper>
        <SidePanelApp />
      </AuthWrapper>
    </QueryClientProvider>
  </React.StrictMode>
);