import { useState, memo, useMemo, useCallback } from "react";
import { ExamConf } from "./ExamConf";
import { ExamQuestions } from "../ExamQuestions";
import { ExamBasedOnHistory } from "../ExamBasedOnHistory";

export const OpcionExam = memo(function OpcionExam() {
  // 1. Estado para guardar el ID de la pestaña activa
  //    Inicializamos con el ID de la pestaña que quieres activa por defecto.
  const [activeTab, setActiveTab] = useState("new-exam-tab"); // 'new-exam-tab' es el ID inicial

  // 2. Función para manejar el clic en una pestaña (memoizada para evitar re-renders)
  const handleTabClick = useCallback((tabId: string): void => {
    setActiveTab(tabId);
  }, []);

  // (Opcional pero recomendado) Definir las pestañas como datos (memoizadas)
  const tabs = useMemo(() => [
    {
      id: "new-exam-tab",
      label: "Nuevo Examen",
      icon: "fas fa-plus-circle",
      content: <ExamConf />,
    },
    {
      id: "upload-exam-tab",
      label: "Subir Examen",
      icon: "fas fa-file-upload",
      content: <ExamQuestions />,
    },
    {
      id: "history-exam-tab",
      label: "Basado en Historial",
      icon: "fas fa-history",
      content: <ExamBasedOnHistory />,
    },
  ], []);

  // Estilos de tabs usando CSS variables (memoizados)
  const getTabStyles = useCallback((isActive: boolean) => {
    const baseStyles = {
      whiteSpace: 'nowrap' as const,
      padding: '1rem 0.25rem',
      borderBottom: '2px solid',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    };

    if (isActive) {
      return {
        ...baseStyles,
        borderBottomColor: 'var(--primary)',
        color: 'var(--primary)'
      };
    } else {
      return {
        ...baseStyles,
        borderBottomColor: 'transparent',
        color: 'var(--theme-text-secondary)'
      };
    }
  }, []);

  const getTabHoverStyles = useCallback(() => ({
    color: 'var(--primary)',
    borderBottomColor: 'var(--theme-border-secondary)'
  }), []);

  return (
    <div>
      {/* Contenedor principal */}
      <div 
        className="mb-4 sm:mb-8 border-b transition-colors duration-300"
        style={{ borderBottomColor: 'var(--theme-border-primary)' }}
      >
        <nav
          className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={getTabStyles(activeTab === tab.id)}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  Object.assign(e.currentTarget.style, getTabHoverStyles());
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  Object.assign(e.currentTarget.style, getTabStyles(false));
                }
              }}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
            >
              {tab.icon && (
                <i 
                  className={`${tab.icon} mr-2 transition-colors duration-300`}
                  style={{ 
                    color: activeTab === tab.id 
                      ? 'var(--primary)' 
                      : 'var(--theme-text-secondary)' 
                  }}
                ></i>
              )}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      {/* 6. Mostrar el contenido de la pestaña activa */}
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={`${tab.id}-panel`}
            id={`${tab.id}-panel`}
            role="tabpanel"
            aria-labelledby={tab.id}
            // Mostrar solo si la pestaña está activa
            hidden={activeTab !== tab.id}
          >
            {/* Renderiza el componente de contenido asociado */}
            {activeTab === tab.id && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
});
