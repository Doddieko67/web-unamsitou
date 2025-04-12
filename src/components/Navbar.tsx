import { Link } from "react-router";
import { NavLink } from "react-router";

const Data = [
  {
    title: "Home",
    path: "/",
  },
  {
    title: "Mis Examenes",
    path: "/login",
  },
  {
    title: "Contacto",
    path: "/contact",
  },
  {
    title: "Configuracion",
    path: "/settings",
  },
];

export function NavBar() {
  return (
    <nav className="gradient-bg text-white shadow-lg flex flex-row">
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
            <div className="ml-4 flex items-center md:ml-6">
              <button className="p-1 rounded-full text-indigo-200 hover:text-white focus:outline-none">
                <i className="fas fa-bell h-6 w-6"></i>
              </button>
              <div className="ml-3 relative">
                <div>
                  <button
                    id="user-menu"
                    className="max-w-xs flex items-center text-sm rounded-full focus:outline-none"
                  >
                    <img
                      className="h-8 w-8 rounded-full"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-700 focus:outline-none">
              <i className="fas fa-bars h-6 w-6"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
