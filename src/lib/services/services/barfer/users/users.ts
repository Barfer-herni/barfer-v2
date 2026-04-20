'use server';

import { apiClient } from '@/lib/api';
import { revalidatePath } from 'next/cache';

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

// Re-export types for compatibility if needed
export type UserData = any; // For backward compatibility with userService.ts
export type UserFormData = any; // For backward compatibility with userService.ts

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
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR',
        };
    }
}

// Wrappers for compatibility with userService.ts

export async function createUser(data: any) {
    return await createUserGestor(data);
}

export async function getUserById(userId: string) {
    return await getUserGestorById(userId);
}

export async function getAllUsers(excludeUserId?: string) {
    return await getAllUsersGestor(excludeUserId);
}

export async function updateUser(userId: string, data: any) {
    const user = await updateUserGestor(userId, data);
    if (user) {
        revalidatePath('/admin/account');
    }
    return user;
}

export async function deleteUser(userId: string) {
    const result = await deleteUserGestor(userId);
    if (result.success) {
        revalidatePath('/admin/account');
    }
    return result;
}

export async function verifyUserCredentials(email: string, password: string) {
    return await verifyUserGestorCredentials(email, password);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
    return await changeUserGestorPassword(userId, currentPassword, newPassword);
}




export async function getClientAnalytics() {
    return await apiClient.get('/users/analytics');
}


// ESTADISTICAS

export async function getClientsNew() {
    return await apiClient.get('/users/clients-new');
}

export async function getClientsActive() {
    return await apiClient.get('/users/clients-active');
}

export async function getClientsInactive() {
    return await apiClient.get('/users/clients-inactive');
}

export async function getClientsRecovered() {
    return await apiClient.get('/users/clients-recovered');
}

export async function getClientsLost() {
    return await apiClient.get('/users/clients-lost');
}

export async function getClientsUnderFollowUp() {
    return await apiClient.get('/users/clients-under-follow-up');
}

export async function getClientsForWhatsapp(params?: {
    category?: string;
    type?: string;
    page?: number;
    limit?: number;
}): Promise<{
    clients: {
        id: string;
        email: string;
        name: string;
        phone: string | null;
        orderCount: number;
        lastOrderDate: string | null;
        behaviorCategory: string;
        spendingCategory: string;
    }[];
    pagination: {
        totalCount: number;
        totalPages: number;
        currentPage: number;
        hasMore: boolean;
    };
}> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.set('category', params.category);
    if (params?.type) queryParams.set('type', params.type);
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));
    const qs = queryParams.toString();
    return await apiClient.get(`/users/clients-for-whatsapp${qs ? `?${qs}` : ''}`);
}