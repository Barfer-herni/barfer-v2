'use server';

import { apiClient } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { Survey, SurveyResponse } from '@/types/surveys';

/**
 * Obtener todas las encuestas
 */
export async function getAllSurveys(): Promise<Survey[]> {
    try {
        const surveys = await apiClient.get<Survey[]>('/surveys');
        return surveys || [];
    } catch (error) {
        console.error('Error fetching surveys:', error);
        return [];
    }
}

/**
 * Obtener una encuesta por ID
 */
export async function getSurveyById(id: string): Promise<Survey | null> {
    try {
        return await apiClient.get<Survey>(`/surveys/${id}`);
    } catch (error) {
        console.error(`Error fetching survey ${id}:`, error);
        return null;
    }
}

/**
 * Eliminar una encuesta
 */
export async function deleteSurvey(id: string): Promise<{ success: boolean; message?: string }> {
    try {
        await apiClient.delete(`/surveys/${id}`);
        revalidatePath('/admin/surveys');
        return { success: true };
    } catch (error) {
        console.error(`Error deleting survey ${id}:`, error);
        return { success: false, message: 'Error al eliminar la encuesta' };
    }
}

/**
 * Obtener respuestas de una encuesta
 */
export async function getSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
    try {
        const responses = await apiClient.get<SurveyResponse[]>(`/surveys/${surveyId}/responses`);
        return responses || [];
    } catch (error) {
        console.error(`Error fetching responses for survey ${surveyId}:`, error);
        return [];
    }
}

/**
 * Actualizar una encuesta
 */
export async function updateSurvey(id: string, data: Partial<Survey>): Promise<Survey | null> {
    try {
        const updated = await apiClient.patch<Survey>(`/surveys/${id}`, data);
        revalidatePath('/admin/surveys');
        return updated;
    } catch (error) {
        console.error(`Error updating survey ${id}:`, error);
        return null;
    }
}
/**
 * Crear una nueva encuesta
 */
export async function createSurvey(data: Omit<Survey, '_id' | 'createdAt' | 'updatedAt'>): Promise<Survey | null> {
    try {
        const created = await apiClient.post<Survey>('/surveys', data);
        revalidatePath('/admin/surveys');
        return created;
    } catch (error) {
        console.error('Error creating survey:', error);
        return null;
    }
}
