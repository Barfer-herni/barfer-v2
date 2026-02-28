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
    return (
        <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">
                Servicio no disponible - migrando a backend API
            </p>
        </div>
    );
}
