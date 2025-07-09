import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { supabase } from "../supabase.config";
import { ExamenData } from "../components/Main/interfacesExam";
import { 
  ExamDistributionChart, 
  MonthlyProgressChart,
  PerformanceRadarChart,
  ScoreDistributionChart 
} from "../components/charts";
import { getPerformanceColor } from "../utils/chartColors";

// Interfaces para las estadísticas avanzadas de nivel enterprise
interface ExamStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  suspended: number;
  pinned: number;
  totalTimeMinutes: number;
  averageScore: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
    mixed: number;
  };
  monthlyProgress: Array<{
    month: string;
    completed: number;
    started: number;
    avgScore: number;
  }>;
  // Métricas Core de Performance
  performanceScore: {
    overall: number;
    trend: string;
    consistency: number;
    improvement: string;
    percentileRank: number;
  };
  // Análisis Temporal Inteligente
  timeAnalytics: {
    bestTimeOfDay: string;
    optimalDuration: string;
    burnoutRisk: 'Low' | 'Medium' | 'High';
    studyStreak: number;
    weekdayVsWeekend: {
      weekday: number;
      weekend: number;
    };
    activityHeatmap: Array<{
      date: string;
      intensity: number;
      performance: number;
    }>;
  };
  // Predicciones y Recomendaciones
  predictions: {
    nextExamPrediction: {
      expectedScore: number;
      confidence: string;
      recommendation: string;
    };
    readinessLevel: string;
    suggestedDifficulty: string;
    estimatedTimeToMastery: string;
  };
  // Mapa de Conocimiento
  knowledgeMap: {
    strongTopics: string[];
    weakTopics: string[];
    masteredSkills: number;
    inProgressSkills: number;
    newSkills: number;
  };
  // Análisis de Errores
  errorAnalysis: {
    commonMistakePatterns: Array<{
      type: string;
      frequency: number;
      impact: 'Bajo' | 'Medio' | 'Alto';
    }>;
    improvementOpportunities: string[];
  };
  // Gamification
  gamification: {
    level: number;
    experiencePoints: number;
    nextLevelProgress: number;
    achievements: Array<{
      name: string;
      description: string;
      unlocked: boolean;
      icon: string;
    }>;
    streaks: {
      current: number;
      longest: number;
      thisMonth: number;
    };
  };
  // Goals & Milestones
  goals: {
    monthlyGoal: {
      target: number;
      current: number;
      onTrack: boolean;
      daysLeft: number;
    };
    yearlyGoals: Array<{
      goal: string;
      progress: number;
      target: number;
      current: number;
    }>;
  };
  // Smart Insights
  smartInsights: Array<{
    type: 'performance' | 'difficulty' | 'topic' | 'time' | 'motivation';
    message: string;
    action: string;
    priority: 'low' | 'medium' | 'high';
    icon: string;
  }>;
  // Datos existentes expandidos
  difficultyPerformance: {
    easy: { count: number; avgScore: number; totalTime: number };
    medium: { count: number; avgScore: number; totalTime: number };
    hard: { count: number; avgScore: number; totalTime: number };
    mixed: { count: number; avgScore: number; totalTime: number };
  };
  scoreDistribution: {
    '90-100': number;
    '80-89': number;
    '70-79': number;
    '60-69': number;
    '50-59': number;
    '0-49': number;
  };
  competencyRadar: {
    speed: number;
    accuracy: number;
    comprehension: number;
    analysis: number;
    memory: number;
    application: number;
  };
}

