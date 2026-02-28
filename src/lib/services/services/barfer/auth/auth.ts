'use server';

import { cookies } from 'next/headers';
import { createUser, getUserById } from '../users/users';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { env } from '@/config/env';

const API_URL = env.API_URL;


// Tipos de permisos disponibles
type Permission =
    // Analytics
    | 'analytics:view'
    | 'analytics:export'
    // Users
    | 'users:view'
    | 'users:create'
    | 'users:edit'
    | 'users:delete'
    // Account
    | 'account:view_own'
    | 'account:edit_own'
    | 'account:change_password'
    | 'account:manage_users'
    // Admin
    | 'admin:full_access'
    | 'admin:system_settings'
    // Clients
    | 'clients:view'
    | 'clients:create'
    | 'clients:edit'
    | 'clients:delete'
    | 'clients:view_analytics'
    | 'clients:send_email'
    | 'clients:send_whatsapp'
    // Table
    | 'table:view'
    | 'table:export'
    | 'table:delete'
    | 'table:edit'
    // Balance
    | 'balance:view'
    | 'balance:export'
    // Prices
    | 'prices:view'
    | 'prices:edit'
    // Balance  
    | 'balance:view'
    | 'balance:export'
    // Outputs/Salidas
    | 'outputs:view'
    | 'outputs:export'
    | 'outputs:create'
    | 'outputs:edit'
    | 'outputs:delete'
    | 'outputs:view_statistics'
    // Permisos dinámicos por categoría (se generan automáticamente)
    | 'outputs:view_all_categories'
    | `outputs:view_category:${string}`
    // Mayoristas/Puntos de Venta
    | 'mayoristas:view'
    | 'mayoristas:create'
    | 'mayoristas:edit'
    | 'mayoristas:delete'
    | 'mayoristas:view_statistics'
    | 'mayoristas:view_matrix'
    // Express
    | 'express:view'
    | 'express:create'
    | 'express:edit'
    | 'express:delete'

// Permisos por defecto para admins (siempre tienen todos)
const ADMIN_PERMISSIONS: Permission[] = [
    'analytics:view',
    'analytics:export',
    'users:view',
    'users:create',
    'users:edit',
    'users:delete',
    'account:view_own',
    'account:edit_own',
    'account:change_password',
    'account:manage_users',
    'admin:full_access',
    'admin:system_settings',
    'clients:view',
    'clients:create',
    'clients:edit',
    'clients:delete',
    'clients:view_analytics',
    'clients:send_email',
    'clients:send_whatsapp',
    'table:view',
    'table:export',
    'table:delete',
    'table:edit',
    'balance:view',
    'balance:export',
    'prices:view',
    'prices:edit',
    'outputs:view',
    'outputs:export',
    'outputs:create',
    'outputs:edit',
    'outputs:delete',
    'outputs:view_statistics',
    'outputs:view_all_categories',
    'mayoristas:view',
    'mayoristas:create',
    'mayoristas:edit',
    'mayoristas:delete',
    'mayoristas:view_statistics',
    'mayoristas:view_matrix',
    'express:view',
    'express:create',
    'express:edit',
    'express:delete',
];



// Cookie expiration (30 days in seconds)
const COOKIE_EXPIRATION = 60 * 60 * 24 * 30;

/**
 * Establecer cookie de manera compatible con Next.js 15
 */
async function setCookie(name: string, value: string, options?: Partial<ResponseCookie>) {
    try {
        const cookieStore = await cookies();

        cookieStore.set(name, value, {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: COOKIE_EXPIRATION,
            sameSite: 'lax',
            ...options,
        });
    } catch (error) {
    }
}

/**
 * Sign in a user with email and password via backend API
 */
