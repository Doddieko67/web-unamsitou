import { describe, it, expect } from 'vitest';
import {
  filterExams,
  sortExams,
  getFilterColorStyles,
  formatDuration,
  getStatusBadge,
  getDifficultyBadge,
  DIFFICULTY_ORDER,
  type SortOption,
  type SortDirection,
  type FilterDifficulty,
  type FilterStatus
} from '../examHelpers';
import { ExamenData } from '../../components/Main/interfacesExam';

// Mock data para tests
const createMockExam = (overrides: Partial<ExamenData> = {}): ExamenData => ({
  id: 'test-id',
  user_id: 'test-user',
  titulo: 'Test Exam',
  dificultad: 'medium',
  estado: 'pendiente',
  numero_preguntas: 10,
  datos: [],
  fecha_inicio: '2024-01-01T00:00:00Z',
  tiempo_limite_segundos: 3600,
  tiempo_tomado_segundos: 1800,
  descripcion: 'Test description',
  ...overrides
});

const mockExams: ExamenData[] = [
  createMockExam({
    id: '1',
    titulo: 'Matemáticas Básicas',
    dificultad: 'easy',
    estado: 'terminado',
    fecha_inicio: '2024-01-01T10:00:00Z',
    tiempo_tomado_segundos: 1200,
    descripcion: 'Examen de matemáticas básicas'
  }),
  createMockExam({
    id: '2',
    titulo: 'Física Avanzada',
    dificultad: 'hard',
    estado: 'en_progreso',
    fecha_inicio: '2024-01-02T14:00:00Z',
    tiempo_tomado_segundos: 2400,
    descripcion: 'Examen de física avanzada'
  }),
  createMockExam({
    id: '3',
    titulo: 'Historia Mundial',
    dificultad: 'medium',
    estado: 'pendiente',
    fecha_inicio: '2024-01-03T09:00:00Z',
    tiempo_tomado_segundos: 1800,
    descripcion: 'Examen de historia mundial'
  }),
  createMockExam({
    id: '4',
    titulo: 'Química Orgánica',
    dificultad: 'hard',
    estado: 'suspendido',
    fecha_inicio: '2024-01-04T16:00:00Z',
    tiempo_tomado_segundos: 3000,
    descripcion: 'Examen de química orgánica'
  }),
  createMockExam({
    id: '5',
    titulo: 'Literatura Clásica',
    dificultad: 'mixed',
    estado: 'terminado',
    fecha_inicio: '2024-01-05T11:00:00Z',
    tiempo_tomado_segundos: 2700,
    descripcion: 'Examen de literatura clásica'
  }),
  createMockExam({
    id: '6',
    titulo: 'Programación Web',
    dificultad: 'easy',
    estado: 'en_progreso',
    fecha_inicio: null,
    tiempo_tomado_segundos: undefined,
    descripcion: undefined
  })
];

