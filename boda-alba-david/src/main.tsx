import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { appQueryClient } from "./shared/query-client";
import { GlobalStyle } from "./shared/global-style";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={appQueryClient}>
      <GlobalStyle />
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
