'use server';

import * as analyticsService from '@/lib/services/services/barfer/analytics/analytics';

// Helpers for actions
async function wrapAction<T>(fn: () => Promise<T>) {
    try {
        const data = await fn();
        return { success: true, data };
    } catch (error) {
        console.error('Action error:', error);
        return { success: false, message: 'Error al procesar la solicitud' };
    }
}

// --- DATA FETCHING ACTIONS ---

export async function getAverageOrderValueAction() {
    return wrapAction(() => analyticsService.getAverageOrderValue());
}

export async function getCategorySalesAction(statusFilter?: string, limit?: number, startDate?: string, endDate?: string) {
    return wrapAction(() => analyticsService.getCategorySales(statusFilter, limit, startDate, endDate));
}

export async function getClientCategoriesStatsAction(startDate?: string, endDate?: string) {
    return wrapAction(() => analyticsService.getClientCategoriesStats(startDate, endDate));
}

export async function getClientCategorizationAction() {
    return wrapAction(() => analyticsService.getClientCategorization());
}

export async function getClientGeneralStatsAction(startDate?: string, endDate?: string) {
    return wrapAction(() => analyticsService.getClientGeneralStats(startDate, endDate));
}

export async function getClientsByCategoryAction() {
    return wrapAction(() => analyticsService.getClientsByCategory());
}

export async function getClientsPaginatedAction(page?: number, limit?: number) {
    return wrapAction(() => analyticsService.getClientsPaginated(page, limit));
}

export async function getCustomerFrequencyAction() {
    return wrapAction(() => analyticsService.getCustomerFrequency());
}

export async function getCustomerInsightsAction(startDate?: string, endDate?: string) {
    return wrapAction(() => analyticsService.getCustomerInsights(startDate, endDate));
}

export async function getDeliveryTypeStatsByMonthAction() {
    return wrapAction(() => analyticsService.getDeliveryTypeStatsByMonth());
}

export async function getOrdersByDayAction(startDate?: string, endDate?: string) {
    return wrapAction(() => analyticsService.getOrdersByDay(startDate, endDate));
}

export async function getOrdersByMonthAction() {
    return wrapAction(() => analyticsService.getOrdersByMonth());
}

export async function getPaymentMethodStatsAction(startDate?: string, endDate?: string) {
    return wrapAction(() => analyticsService.getPaymentMethodStats(startDate, endDate));
}

export async function getPaymentsByTimePeriodAction(startDate: string, endDate: string, periodType?: string) {
    return wrapAction(() => analyticsService.getPaymentsByTimePeriod(startDate, endDate, periodType));
}

export async function getProductSalesAction(statusFilter?: string, limit?: number, startDate?: string, endDate?: string) {
    return wrapAction(() => analyticsService.getProductSales(statusFilter, limit, startDate, endDate));
}

export async function getProductsByTimePeriodAction(startDate: string, endDate: string) {
    return wrapAction(() => analyticsService.getProductsByTimePeriod(startDate, endDate));
}

export async function getProductTimelineAction(startDate: string, endDate: string, productIds?: string[]) {
    return wrapAction(() => analyticsService.getProductTimeline(startDate, endDate, productIds));
}

export async function getPurchaseFrequencyAction(startDate?: string, endDate?: string) {
    return wrapAction(() => analyticsService.getPurchaseFrequency(startDate, endDate));
}

export async function getQuantityStatsByMonthAction(startDate?: string, endDate?: string, puntoEnvio?: string) {
    return wrapAction(() => analyticsService.getQuantityStatsByMonth(startDate, endDate, puntoEnvio));
}

export async function getRevenueByDayAction(startDate?: string, endDate?: string) {
    return wrapAction(() => analyticsService.getRevenueByDay(startDate, endDate));
}

export async function debugBigDogAction() {
    return { success: true, message: 'Debug no disponible en el nuevo backend NestJS.' };
}
