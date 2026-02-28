interface QuantityAnalyticsTabProps {
    dateFilter: {
        from: Date;
        to: Date;
    };
    compareFilter?: {
        from: Date;
        to: Date;
    };
    selectedYear?: number;
}

export async function QuantityAnalyticsTab({ dateFilter, compareFilter, selectedYear }: QuantityAnalyticsTabProps) {
    return (
        <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">
                Servicio no disponible - migrando a backend API
            </p>
        </div>
    );
}
