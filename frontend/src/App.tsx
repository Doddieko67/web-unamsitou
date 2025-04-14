import "./App.css";
import { NavBar } from "./components/Navbar";
import { MyRoutes } from "./routers/routes";
import { Footer } from "./components/Footer";
import { AuthContextProvider } from "./context/AuthContext";
import { handleGenerate } from "./API/Gemini";

function App() {
  console.log(handleGenerate("Holaaa"));
  return (
    <AuthContextProvider>
      <NavBar />
      <div className="my-5">
        <MyRoutes />
      </div>
      <Footer />
    </AuthContextProvider>
  );
}

export default App;
