import { useEffect, useRef, useState } from "react"; // Import useState
import { Link } from "react-router"; // Use react-router-dom for web (if applicable) - NavLink is from here too
import { NavLink } from "react-router"; // Use react-router-dom for web
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
];

export function NavBar() {
  const { user, signOut, signInWithGoogle } = UserAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false); // State for desktop profile dropdown

  // Ref for the dropdown container to detect clicks outside
  const dropdownRef = useRef<HTMLDivElement>(null); // Specify type for ref

  // --- Mobile Menu Logic ---
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsDesktopDropdownOpen(false); // Close desktop dropdown if opening mobile
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // --- Desktop Dropdown Logic ---
  const toggleDesktopDropdown = () => {
    setIsDesktopDropdownOpen(!isDesktopDropdownOpen);
    setIsMobileMenuOpen(false); // Close mobile menu if opening desktop dropdown
  };

  const closeDesktopDropdown = () => {
    setIsDesktopDropdownOpen(false);
  };

  // --- Click Outside Logic for Desktop Dropdown ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Use Type assertion for event.target
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDesktopDropdown();
      }
    };

    // Add event listener when the dropdown is open
    if (isDesktopDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener when the component unmounts or dropdown closes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDesktopDropdownOpen]); // Re-run effect when dropdown state changes

  // --- Combined Auth Handlers (close relevant menus) ---
  const handleSignOut = async () => {
    try {
      await signOut();
      closeMobileMenu(); // Close mobile menu
      closeDesktopDropdown(); // Close desktop dropdown
    } catch (error) {
      console.error("Error during sign out:", error);
      // Handle error
      closeMobileMenu();
      closeDesktopDropdown();
    }
  };

  // Assuming signInWithGoogle might change the user or is used for changing sessions
  const handleChangeSession = async () => {
    try {
      await signInWithGoogle(); // Or whatever your signInWithGoogle does
      closeMobileMenu(); // Close mobile menu
      closeDesktopDropdown(); // Close desktop dropdown
    } catch (error) {
      console.error("Error during sign in/change session:", error);
      // Handle error
      closeMobileMenu();
      closeDesktopDropdown();
    }
  };

  return (
    <nav className="gradient-bg text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand Section */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <i className="fas fa-brain text-2xl mr-2"></i>
              <Link
                to="/"
                onClick={() => {
                  closeMobileMenu();
                  closeDesktopDropdown();
                }}
              >
                {" "}
                {/* Close both menus on logo click */}
                <span className="text-xl font-bold">ExamGen AI</span>
              </Link>
            </div>
          </div>

          {/* Desktop Menu & User Info */}
          {user !== null && (
            <>
              {/* Desktop Navigation Links */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {Data.map(({ title, path }) => (
                    <NavLink
                      key={path}
                      to={path}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-white text-indigo-600" : "hover:bg-indigo-700 hover:bg-opacity-75"}`
                      }
                    >
                      {title}
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* Desktop User Profile & Dropdown */}
              <div className="hidden md:block">
                {" "}
                {/* Hide on small screens */}
                <div className="ml-4 flex items-center">
                  <div className="ml-3 relative" ref={dropdownRef}>
                    {" "}
                    {/* Attach ref here */}
                    <div>
                      <button
                        onClick={toggleDesktopDropdown} // Toggle desktop dropdown state
                        type="button"
                        className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                        id="user-menu-button" // Use unique ID
                        aria-expanded={isDesktopDropdownOpen}
                        aria-haspopup="true"
                      >
                        <span className="sr-only">Open user menu</span>{" "}
                        {/* For screen readers */}
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user?.user_metadata.picture}
                          alt="User profile"
                        />
                      </button>
                    </div>
                    {/* Desktop Dropdown Content */}
                    {isDesktopDropdownOpen && ( // Conditionally render based on state
                      <div
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                        role="menu" // ARIA role
                        aria-orientation="vertical"
                        aria-labelledby="user-menu-button" // Link to the button
                      >
                        {/* User Info (Optional) */}
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                          {user?.user_metadata.name || user?.email || "User"}
                        </div>

                        <a
                          href="#" // Use # or a proper route if navigating
                          onClick={(e) => {
                            e.preventDefault();
                            handleChangeSession();
                          }} // Use the handler that closes dropdown
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem" // ARIA role
                        >
                          <i className="fas fa-sync-alt mr-2"></i> Cambiar de
                          Sesión
                        </a>
                        <a
                          href="#" // Use # or a proper route if navigating
                          onClick={(e) => {
                            e.preventDefault();
                            handleSignOut();
                          }} // Use the handler that closes dropdown
                          className="block px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
                          role="menuitem" // ARIA role
                        >
                          <i className="fas fa-sign-out-alt mr-2"></i> Cerrar
                          Sesión
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Mobile Hamburger Button */}
          {user !== null && (
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={toggleMobileMenu} // Toggle mobile menu
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>{" "}
                {/* For screen readers */}
                {isMobileMenuOpen ? (
                  // Close icon (X)
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  // Hamburger icon
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Content */}
      {user !== null &&
        isMobileMenuOpen && ( // Only show if user is logged in AND mobile menu is open
          <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Mobile Navigation Links */}
              {Data.map(({ title, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={closeMobileMenu} // Close mobile menu when a link is clicked
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive ? "bg-white text-indigo-600" : "text-white hover:bg-indigo-700 hover:bg-opacity-75"}`
                  }
                >
                  {title}
                </NavLink>
              ))}

              {/* Mobile User Info & Auth Actions */}
              {user?.user_metadata.picture && ( // Show profile picture if available
                <div className="flex items-center px-3 py-2 space-x-3">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.user_metadata.picture}
                    alt="User profile"
                  />
                  <span className="text-sm font-medium text-white">
                    {user.user_metadata.name || user.email}
                  </span>{" "}
                  {/* Show user name or email */}
                </div>
              )}
              {/* Mobile Auth Actions */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleChangeSession();
                }}
                className="block px-3 py-2 rounded-md text-base font-medium text-red-300 hover:text-white hover:bg-indigo-700"
              >
                <i className="fas fa-sync-alt mr-2"></i> Cambiar de Sesión
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSignOut();
                }}
                className="block px-3 py-2 rounded-md text-base font-medium text-red-300 hover:text-white hover:bg-indigo-700"
              >
                <i className="fas fa-sign-out-alt mr-2"></i> Cerrar Sesión
              </a>
            </div>
          </div>
        )}
    </nav>
  );
}
