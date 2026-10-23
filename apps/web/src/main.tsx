import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BoardEditor } from "./board/Editor";
import { Dashboard } from "./board/Dashboard";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/board/:id" element={<BoardEditor />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>
);

const el = document.getElementById("root");
if (el) createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>
);