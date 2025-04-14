import { Link } from "react-router";
import { NavLink } from "react-router";
import { UserAuth } from "../context/AuthContext";

const Data = [
  {
    title: "Home",
    path: "/",
  },
  {
    title: "Mis Examenes",
    path: "/examenes",
  },
  {
    title: "Mi perfil",
    path: "/mi-perfil",
  },
  {
    title: "Contacto",
    path: "/contact",
  },
];

export function NavBar() {
  const { user, signOut, signInWithGoogle } = UserAuth();
  return (
    <nav className="gradient-bg text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <i className="fas fa-brain text-2xl mr-2"></i>
              <Link to="/">
                <span className="text-xl font-bold">ExamGen AI</span>
              </Link>
            </div>
          </div>
          {user !== null && (
            <>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {Data.map(({ title, path }) => (
                    <NavLink
                      to={path}
                      className={
                        ({ isActive }) =>
                          `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-white text-indigo-600" : "hover:bg-indigo-700 hover:bg-opacity-75"}`.trim() // Añade la clase activa al final (trim opcional para quitar espacios sobrantes si isActive es false)
                      }
                    >
                      {title}
                    </NavLink>
                  ))}
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center">
                  <div className="profile-container ml-3 relative">
                    <div>
                      <button
                        id="user-menu"
                        className="max-w-xs flex items-center text-sm rounded-full focus:outline-none"
                      >
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user?.user_metadata.picture}
                          alt=""
                        />
                      </button>
                      <div className="profile-dropdown">
                        <a
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                          onClick={signInWithGoogle}
                        >
                          <i className="fas fa-sync-alt mr-2"></i> Cambiar de
                          Sesión
                        </a>
                        <a
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                          onClick={signOut}
                        >
                          <i className="fas fa-sign-out-alt mr-2"></i> Cerrar
                          Sesión
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                <button className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-700 focus:outline-none">
                  <i className="fas fa-bars h-6 w-6"></i>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
