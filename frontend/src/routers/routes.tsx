import { Route, Routes } from "react-router";
import Home from "../pages/home";
import { Main } from "../pages/Inicio";
import { Examenes } from "../pages/Examenes";
import { NotFound } from "../pages/NotFound";
import { Login } from "../pages/Login";
import { Contacto } from "../pages/Contacto";
import { SignUp } from "../pages/SignUp";
import { ResetPassword } from "../pages/ResetPassword";
import { UpdatePassword } from "../pages/updatePassword";
import { Perfil } from "../pages/Perfil";
import { ExamenPage } from "../Examen/ExamenPage";

export function MyRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound></NotFound>} />
      <Route path="/inicio" element={<Main></Main>} />
      <Route path="/examen" element={<ExamenPage />} />
      <Route path="/examenes" element={<Examenes />} />
      <Route path="/mi-perfil" element={<Perfil />}></Route>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/signup" element={<SignUp />}></Route>
      <Route path="/contact" element={<Contacto />}></Route>
      <Route path="/reset-password" element={<ResetPassword />}></Route>
      <Route path="/update-password" element={<UpdatePassword />}></Route>
    </Routes>
  );
}
