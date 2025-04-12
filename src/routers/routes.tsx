import { Route, Routes } from "react-router";
import Home from "../pages/home";
import { Main } from "../pages/Inicio";

export function MyRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<div>Not found</div>} />
      <Route path="/inicio" element={<Main></Main>} />
    </Routes>
  );
}