export async function signIn({ email, password }: { email: string; password: string }) {
    try {
        // Call backend login endpoint
        const response = await fetch(`${API_URL}/users-gestor/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                message: errorData.message || 'Credenciales inválidas',
            };
        }

        const { access_token, refresh_token, user } = await response.json();

        // Create session token with all needed data for the middleware
        const token = JSON.stringify({
            id: user.id,
            email: user.email,
            role: user.role.toLowerCase(),
            permissions: Array.isArray(user.permissions) ? user.permissions : [],
            puntoEnvio: user.puntoEnvio,
            access_token,
            refresh_token,
        });

        // Establecer cookie
        await setCookie('auth-token', token);

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        };
    } catch (error) {
        return { success: false, message: 'Error al iniciar sesión' };
    }
}

/**
 * Sign up a new user
 */
export async function signUp(data: {
    name: string;
    lastName: string;
    email: string;
    password: string;
}) {
    try {
        // Create new user
        const result = await createUser({
            name: data.name,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            role: 'admin', // Primeros usuarios como admin para setup inicial
        });

        // Check if user creation failed
        if (!result.success || !result.user) {
            return {
                success: false,
                message: result.message || 'Error al crear usuario',
                error: result.error || 'USER_CREATION_FAILED'
            };
        }

        const user = result.user;

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error inesperado al crear la cuenta',
            error: 'UNEXPECTED_ERROR'
        };
    }
}

/**
 * Sign out the current user
 */
export async function signOut() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('auth-token');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Error al cerrar sesión' };
    }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('auth-token');

        if (!tokenCookie || !tokenCookie.value || tokenCookie.value.trim() === '') {
            return null;
        }

        try {
            const token = JSON.parse(tokenCookie.value);

            if (!token || !token.id) {
                return null;
            }

            // Try to get user from backend API
            try {
                const response = await fetch(`${API_URL}/users-gestor/${token.id}`, {
                    headers: token.access_token
                        ? { 'Authorization': `Bearer ${token.access_token}` }
                        : {},
                    cache: 'no-store',
                });

                if (response.ok) {
                    const user = await response.json();
                    return {
                        id: user.id || user._id,
                        name: user.name,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                        permissions: Array.isArray(user.permissions) ? user.permissions : [],
                        puntoEnvio: user.puntoEnvio,
                    };
                }
            } catch {
                // If API call fails, use data from cookie
            }

            // Fallback: use cookie data
            return {
                id: token.id,
                name: '',
                lastName: '',
                email: token.email || '',
                role: token.role || '',
                permissions: Array.isArray(token.permissions) ? token.permissions : [],
                puntoEnvio: token.puntoEnvio,
            };
        } catch (parseError) {
            return null;
        }
    } catch (error) {
        return null;
    }
}

/**
 * Get only the current user ID from cookies
 * Useful for CRUD operations that need the creator ID
 */
export async function getCurrentUserId(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('auth-token');

        if (!tokenCookie || !tokenCookie.value || tokenCookie.value.trim() === '') {
            return null;
        }

        try {
            const token = JSON.parse(tokenCookie.value);
            return token.id || null;
        } catch (parseError) {
            return null;
        }
    } catch (error) {
        return null;
    }
}

export async function getCurrentUserWithPermissions() {
    const user = await getCurrentUser();
    if (!user) {
        return null;
    }

    const isAdmin = user.role.toLowerCase() === 'admin';
    const isUser = user.role.toLowerCase() === 'user';

    // Si es admin, tiene todos los permisos siempre
    if (isAdmin) {
        return {
            ...user,
            permissions: ADMIN_PERMISSIONS,
            isAdmin: true,
            isUser: false,
        };
    }

    // Si es usuario normal, usar sus permisos personalizados
    if (isUser) {
        return {
            ...user,
            permissions: user.permissions, // Usar permisos del usuario desde la BD
            isAdmin: false,
            isUser: true,
        };
    }

    // Rol desconocido - sin permisos
    return {
        ...user,
        permissions: [],
        isAdmin: false,
        isUser: true,
    };
}

export async function isAdmin(): Promise<boolean> {
    const userWithPermissions = await getCurrentUserWithPermissions();
    return userWithPermissions?.isAdmin || false;
}

export async function canViewSalidaCategory(categoryName: string): Promise<boolean> {
    const userWithPermissions = await getCurrentUserWithPermissions();
    if (!userWithPermissions) {
        return false;
    }

    // Log temporal para debug
    console.log(`🔍 Verificando categoría "${categoryName}" para usuario ${userWithPermissions.name}`);
    console.log(`  Permisos: ${userWithPermissions.permissions.join(', ')}`);

    // Los admins pueden ver todo
    if (userWithPermissions.isAdmin) {
        console.log(`  ✅ Admin - puede ver todo`);
        return true;
    }

    // Verificar si tiene el permiso general para ver todas las categorías
    if (userWithPermissions.permissions.includes('outputs:view_all_categories')) {
        console.log(`  ✅ Tiene permiso para ver todas las categorías`);
        return true;
    }

    // Verificar permisos específicos por categoría
    const categoryPermission = `outputs:view_category:${categoryName.toUpperCase()}`;
    if (userWithPermissions.permissions.includes(categoryPermission)) {
        console.log(`  ✅ Tiene permiso específico: ${categoryPermission}`);
        return true;
    }

    // Si no tiene permisos específicos para esta categoría, no puede verla
    console.log(`  ❌ No tiene permisos para esta categoría`);
    return false;
}