export function Estadisticas() {
  const { user } = useAuthStore();
  const [examData, setExamData] = useState<ExamenData[]>([]);
  const [stats, setStats] = useState<ExamStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de exámenes
  useEffect(() => {
    async function fetchExamData() {
      if (!user?.id) {
        setError("Usuario no autenticado");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('examenes')
          .select('*')
          .eq('user_id', user.id)
          .order('fecha_inicio', { ascending: false });

        if (error) throw error;

        setExamData(data || []);
        generateStats(data || []);
      } catch (error) {
        console.error('Error fetching exam data:', error);
        setError('Error al cargar los datos de exámenes');
      } finally {
        setIsLoading(false);
      }
    }

    fetchExamData();
  }, [user]);

  // Generar estadísticas enterprise de nivel analista avanzado
  const generateStats = (data: ExamenData[]) => {
    const completedExams = data.filter(e => e.estado === 'terminado' && e.respuestas_usuario);
    
    // Calcular todas las métricas avanzadas
    const difficultyPerformance = calculateDifficultyPerformance(completedExams);
    const scoreDistribution = calculateScoreDistribution(completedExams);
    const performanceScore = calculatePerformanceScore(data, completedExams);
    const timeAnalytics = calculateTimeAnalytics(data, completedExams);
    const predictions = calculatePredictions(data, completedExams, difficultyPerformance);
    const knowledgeMap = calculateKnowledgeMap(completedExams, difficultyPerformance);
    const errorAnalysis = calculateErrorAnalysis(completedExams);
    const gamification = calculateGamification(data, completedExams);
    const goals = calculateGoals(data, completedExams);
    const smartInsights = generateSmartInsights(data, completedExams, timeAnalytics, difficultyPerformance);
    const competencyRadar = calculateCompetencyRadar(completedExams, timeAnalytics);

    const stats: ExamStats = {
      // Métricas básicas
      total: data.length,
      completed: data.filter(e => e.estado === 'terminado').length,
      inProgress: data.filter(e => e.estado === 'en_progreso').length,
      pending: data.filter(e => e.estado === 'pendiente').length,
      suspended: data.filter(e => e.estado === 'suspendido').length,
      pinned: data.filter(e => e.is_pinned).length,
      totalTimeMinutes: Math.round(
        data
          .filter(e => e.tiempo_tomado_segundos)
          .reduce((acc, e) => acc + (e.tiempo_tomado_segundos || 0), 0) / 60
      ),
      averageScore: completedExams.length > 0 ? 
        Math.round(completedExams.reduce((acc, exam) => acc + calculateExamScore(exam), 0) / completedExams.length) : 0,
      difficultyDistribution: {
        easy: data.filter(e => e.dificultad === 'easy').length,
        medium: data.filter(e => e.dificultad === 'medium').length,
        hard: data.filter(e => e.dificultad === 'hard').length,
        mixed: data.filter(e => e.dificultad === 'mixed').length,
      },
      monthlyProgress: generateMonthlyProgress(data, completedExams),
      
      // Métricas avanzadas enterprise
      performanceScore,
      timeAnalytics,
      predictions,
      knowledgeMap,
      errorAnalysis,
      gamification,
      goals,
      smartInsights,
      competencyRadar,
      difficultyPerformance,
      scoreDistribution,
    };

    setStats(stats);
  };

  // Calcular performance por dificultad
  const calculateDifficultyPerformance = (completedExams: ExamenData[]) => {
    const difficulties = ['easy', 'medium', 'hard', 'mixed'] as const;
    const result: any = {};

    difficulties.forEach(difficulty => {
      const examsOfDifficulty = completedExams.filter(e => e.dificultad === difficulty);
      
      if (examsOfDifficulty.length > 0) {
        const scores = examsOfDifficulty.map(calculateExamScore);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const totalTime = examsOfDifficulty.reduce((acc, e) => acc + (e.tiempo_tomado_segundos || 0), 0);
        
        result[difficulty] = {
          count: examsOfDifficulty.length,
          avgScore: Math.round(avgScore),
          totalTime: Math.round(totalTime / 60) // en minutos
        };
      } else {
        result[difficulty] = {
          count: 0,
          avgScore: 0,
          totalTime: 0
        };
      }
    });

    return result;
  };

  // Calcular distribución de scores
  const calculateScoreDistribution = (completedExams: ExamenData[]) => {
    const distribution = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      '50-59': 0,
      '0-49': 0,
    };

    completedExams.forEach(exam => {
      const score = calculateExamScore(exam);
      
      if (score >= 90) distribution['90-100']++;
      else if (score >= 80) distribution['80-89']++;
      else if (score >= 70) distribution['70-79']++;
      else if (score >= 60) distribution['60-69']++;
      else if (score >= 50) distribution['50-59']++;
      else distribution['0-49']++;
    });

    return distribution;
  };

  // Calcular métricas de rendimiento avanzadas
  const calculatePerformanceMetrics = (allExams: ExamenData[], completedExams: ExamenData[], difficultyPerf: any) => {
    const completionRate = allExams.length > 0 ? (completedExams.length / allExams.length) * 100 : 0;
    
    const averageTimePerExam = completedExams.length > 0 ? 
      completedExams.reduce((acc, e) => acc + (e.tiempo_tomado_segundos || 0), 0) / completedExams.length / 60 : 0;
    
    // Calcular tendencia de mejora (últimos vs primeros exámenes)
    const improvementTrend = calculateImprovementTrend(completedExams);
    
    // Calcular consistencia (baja desviación estándar = alta consistencia)
    const consistencyScore = calculateConsistencyScore(completedExams);
    
    // Encontrar fortalezas y debilidades
    const difficultyScores = [
      { name: 'easy', score: difficultyPerf.easy.avgScore, label: 'Fácil' },
      { name: 'medium', score: difficultyPerf.medium.avgScore, label: 'Medio' },
      { name: 'hard', score: difficultyPerf.hard.avgScore, label: 'Difícil' },
      { name: 'mixed', score: difficultyPerf.mixed.avgScore, label: 'Mixto' }
    ].filter(d => d.score > 0);

    const strongestDifficulty = difficultyScores.length > 0 ? 
      difficultyScores.reduce((max, current) => current.score > max.score ? current : max).label : 'N/A';
    
    const weakestDifficulty = difficultyScores.length > 0 ? 
      difficultyScores.reduce((min, current) => current.score < min.score ? current : min).label : 'N/A';

    return {
      completionRate: Math.round(completionRate),
      averageTimePerExam: Math.round(averageTimePerExam),
      improvementTrend: Math.round(improvementTrend),
      consistencyScore: Math.round(consistencyScore),
      strongestDifficulty,
      weakestDifficulty
    };
  };

  // Calcular tendencia de mejora
  const calculateImprovementTrend = (completedExams: ExamenData[]): number => {
    if (completedExams.length < 2) return 0;
    
    // Ordenar por fecha
    const sortedExams = [...completedExams].sort((a, b) => 
      new Date(a.fecha_inicio || 0).getTime() - new Date(b.fecha_inicio || 0).getTime()
    );
    
    const halfPoint = Math.floor(sortedExams.length / 2);
    const firstHalf = sortedExams.slice(0, halfPoint);
    const secondHalf = sortedExams.slice(halfPoint);
    
    if (firstHalf.length === 0 || secondHalf.length === 0) return 0;
    
    const firstHalfAvg = firstHalf.reduce((acc, e) => acc + calculateExamScore(e), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((acc, e) => acc + calculateExamScore(e), 0) / secondHalf.length;
    
    return secondHalfAvg - firstHalfAvg;
  };

  // Calcular score de consistencia
  const calculateConsistencyScore = (completedExams: ExamenData[]): number => {
    if (completedExams.length < 2) return 100;
    
    const scores = completedExams.map(calculateExamScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Convertir a score de consistencia (0-100, donde 100 es perfectamente consistente)
    return Math.max(0, 100 - (standardDeviation * 2));
  };

  // Calcular score de un examen individual
  const calculateExamScore = (exam: ExamenData): number => {
    const questions = Array.isArray(exam.datos) ? exam.datos : [];
    if (questions.length === 0 || !exam.respuestas_usuario) return 0;

    let correctCount = 0;
    questions.forEach((pregunta) => {
      const userAnswer = exam.respuestas_usuario?.[pregunta.id - 1];
      if (userAnswer !== undefined && userAnswer === pregunta.correcta) {
        correctCount++;
      }
    });

    return Math.round((correctCount / questions.length) * 100);
  };

  // === FUNCIONES DE ANÁLISIS AVANZADO ENTERPRISE ===

  // Calcular Performance Score Global
  const calculatePerformanceScore = (allData: ExamenData[], completedExams: ExamenData[]) => {
    if (completedExams.length === 0) {
      return {
        overall: 0,
        trend: "0%",
        consistency: 0,
        improvement: "0pts",
        percentileRank: 0
      };
    }

    const scores = completedExams.map(calculateExamScore);
    const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    
    // Calcular tendencia (último mes vs anterior)
    const lastMonth = completedExams.filter(e => {
      const examDate = new Date(e.fecha_fin || e.fecha_inicio || Date.now());
      const monthsAgo = (Date.now() - examDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsAgo <= 1;
    });
    
    const previousMonth = completedExams.filter(e => {
      const examDate = new Date(e.fecha_fin || e.fecha_inicio || Date.now());
      const monthsAgo = (Date.now() - examDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsAgo > 1 && monthsAgo <= 2;
    });
    
    const lastMonthAvg = lastMonth.length > 0 ? 
      Math.round(lastMonth.reduce((acc, e) => acc + calculateExamScore(e), 0) / lastMonth.length) : overall;
    const prevMonthAvg = previousMonth.length > 0 ? 
      Math.round(previousMonth.reduce((acc, e) => acc + calculateExamScore(e), 0) / previousMonth.length) : overall;
    
    const trendDiff = lastMonthAvg - prevMonthAvg;
    const trend = trendDiff >= 0 ? `+${trendDiff}%` : `${trendDiff}%`;
    
    // Calcular consistencia (menor desviación estándar = más consistente)
    const mean = overall;
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, Math.round(100 - (stdDev * 1.5)));
    
    // Calcular mejora total (primeros vs últimos exámenes)
    const sortedByDate = [...completedExams].sort((a, b) => 
      new Date(a.fecha_inicio || 0).getTime() - new Date(b.fecha_inicio || 0).getTime()
    );
    const firstQuarter = sortedByDate.slice(0, Math.max(1, Math.floor(sortedByDate.length * 0.25)));
    const lastQuarter = sortedByDate.slice(-Math.max(1, Math.floor(sortedByDate.length * 0.25)));
    
    const firstAvg = firstQuarter.reduce((acc, e) => acc + calculateExamScore(e), 0) / firstQuarter.length;
    const lastAvg = lastQuarter.reduce((acc, e) => acc + calculateExamScore(e), 0) / lastQuarter.length;
    const improvementPoints = Math.round(lastAvg - firstAvg);
    const improvement = improvementPoints >= 0 ? `+${improvementPoints}pts` : `${improvementPoints}pts`;
    
    // Calcular percentil (simulado - en producción sería vs todos los usuarios)
    const percentileRank = Math.min(99, Math.max(1, Math.round(overall * 0.9 + Math.random() * 20)));
    
    return {
      overall,
      trend,
      consistency,
      improvement,
      percentileRank
    };
  };

  // Análisis Temporal Inteligente
  const calculateTimeAnalytics = (allData: ExamenData[], completedExams: ExamenData[]) => {
    if (completedExams.length === 0) {
      return {
        bestTimeOfDay: "14:00-16:00",
        optimalDuration: "30min",
        burnoutRisk: 'Low' as const,
        studyStreak: 0,
        weekdayVsWeekend: { weekday: 0, weekend: 0 },
        activityHeatmap: []
      };
    }

    // Encontrar mejor hora del día
    const hourlyPerformance: { [hour: string]: { scores: number[], count: number } } = {};
    
    completedExams.forEach(exam => {
      const hour = new Date(exam.fecha_inicio || Date.now()).getHours();
      const timeSlot = `${hour}:00-${hour + 1}:00`;
      if (!hourlyPerformance[timeSlot]) {
        hourlyPerformance[timeSlot] = { scores: [], count: 0 };
      }
      hourlyPerformance[timeSlot].scores.push(calculateExamScore(exam));
      hourlyPerformance[timeSlot].count++;
    });

    let bestTimeOfDay = "14:00-16:00";
    let bestAvgScore = 0;
    Object.entries(hourlyPerformance).forEach(([time, data]) => {
      if (data.count >= 2) { // Solo considerar si hay al menos 2 exámenes
        const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
        if (avg > bestAvgScore) {
          bestAvgScore = avg;
          bestTimeOfDay = time;
        }
      }
    });

    // Calcular duración óptima
    const avgDuration = completedExams.reduce((acc, e) => acc + (e.tiempo_tomado_segundos || 1800), 0) / completedExams.length;
    const optimalDuration = `${Math.round(avgDuration / 60)}min`;

    // Calcular riesgo de burnout
    const recentExams = allData.filter(e => {
      const daysAgo = (Date.now() - new Date(e.fecha_inicio || Date.now()).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    }).length;
    
    let burnoutRisk: 'Low' | 'Medium' | 'High' = 'Low';
    if (recentExams > 20) burnoutRisk = 'High';
    else if (recentExams > 10) burnoutRisk = 'Medium';

    // Calcular racha de estudio
    const studyDates = [...new Set(allData.map(e => {
      const date = new Date(e.fecha_inicio || Date.now());
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }))].sort();
    
    let studyStreak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateStr = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
      if (studyDates.includes(dateStr)) {
        studyStreak++;
      } else if (i > 0) {
        break;
      }
    }

    // Rendimiento weekday vs weekend
    const weekdayExams = completedExams.filter(e => {
      const day = new Date(e.fecha_inicio || Date.now()).getDay();
      return day >= 1 && day <= 5;
    });
    const weekendExams = completedExams.filter(e => {
      const day = new Date(e.fecha_inicio || Date.now()).getDay();
      return day === 0 || day === 6;
    });

    const weekdayAvg = weekdayExams.length > 0 ? 
      Math.round(weekdayExams.reduce((acc, e) => acc + calculateExamScore(e), 0) / weekdayExams.length) : 0;
    const weekendAvg = weekendExams.length > 0 ? 
      Math.round(weekendExams.reduce((acc, e) => acc + calculateExamScore(e), 0) / weekendExams.length) : 0;

    // Generar heatmap de actividad (últimos 90 días)
    const activityHeatmap = [];
    for (let i = 89; i >= 0; i--) {
      const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayExams = allData.filter(e => {
        const examDate = new Date(e.fecha_inicio || Date.now()).toISOString().split('T')[0];
        return examDate === dateStr;
      });
      
      const dayCompleted = dayExams.filter(e => e.estado === 'terminado');
      const intensity = Math.min(5, dayExams.length);
      const performance = dayCompleted.length > 0 ? 
        dayCompleted.reduce((acc, e) => acc + calculateExamScore(e), 0) / dayCompleted.length : 0;
      
      activityHeatmap.push({
        date: dateStr,
        intensity,
        performance: Math.round(performance)
      });
    }

    return {
      bestTimeOfDay,
      optimalDuration,
      burnoutRisk,
      studyStreak,
      weekdayVsWeekend: { weekday: weekdayAvg, weekend: weekendAvg },
      activityHeatmap
    };
  };

  // Predicciones y Recomendaciones
  const calculatePredictions = (allData: ExamenData[], completedExams: ExamenData[], difficultyPerf: any) => {
    if (completedExams.length < 3) {
      return {
        nextExamPrediction: {
          expectedScore: 75,
          confidence: "50%",
          recommendation: "Completa más exámenes para predicciones precisas"
        },
        readinessLevel: "Principiante",
        suggestedDifficulty: "easy",
        estimatedTimeToMastery: "4-6 semanas"
      };
    }

    // Predecir próximo score basado en tendencia
    const recentScores = completedExams.slice(-5).map(calculateExamScore);
    const trend = recentScores.length > 1 ? 
      (recentScores[recentScores.length - 1] - recentScores[0]) / (recentScores.length - 1) : 0;
    
    const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const expectedScore = Math.max(0, Math.min(100, Math.round(avgRecent + trend)));
    
    const confidence = completedExams.length >= 10 ? "85%" : 
                     completedExams.length >= 5 ? "70%" : "55%";

    // Generar recomendación inteligente
    let recommendation = "Continúa con tu ritmo actual de estudio";
    if (trend < -5) recommendation = "Toma un descanso, pareces estar fatigado";
    else if (trend > 10) recommendation = "¡Excelente progreso! Intenta un nivel más alto";
    else if (avgRecent < 60) recommendation = "Enfócate en repasar conceptos básicos";
    else if (avgRecent > 85) recommendation = "Estás listo para desafíos más complejos";

    // Determinar nivel de preparación
    let readinessLevel = "Principiante";
    if (avgRecent >= 90) readinessLevel = "Experto";
    else if (avgRecent >= 80) readinessLevel = "Avanzado";
    else if (avgRecent >= 70) readinessLevel = "Intermedio";
    else if (avgRecent >= 60) readinessLevel = "Básico";

    // Sugerir dificultad
    let suggestedDifficulty = "easy";
    if (difficultyPerf.hard.avgScore >= 80) suggestedDifficulty = "hard";
    else if (difficultyPerf.medium.avgScore >= 75) suggestedDifficulty = "medium";
    else if (difficultyPerf.easy.avgScore >= 85) suggestedDifficulty = "medium";

    // Estimar tiempo para maestría
    const masterScore = 85;
    const timeToMastery = avgRecent >= masterScore ? "Ya dominado" :
                         trend > 0 ? `${Math.ceil((masterScore - avgRecent) / Math.max(trend, 1))} exámenes más` :
                         "4-6 semanas con práctica constante";

    return {
      nextExamPrediction: { expectedScore, confidence, recommendation },
      readinessLevel,
      suggestedDifficulty,
      estimatedTimeToMastery: timeToMastery
    };
  };

  // Generar progreso mensual mejorado (últimos 6 meses)
  const generateMonthlyProgress = (data: ExamenData[], completedExams: ExamenData[]) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthCompleted = data.filter(e => {
        if (e.estado !== 'terminado' || !e.fecha_fin) return false;
        const examDate = new Date(e.fecha_fin);
        const examMonthYear = `${examDate.getFullYear()}-${String(examDate.getMonth() + 1).padStart(2, '0')}`;
        return examMonthYear === monthYear;
      });
      
      const started = data.filter(e => {
        if (!e.fecha_inicio) return false;
        const examDate = new Date(e.fecha_inicio);
        const examMonthYear = `${examDate.getFullYear()}-${String(examDate.getMonth() + 1).padStart(2, '0')}`;
        return examMonthYear === monthYear;
      }).length;

      const avgScore = monthCompleted.length > 0 ?
        Math.round(monthCompleted.reduce((acc, e) => acc + calculateExamScore(e), 0) / monthCompleted.length) : 0;

      months.push({
        month: monthName,
        completed: monthCompleted.length,
        started,
        avgScore
      });
    }
    
    return months;
  };

  // Mapa de Conocimiento 
  const calculateKnowledgeMap = (completedExams: ExamenData[], difficultyPerf: any) => {
    // Simular análisis de temas basado en dificultades y performance
    const strongTopics = [];
    const weakTopics = [];
    
    if (difficultyPerf.easy.avgScore >= 85) strongTopics.push("Conceptos básicos");
    if (difficultyPerf.medium.avgScore >= 80) strongTopics.push("Análisis intermedio");
    if (difficultyPerf.hard.avgScore >= 75) strongTopics.push("Problemas complejos");
    if (difficultyPerf.mixed.avgScore >= 80) strongTopics.push("Aplicación integrada");
    
    if (difficultyPerf.easy.avgScore < 70) weakTopics.push("Fundamentos");
    if (difficultyPerf.medium.avgScore < 65) weakTopics.push("Lógica intermedia");
    if (difficultyPerf.hard.avgScore < 60) weakTopics.push("Resolución avanzada");
    if (difficultyPerf.mixed.avgScore < 65) weakTopics.push("Síntesis de conceptos");
    
    // Si no hay temas débiles específicos, agregar generales
    if (weakTopics.length === 0 && completedExams.length > 0) {
      const avgOverall = Object.values(difficultyPerf).reduce((acc: number, curr: any) => acc + curr.avgScore, 0) / 4;
      if (avgOverall < 80) weakTopics.push("Precisión en detalles", "Gestión del tiempo");
    }
    
    const masteredSkills = strongTopics.length * 3 + Math.floor(completedExams.length / 5);
    const inProgressSkills = Math.floor(completedExams.length / 10) + 2;
    const newSkills = Math.max(5, 15 - masteredSkills - inProgressSkills);
    
    return {
      strongTopics: strongTopics.length > 0 ? strongTopics : ["Completar más exámenes para análisis"],
      weakTopics: weakTopics.length > 0 ? weakTopics : ["Ninguna debilidad detectada"],
      masteredSkills,
      inProgressSkills,
      newSkills
    };
  };

  // Análisis de Errores Inteligente
  const calculateErrorAnalysis = (completedExams: ExamenData[]) => {
    if (completedExams.length === 0) {
      return {
        commonMistakePatterns: [],
        improvementOpportunities: ["Completa más exámenes para análisis de errores"]
      };
    }

    // Simular patrones de errores comunes basados en performance
    const totalQuestions = completedExams.reduce((acc, exam) => {
      const questions = Array.isArray(exam.datos) ? exam.datos.length : 0;
      return acc + questions;
    }, 0);

    const totalCorrect = completedExams.reduce((acc, exam) => {
      const questions = Array.isArray(exam.datos) ? exam.datos : [];
      let correctCount = 0;
      questions.forEach((pregunta) => {
        const userAnswer = exam.respuestas_usuario?.[pregunta.id - 1];
        if (userAnswer !== undefined && userAnswer === pregunta.correcta) {
          correctCount++;
        }
      });
      return acc + correctCount;
    }, 0);

    const totalErrors = totalQuestions - totalCorrect;
    const errorRate = totalQuestions > 0 ? (totalErrors / totalQuestions) * 100 : 0;

    const commonMistakePatterns = [];
    
    if (errorRate > 40) {
      commonMistakePatterns.push(
        { type: "Comprensión de enunciados", frequency: Math.floor(totalErrors * 0.3), impact: "Alto" as const },
        { type: "Aplicación de conceptos", frequency: Math.floor(totalErrors * 0.25), impact: "Alto" as const }
      );
    } else if (errorRate > 25) {
      commonMistakePatterns.push(
        { type: "Cálculos aritméticos", frequency: Math.floor(totalErrors * 0.4), impact: "Medio" as const },
        { type: "Interpretación de datos", frequency: Math.floor(totalErrors * 0.3), impact: "Medio" as const }
      );
    } else {
      commonMistakePatterns.push(
        { type: "Detalles menores", frequency: Math.floor(totalErrors * 0.5), impact: "Bajo" as const },
        { type: "Presión de tiempo", frequency: Math.floor(totalErrors * 0.3), impact: "Bajo" as const }
      );
    }

    const improvementOpportunities = [];
    if (errorRate > 30) {
      improvementOpportunities.push(
        "Revisar conceptos fundamentales",
        "Practicar más ejercicios básicos",
        "Leer enunciados con más cuidado"
      );
    } else if (errorRate > 15) {
      improvementOpportunities.push(
        "Mejorar técnicas de cálculo rápido",
        "Practicar interpretación de gráficos y tablas"
      );
    } else {
      improvementOpportunities.push(
        "Gestionar mejor el tiempo de examen",
        "Revisar respuestas antes de enviar"
      );
    }

    return { commonMistakePatterns, improvementOpportunities };
  };

  // Sistema de Gamification
  const calculateGamification = (allData: ExamenData[], completedExams: ExamenData[]) => {
    const level = Math.floor(completedExams.length / 5) + 1;
    const experiencePoints = completedExams.length * 100 + 
                           completedExams.reduce((acc, exam) => acc + calculateExamScore(exam), 0) * 10;
    
    const nextLevelProgress = ((completedExams.length % 5) / 5) * 100;
    
    const achievements = [
      {
        name: "Primer Paso",
        description: "Completa tu primer examen",
        unlocked: completedExams.length >= 1,
        icon: "🎯"
      },
      {
        name: "Persistente",
        description: "Completa 10 exámenes",
        unlocked: completedExams.length >= 10,
        icon: "💪"
      },
      {
        name: "Perfeccionista",
        description: "Obtén 100% en un examen",
        unlocked: completedExams.some(e => calculateExamScore(e) === 100),
        icon: "🏆"
      },
      {
        name: "Maratonista",
        description: "Estudia 7 días consecutivos",
        unlocked: calculateStudyStreak(allData) >= 7,
        icon: "🔥"
      },
      {
        name: "Maestro",
        description: "Promedio de 90% en 20 exámenes",
        unlocked: completedExams.length >= 20 && 
                 (completedExams.reduce((acc, e) => acc + calculateExamScore(e), 0) / completedExams.length) >= 90,
        icon: "👑"
      }
    ];

    // Calcular rachas
    const currentStreak = calculateStudyStreak(allData);
    const longestStreak = Math.max(currentStreak, Math.floor(completedExams.length / 2)); // Simulado
    const thisMonth = allData.filter(e => {
      const monthsAgo = (Date.now() - new Date(e.fecha_inicio || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsAgo <= 1;
    }).length;

    return {
      level,
      experiencePoints,
      nextLevelProgress: Math.round(nextLevelProgress),
      achievements,
      streaks: {
        current: currentStreak,
        longest: longestStreak,
        thisMonth
      }
    };
  };

  // Helper function para calcular racha de estudio
  const calculateStudyStreak = (allData: ExamenData[]): number => {
    const studyDates = [...new Set(allData.map(e => {
      const date = new Date(e.fecha_inicio || Date.now());
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }))].sort();
    
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateStr = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
      if (studyDates.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  // Sistema de Goals & Milestones
  const calculateGoals = (allData: ExamenData[], completedExams: ExamenData[]) => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = daysInMonth - now.getDate();
    
    const thisMonthExams = completedExams.filter(e => {
      const examDate = new Date(e.fecha_fin || e.fecha_inicio || Date.now());
      return examDate.getMonth() === now.getMonth() && examDate.getFullYear() === now.getFullYear();
    }).length;

    const monthlyTarget = 20; // Meta configurable
    const monthlyGoal = {
      target: monthlyTarget,
      current: thisMonthExams,
      onTrack: daysLeft === 0 ? thisMonthExams >= monthlyTarget : 
               (thisMonthExams / (daysInMonth - daysLeft)) * daysInMonth >= monthlyTarget,
      daysLeft
    };

    const yearlyGoals = [
      {
        goal: "Completar 200 exámenes",
        progress: Math.min(100, (completedExams.length / 200) * 100),
        target: 200,
        current: completedExams.length
      },
      {
        goal: "Mantener 80% de promedio",
        progress: completedExams.length > 0 ? 
          Math.min(100, ((completedExams.reduce((acc, e) => acc + calculateExamScore(e), 0) / completedExams.length) / 80) * 100) : 0,
        target: 80,
        current: completedExams.length > 0 ? 
          Math.round(completedExams.reduce((acc, e) => acc + calculateExamScore(e), 0) / completedExams.length) : 0
      },
      {
        goal: "Alcanzar nivel 15",
        progress: Math.min(100, ((Math.floor(completedExams.length / 5) + 1) / 15) * 100),
        target: 15,
        current: Math.floor(completedExams.length / 5) + 1
      }
    ];

    return { monthlyGoal, yearlyGoals };
  };

  // Generar Smart Insights
  const generateSmartInsights = (
    allData: ExamenData[], 
    completedExams: ExamenData[], 
    timeAnalytics: any, 
    difficultyPerf: any
  ) => {
    const insights = [];

    // Insight de tiempo óptimo
    if (timeAnalytics.weekdayVsWeekend.weekday > timeAnalytics.weekdayVsWeekend.weekend + 10) {
      insights.push({
        type: 'time' as const,
        message: `Tu rendimiento mejora ${timeAnalytics.weekdayVsWeekend.weekday - timeAnalytics.weekdayVsWeekend.weekend}% en días de semana`,
        action: "Programa sesiones intensivas de lunes a viernes",
        priority: 'medium' as const,
        icon: "📅"
      });
    }

    // Insight de dificultad
    const bestDifficulty = Object.entries(difficultyPerf)
      .filter(([_, data]: any) => data.count > 0)
      .sort(([_, a]: any, [__, b]: any) => b.avgScore - a.avgScore)[0];
    
    if (bestDifficulty && bestDifficulty[1].avgScore > 85) {
      insights.push({
        type: 'difficulty' as const,
        message: `Dominas exámenes de nivel ${bestDifficulty[0]} con ${bestDifficulty[1].avgScore}% de promedio`,
        action: `Intenta el siguiente nivel de dificultad para seguir creciendo`,
        priority: 'high' as const,
        icon: "🎯"
      });
    }

    // Insight de burnout
    if (timeAnalytics.burnoutRisk === 'High') {
      insights.push({
        type: 'motivation' as const,
        message: "Riesgo alto de burnout detectado - muchos exámenes recientes",
        action: "Toma un descanso de 1-2 días y vuelve con energía renovada",
        priority: 'high' as const,
        icon: "⚠️"
      });
    }

    // Insight de progreso
    if (completedExams.length >= 10) {
      const recentAvg = completedExams.slice(-5).reduce((acc, e) => acc + calculateExamScore(e), 0) / 5;
      const overallAvg = completedExams.reduce((acc, e) => acc + calculateExamScore(e), 0) / completedExams.length;
      
      if (recentAvg > overallAvg + 5) {
        insights.push({
          type: 'performance' as const,
          message: `Tu rendimiento reciente (${Math.round(recentAvg)}%) supera tu promedio histórico`,
          action: "¡Continúa con esta tendencia positiva! Estás en racha",
          priority: 'medium' as const,
          icon: "📈"
        });
      }
    }

    // Insight de racha
    if (timeAnalytics.studyStreak >= 7) {
      insights.push({
        type: 'motivation' as const,
        message: `¡Increíble! Llevas ${timeAnalytics.studyStreak} días estudiando consecutivos`,
        action: "Mantén el impulso, pero recuerda tomar descansos regulares",
        priority: 'low' as const,
        icon: "🔥"
      });
    }

    // Si no hay insights específicos, agregar uno general
    if (insights.length === 0) {
      insights.push({
        type: 'performance' as const,
        message: "Tu progreso es constante. Sigue practicando regularmente",
        action: "Considera aumentar gradualmente la dificultad de los exámenes",
        priority: 'medium' as const,
        icon: "💡"
      });
    }

    return insights.slice(0, 3); // Máximo 3 insights para no saturar
  };

  // Calcular Competency Radar
  const calculateCompetencyRadar = (completedExams: ExamenData[], timeAnalytics: any) => {
    if (completedExams.length === 0) {
      return {
        speed: 0,
        accuracy: 0,
        comprehension: 0,
        analysis: 0,
        memory: 0,
        application: 0
      };
    }

    const avgScore = completedExams.reduce((acc, e) => acc + calculateExamScore(e), 0) / completedExams.length;
    const avgTime = completedExams.reduce((acc, e) => acc + (e.tiempo_tomado_segundos || 1800), 0) / completedExams.length;
    
    // Simular métricas basadas en datos reales
    const speed = Math.min(100, Math.round(100 - ((avgTime - 600) / 50))); // Basado en tiempo vs óptimo
    const accuracy = Math.round(avgScore); // Directamente el score promedio
    const comprehension = Math.min(100, Math.round(avgScore * 0.9 + 15)); // Ligeramente mejor que accuracy
    const analysis = Math.round(avgScore * 0.8 + timeAnalytics.consistency * 0.2); // Combina score y consistencia
    const memory = Math.round(avgScore * 0.85 + (timeAnalytics.studyStreak * 2)); // Score + beneficio de estudiar regularmente
    const application = Math.round(avgScore * 0.9 + Math.random() * 10); // Score con variación

    return {
      speed: Math.max(0, Math.min(100, speed)),
      accuracy: Math.max(0, Math.min(100, accuracy)),
      comprehension: Math.max(0, Math.min(100, comprehension)),
      analysis: Math.max(0, Math.min(100, analysis)),
      memory: Math.max(0, Math.min(100, memory)),
      application: Math.max(0, Math.min(100, application))
    };
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderColor: 'var(--primary)' }}
            ></div>
            <p style={{ color: 'var(--theme-text-secondary)' }}>
              Cargando estadísticas...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <i 
            className="fas fa-exclamation-triangle text-4xl mb-4"
            style={{ color: 'var(--theme-error)' }}
          ></i>
          <p style={{ color: 'var(--theme-error-dark)' }}>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <i 
            className="fas fa-chart-bar text-3xl mr-4"
            style={{ color: 'var(--primary)' }}
          ></i>
          <div>
            <h1 
              className="text-3xl font-bold"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              Estadísticas
            </h1>
            <p 
              className="text-lg"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              Análisis detallado de tu progreso en exámenes
            </p>
          </div>
        </div>
      </div>

      {!stats || stats.total === 0 ? (
        // Estado vacío
        <div className="text-center py-12">
          <i 
            className="fas fa-chart-line text-6xl mb-4"
            style={{ color: 'var(--theme-text-muted)' }}
          ></i>
          <h3 
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            No hay datos para mostrar
          </h3>
          <p 
            className="mb-6"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            Completa algunos exámenes para ver tus estadísticas
          </p>
          <button
            onClick={() => window.location.href = '/inicio'}
            className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-md"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white'
            }}
          >
            Crear Primer Examen
          </button>
        </div>
      ) : (
        // Dashboard Enterprise - Contenido principal con estadísticas avanzadas
        <div className="space-y-8">
          {/* === HERO METRICS SECTION === */}
          <div 
            className="p-8 rounded-xl shadow-lg border"
            style={{
              background: `linear-gradient(135deg, var(--primary), var(--primary-dark))`,
              borderColor: 'var(--theme-border-primary)'
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white">
              {/* Performance Score Central */}
              <div className="lg:col-span-1 text-center">
                <div className="text-6xl font-bold mb-2">
                  {stats.performanceScore.overall}
                </div>
                <div className="text-xl font-semibold mb-1">Performance Score</div>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <span className={`flex items-center ${stats.performanceScore.trend.startsWith('+') ? 'text-green-200' : 'text-red-200'}`}>
                    <i className={`fas ${stats.performanceScore.trend.startsWith('+') ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
                    {stats.performanceScore.trend} este mes
                  </span>
                  <span className="text-blue-200">
                    Top {100 - stats.performanceScore.percentileRank}%
                  </span>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <div className="text-sm opacity-90">Completados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.performanceScore.consistency}%</div>
                  <div className="text-sm opacity-90">Consistencia</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.gamification.level}</div>
                  <div className="text-sm opacity-90">Nivel</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.timeAnalytics.studyStreak}</div>
                  <div className="text-sm opacity-90">Días seguidos</div>
                </div>
              </div>
            </div>
          </div>

          {/* === SMART INSIGHTS BANNER === */}
          {stats.smartInsights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.smartInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                    insight.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                    'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  }`}
                  style={{
                    backgroundColor: insight.priority === 'high' ? 'var(--theme-error-light)' :
                                   insight.priority === 'medium' ? 'var(--theme-warning-light)' :
                                   'var(--theme-info-light)',
                    borderLeftColor: insight.priority === 'high' ? 'var(--theme-error)' :
                                   insight.priority === 'medium' ? 'var(--theme-warning)' :
                                   'var(--theme-info)'
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <div>
                      <p 
                        className="font-semibold text-sm"
                        style={{ color: 'var(--theme-text-primary)' }}
                      >
                        {insight.message}
                      </p>
                      <p 
                        className="text-xs mt-1"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        💡 {insight.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* === MAIN ANALYTICS GRID === */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Score Evolution Timeline */}
            <div 
              className="p-6 rounded-xl shadow-md border"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)'
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4 flex items-center"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                <i className="fas fa-chart-line mr-2 text-blue-500"></i>
                Evolución de Rendimiento
              </h3>
              {stats.monthlyProgress.some(m => m.completed > 0) ? (
                <MonthlyProgressChart monthlyData={stats.monthlyProgress} />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p style={{ color: 'var(--theme-text-muted)' }}>
                    No hay datos de progreso mensual
                  </p>
                </div>
              )}
            </div>

            {/* Competency Radar */}
            <div 
              className="p-6 rounded-xl shadow-md border"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)'
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4 flex items-center"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                <i className="fas fa-spider mr-2 text-purple-500"></i>
                Radar de Competencias
              </h3>
              {stats.completed > 0 ? (
                <PerformanceRadarChart 
                  difficultyStats={stats.difficultyPerformance}
                  competencyData={stats.competencyRadar}
                />
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p style={{ color: 'var(--theme-text-muted)' }}>
                    Completa más exámenes para ver tu radar
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* === SECONDARY ANALYTICS === */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Distribution Chart */}
            <div 
              className="p-6 rounded-xl shadow-md border"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)'
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4 flex items-center"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                <i className="fas fa-chart-pie mr-2 text-green-500"></i>
                Estado de Exámenes
              </h3>
              {stats.total > 0 ? (
                <ExamDistributionChart
                  completed={stats.completed}
                  inProgress={stats.inProgress}
                  pending={stats.pending}
                  suspended={stats.suspended}
                />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p style={{ color: 'var(--theme-text-muted)' }}>
                    No hay datos suficientes
                  </p>
                </div>
              )}
            </div>

            {/* Score Distribution */}
            <div 
              className="p-6 rounded-xl shadow-md border"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)'
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4 flex items-center"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                <i className="fas fa-chart-bar mr-2 text-orange-500"></i>
                Distribución de Scores
              </h3>
              {stats.completed > 0 ? (
                <ScoreDistributionChart scoreRanges={stats.scoreDistribution} />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p style={{ color: 'var(--theme-text-muted)' }}>
                    No hay scores para mostrar
                  </p>
                </div>
              )}
            </div>

            {/* Time Analytics & Predictions */}
            <div 
              className="p-6 rounded-xl shadow-md border space-y-6"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)'
              }}
            >
              <div>
                <h3 
                  className="text-lg font-semibold mb-4 flex items-center"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  <i className="fas fa-brain mr-2 text-pink-500"></i>
                  Análisis Temporal
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--theme-text-secondary)' }} className="text-sm">
                      Mejor hora:
                    </span>
                    <span 
                      className="font-semibold"
                      style={{ color: 'var(--theme-text-primary)' }}
                    >
                      {stats.timeAnalytics.bestTimeOfDay}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--theme-text-secondary)' }} className="text-sm">
                      Duración óptima:
                    </span>
                    <span 
                      className="font-semibold"
                      style={{ color: 'var(--theme-text-primary)' }}
                    >
                      {stats.timeAnalytics.optimalDuration}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--theme-text-secondary)' }} className="text-sm">
                      Riesgo burnout:
                    </span>
                    <span 
                      className={`font-semibold ${
                        stats.timeAnalytics.burnoutRisk === 'High' ? 'text-red-500' :
                        stats.timeAnalytics.burnoutRisk === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                      }`}
                    >
                      {stats.timeAnalytics.burnoutRisk}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--theme-text-secondary)' }} className="text-sm">
                      Semana vs Fin de semana:
                    </span>
                    <span 
                      className="font-semibold text-xs"
                      style={{ color: 'var(--theme-text-primary)' }}
                    >
                      {stats.timeAnalytics.weekdayVsWeekend.weekday}% vs {stats.timeAnalytics.weekdayVsWeekend.weekend}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 
                  className="font-semibold mb-3 flex items-center text-sm"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  <i className="fas fa-crystal-ball mr-2 text-purple-500"></i>
                  Predicciones
                </h4>
                <div className="space-y-2">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--theme-bg-secondary)' }}
                  >
                    <div className="text-xs mb-1" style={{ color: 'var(--theme-text-secondary)' }}>
                      Próximo examen:
                    </div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--theme-text-primary)' }}>
                      {stats.predictions.nextExamPrediction.expectedScore}% 
                      <span className="text-xs ml-1" style={{ color: 'var(--theme-text-muted)' }}>
                        ({stats.predictions.nextExamPrediction.confidence} confianza)
                      </span>
                    </div>
                  </div>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--theme-bg-secondary)' }}
                  >
                    <div className="text-xs mb-1" style={{ color: 'var(--theme-text-secondary)' }}>
                      Nivel actual:
                    </div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--theme-text-primary)' }}>
                      {stats.predictions.readinessLevel}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* === GAMIFICATION & GOALS SECTION === */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Gamification Stats */}
            <div 
              className="p-6 rounded-xl shadow-md border"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)'
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4 flex items-center"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                <i className="fas fa-trophy mr-2 text-yellow-500"></i>
                Progreso y Logros
              </h3>
              
              {/* Level Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                    Nivel {stats.gamification.level}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                    {stats.gamification.experiencePoints.toLocaleString()} XP
                  </span>
                </div>
                <div 
                  className="w-full bg-gray-200 rounded-full h-3"
                  style={{ backgroundColor: 'var(--theme-bg-secondary)' }}
                >
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.gamification.nextLevelProgress}%`,
                      backgroundColor: 'var(--primary)'
                    }}
                  ></div>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                  {stats.gamification.nextLevelProgress}% al siguiente nivel
                </p>
              </div>

              {/* Achievements */}
              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--theme-text-primary)' }}>
                  Logros
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {stats.gamification.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                        achievement.unlocked ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-800/20'
                      }`}
                      style={{
                        borderColor: achievement.unlocked ? 'var(--theme-success)' : 'var(--theme-border-primary)',
                        backgroundColor: achievement.unlocked ? 'var(--theme-success-light)' : 'var(--theme-bg-secondary)'
                      }}
                    >
                      <div className={`text-2xl mb-1 ${achievement.unlocked ? '' : 'opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div 
                        className={`text-xs font-semibold ${achievement.unlocked ? '' : 'opacity-50'}`}
                        style={{ color: 'var(--theme-text-primary)' }}
                      >
                        {achievement.name}
                      </div>
                      <div 
                        className={`text-xs ${achievement.unlocked ? '' : 'opacity-50'}`}
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        {achievement.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Goals & Milestones */}
            <div 
              className="p-6 rounded-xl shadow-md border"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)'
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4 flex items-center"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                <i className="fas fa-bullseye mr-2 text-red-500"></i>
                Metas y Objetivos
              </h3>
              
              {/* Monthly Goal */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                    Meta mensual
                  </span>
                  <span 
                    className={`text-sm px-2 py-1 rounded ${
                      stats.goals.monthlyGoal.onTrack ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                    }`}
                    style={{
                      color: stats.goals.monthlyGoal.onTrack ? 'var(--theme-success-dark)' : 'var(--theme-error-dark)',
                      backgroundColor: stats.goals.monthlyGoal.onTrack ? 'var(--theme-success-light)' : 'var(--theme-error-light)'
                    }}
                  >
                    {stats.goals.monthlyGoal.onTrack ? 'En progreso' : 'Retrasado'}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span style={{ color: 'var(--theme-text-secondary)' }}>
                    {stats.goals.monthlyGoal.current} / {stats.goals.monthlyGoal.target} exámenes
                  </span>
                  <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                    {stats.goals.monthlyGoal.daysLeft} días restantes
                  </span>
                </div>
                <div 
                  className="w-full bg-gray-200 rounded-full h-2"
                  style={{ backgroundColor: 'var(--theme-bg-secondary)' }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (stats.goals.monthlyGoal.current / stats.goals.monthlyGoal.target) * 100)}%`,
                      backgroundColor: stats.goals.monthlyGoal.onTrack ? 'var(--theme-success)' : 'var(--theme-warning)'
                    }}
                  ></div>
                </div>
              </div>

              {/* Yearly Goals */}
              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--theme-text-primary)' }}>
                  Objetivos Anuales
                </h4>
                <div className="space-y-4">
                  {stats.goals.yearlyGoals.map((goal, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                          {goal.goal}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                          {goal.current} / {goal.target}
                        </span>
                      </div>
                      <div 
                        className="w-full bg-gray-200 rounded-full h-2"
                        style={{ backgroundColor: 'var(--theme-bg-secondary)' }}
                      >
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, goal.progress)}%`,
                            backgroundColor: goal.progress >= 100 ? 'var(--theme-success)' : 
                                           goal.progress >= 75 ? 'var(--theme-info)' : 
                                           goal.progress >= 50 ? 'var(--theme-warning)' : 'var(--theme-error)'
                          }}
                        ></div>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                        {Math.round(goal.progress)}% completado
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* === KNOWLEDGE MAP & ERROR ANALYSIS === */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Knowledge Map */}
            <div 
              className="p-6 rounded-xl shadow-md border"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)'
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4 flex items-center"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                <i className="fas fa-map mr-2 text-indigo-500"></i>
                Mapa de Conocimiento
              </h3>
              
              <div className="space-y-4">
                {/* Skills Overview */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: 'var(--theme-success)' }}
                    >
                      {stats.knowledgeMap.masteredSkills}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                      Dominadas
                    </div>
                  </div>
                  <div>
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: 'var(--theme-warning)' }}
                    >
                      {stats.knowledgeMap.inProgressSkills}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                      En progreso
                    </div>
                  </div>
                  <div>
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: 'var(--theme-info)' }}
                    >
                      {stats.knowledgeMap.newSkills}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                      Por explorar
                    </div>
                  </div>
                </div>

                {/* Strong Topics */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm" style={{ color: 'var(--theme-text-primary)' }}>
                    🎯 Fortalezas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {stats.knowledgeMap.strongTopics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: 'var(--theme-success-light)',
                          color: 'var(--theme-success-dark)'
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Weak Topics */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm" style={{ color: 'var(--theme-text-primary)' }}>
                    📈 Áreas de mejora
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {stats.knowledgeMap.weakTopics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: 'var(--theme-warning-light)',
                          color: 'var(--theme-warning-dark)'
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Analysis */}
            <div 
              className="p-6 rounded-xl shadow-md border"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)'
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4 flex items-center"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                <i className="fas fa-bug mr-2 text-red-500"></i>
                Análisis de Errores
              </h3>
              
              <div className="space-y-4">
                {/* Common Mistake Patterns */}
                {stats.errorAnalysis.commonMistakePatterns.length > 0 ? (
                  <div>
                    <h4 className="font-semibold mb-3 text-sm" style={{ color: 'var(--theme-text-primary)' }}>
                      Patrones de errores comunes
                    </h4>
                    <div className="space-y-3">
                      {stats.errorAnalysis.commonMistakePatterns.map((pattern, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <div className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                              {pattern.type}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                              {pattern.frequency} veces
                            </div>
                          </div>
                          <span 
                            className={`px-2 py-1 rounded text-xs ${
                              pattern.impact === 'Alto' ? 'bg-red-100 text-red-700' :
                              pattern.impact === 'Medio' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}
                            style={{
                              backgroundColor: pattern.impact === 'Alto' ? 'var(--theme-error-light)' :
                                             pattern.impact === 'Medio' ? 'var(--theme-warning-light)' :
                                             'var(--theme-info-light)',
                              color: pattern.impact === 'Alto' ? 'var(--theme-error-dark)' :
                                     pattern.impact === 'Medio' ? 'var(--theme-warning-dark)' :
                                     'var(--theme-info-dark)'
                            }}
                          >
                            {pattern.impact}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-check-circle text-4xl text-green-500 mb-2"></i>
                    <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                      ¡Excelente! No se detectaron patrones de errores significativos
                    </p>
                  </div>
                )}

                {/* Improvement Opportunities */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm" style={{ color: 'var(--theme-text-primary)' }}>
                    💡 Oportunidades de mejora
                  </h4>
                  <ul className="space-y-2">
                    {stats.errorAnalysis.improvementOpportunities.map((opportunity, index) => (
                      <li 
                        key={index} 
                        className="text-sm flex items-start"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        <span className="mr-2 mt-1">•</span>
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>

          {/* === LEGACY DETAILED BREAKDOWN (Simplified) === */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Exams */}
            <div 
              className="p-6 rounded-xl shadow-md transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)',
                border: '1px solid'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    Total Exámenes
                  </p>
                  <p 
                    className="text-3xl font-bold"
                    style={{ color: 'var(--theme-info-dark)' }}
                  >
                    {stats.total}
                  </p>
                </div>
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: 'var(--theme-info-light)' }}
                >
                  <i 
                    className="fas fa-clipboard-list text-xl"
                    style={{ color: 'var(--theme-info)' }}
                  ></i>
                </div>
              </div>
            </div>

            {/* Completed */}
            <div 
              className="p-6 rounded-xl shadow-md transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)',
                border: '1px solid'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    Completados
                  </p>
                  <p 
                    className="text-3xl font-bold"
                    style={{ color: 'var(--theme-success-dark)' }}
                  >
                    {stats.completed}
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% del total
                  </p>
                </div>
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: 'var(--theme-success-light)' }}
                >
                  <i 
                    className="fas fa-check-circle text-xl"
                    style={{ color: 'var(--theme-success)' }}
                  ></i>
                </div>
              </div>
            </div>

            {/* Average Score */}
            <div 
              className="p-6 rounded-xl shadow-md transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)',
                border: '1px solid'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    Promedio de Puntuación
                  </p>
                  <p 
                    className="text-3xl font-bold"
                    style={{ 
                      color: stats.averageScore >= 70 ? 'var(--theme-success-dark)' : 
                             stats.averageScore >= 40 ? 'var(--theme-warning-dark)' : 'var(--theme-error-dark)'
                    }}
                  >
                    {stats.averageScore}%
                  </p>
                </div>
                <div 
                  className="p-3 rounded-full"
                  style={{ 
                    backgroundColor: stats.averageScore >= 70 ? 'var(--theme-success-light)' : 
                                   stats.averageScore >= 40 ? 'var(--theme-warning-light)' : 'var(--theme-error-light)'
                  }}
                >
                  <i 
                    className="fas fa-trophy text-xl"
                    style={{ 
                      color: stats.averageScore >= 70 ? 'var(--theme-success)' : 
                             stats.averageScore >= 40 ? 'var(--theme-warning)' : 'var(--theme-error)'
                    }}
                  ></i>
                </div>
              </div>
            </div>

            {/* Total Time */}
            <div 
              className="p-6 rounded-xl shadow-md transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)',
                border: '1px solid'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    Tiempo Total
                  </p>
                  <p 
                    className="text-3xl font-bold"
                    style={{ color: '#6b21a8' }}
                  >
                    {stats.totalTimeMinutes}
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    minutos de estudio
                  </p>
                </div>
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: '#f3e8ff' }}
                >
                  <i 
                    className="fas fa-clock text-xl"
                    style={{ color: '#6b21a8' }}
                  ></i>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Distribution Chart */}
            <div 
              className="p-6 rounded-xl shadow-md"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)',
                border: '1px solid'
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                Distribución por Estado
              </h3>
              {stats.total > 0 ? (
                <ExamDistributionChart
                  completed={stats.completed}
                  inProgress={stats.inProgress}
                  pending={stats.pending}
                  suspended={stats.suspended}
                />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p style={{ color: 'var(--theme-text-muted)' }}>
                    No hay datos suficientes para mostrar
                  </p>
                </div>
              )}
            </div>

            {/* Monthly Progress Chart */}
            <div 
              className="p-6 rounded-xl shadow-md"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)',
                border: '1px solid'
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                Progreso Mensual
              </h3>
              {stats.monthlyProgress.some(m => m.completed > 0 || m.started > 0) ? (
                <MonthlyProgressChart monthlyData={stats.monthlyProgress} />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p style={{ color: 'var(--theme-text-muted)' }}>
                    No hay datos de progreso mensual
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Stats Table */}
          <div 
            className="p-6 rounded-xl shadow-md"
            style={{
              backgroundColor: 'var(--theme-bg-primary)',
              borderColor: 'var(--theme-border-primary)',
              border: '1px solid'
            }}
          >
            <h3 
              className="text-lg font-semibold mb-6"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              Desglose Detallado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <p 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--theme-warning-dark)' }}
                >
                  {stats.inProgress}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  En Progreso
                </p>
              </div>
              <div className="text-center">
                <p 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--theme-info-dark)' }}
                >
                  {stats.pending}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  Pendientes
                </p>
              </div>
              <div className="text-center">
                <p 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--theme-error-dark)' }}
                >
                  {stats.suspended}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  Suspendidos
                </p>
              </div>
              <div className="text-center">
                <p 
                  className="text-2xl font-bold"
                  style={{ color: '#6b21a8' }}
                >
                  {stats.pinned}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  Fijados
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}