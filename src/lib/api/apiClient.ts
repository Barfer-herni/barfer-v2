import 'server-only';
import { cookies } from 'next/headers';
import { env } from '@/config/env';

const API_URL = env.API_URL;

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Get auth token from cookie
 */
async function getAuthToken(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('auth-token');
        if (!tokenCookie?.value) return null;

        const parsed = JSON.parse(tokenCookie.value);
        return parsed.access_token || null;
    } catch {
        return null;
    }
}

/**
 * Get refresh token from cookie
 */
async function getRefreshToken(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('auth-token');
        if (!tokenCookie?.value) return null;

        const parsed = JSON.parse(tokenCookie.value);
        return parsed.refresh_token || null;
    } catch {
        return null;
    }
}

/**
 * Build headers with optional auth
 */
async function buildHeaders(extraHeaders?: Record<string, string>): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...extraHeaders,
    };

    const token = await getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

/**
 * Generic fetch wrapper with error handling
 */
async function request<T = any>(
    method: string,
    path: string,
    body?: any,
    extraHeaders?: Record<string, string>,
): Promise<T> {
    const url = `${API_URL}${path}`;
    const headers = await buildHeaders(extraHeaders);

    const options: RequestInit = {
        method,
        headers,
        cache: 'no-store',
    };

    if (body !== undefined && method !== 'GET') {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    // Handle 401 - try refresh token
    if (response.status === 401) {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
            try {
                const refreshResponse = await fetch(`${API_URL}/users-gestor/refresh-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });

                if (refreshResponse.ok) {
                    const { access_token } = await refreshResponse.json();

                    // Update cookie with new access_token
                    const cookieStore = await cookies();
                    const tokenCookie = cookieStore.get('auth-token');
                    if (tokenCookie?.value) {
                        const parsed = JSON.parse(tokenCookie.value);
                        parsed.access_token = access_token;
                        cookieStore.set('auth-token', JSON.stringify(parsed), {
                            httpOnly: true,
                            path: '/',
                            secure: process.env.NODE_ENV === 'production',
                            maxAge: 60 * 60 * 24 * 30,
                            sameSite: 'lax',
                        });
                    }

                    // Retry original request with new token
                    headers['Authorization'] = `Bearer ${access_token}`;
                    const retryResponse = await fetch(url, { ...options, headers });

                    if (!retryResponse.ok) {
                        const errorBody = await retryResponse.text();
                        throw new Error(`API error ${retryResponse.status}: ${errorBody}`);
                    }

                    // Handle 204 No Content
                    if (retryResponse.status === 204) {
                        return {} as T;
                    }

                    return retryResponse.json();
                }
            } catch (refreshError) {
                // Refresh failed, throw original 401
            }
        }

        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        let errorBody: string;
        try {
            const errorJson = await response.json();
            errorBody = errorJson.message || JSON.stringify(errorJson);
        } catch {
            errorBody = await response.text();
        }
        throw new Error(`API error ${response.status}: ${errorBody}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

export const apiClient = {
    get: <T = any>(path: string, extraHeaders?: Record<string, string>) =>
        request<T>('GET', path, undefined, extraHeaders),

    post: <T = any>(path: string, body?: any, extraHeaders?: Record<string, string>) =>
        request<T>('POST', path, body, extraHeaders),

    patch: <T = any>(path: string, body?: any, extraHeaders?: Record<string, string>) =>
        request<T>('PATCH', path, body, extraHeaders),

    put: <T = any>(path: string, body?: any, extraHeaders?: Record<string, string>) =>
        request<T>('PUT', path, body, extraHeaders),

    delete: <T = any>(path: string, extraHeaders?: Record<string, string>) =>
        request<T>('DELETE', path, undefined, extraHeaders),
};
