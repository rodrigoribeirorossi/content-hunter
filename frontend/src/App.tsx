import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ScriptStudio from "./pages/ScriptStudio";
import SavedContent from "./pages/SavedContent";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/studio" element={<ScriptStudio />} />
        <Route path="/saved" element={<SavedContent />} />
      </Routes>
    </Layout>
  );
}
