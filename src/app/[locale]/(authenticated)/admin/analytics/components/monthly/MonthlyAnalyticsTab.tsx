interface MonthlyAnalyticsTabProps {
    dateFilter: {
        from: Date;
        to: Date;
    };
    compareFilter?: {
        from: Date;
        to: Date;
    };
}

export async function MonthlyAnalyticsTab({ dateFilter, compareFilter }: MonthlyAnalyticsTabProps) {
    return (
        <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">
                Servicio no disponible - migrando a backend API
            </p>
        </div>
    );
}
