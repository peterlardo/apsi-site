import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ContentProvider } from "./context/ContentContext";
import { CookieConsentProvider } from "./context/CookieConsentContext";
import "./styles/global.css";
import "./admin/admin.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ContentProvider>
        <CookieConsentProvider>
          <App />
        </CookieConsentProvider>
      </ContentProvider>
    </AuthProvider>
  </StrictMode>
);
