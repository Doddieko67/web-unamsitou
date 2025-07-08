import "./App.css";
import { NavBar } from "./components/Navbar";
import { MyRoutes } from "./routers/routes";
import { Footer } from "./components/Footer";
import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { useAuthInit } from "./hooks/useAuthInit";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Componente interno que usa los hooks
function AppContent() {
  const { loading, error } = useAuthInit();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-red-800 font-semibold mb-2">Error de inicialización</h2>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="my-5">
        <MyRoutes />
      </div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <AppContent />
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
