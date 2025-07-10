import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { useAuthStore } from "../stores/authStore";
import { ThemeToggle } from "./ThemeToggle";

const Data = [
  {
    title: "Home",
    path: "/",
    icon: "fas fa-home"
  },
  {
    title: "Mis Examenes",
    path: "/examenes",
    icon: "fas fa-clipboard-list"
  },
];

export function FloatingNavbar() {
  const { user, signOut } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ left: 80, bottom: 80 }); // left as %, bottom as px - más arriba y bien a la derecha
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contactDropdownRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();


  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (contactDropdownRef.current && !contactDropdownRef.current.contains(event.target as Node)) {
        setIsContactDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isContactDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isContactDropdownOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Error during sign out:", error);
      setIsDropdownOpen(false);
    }
  };

  const handleChangeSession = () => {
    try {
      signOut();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Error during sign out:", error);
      setIsDropdownOpen(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleContactDropdown = () => {
    setIsContactDropdownOpen(!isContactDropdownOpen);
  };

  // Calculate dropdown position based on navbar position
  const getDropdownPosition = () => {
    const windowHeight = window.innerHeight;
    const isInUpperHalf = position.bottom > windowHeight / 2;
    
    return {
      showBelow: isInUpperHalf, // Show below if navbar is in upper half
      showAbove: !isInUpperHalf // Show above if navbar is in lower half
    };
  };

  // Drag and drop functionality
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialLeft = position.left;
    const initialBottom = position.bottom;
    
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = startY - e.clientY; // Inverted for bottom positioning
      
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const navbar = navbarRef.current;
      if (!navbar) return;
      
      const navbarWidth = navbar.offsetWidth;
      
      // Calculate new position with 20px margins
      const margin = 20;
      const newLeftPercent = initialLeft + (deltaX / windowWidth) * 100;
      const newBottom = initialBottom + deltaY;
      
      // Constrain to screen bounds with margins
      // Since navbar uses translateX(-50%), we need to account for half the width
      const halfWidthPercent = (navbarWidth / 2) / windowWidth * 100;
      const marginPercent = (margin / windowWidth) * 100;
      
      const minLeftPercent = halfWidthPercent + marginPercent; // Minimum to prevent overflow left
      const maxLeftPercent = 100 - halfWidthPercent - marginPercent; // Maximum to prevent overflow right
      
      const constrainedLeft = Math.max(minLeftPercent, Math.min(maxLeftPercent, newLeftPercent));
      // For bottom positioning: margin from bottom, but max should leave margin from top
      const navbarHeight = navbar.offsetHeight || 60; // fallback height
      const maxBottom = windowHeight - margin - navbarHeight; // leave margin from top
      const constrainedBottom = Math.max(margin, Math.min(maxBottom, newBottom));
      
      setPosition({ left: constrainedLeft, bottom: constrainedBottom });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Save position to localStorage
      localStorage.setItem('floatingNavbarPosition', JSON.stringify(position));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Reset position if stuck
  const handleDoubleClick = () => {
    const defaultPosition = { left: 80, bottom: 80 };
    setPosition(defaultPosition);
    localStorage.setItem('floatingNavbarPosition', JSON.stringify(defaultPosition));
  };

  // Load saved position on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('floatingNavbarPosition');
    if (savedPosition) {
      try {
        const parsedPosition = JSON.parse(savedPosition);
        
        // Validar que la posición guardada no esté muy a la izquierda (problema de atascamiento)
        if (parsedPosition.left < 15) {
          console.log('Posición guardada muy a la izquierda, usando posición por defecto');
          const defaultPosition = { left: 80, bottom: 80 };
          setPosition(defaultPosition);
          localStorage.setItem('floatingNavbarPosition', JSON.stringify(defaultPosition));
        } else {
          setPosition(parsedPosition);
        }
      } catch (error) {
        console.error('Error loading navbar position:', error);
        // If error loading, use default position
        const defaultPosition = { left: 80, bottom: 80 };
        setPosition(defaultPosition);
        localStorage.setItem('floatingNavbarPosition', JSON.stringify(defaultPosition));
      }
    }
    // If no saved position, it will use the default from useState
  }, []);

  return (
    <nav 
      ref={navbarRef}
      className={`floating-navbar visible ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.left}%`,
        bottom: `${position.bottom}px`,
        transform: `translateX(-50%)`,
      }}
    >
      <div className="floating-navbar-container">
        {/* Drag Handle */}
        <div 
          className="floating-navbar-drag-handle"
          title="Arrastra para mover (doble-click para resetear posición)"
          onMouseDown={handleDragStart}
          onDoubleClick={handleDoubleClick}
        >
          <i className="fas fa-grip-vertical"></i>
        </div>
        
        {/* Brand/Logo */}
        <Link 
          to={user ? "/" : "/login"} 
          className="floating-navbar-brand"
          onClick={() => setIsDropdownOpen(false)}
        >
          <i className="fas fa-brain"></i>
          <span>VikDev</span>
        </Link>

        {user && (
          <>
            {/* Divider */}
            <div className="floating-navbar-divider"></div>

            {/* Navigation Links */}
            <div className="floating-navbar-links">
              {Data.map(({ title, path, icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) => 
                    `floating-navbar-link ${isActive ? 'active' : ''}`
                  }
                  title={title}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <i className={icon}></i>
                </NavLink>
              ))}
            </div>

            {/* Divider */}
            <div className="floating-navbar-divider"></div>
          </>
        )}

        {/* Theme Toggle */}
        <div className="floating-navbar-theme-toggle">
          <ThemeToggle variant="icon" size="sm" />
        </div>

        {/* Contact */}
        <div className="floating-navbar-contact" ref={contactDropdownRef}>
          <button
            className="floating-navbar-contact-button"
            onClick={toggleContactDropdown}
            title="Contacto"
          >
            <i className="fas fa-address-book"></i>
          </button>
          
          {/* Contact Dropdown */}
          <div className={`floating-navbar-contact-dropdown ${isContactDropdownOpen ? 'open' : ''} ${getDropdownPosition().showBelow ? 'show-below' : 'show-above'}`}>
            <div className="floating-navbar-contact-header">
              <i className="fas fa-brain text-lg"></i>
              <span>VikDev</span>
            </div>
            
            <p className="floating-navbar-contact-description">
              La plataforma inteligente para crear exámenes personalizados con ayuda de IA.
            </p>
            
            <div className="floating-navbar-contact-info">
              <div className="floating-navbar-contact-person">
                <h4 className="floating-navbar-contact-person-name">Victor Gabriel Rivero Flores</h4>
                <div className="floating-navbar-contact-person-links">
                  <a
                    href="https://github.com/Vikktorrf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="floating-navbar-contact-item"
                  >
                    <i className="fab fa-github"></i>
                    <span>Vikktorrf</span>
                  </a>
                </div>
              </div>
              
              <div className="floating-navbar-contact-person">
                <h4 className="floating-navbar-contact-person-name">Hector Fidel Hernandez Tellez</h4>
                <div className="floating-navbar-contact-person-links">
                  <a
                    href="https://github.com/Doddieko67"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="floating-navbar-contact-item"
                  >
                    <i className="fab fa-github"></i>
                    <span>Doddieko67</span>
                  </a>
                  <a
                    href="mailto:hern04045@gmail.com"
                    className="floating-navbar-contact-item"
                  >
                    <i className="fas fa-envelope"></i>
                    <span>hern04045@gmail.com</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/hernandez-tellez-hector-fidel-a710b72a8/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="floating-navbar-contact-item"
                  >
                    <i className="fab fa-linkedin"></i>
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="floating-navbar-contact-footer">
              © 2025 VikDev
            </div>
          </div>
        </div>

        {user && (
          /* User Profile */
          <div className="floating-navbar-profile" ref={dropdownRef}>
            <img
              className="floating-navbar-avatar"
              src={user?.user_metadata?.picture || '/default-avatar.svg'}
              alt="User profile"
              onClick={toggleDropdown}
              title={user?.user_metadata?.name || user?.email || "Usuario"}
            />
            
            {/* Dropdown Menu */}
            <div className={`floating-navbar-dropdown ${isDropdownOpen ? 'open' : ''} ${getDropdownPosition().showBelow ? 'show-below' : 'show-above'}`}>
              {/* User Info */}
              <div className="floating-navbar-user-info">
                {user?.user_metadata?.name || user?.email || "Usuario"}
              </div>
              
              {/* Menu Items */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleChangeSession();
                }}
                className="floating-navbar-dropdown-item"
              >
                <i className="fas fa-sync-alt"></i>
                Cambiar de Sesión
              </a>
              
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSignOut();
                }}
                className="floating-navbar-dropdown-item danger"
              >
                <i className="fas fa-sign-out-alt"></i>
                Cerrar Sesión
              </a>
            </div>
          </div>
        )}

        {/* Right Drag Handle - Next to Profile */}
        {user && (
          <div 
            className="floating-navbar-drag-handle floating-navbar-drag-handle-right"
            title="Arrastra para mover (doble-click para resetear posición)"
            onMouseDown={handleDragStart}
            onDoubleClick={handleDoubleClick}
          >
            <i className="fas fa-grip-vertical"></i>
          </div>
        )}
      </div>
    </nav>
  );
}