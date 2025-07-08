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
  { value: 'todas', label: 'Todas', icon: 'fa-list', color: 'text-gray-600' },
  { value: 'contestadas', label: 'Contestadas', icon: 'fa-check', color: 'text-blue-600' },
  { value: 'sin_contestar', label: 'Sin contestar', icon: 'fa-question', color: 'text-orange-600' },
  { value: 'correctas', label: 'Correctas', icon: 'fa-check-circle', color: 'text-green-600' },
  { value: 'incorrectas', label: 'Incorrectas', icon: 'fa-times-circle', color: 'text-red-600' },
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
          <i className="fas fa-search text-gray-400"></i>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar preguntas..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <i className="fas fa-times text-gray-400 hover:text-gray-600"></i>
          </button>
        )}
      </div>

      {/* Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <div className="flex items-center space-x-2">
            <i className={`fas ${selectedFilterOption.icon} ${selectedFilterOption.color}`}></i>
            <span className="text-gray-700">{selectedFilterOption.label}</span>
          </div>
          <i className={`fas fa-chevron-down transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}></i>
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
            >
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedFilter(option.value);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                    selectedFilter === option.value ? 'bg-blue-50' : ''
                  }`}
                  disabled={
                    !isSubmitted && (option.value === 'correctas' || option.value === 'incorrectas')
                  }
                >
                  <i className={`fas ${option.icon} ${option.color}`}></i>
                  <span className="text-gray-700">{option.label}</span>
                  {selectedFilter === option.value && (
                    <i className="fas fa-check text-blue-600 ml-auto"></i>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Counter */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {filteredQuestions.length} de {questions.length} preguntas
        </span>
        {(searchTerm || selectedFilter !== 'todas') && (
          <button
            onClick={handleReset}
            className="text-blue-600 hover:text-blue-800 font-medium"
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

            return (
              <button
                key={originalIndex}
                onClick={() => onQuestionSelect(originalIndex)}
                className={`w-full p-3 text-left rounded-lg border transition-all duration-200 ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isAnswered
                        ? isSubmitted
                          ? isCorrect
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {originalIndex + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {question.pregunta.substring(0, 60)}
                      {question.pregunta.length > 60 ? '...' : ''}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {isAnswered && (
                        <span className="inline-flex items-center space-x-1">
                          <i className={`fas fa-check text-xs ${
                            isSubmitted
                              ? isCorrect
                                ? 'text-green-600'
                                : 'text-red-600'
                              : 'text-blue-600'
                          }`}></i>
                          <span className="text-xs text-gray-500">Contestada</span>
                        </span>
                      )}
                      {!isAnswered && (
                        <span className="inline-flex items-center space-x-1">
                          <i className="fas fa-question text-xs text-orange-600"></i>
                          <span className="text-xs text-gray-500">Sin contestar</span>
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
            <i className="fas fa-search text-gray-300 text-3xl mb-3"></i>
            <p className="text-gray-500 font-medium">No se encontraron preguntas</p>
            <p className="text-gray-400 text-sm">
              Intenta ajustar tu búsqueda o filtros
            </p>
            {(searchTerm || selectedFilter !== 'todas') && (
              <button
                onClick={handleReset}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
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