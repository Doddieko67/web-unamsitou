// Branded types for better type safety
export type ExamId = string & { readonly __brand: 'ExamId' };
export type UserId = string & { readonly __brand: 'UserId' };
export type QuestionId = number & { readonly __brand: 'QuestionId' };
export type AnswerIndex = number & { readonly __brand: 'AnswerIndex' };

// Exam states with discriminated unions
export type ExamStatus = 
  | { status: 'pending'; startTime: null }
  | { status: 'in_progress'; startTime: Date; timeSpent: number }
  | { status: 'completed'; endTime: Date; score?: number }
  | { status: 'suspended'; lastActivity: Date };

// Question interface with strict typing
export interface Question {
  readonly id?: QuestionId;
  readonly pregunta: string;
  readonly opciones?: readonly string[];
  readonly correcta?: AnswerIndex;
  readonly respuesta?: AnswerIndex;
  readonly feedback?: string;
}

// Exam data interface
export interface ExamData {
  readonly id: ExamId;
  readonly user_id: UserId;
  readonly titulo: string;
  readonly dificultad: 'facil' | 'medio' | 'dificil';
  readonly estado: 'pendiente' | 'en_progreso' | 'terminado' | 'suspendido';
  readonly numero_preguntas: number;
  readonly datos: readonly Question[];
  readonly fecha_inicio: string | null;
  readonly tiempo_limite_segundos: number;
  readonly tiempo_tomado_segundos?: number;
  readonly respuestas_usuario?: Readonly<Record<number, AnswerIndex>>;
  readonly descripcion: string;
  readonly questions_pinned?: Readonly<Record<number, boolean>>;
  readonly feedback?: Readonly<Record<number, string>>;
}

// Answer map type
export type AnswerMap = ReadonlyMap<QuestionId, AnswerIndex>;
export type PinnedMap = ReadonlyMap<QuestionId, boolean>;
export type FeedbackMap = ReadonlyMap<QuestionId, string>;

// Exam configuration
export interface ExamConfig {
  readonly timeLimit: number;
  readonly allowReview: boolean;
  readonly showResults: boolean;
  readonly shuffleQuestions: boolean;
  readonly shuffleAnswers: boolean;
}

// Exam session interface
export interface ExamSession {
  readonly examId: ExamId;
  readonly userId: UserId;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly timeSpent: number;
  readonly currentQuestionIndex: number;
  readonly answers: AnswerMap;
  readonly pinnedQuestions: PinnedMap;
  readonly isSubmitted: boolean;
  readonly config: ExamConfig;
}

// API response types
export interface ExamApiResponse {
  data: ExamData | null;
  error: string | null;
  loading: boolean;
}

// Error types
export class ExamError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ExamError';
  }

  get isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR' || this.code === 'TIMEOUT';
  }

  get isRecoverable(): boolean {
    return this.isNetworkError || this.code === 'TEMPORARY_ERROR';
  }
}

// Helper functions for type creation
export const createExamId = (id: string): ExamId => id as ExamId;
export const createUserId = (id: string): UserId => id as UserId;
export const createQuestionId = (id: number): QuestionId => id as QuestionId;
export const createAnswerIndex = (index: number): AnswerIndex => index as AnswerIndex;