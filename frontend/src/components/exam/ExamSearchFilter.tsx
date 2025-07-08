import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Question {
  id?: number;
  pregunta: string;
  opciones?: string[];
  correcta?: number;
  respuesta?: number;
}

interface ExamSearchFilterProps {
  questions: Question[];
  userAnswers: { [key: number]: number };
  onQuestionSelect: (index: number) => void;
  currentQuestionIndex: number;
  isSubmitted: boolean;
}

type FilterCategory = 'todas' | 'contestadas' | 'sin_contestar' | 'correctas' | 'incorrectas';

interface FilterOption {
  value: FilterCategory;
  label: string;
  icon: string;
  color: string;
}

const filterOptions: FilterOption[] = [
  { value: 'todas', label: 'Todas', icon: 'fa-list', color: 'var(--theme-text-secondary)' },
  { value: 'contestadas', label: 'Contestadas', icon: 'fa-check', color: 'var(--primary)' },
  { value: 'sin_contestar', label: 'Sin contestar', icon: 'fa-question', color: 'var(--theme-warning)' },
  { value: 'correctas', label: 'Correctas', icon: 'fa-check-circle', color: 'var(--secondary)' },
  { value: 'incorrectas', label: 'Incorrectas', icon: 'fa-times-circle', color: 'var(--theme-error)' },
];

/**
 * Search and filter component for exam questions
 * Provides real-time search and category filtering
 */
