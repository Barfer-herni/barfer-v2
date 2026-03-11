import { getDictionary } from '@/config/i18n';
import type { Locale } from '@/config/i18n';
import { ExpressPageClient } from './components/ExpressPageClient';
import { getAllPuntosEnvioAction } from './actions';
import { getCurrentUserWithPermissions, requirePermission } from '@/lib/auth/server-permissions';

export default async function GestionEnvioExpressStockPage({
    params,
}: {
    params: Promise<{ locale: Locale }>;
}) {
    const { locale } = await params;

    // Verificar permiso de acceso
    await requirePermission('stock:view');

    const dictionary = await getDictionary(locale);
    const puntosEnvioResult = await getAllPuntosEnvioAction();
    const puntosEnvio = puntosEnvioResult.success ? (puntosEnvioResult.puntosEnvio || []) : [];

    // Obtener permisos del usuario
    const userWithPermissions = await getCurrentUserWithPermissions();
    const isAdmin = userWithPermissions?.isAdmin || false;
    const canEdit = isAdmin || userWithPermissions?.permissions.includes('stock:edit') || false;
    const canDelete = isAdmin || userWithPermissions?.permissions.includes('stock:delete') || false;

    // Obtener los puntos de envío asignados al usuario como array de strings
    const rawUserPuntosEnvio: string[] = !isAdmin && userWithPermissions?.puntoEnvio
        ? (Array.isArray(userWithPermissions.puntoEnvio)
            ? userWithPermissions.puntoEnvio
            : [userWithPermissions.puntoEnvio])
        : [];

    // Filtrar puntos de envío: si no es admin, solo mostrar los asignados al usuario
    let filteredPuntosEnvio = puntosEnvio;
    if (!isAdmin && rawUserPuntosEnvio.length > 0) {
        // Normalizar nombres para comparación (trim y case-insensitive)
        const normalizedUserPuntos = rawUserPuntosEnvio.map(p => (p || '').trim().toUpperCase());

        filteredPuntosEnvio = puntosEnvio.filter(p => {
            if (!p.nombre) return false;
            const puntoNombreNormalized = p.nombre.trim().toUpperCase();
            return normalizedUserPuntos.includes(puntoNombreNormalized);
        });

        // Fallback: si no se encontró ningún punto en la DB que coincida con los asignados al usuario,
        // crear objetos sintéticos para que el select al menos muestre las opciones del usuario.
        if (filteredPuntosEnvio.length === 0) {
            filteredPuntosEnvio = rawUserPuntosEnvio.map(nombre => ({
                _id: nombre, // usar el nombre como ID sintético
                nombre,
                cutoffTime: undefined,
                createdAt: '',
                updatedAt: '',
            }));
        }
    } else if (!isAdmin) {
        // Si no es admin y no tiene punto de envío asignado, mostrar array vacío
        filteredPuntosEnvio = [];
    }

    return (
        <ExpressPageClient
            dictionary={dictionary}
            initialPuntosEnvio={filteredPuntosEnvio}
            userPuntosEnvio={rawUserPuntosEnvio}
            canEdit={canEdit}
            canDelete={canDelete}
            isAdmin={isAdmin}
        />
    );
}

