import { getPaymentMethodStats, getPaymentsByTimePeriod } from '@/lib/services/services/barfer';
import { PaymentsAnalyticsClient } from './PaymentsAnalyticsClient';

interface PaymentsAnalyticsTabProps {
    dateFilter: {
        from: Date;
        to: Date;
    };
    compareFilter?: {
        from: Date;
        to: Date;
    };
}

export async function PaymentsAnalyticsTab({ dateFilter, compareFilter }: PaymentsAnalyticsTabProps) {
    try {
        // Determinar el tipo de período basado en el rango de fechas
        const diffTime = Math.abs(dateFilter.to.getTime() - dateFilter.from.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let periodType: 'daily' | 'weekly' | 'monthly' = 'daily';
        if (diffDays <= 31) periodType = 'daily';      // Hasta un mes: por días
        else if (diffDays <= 90) periodType = 'weekly'; // Hasta 3 meses: por semanas
        else periodType = 'monthly';                     // Más de 3 meses: por meses

        // Obtener datos principales
        const [paymentStats, rawProgressData] = await Promise.all([
            getPaymentMethodStats(dateFilter.from, dateFilter.to),
            getPaymentsByTimePeriod(dateFilter.from, dateFilter.to, periodType)
        ]);
        const progressData = rawProgressData.map(d => ({ ...d, otherOrders: 0, otherRevenue: 0 }));

        // Datos del período de comparación (si está habilitado)
        let comparePaymentStats;
        let compareProgressData;
        if (compareFilter) {
            const [rawCompareStats, rawCompareProgress] = await Promise.all([
                getPaymentMethodStats(compareFilter.from, compareFilter.to),
                getPaymentsByTimePeriod(compareFilter.from, compareFilter.to, periodType)
            ]);
            comparePaymentStats = rawCompareStats;
            compareProgressData = rawCompareProgress.map(d => ({ ...d, otherOrders: 0, otherRevenue: 0 }));
        }

        return (
            <PaymentsAnalyticsClient
                paymentStats={paymentStats}
                comparePaymentStats={comparePaymentStats}
                progressData={progressData}
                compareProgressData={compareProgressData}
                isComparing={!!compareFilter}
                dateFilter={dateFilter}
                compareFilter={compareFilter}
            />
        );
    } catch (error) {
        console.error('Error loading payment analytics:', error);
        return (
            <div className="p-4 border rounded-lg">
                <p className="text-sm text-red-600">Error al cargar datos de pagos</p>
            </div>
        );
    }
} 