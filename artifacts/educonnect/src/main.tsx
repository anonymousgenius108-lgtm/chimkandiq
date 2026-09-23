import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setRoleGetter } from "@workspace/api-client-react";
import { getStoredRole } from "@/lib/auth";

// Inject role header into every API call for backend RBAC enforcement
setRoleGetter(getStoredRole);

createRoot(document.getElementById("root")!).render(<App />);
