import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
const el = document.getElementById("root");
if (el) createRoot(el).render(<StrictMode><div>shiro</div></StrictMode>);
