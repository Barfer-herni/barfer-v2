import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Repeat, ShoppingCart } from 'lucide-react';
import type { Dictionary } from '@/config/i18n';

// TODO: Migrar a backend API

interface ClientStatsServerProps {
    dictionary: Dictionary;
}

/**
 * Componente Server que obtiene y muestra las estadísticas generales de clientes
 * Actualmente deshabilitado - migrando a backend API
 */
export async function ClientStatsServer({ dictionary }: ClientStatsServerProps) {
    const statsData = [
        {
            title: dictionary.app.admin.clients.stats.totalClients,
            value: '-',
            icon: Users,
            description: "Migrando a backend API",
            color: "text-blue-600"
        },
        {
            title: dictionary.app.admin.clients.stats.averageSpending,
            value: '-',
            icon: DollarSign,
            description: "Migrando a backend API",
            color: "text-green-600"
        },
        {
            title: dictionary.app.admin.clients.stats.repeatRate,
            value: '-',
            icon: Repeat,
            description: "Migrando a backend API",
            color: "text-purple-600"
        },
        {
            title: dictionary.app.admin.clients.stats.averageOrders,
            value: '-',
            icon: ShoppingCart,
            description: "Migrando a backend API",
            color: "text-orange-600"
        }
    ];

    return (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
            {statsData.map((stat, index) => {
                const Icon = stat.icon;

                return (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] xs:text-xs sm:text-sm font-medium text-muted-foreground truncate">
                                {stat.title}
                            </CardTitle>
                            <Icon className={`h-3 xs:h-4 w-3 xs:w-4 flex-shrink-0 ${stat.color}`} />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-sm xs:text-lg sm:text-2xl font-bold truncate">{stat.value}</div>
                            <p className="text-[10px] xs:text-xs text-muted-foreground mt-1 leading-tight">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
} 