export const ExamSearchFilter: React.FC<ExamSearchFilterProps> = ({
  questions,
  userAnswers,
  onQuestionSelect,
  currentQuestionIndex,
  isSubmitted,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('todas');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter questions based on search term and selected filter
  const filteredQuestions = useMemo(() => {
    let filtered = questions;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((question, index) =>
        question.pregunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.opciones?.some(option => 
          option.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        (index + 1).toString().includes(searchTerm.trim())
      );
    }

    // Apply category filter
    if (selectedFilter !== 'todas') {
      filtered = filtered.filter((question, index) => {
        const isAnswered = userAnswers[index] !== undefined;
        const isCorrect = isAnswered && question.correcta !== undefined && 
                         userAnswers[index] === question.correcta;

        switch (selectedFilter) {
          case 'contestadas':
            return isAnswered;
          case 'sin_contestar':
            return !isAnswered;
          case 'correctas':
            return isSubmitted && isCorrect;
          case 'incorrectas':
            return isSubmitted && isAnswered && !isCorrect;
          default:
            return true;
        }
      });
    }

    return filtered.map((question) => ({
      question,
      originalIndex: questions.findIndex(q => q === question),
    }));
  }, [questions, searchTerm, selectedFilter, userAnswers, isSubmitted]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedFilter('todas');
  };

  const selectedFilterOption = filterOptions.find(option => option.value === selectedFilter)!;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i 
            className="fas fa-search transition-colors duration-300" 
            style={{ color: 'var(--theme-text-tertiary)' }}
          ></i>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar preguntas..."
          className="block w-full pl-10 pr-3 py-2 border rounded-lg leading-5 text-sm transition-all duration-300 focus:outline-none focus:ring-1"
          style={{
            backgroundColor: 'var(--theme-bg-primary)',
            borderColor: 'var(--theme-border-primary)',
            color: 'var(--theme-text-primary)',
            '--tw-ring-color': 'var(--primary)',
            '--tw-ring-opacity': '0.5'
          } as React.CSSProperties}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200"
            style={{ color: 'var(--theme-text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--theme-text-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--theme-text-tertiary)';
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {/* Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300"
          style={{
            backgroundColor: 'var(--theme-bg-primary)',
            borderColor: 'var(--theme-border-primary)',
            '--tw-ring-color': 'var(--primary)',
            '--tw-ring-opacity': '0.5'
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--theme-bg-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--theme-bg-primary)';
          }}
        >
          <div className="flex items-center space-x-2">
            <i 
              className={`fas ${selectedFilterOption.icon} transition-colors duration-300`}
              style={{ color: selectedFilterOption.color }}
            ></i>
            <span 
              className="transition-colors duration-300"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              {selectedFilterOption.label}
            </span>
          </div>
          <i 
            className={`fas fa-chevron-down transition-all duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
            style={{ color: 'var(--theme-text-secondary)' }}
          ></i>
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-10 w-full mt-1 border rounded-lg shadow-lg transition-colors duration-300"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)',
                boxShadow: 'var(--theme-shadow-lg)'
              }}
            >
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedFilter(option.value);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-left transition-all duration-200"
                  style={{
                    backgroundColor: selectedFilter === option.value 
                      ? 'var(--theme-info-light)' 
                      : 'transparent',
                    color: 'var(--theme-text-primary)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedFilter !== option.value) {
                      e.currentTarget.style.backgroundColor = 'var(--theme-bg-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = selectedFilter === option.value 
                      ? 'var(--theme-info-light)' 
                      : 'transparent';
                  }}
                  disabled={
                    !isSubmitted && (option.value === 'correctas' || option.value === 'incorrectas')
                  }
                >
                  <i 
                    className={`fas ${option.icon} transition-colors duration-300`}
                    style={{ color: option.color }}
                  ></i>
                  <span className="transition-colors duration-300">{option.label}</span>
                  {selectedFilter === option.value && (
                    <i 
                      className="fas fa-check ml-auto transition-colors duration-300"
                      style={{ color: 'var(--primary)' }}
                    ></i>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Counter */}
      <div 
        className="flex items-center justify-between text-sm transition-colors duration-300"
        style={{ color: 'var(--theme-text-secondary)' }}
      >
        <span>
          {filteredQuestions.length} de {questions.length} preguntas
        </span>
        {(searchTerm || selectedFilter !== 'todas') && (
          <button
            onClick={handleReset}
            className="font-medium transition-colors duration-200"
            style={{ color: 'var(--primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--primary-dark)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--primary)';
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Filtered Question List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map(({ question, originalIndex }) => {
            const isAnswered = userAnswers[originalIndex] !== undefined;
            const isCorrect = isAnswered && question.correcta !== undefined && 
                             userAnswers[originalIndex] === question.correcta;
            const isCurrent = originalIndex === currentQuestionIndex;

            const getQuestionCardStyles = () => {
              const baseStyles = {
                width: '100%',
                padding: '0.75rem',
                textAlign: 'left' as const,
                borderRadius: '0.5rem',
                border: '2px solid',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              };

              if (isCurrent) {
                return {
                  ...baseStyles,
                  borderColor: 'var(--primary)',
                  backgroundColor: 'var(--theme-info-light)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 4px rgba(99, 102, 241, 0.1)'
                };
              }
              
              if (isAnswered) {
                if (isSubmitted) {
                  if (isCorrect) {
                    return {
                      ...baseStyles,
                      borderColor: 'var(--secondary)',
                      backgroundColor: 'var(--theme-success-light)'
                    };
                  } else {
                    return {
                      ...baseStyles,
                      borderColor: 'var(--theme-error)',
                      backgroundColor: 'var(--theme-error-light)'
                    };
                  }
                } else {
                  return {
                    ...baseStyles,
                    borderColor: 'var(--primary)',
                    backgroundColor: 'var(--theme-info-light)'
                  };
                }
              } else {
                return {
                  ...baseStyles,
                  borderColor: 'var(--theme-border-primary)',
                  backgroundColor: 'var(--theme-bg-secondary)'
                };
              }
            };

            const getHoverStyles = () => {
              if (isCurrent) return {};
              
              if (isAnswered) {
                if (isSubmitted) {
                  if (isCorrect) {
                    return { borderColor: 'var(--secondary)' };
                  } else {
                    return { borderColor: 'var(--theme-error)' };
                  }
                } else {
                  return { borderColor: 'var(--primary)' };
                }
              } else {
                return { borderColor: 'var(--theme-border-secondary)' };
              }
            };

            return (
              <button
                key={originalIndex}
                onClick={() => onQuestionSelect(originalIndex)}
                className="transition-all duration-200 hover:scale-102 hover:shadow-sm"
                style={getQuestionCardStyles()}
                onMouseEnter={(e) => {
                  const hoverStyles = getHoverStyles();
                  Object.assign(e.currentTarget.style, hoverStyles);
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, getQuestionCardStyles());
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span 
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors duration-300"
                      style={(() => {
                        if (isCurrent) {
                          return {
                            backgroundColor: 'var(--primary)',
                            color: 'white'
                          };
                        }
                        if (isAnswered) {
                          if (isSubmitted) {
                            if (isCorrect) {
                              return {
                                backgroundColor: 'var(--theme-success-light)',
                                color: 'var(--secondary)'
                              };
                            } else {
                              return {
                                backgroundColor: 'var(--theme-error-light)',
                                color: 'var(--theme-error)'
                              };
                            }
                          } else {
                            return {
                              backgroundColor: 'var(--theme-info-light)',
                              color: 'var(--primary)'
                            };
                          }
                        } else {
                          return {
                            backgroundColor: 'var(--theme-bg-tertiary)',
                            color: 'var(--theme-text-secondary)'
                          };
                        }
                      })()}
                    >
                      {originalIndex + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p 
                      className="text-sm font-medium truncate transition-colors duration-300"
                      style={{ color: 'var(--theme-text-primary)' }}
                    >
                      {question.pregunta.substring(0, 60)}
                      {question.pregunta.length > 60 ? '...' : ''}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {isAnswered && (
                        <span className="inline-flex items-center space-x-1">
                          <i 
                            className="fas fa-check text-xs transition-colors duration-300"
                            style={{
                              color: isSubmitted
                                ? isCorrect
                                  ? 'var(--secondary)'
                                  : 'var(--theme-error)'
                                : 'var(--primary)'
                            }}
                          ></i>
                          <span 
                            className="text-xs transition-colors duration-300"
                            style={{ color: 'var(--theme-text-secondary)' }}
                          >
                            Contestada
                          </span>
                        </span>
                      )}
                      {!isAnswered && (
                        <span className="inline-flex items-center space-x-1">
                          <i 
                            className="fas fa-question text-xs transition-colors duration-300"
                            style={{ color: 'var(--theme-warning)' }}
                          ></i>
                          <span 
                            className="text-xs transition-colors duration-300"
                            style={{ color: 'var(--theme-text-secondary)' }}
                          >
                            Sin contestar
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center py-8">
            <i 
              className="fas fa-search text-3xl mb-3 transition-colors duration-300"
              style={{ color: 'var(--theme-text-tertiary)' }}
            ></i>
            <p 
              className="font-medium transition-colors duration-300"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              No se encontraron preguntas
            </p>
            <p 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--theme-text-tertiary)' }}
            >
              Intenta ajustar tu búsqueda o filtros
            </p>
            {(searchTerm || selectedFilter !== 'todas') && (
              <button
                onClick={handleReset}
                className="mt-2 font-medium text-sm transition-colors duration-200"
                style={{ color: 'var(--primary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--primary-dark)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--primary)';
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Click outside handler */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};