import "./App.css";
import { NavBar } from "./components/Navbar";
import { MyRoutes } from "./routers/routes";
import { Footer } from "./components/Footer";

function App() {
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

export default App;
