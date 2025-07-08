import { supabase } from "../../supabase.config.js";
import logger from "../utils/logger.js";

export class ExamService {
  /**
   * Crear un nuevo examen en la base de datos
   */
  static async createExam(examData) {
    try {
      const { data, error } = await supabase
        .from("examenes")
        .insert(examData)
        .select()
        .single();

      if (error) {
        logger.error('Error al crear examen en Supabase:', {
          error: error.message,
          examData: { userId: examData.user_id, titulo: examData.titulo }
        });
        throw new Error(`Error al guardar examen: ${error.message}`);
      }

      if (!data) {
        throw new Error('No se pudo crear el examen');
      }

      logger.info('Examen creado exitosamente', {
        examId: data.id,
        userId: data.user_id,
        titulo: data.titulo
      });

      return data;
    } catch (error) {
      logger.error('Error en createExam:', error.message);
      throw error;
    }
  }

  /**
   * Obtener exámenes de un usuario
   */
  static async getUserExams(userId, examId = null) {
    try {
      let query = supabase
        .from("examenes")
        .select("*")
        .eq("user_id", userId);

      if (examId) {
        query = query.eq("id", examId);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error al obtener exámenes:', {
          error: error.message,
          userId,
          examId
        });
        throw new Error(`Error al obtener exámenes: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Error en getUserExams:', error.message);
      throw error;
    }
  }

  /**
   * Verificar si un examen pertenece a un usuario
   */
  static async verifyExamOwnership(userId, examId) {
    try {
      const { data, error } = await supabase
        .from("examenes")
        .select("id, titulo, datos, respuestas_usuario, feedback")
        .eq("user_id", userId)
        .eq("id", examId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Examen no encontrado o no autorizado');
        }
        throw new Error(`Error al verificar examen: ${error.message}`);
      }

      return {
        id: data.id,
        titulo: data.titulo,
        preguntas: data.datos,
        respuestas_usuario: data.respuestas_usuario,
        feedback: data.feedback
      };
    } catch (error) {
      logger.error('Error en verifyExamOwnership:', {
        error: error.message,
        userId,
        examId
      });
      throw error;
    }
  }

  /**
   * Actualizar feedback de un examen
   */
  static async createFeedback(userId, examId, feedbackData) {
    try {
      // Verificar que el examen pertenece al usuario antes de actualizar
      await this.verifyExamOwnership(userId, examId);

      const { data, error } = await supabase
        .from("examenes")
        .update({ feedback: feedbackData })
        .eq("id", examId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        logger.error('Error al actualizar feedback:', {
          error: error.message,
          userId,
          examId
        });
        throw new Error(`Error al guardar feedback: ${error.message}`);
      }

      logger.info('Feedback actualizado exitosamente', {
        examId,
        userId
      });

      return data;
    } catch (error) {
      logger.error('Error en createFeedback:', error.message);
      throw error;
    }
  }
}