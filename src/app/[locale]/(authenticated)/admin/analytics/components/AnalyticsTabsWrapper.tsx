'use client';

import { Suspense, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useInitStore } from '@/stores/initStore';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

// Skeleton para carga
function AnalyticsSkeleton() {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 w-full bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

interface AnalyticsTabsWrapperProps {
    children: React.ReactNode;
    activeTab: string;
}

export function AnalyticsTabsWrapper({
    children,
    activeTab
}: AnalyticsTabsWrapperProps) {
    const { analyticsActiveTab, setAnalyticsActiveTab } = useInitStore();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Sincronizar el store con la prop activa al montar o cambiar
    useEffect(() => {
        if (activeTab !== analyticsActiveTab) {
            setAnalyticsActiveTab(activeTab);
        }
    }, [activeTab, analyticsActiveTab, setAnalyticsActiveTab]);

    const onTabChange = useCallback((value: string) => {
        setAnalyticsActiveTab(value);
        
        // Actualizar URL con el nuevo tab
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', value);
        
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [pathname, router, searchParams, setAnalyticsActiveTab]);

    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
            <div className="overflow-x-auto">
                <TabsList className="grid grid-cols-7 w-full min-w-[560px] md:min-w-0">
                    <TabsTrigger value="daily" className="text-xs md:text-sm px-1 md:px-3">Por Día</TabsTrigger>
                    <TabsTrigger value="monthly" className="text-xs md:text-sm px-1 md:px-3">Por Mes</TabsTrigger>
                    <TabsTrigger value="products" className="text-xs md:text-sm px-1 md:px-3">Productos</TabsTrigger>
                    <TabsTrigger value="categories" className="text-xs md:text-sm px-1 md:px-3">Categorías</TabsTrigger>
                    <TabsTrigger value="payments" className="text-xs md:text-sm px-1 md:px-3">Pagos</TabsTrigger>
                    <TabsTrigger value="frequency" className="text-xs md:text-sm px-1 md:px-3">Métricas</TabsTrigger>
                    <TabsTrigger value="quantity" className="text-xs md:text-sm px-1 md:px-3">Cant. Total KG</TabsTrigger>
                </TabsList>
            </div>

            <div className="space-y-4">
                <Suspense key={activeTab} fallback={<AnalyticsSkeleton />}>
                    {children}
                </Suspense>
            </div>
        </Tabs>
    );
}