import { Route, Routes, useParams } from "react-router";
import { Suspense, lazy } from "react";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { PublicRoute } from "../components/PublicRoute";

// Lazy loading de componentes
const Home = lazy(() => import("../pages/home"));
const Main = lazy(() => import("../pages/Inicio").then(module => ({ default: module.Main })));
const Examenes = lazy(() => import("../pages/Examenes").then(module => ({ default: module.Examenes })));
const NotFound = lazy(() => import("../pages/NotFound").then(module => ({ default: module.NotFound })));
const Login = lazy(() => import("../pages/Login").then(module => ({ default: module.Login })));
const Contacto = lazy(() => import("../pages/Contacto").then(module => ({ default: module.Contacto })));
const SignUp = lazy(() => import("../pages/SignUp").then(module => ({ default: module.SignUp })));
const ResetPassword = lazy(() => import("../pages/ResetPassword").then(module => ({ default: module.ResetPassword })));
const UpdatePassword = lazy(() => import("../pages/updatePassword").then(module => ({ default: module.UpdatePassword })));
const Perfil = lazy(() => import("../pages/Perfil").then(module => ({ default: module.Perfil })));
const ExamContainer = lazy(() => import("../components/exam/ExamContainer").then(module => ({ default: module.ExamContainer })));
// const FeedbackHub = lazy(() => import("../pages/FeedbackHub").then(module => ({ default: module.FeedbackHub })));

// Componente de loading
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando página...</p>
    </div>
  </div>
);

function ExamContainerWrapper() {
  const { examId } = useParams();
  // Renderiza ExamContainer pasándole examId como key
  // Esto le dice a React: si examId cambia, trata esto como
  // un componente COMPLETAMENTE NUEVO.
  return <ExamContainer key={examId} />;
}

export function MyRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Rutas públicas - redirigen a /inicio si ya está autenticado */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/contact" element={<Contacto />} />
        {/* <Route path="/feedback" element={<FeedbackHub />} /> */}
        
        {/* Rutas protegidas - requieren autenticación */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/inicio" element={<ProtectedRoute><Main /></ProtectedRoute>} />
        <Route path="/examen/:examId" element={<ProtectedRoute><ExamContainerWrapper /></ProtectedRoute>} />
        <Route path="/examenes" element={<ProtectedRoute><Examenes /></ProtectedRoute>} />
        <Route path="/mi-perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        
        
        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
