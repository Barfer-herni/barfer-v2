'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientCategoryCard } from './ClientCategoryCard';
import type { Dictionary } from '@/config/i18n';
import type { ClientCategoryStats, ClientBehaviorCategory, ClientSpendingCategory } from '@/lib/services';

interface ClientCategoriesServerProps {
    behaviorCategories: ClientCategoryStats[];
    spendingCategories: ClientCategoryStats[];
    dictionary: Dictionary;
    canSendEmail?: boolean;
    canSendWhatsApp?: boolean;
}

export function ClientCategoriesServer({
    behaviorCategories,
    spendingCategories,
    dictionary,
    canSendEmail = false,
    canSendWhatsApp = false
}: ClientCategoriesServerProps) {
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

    const sortedSpendingCategories = [...spendingCategories].sort(
        (a, b) => spendingOrder.indexOf(a.category as ClientSpendingCategory) - spendingOrder.indexOf(b.category as ClientSpendingCategory)
    );

    const sortedBehaviorCategories = [...behaviorCategories].sort(
        (a, b) => behaviorOrder.indexOf(a.category as ClientBehaviorCategory) - behaviorOrder.indexOf(b.category as ClientBehaviorCategory)
    );

    return (
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

            <TabsContent value="behavior" className="mt-6 space-y-8">
                {/* Section 1: Nuevos Clientes */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold tracking-tight">
                        {dictionary.app.admin.clients.categories.sections?.newClients || 'Nuevos Clientes'}
                    </h2>
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {['new', 'tracking', 'recompra', 'no-recompra'].map((catKey) => {
                            const category = behaviorCategories.find(c => c.category === catKey);
                            if (!category) return null;
                            return (
                                <ClientCategoryCard
                                    key={category.category}
                                    category={category}
                                    type="behavior"
                                    dictionary={dictionary}
                                    canSendEmail={canSendEmail}
                                    canSendWhatsApp={canSendWhatsApp}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Section 2: Clientes Recurrentes */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold tracking-tight">
                        {dictionary.app.admin.clients.categories.sections?.recurringClients || 'Clientes Recurrentes'}
                    </h2>
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {['active', 'possible-inactive', 'lost', 'recovered'].map((catKey) => {
                            const category = behaviorCategories.find(c => c.category === catKey);
                            if (!category) return null;
                            return (
                                <ClientCategoryCard
                                    key={category.category}
                                    category={category}
                                    type="behavior"
                                    dictionary={dictionary}
                                    canSendEmail={canSendEmail}
                                    canSendWhatsApp={canSendWhatsApp}
                                />
                            );
                        })}
                    </div>
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
                            canSendEmail={canSendEmail}
                            canSendWhatsApp={canSendWhatsApp}
                        />
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    );
} 