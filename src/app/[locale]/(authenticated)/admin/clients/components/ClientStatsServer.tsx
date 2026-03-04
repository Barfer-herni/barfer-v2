import { getClientAnalyticsAction } from '../actions';
import { ClientStatsGrid } from './ClientStatsGrid';
import type { Dictionary } from '@/config/i18n';

interface ClientStatsServerProps {
    dictionary: Dictionary;
}

/**
 * Componente Server que obtiene y muestra las estadísticas generales de clientes
 */
export async function ClientStatsServer({ dictionary }: ClientStatsServerProps) {
    const result = await getClientAnalyticsAction();

    if (!result.success || !result.data) {
        return (
            <div className="p-6 border rounded-lg bg-red-50 text-red-600">
                <p className="text-sm text-center">
                    Error al cargar las estadísticas: {result.error || 'Datos no disponibles'}
                </p>
            </div>
        );
    }

    return (
        <ClientStatsGrid
            analytics={result.data}
            dictionary={dictionary}
        />
    );
}
