import { getPaymentMethodStatsAction, getPaymentsByTimePeriodAction } from '../../actions';
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
        const [paymentStatsResp, progressResp] = await Promise.all([
            getPaymentMethodStatsAction(dateFilter.from.toISOString(), dateFilter.to.toISOString()),
            getPaymentsByTimePeriodAction(dateFilter.from.toISOString(), dateFilter.to.toISOString(), periodType)
        ]);
        const progressData = (progressResp.success ? progressResp.data : []).map((d: any) => ({ ...d, otherOrders: 0, otherRevenue: 0 }));

        // Datos del período de comparación (si está habilitado)
        let comparePaymentStats;
        let compareProgressData;
        if (compareFilter) {
            const [compStatsResp, compProgressResp] = await Promise.all([
                getPaymentMethodStatsAction(compareFilter.from.toISOString(), compareFilter.to.toISOString()),
                getPaymentsByTimePeriodAction(compareFilter.from.toISOString(), compareFilter.to.toISOString(), periodType)
            ]);
            comparePaymentStats = compStatsResp.success ? compStatsResp.data : [];
            compareProgressData = (compProgressResp.success ? compProgressResp.data : []).map((d: any) => ({ ...d, otherOrders: 0, otherRevenue: 0 }));
        }

        return (
            <PaymentsAnalyticsClient
                paymentStats={paymentStatsResp.success ? paymentStatsResp.data : []}
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
