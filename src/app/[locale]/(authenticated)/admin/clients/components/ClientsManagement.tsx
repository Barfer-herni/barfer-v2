'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Dictionary } from '@/config/i18n';
import type { ClientAnalytics, ClientBehaviorCategory, ClientSpendingCategory } from '@/lib/services';
import { ClientCategoryCard } from './ClientCategoryCard';
import { ClientStatsGrid } from './ClientStatsGrid';

interface ClientsManagementProps {
    analytics: ClientAnalytics;
    dictionary: Dictionary;
}

export function ClientsManagement({
    analytics,
    dictionary
}: ClientsManagementProps) {
    const [activeTab, setActiveTab] = useState('behavior');

    const spendingOrder: ClientSpendingCategory[] = ['premium', 'standard', 'basic'];

    const behaviorOrder: ClientBehaviorCategory[] = [
        'active',
        'recovered',
        'new',
        'tracking',
        'possible-inactive',
        'lost'
    ];

    const sortedSpendingCategories = [...analytics.spendingCategories].sort(
        (a, b) => spendingOrder.indexOf(a.category as ClientSpendingCategory) - spendingOrder.indexOf(b.category as ClientSpendingCategory)
    );

    const sortedBehaviorCategories = [...analytics.behaviorCategories].sort(
        (a, b) => behaviorOrder.indexOf(a.category as ClientBehaviorCategory) - behaviorOrder.indexOf(b.category as ClientBehaviorCategory)
    );

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {dictionary.app.admin.clients.title}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    {dictionary.app.admin.clients.description}
                </p>
            </div>

            {/* Stats Overview */}
            <ClientStatsGrid
                analytics={analytics}
                dictionary={dictionary}
            />

            {/* Categories Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-auto min-h-[40px] sm:h-11">
                    <TabsTrigger
                        value="behavior"
                        className="text-[10px] xs:text-xs sm:text-sm px-1 sm:px-3 py-2 leading-tight"
                    >
                        <span className="hidden xs:inline">
                            {dictionary.app.admin.clients.categories.behaviorTitle}
                        </span>
                        <span className="xs:hidden">
                            Comportamiento
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="spending"
                        className="text-[10px] xs:text-xs sm:text-sm px-1 sm:px-3 py-2 leading-tight"
                    >
                        <span className="hidden xs:inline">
                            {dictionary.app.admin.clients.categories.spendingTitle}
                        </span>
                        <span className="xs:hidden">
                            Gasto
                        </span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="behavior" className="mt-6">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {sortedBehaviorCategories.map((category) => (
                            <ClientCategoryCard
                                key={category.category}
                                category={category}
                                type="behavior"
                                dictionary={dictionary}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="spending" className="mt-6">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
                        {sortedSpendingCategories.map((category) => (
                            <ClientCategoryCard
                                key={category.category}
                                category={category}
                                type="spending"
                                dictionary={dictionary}
                            />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 