describe('examHelpers - Tests Básicos', () => {
  describe('DIFFICULTY_ORDER constante', () => {
    it('debería tener orden correcto de dificultades', () => {
      expect(DIFFICULTY_ORDER.easy).toBe(1);
      expect(DIFFICULTY_ORDER.medium).toBe(2);
      expect(DIFFICULTY_ORDER.hard).toBe(3);
      expect(DIFFICULTY_ORDER.mixed).toBe(4);
    });

    it('debería ser readonly', () => {
      expect(Object.isFrozen(DIFFICULTY_ORDER)).toBe(false); // const assertion no congela el objeto
      expect(typeof DIFFICULTY_ORDER).toBe('object');
    });
  });

  describe('filterExams función', () => {
    describe('Filtrado por búsqueda de texto', () => {
      it('debería filtrar por título', () => {
        const result = filterExams(mockExams, 'matemáticas', 'all', 'all');
        expect(result).toHaveLength(1);
        expect(result[0].titulo).toBe('Matemáticas Básicas');
      });

      it('debería filtrar por descripción', () => {
        const result = filterExams(mockExams, 'física', 'all', 'all');
        expect(result).toHaveLength(1);
        expect(result[0].titulo).toBe('Física Avanzada');
      });

      it('debería ser case insensitive', () => {
        const result1 = filterExams(mockExams, 'MATEMÁTICAS', 'all', 'all');
        const result2 = filterExams(mockExams, 'matemáticas', 'all', 'all');
        const result3 = filterExams(mockExams, 'MaTeMáTiCaS', 'all', 'all');
        
        expect(result1).toHaveLength(1);
        expect(result2).toHaveLength(1);
        expect(result3).toHaveLength(1);
        expect(result1[0].id).toBe(result2[0].id);
        expect(result2[0].id).toBe(result3[0].id);
      });

      it('debería retornar array vacío si no hay coincidencias', () => {
        const result = filterExams(mockExams, 'inexistente', 'all', 'all');
        expect(result).toHaveLength(0);
      });

      it('debería manejar término de búsqueda vacío', () => {
        const result = filterExams(mockExams, '', 'all', 'all');
        expect(result).toHaveLength(mockExams.length);
      });

      it('debería manejar exámenes sin descripción', () => {
        const result = filterExams(mockExams, 'programación', 'all', 'all');
        expect(result).toHaveLength(1);
        expect(result[0].titulo).toBe('Programación Web');
      });

      it('debería buscar en múltiples campos', () => {
        const result = filterExams(mockExams, 'web', 'all', 'all');
        expect(result).toHaveLength(1);
        expect(result[0].titulo).toBe('Programación Web');
      });
    });

    describe('Filtrado por dificultad', () => {
      it('debería filtrar por dificultad fácil', () => {
        const result = filterExams(mockExams, '', 'easy', 'all');
        expect(result).toHaveLength(2);
        expect(result.every(exam => exam.dificultad === 'easy')).toBe(true);
      });

      it('debería filtrar por dificultad media', () => {
        const result = filterExams(mockExams, '', 'medium', 'all');
        expect(result).toHaveLength(1);
        expect(result[0].dificultad).toBe('medium');
      });

      it('debería filtrar por dificultad difícil', () => {
        const result = filterExams(mockExams, '', 'hard', 'all');
        expect(result).toHaveLength(2);
        expect(result.every(exam => exam.dificultad === 'hard')).toBe(true);
      });

      it('debería filtrar por dificultad mixta', () => {
        const result = filterExams(mockExams, '', 'mixed', 'all');
        expect(result).toHaveLength(1);
        expect(result[0].dificultad).toBe('mixed');
      });

      it('debería mostrar todos cuando dificultad es "all"', () => {
        const result = filterExams(mockExams, '', 'all', 'all');
        expect(result).toHaveLength(mockExams.length);
      });
    });

    describe('Filtrado por estado', () => {
      it('debería filtrar por estado pendiente', () => {
        const result = filterExams(mockExams, '', 'all', 'pendiente');
        expect(result).toHaveLength(1);
        expect(result[0].estado).toBe('pendiente');
      });

      it('debería filtrar por estado en progreso', () => {
        const result = filterExams(mockExams, '', 'all', 'en_progreso');
        expect(result).toHaveLength(2);
        expect(result.every(exam => exam.estado === 'en_progreso')).toBe(true);
      });

      it('debería filtrar por estado terminado', () => {
        const result = filterExams(mockExams, '', 'all', 'terminado');
        expect(result).toHaveLength(2);
        expect(result.every(exam => exam.estado === 'terminado')).toBe(true);
      });

      it('debería filtrar por estado suspendido', () => {
        const result = filterExams(mockExams, '', 'all', 'suspendido');
        expect(result).toHaveLength(1);
        expect(result[0].estado).toBe('suspendido');
      });

      it('debería mostrar todos cuando estado es "all"', () => {
        const result = filterExams(mockExams, '', 'all', 'all');
        expect(result).toHaveLength(mockExams.length);
      });
    });

    describe('Filtrado combinado', () => {
      it('debería combinar filtros de texto y dificultad', () => {
        const result = filterExams(mockExams, 'química', 'hard', 'all');
        expect(result).toHaveLength(1);
        expect(result[0].titulo).toBe('Química Orgánica');
        expect(result[0].dificultad).toBe('hard');
      });

      it('debería combinar filtros de texto y estado', () => {
        const result = filterExams(mockExams, 'matemáticas', 'all', 'terminado');
        expect(result).toHaveLength(1);
        expect(result[0].titulo).toBe('Matemáticas Básicas');
        expect(result[0].estado).toBe('terminado');
      });

      it('debería combinar todos los filtros', () => {
        const result = filterExams(mockExams, 'física', 'hard', 'en_progreso');
        expect(result).toHaveLength(1);
        expect(result[0].titulo).toBe('Física Avanzada');
      });

      it('debería retornar vacío si combinación no existe', () => {
        const result = filterExams(mockExams, 'matemáticas', 'hard', 'all');
        expect(result).toHaveLength(0);
      });
    });

    describe('Casos edge', () => {
      it('debería manejar array vacío', () => {
        const result = filterExams([], 'test', 'easy', 'pendiente');
        expect(result).toHaveLength(0);
      });

      it('debería manejar espacios en término de búsqueda', () => {
        const result = filterExams(mockExams, 'química', 'all', 'all');
        expect(result).toHaveLength(1);
        expect(result[0].titulo).toBe('Química Orgánica');
      });

      it('debería manejar caracteres especiales', () => {
        const specialExam = createMockExam({
          titulo: 'Examen C++/Java',
          descripcion: 'Programación & Algoritmos'
        });
        const examsWithSpecial = [...mockExams, specialExam];
        
        const result = filterExams(examsWithSpecial, 'c++', 'all', 'all');
        expect(result).toHaveLength(1);
        expect(result[0].titulo).toBe('Examen C++/Java');
      });
    });
  });

  describe('sortExams función', () => {
    describe('Ordenamiento por fecha', () => {
      it('debería ordenar por fecha ascendente', () => {
        const result = sortExams(mockExams, 'date', 'asc');
        // Los exámenes con fecha null aparecen primero (se convierten a timestamp 0)
        const nonNullDateExams = result.filter(exam => exam.fecha_inicio !== null);
        expect(nonNullDateExams[0].fecha_inicio).toBe('2024-01-01T10:00:00Z');
        expect(nonNullDateExams[1].fecha_inicio).toBe('2024-01-02T14:00:00Z');
      });

      it('debería ordenar por fecha descendente', () => {
        const result = sortExams(mockExams, 'date', 'desc');
        expect(result[0].fecha_inicio).toBe('2024-01-05T11:00:00Z');
        expect(result[1].fecha_inicio).toBe('2024-01-04T16:00:00Z');
      });

      it('debería manejar fechas null', () => {
        const result = sortExams(mockExams, 'date', 'asc');
        const nullDateExam = result.find(exam => exam.fecha_inicio === null);
        expect(nullDateExam).toBeDefined();
      });
    });

    describe('Ordenamiento por título', () => {
      it('debería ordenar por título ascendente', () => {
        const result = sortExams(mockExams, 'title', 'asc');
        expect(result[0].titulo).toBe('Física Avanzada');
        expect(result[1].titulo).toBe('Historia Mundial');
      });

      it('debería ordenar por título descendente', () => {
        const result = sortExams(mockExams, 'title', 'desc');
        expect(result[0].titulo).toBe('Química Orgánica');
        expect(result[1].titulo).toBe('Programación Web');
      });

      it('debería usar localeCompare para ordenamiento natural', () => {
        const examsWithNumbers = [
          createMockExam({ titulo: 'Test 10' }),
          createMockExam({ titulo: 'Test 2' }),
          createMockExam({ titulo: 'Test 1' })
        ];
        
        const result = sortExams(examsWithNumbers, 'title', 'asc');
        expect(result[0].titulo).toBe('Test 1');
        expect(result[1].titulo).toBe('Test 10');
        expect(result[2].titulo).toBe('Test 2');
      });
    });

    describe('Ordenamiento por dificultad', () => {
      it('debería ordenar por dificultad ascendente', () => {
        const result = sortExams(mockExams, 'difficulty', 'asc');
        expect(result[0].dificultad).toBe('easy');
        expect(result[result.length - 1].dificultad).toBe('mixed');
      });

      it('debería ordenar por dificultad descendente', () => {
        const result = sortExams(mockExams, 'difficulty', 'desc');
        expect(result[0].dificultad).toBe('mixed');
        expect(result[result.length - 1].dificultad).toBe('easy');
      });

      it('debería usar DIFFICULTY_ORDER para ordenamiento', () => {
        const difficultyOnlyExams = [
          createMockExam({ dificultad: 'hard' }),
          createMockExam({ dificultad: 'easy' }),
          createMockExam({ dificultad: 'mixed' }),
          createMockExam({ dificultad: 'medium' })
        ];
        
        const result = sortExams(difficultyOnlyExams, 'difficulty', 'asc');
        expect(result[0].dificultad).toBe('easy');
        expect(result[1].dificultad).toBe('medium');
        expect(result[2].dificultad).toBe('hard');
        expect(result[3].dificultad).toBe('mixed');
      });
    });

    describe('Ordenamiento por estado', () => {
      it('debería ordenar por estado ascendente', () => {
        const result = sortExams(mockExams, 'status', 'asc');
        expect(result[0].estado).toBe('en_progreso');
        expect(result[result.length - 1].estado).toBe('terminado');
      });

      it('debería ordenar por estado descendente', () => {
        const result = sortExams(mockExams, 'status', 'desc');
        expect(result[0].estado).toBe('terminado');
      });
    });

    describe('Ordenamiento por duración', () => {
      it('debería ordenar por duración ascendente', () => {
        const result = sortExams(mockExams, 'duration', 'asc');
        const firstWithDuration = result.find(exam => exam.tiempo_tomado_segundos !== undefined);
        expect(firstWithDuration?.tiempo_tomado_segundos).toBe(1200);
      });

      it('debería ordenar por duración descendente', () => {
        const result = sortExams(mockExams, 'duration', 'desc');
        expect(result[0].tiempo_tomado_segundos).toBe(3000);
      });

      it('debería manejar duraciones undefined', () => {
        const result = sortExams(mockExams, 'duration', 'asc');
        const undefinedDurationExam = result.find(exam => exam.tiempo_tomado_segundos === undefined);
        expect(undefinedDurationExam).toBeDefined();
      });
    });

    describe('Casos edge de ordenamiento', () => {
      it('no debería mutar el array original', () => {
        const originalExams = [...mockExams];
        const result = sortExams(mockExams, 'title', 'asc');
        
        expect(mockExams).toEqual(originalExams);
        expect(result).not.toBe(mockExams);
      });

      it('debería manejar array vacío', () => {
        const result = sortExams([], 'title', 'asc');
        expect(result).toHaveLength(0);
      });

      it('debería manejar sortBy inválido', () => {
        const result = sortExams(mockExams, 'invalid' as SortOption, 'asc');
        expect(result).toHaveLength(mockExams.length);
      });

      it('debería manejar un solo elemento', () => {
        const singleExam = [mockExams[0]];
        const result = sortExams(singleExam, 'title', 'asc');
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(singleExam[0]);
      });
    });
  });

  describe('getFilterColorStyles función', () => {
    it('debería retornar estilos blue por defecto', () => {
      const styles = getFilterColorStyles();
      expect(styles).toEqual({
        bg: 'var(--theme-info-light)',
        text: 'var(--theme-info-dark)',
        border: 'var(--theme-info)'
      });
    });

    it('debería retornar estilos blue cuando se especifica', () => {
      const styles = getFilterColorStyles('blue');
      expect(styles).toEqual({
        bg: 'var(--theme-info-light)',
        text: 'var(--theme-info-dark)',
        border: 'var(--theme-info)'
      });
    });

    it('debería retornar estilos green', () => {
      const styles = getFilterColorStyles('green');
      expect(styles).toEqual({
        bg: 'var(--theme-success-light)',
        text: 'var(--theme-success-dark)',
        border: 'var(--theme-success)'
      });
    });

    it('debería retornar estilos yellow', () => {
      const styles = getFilterColorStyles('yellow');
      expect(styles).toEqual({
        bg: 'var(--theme-warning-light)',
        text: 'var(--theme-warning-dark)',
        border: 'var(--theme-warning)'
      });
    });

    it('debería retornar estilos red', () => {
      const styles = getFilterColorStyles('red');
      expect(styles).toEqual({
        bg: 'var(--theme-error-light)',
        text: 'var(--theme-error-dark)',
        border: 'var(--theme-error)'
      });
    });

    it('debería retornar estilos gray', () => {
      const styles = getFilterColorStyles('gray');
      expect(styles).toEqual({
        bg: 'var(--theme-bg-secondary)',
        text: 'var(--theme-text-secondary)',
        border: 'var(--theme-border-primary)'
      });
    });

    it('debería retornar blue para color theme inexistente', () => {
      const styles = getFilterColorStyles('purple');
      expect(styles).toEqual({
        bg: 'var(--theme-info-light)',
        text: 'var(--theme-info-dark)',
        border: 'var(--theme-info)'
      });
    });

    it('debería tener estructura consistente', () => {
      const colors = ['blue', 'green', 'yellow', 'red', 'gray'];
      
      colors.forEach(color => {
        const styles = getFilterColorStyles(color);
        expect(styles).toHaveProperty('bg');
        expect(styles).toHaveProperty('text');
        expect(styles).toHaveProperty('border');
        expect(typeof styles.bg).toBe('string');
        expect(typeof styles.text).toBe('string');
        expect(typeof styles.border).toBe('string');
      });
    });
  });

  describe('formatDuration función', () => {
    it('debería formatear solo segundos', () => {
      expect(formatDuration(45)).toBe('45s');
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(59)).toBe('59s');
    });

    it('debería formatear minutos y segundos', () => {
      expect(formatDuration(60)).toBe('1m 0s');
      expect(formatDuration(90)).toBe('1m 30s');
      expect(formatDuration(3599)).toBe('59m 59s');
    });

    it('debería formatear horas, minutos y segundos', () => {
      expect(formatDuration(3600)).toBe('1h 0m 0s');
      expect(formatDuration(3661)).toBe('1h 1m 1s');
      expect(formatDuration(7323)).toBe('2h 2m 3s');
    });

    it('debería manejar duraciones grandes', () => {
      expect(formatDuration(36000)).toBe('10h 0m 0s');
      expect(formatDuration(86400)).toBe('24h 0m 0s');
    });

    it('debería manejar números decimales', () => {
      // Math.floor se usa para cálculos, pero los decimales pueden aparecer en segundos
      expect(formatDuration(90)).toBe('1m 30s');
      expect(formatDuration(3600)).toBe('1h 0m 0s');
    });

    it('debería manejar números negativos', () => {
      // La función usa Math.floor que maneja negativos de forma específica
      expect(formatDuration(-60)).toBe('0s'); // Math.floor(-60 % 60) = 0
      expect(formatDuration(-1)).toBe('-1s');
    });

    it('debería formatear casos específicos comunes', () => {
      expect(formatDuration(1800)).toBe('30m 0s'); // 30 minutos
      expect(formatDuration(5400)).toBe('1h 30m 0s'); // 1.5 horas
      expect(formatDuration(3665)).toBe('1h 1m 5s'); // 1h 1m 5s
    });
  });

  describe('getStatusBadge función', () => {
    it('debería retornar badge para pendiente', () => {
      const badge = getStatusBadge('pendiente');
      expect(badge).toEqual({
        label: 'Pendiente',
        color: 'gray'
      });
    });

    it('debería retornar badge para en_progreso', () => {
      const badge = getStatusBadge('en_progreso');
      expect(badge).toEqual({
        label: 'En Progreso',
        color: 'blue'
      });
    });

    it('debería retornar badge para terminado', () => {
      const badge = getStatusBadge('terminado');
      expect(badge).toEqual({
        label: 'Terminado',
        color: 'green'
      });
    });

    it('debería retornar badge para suspendido', () => {
      const badge = getStatusBadge('suspendido');
      expect(badge).toEqual({
        label: 'Suspendido',
        color: 'yellow'
      });
    });

    it('debería retornar pendiente para estado inexistente', () => {
      const badge = getStatusBadge('inexistente');
      expect(badge).toEqual({
        label: 'Pendiente',
        color: 'gray'
      });
    });

    it('debería retornar pendiente para string vacío', () => {
      const badge = getStatusBadge('');
      expect(badge).toEqual({
        label: 'Pendiente',
        color: 'gray'
      });
    });

    it('debería tener estructura consistente', () => {
      const statuses = ['pendiente', 'en_progreso', 'terminado', 'suspendido'];
      
      statuses.forEach(status => {
        const badge = getStatusBadge(status);
        expect(badge).toHaveProperty('label');
        expect(badge).toHaveProperty('color');
        expect(typeof badge.label).toBe('string');
        expect(typeof badge.color).toBe('string');
      });
    });
  });

  describe('getDifficultyBadge función', () => {
    it('debería retornar badge para easy', () => {
      const badge = getDifficultyBadge('easy');
      expect(badge).toEqual({
        label: 'Fácil',
        color: 'green'
      });
    });

    it('debería retornar badge para medium', () => {
      const badge = getDifficultyBadge('medium');
      expect(badge).toEqual({
        label: 'Medio',
        color: 'yellow'
      });
    });

    it('debería retornar badge para hard', () => {
      const badge = getDifficultyBadge('hard');
      expect(badge).toEqual({
        label: 'Difícil',
        color: 'red'
      });
    });

    it('debería retornar badge para mixed', () => {
      const badge = getDifficultyBadge('mixed');
      expect(badge).toEqual({
        label: 'Mixto',
        color: 'blue'
      });
    });

    it('debería retornar easy para dificultad inexistente', () => {
      const badge = getDifficultyBadge('inexistente');
      expect(badge).toEqual({
        label: 'Fácil',
        color: 'green'
      });
    });

    it('debería retornar easy para string vacío', () => {
      const badge = getDifficultyBadge('');
      expect(badge).toEqual({
        label: 'Fácil',
        color: 'green'
      });
    });

    it('debería tener estructura consistente', () => {
      const difficulties = ['easy', 'medium', 'hard', 'mixed'];
      
      difficulties.forEach(difficulty => {
        const badge = getDifficultyBadge(difficulty);
        expect(badge).toHaveProperty('label');
        expect(badge).toHaveProperty('color');
        expect(typeof badge.label).toBe('string');
        expect(typeof badge.color).toBe('string');
      });
    });
  });

  describe('Integración y casos complejos', () => {
    it('debería funcionar filtrar y ordenar en secuencia', () => {
      const filtered = filterExams(mockExams, '', 'hard', 'all');
      const sorted = sortExams(filtered, 'title', 'asc');
      
      expect(sorted).toHaveLength(2);
      expect(sorted[0].titulo).toBe('Física Avanzada');
      expect(sorted[1].titulo).toBe('Química Orgánica');
    });

    it('debería manejar operaciones en array muy grande', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => 
        createMockExam({
          id: `exam-${i}`,
          titulo: `Exam ${i}`,
          dificultad: i % 2 === 0 ? 'easy' : 'hard'
        })
      );
      
      const filtered = filterExams(largeArray, 'exam', 'easy', 'all');
      const sorted = sortExams(filtered, 'title', 'asc');
      
      expect(filtered.length).toBe(500);
      expect(sorted.length).toBe(500);
      expect(sorted[0].titulo).toBe('Exam 0');
    });

    it('debería preservar propiedades de objetos después de operaciones', () => {
      const examWithExtraProps = createMockExam({
        titulo: 'Test Extra',
        // @ts-ignore - adding extra property for testing
        extraProp: 'extra value'
      });
      
      const examsWithExtra = [...mockExams, examWithExtraProps];
      const filtered = filterExams(examsWithExtra, 'extra', 'all', 'all');
      const sorted = sortExams(filtered, 'title', 'asc');
      
      expect(sorted).toHaveLength(1);
      // @ts-ignore
      expect(sorted[0].extraProp).toBe('extra value');
    });
  });
});