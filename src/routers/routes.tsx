import { Route, Routes } from "react-router";
import Home from "../pages/home";
import { Main } from "../pages/Inicio";
import { Settings } from "../pages/Settings";
import { History } from "../pages/History";

export function MyRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<div>Not found</div>} />
      <Route path="/inicio" element={<Main></Main>} />
      <Route path="/configuracion" element={<Settings />} />
      <Route path="/historial" element={<History />} />
    </Routes>
  );
}
