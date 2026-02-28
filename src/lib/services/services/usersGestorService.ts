'use server';

import { apiClient } from '@/lib/api';

export type UserRole = 'admin' | 'user';

export interface UserGestor {
    _id?: string;
    id: string;
    email: string;
    name: string;
    lastName: string;
    role: UserRole;
    password?: string;
    permissions: string[];
    puntoEnvio?: string | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface UserGestorCreateInput {
    email: string;
    name: string;
    lastName: string;
    role: UserRole;
    password: string;
    permissions?: string[];
    puntoEnvio?: string | string[];
}

export interface UserGestorUpdateInput {
    email?: string;
    name?: string;
    lastName?: string;
    role?: UserRole;
    password?: string;
    permissions?: string[];
    puntoEnvio?: string | string[];
}

/**
 * Crear un nuevo usuario
 */
export async function createUserGestor(data: UserGestorCreateInput): Promise<{
    success: boolean;
    user?: UserGestor;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/users-gestor', data);

        if (result.success === false) {
            return {
                success: false,
                message: result.message || 'Error al crear el usuario',
                error: 'CREATE_FAILED',
            };
        }

        const user = result.user || result;
        return {
            success: true,
            user: {
                _id: user._id || user.id,
                id: user.id || user._id,
                email: user.email,
                name: user.name,
                lastName: user.lastName,
                role: user.role,
                permissions: Array.isArray(user.permissions) ? user.permissions : [],
                puntoEnvio: user.puntoEnvio || undefined,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        };
    } catch (error) {
        console.error('Error al crear usuario:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error interno del servidor al crear el usuario',
            error: 'SERVER_ERROR',
        };
    }
}

/**
 * Obtener un usuario por ID
 */
export async function getUserGestorById(userId: string): Promise<UserGestor | null> {
    try {
        const user = await apiClient.get(`/users-gestor/${userId}`);

        if (!user) return null;

        return {
            _id: user._id || user.id,
            id: user.id || user._id,
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            role: user.role,
            permissions: Array.isArray(user.permissions) ? user.permissions : [],
            puntoEnvio: user.puntoEnvio || undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        return null;
    }
}

/**
 * Obtener todos los usuarios excluyendo al usuario actual
 */
export async function getAllUsersGestor(excludeUserId?: string): Promise<UserGestor[]> {
    try {
        const query = excludeUserId ? `?exclude=${excludeUserId}` : '';
        const users = await apiClient.get<any[]>(`/users-gestor${query}`);

        return (users || []).map(user => ({
            _id: user._id || user.id,
            id: user.id || user._id,
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            role: user.role,
            permissions: Array.isArray(user.permissions) ? user.permissions : [],
            puntoEnvio: user.puntoEnvio || undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return [];
    }
}

/**
 * Actualizar un usuario existente
 */
export async function updateUserGestor(
    userId: string,
    data: UserGestorUpdateInput
): Promise<UserGestor | null> {
    try {
        const user = await apiClient.patch(`/users-gestor/${userId}`, data);

        if (!user) return null;

        return {
            _id: user._id || user.id,
            id: user.id || user._id,
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            role: user.role,
            permissions: Array.isArray(user.permissions) ? user.permissions : [],
            puntoEnvio: user.puntoEnvio || undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return null;
    }
}

/**
 * Eliminar un usuario
 */
export async function deleteUserGestor(userId: string): Promise<{
    success: boolean;
    message?: string;
}> {
    try {
        const result = await apiClient.delete(`/users-gestor/${userId}`);
        return { success: result.success !== false };
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return {
            success: false,
            message: 'Error al eliminar el usuario',
        };
    }
}

/**
 * Verificar credenciales de usuario con hash
 */
export async function verifyUserGestorCredentials(
    email: string,
    password: string
): Promise<{
    success: boolean;
    user?: {
        id: string;
        email: string;
        name: string;
        lastName: string;
        role: UserRole;
    };
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/users-gestor/verify', { email, password });
        return result;
    } catch (error) {
        console.error('Error al verificar credenciales:', error);
        return {
            success: false,
            message: 'Error interno del servidor al verificar credenciales',
            error: 'SERVER_ERROR',
        };
    }
}

/**
 * Cambiar contrasena de un usuario
 */
export async function changeUserGestorPassword(
    userId: string,
    currentPassword: string,
    newPassword: string
): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.patch(`/users-gestor/${userId}/change-password`, {
            currentPassword,
            newPassword,
        });
        return {
            success: result.success !== false,
            message: result.message || 'Contrasena actualizada exitosamente',
        };
    } catch (error) {
        console.error('Error al cambiar contrasena:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR',
        };
    }
}
