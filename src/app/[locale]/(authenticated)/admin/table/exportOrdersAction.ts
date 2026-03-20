'use server';

import { getOrders } from '@/lib/services/services/barfer';
import * as XLSX from 'xlsx';
import { mapDBProductToSelectOption, normalizeScheduleTime, formatPhoneNumber } from './helpers';

interface ExportParams {
    search?: string;
    from?: string;
    to?: string;
    orderType?: string;
}

export async function exportOrdersAction({
    search = '',
    from = '',
    to = '',
    orderType = '',
}: ExportParams): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
        const { orders } = await getOrders({
            pageIndex: 0,
            pageSize: 10000,
            search: search || '',
            sorting: [{ id: 'deliveryDay', desc: true }],
            from: from && from.trim() !== '' ? from : undefined,
            to: to && to.trim() !== '' ? to : undefined,
            orderType:
                orderType && orderType.trim() !== '' && orderType !== 'all'
                    ? orderType
                    : undefined,
        });

        if (orders.length === 0) {
            return {
                success: false,
                error: 'No se encontraron órdenes para exportar con los filtros seleccionados.',
            };
        }

        if (orders.length === 10000) {
            console.warn(
                'Se alcanzó el límite de 10,000 órdenes para la exportación. Considera usar filtros más específicos.'
            );
        }

        // Extraer solo el rango horario sin el día de la semana
        const extractTimeOnly = (schedule: string): string => {
            if (!schedule) return 'N/A';

            const normalizedSchedule = normalizeScheduleTime(schedule);

            const timePattern =
                /(?:de\s+)?(\d{1,2}:\d{2}hs?\s+a\s+\d{1,2}:\d{2}hs?\s+aprox)/i;
            const match = normalizedSchedule.match(timePattern);
            if (match) return match[1];

            const fallbackPattern = /(\d{1,2}:\d{2}hs?\s+a\s+\d{1,2}:\d{2}hs?)/i;
            const fallbackMatch = normalizedSchedule.match(fallbackPattern);
            if (fallbackMatch) return fallbackMatch[1] + ' aprox';

            return normalizedSchedule;
        };

        // Formatear notas incluyendo información de dirección adicional
        const formatNotes = (order: any): string => {
            const notes = order.notes || '';
            const address = order.address;

            if (!address) return notes || 'N/A';

            const parts: string[] = [];

            if (address.reference) parts.push(address.reference);

            if (address.floorNumber || address.departmentNumber) {
                const floorDept = [address.floorNumber, address.departmentNumber]
                    .filter(Boolean)
                    .join(' ');
                if (floorDept) parts.push(floorDept);
            }

            if (address.betweenStreets) parts.push(`Entre calles: ${address.betweenStreets}`);

            const addressInfo = parts.join(' / ');
            const allNotes = [notes, addressInfo].filter(Boolean).join(' / ');

            return allNotes || 'N/A';
        };

        // Mapear órdenes al formato de exportación
        const dataToExport = orders.map((order: any) => ({
            'Fecha Entrega': order.deliveryDay
                ? new Date(order.deliveryDay).toLocaleDateString('es-AR')
                : 'Sin fecha',
            'Rango Horario': extractTimeOnly(order.deliveryArea?.schedule),
            'Cliente': `${order.user?.name || ''} ${order.user?.lastName || ''}`.trim(),
            'Direccion': `${order.address?.address || ''}, ${order.address?.city || ''}`,
            'Notas Cliente': formatNotes(order),
            'Productos': (order.items || [])
                .map((item: any) => {
                    const fullProductName = mapDBProductToSelectOption(
                        item.name,
                        (item.options?.[0] as any)?.name || ''
                    );
                    const quantity = (item.options?.[0] as any)?.quantity || 1;
                    return `${fullProductName} - x${quantity}`;
                })
                .join('\r\n'),
            'Total': order.total,
            'Medio de Pago': order.paymentMethod || '',
            'Telefono': formatPhoneNumber(order.address?.phone || ''),
            'Email': order.user?.email || '',
        }));

        // Crear libro de trabajo
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // Ajustar anchos de columnas
        worksheet['!cols'] = [
            { wch: 12 }, // Fecha Entrega
            { wch: 25 }, // Rango Horario
            { wch: 30 }, // Cliente
            { wch: 40 }, // Direccion
            { wch: 40 }, // Notas Cliente
            { wch: 60 }, // Productos
            { wch: 12 }, // Total
            { wch: 20 }, // Medio de Pago
            { wch: 15 }, // Telefono
            { wch: 30 }, // Email
        ];

        // Aplicar formato de celdas (alineación y wrap)
        if (worksheet['!ref']) {
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const headerCell = worksheet[XLSX.utils.encode_col(C) + '1'];
                const header = headerCell?.v;

                for (let R = range.s.r + 1; R <= range.e.r; ++R) {
                    const cellAddress = XLSX.utils.encode_col(C) + (R + 1);
                    if (!worksheet[cellAddress]) continue;
                    if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};

                    if (typeof header === 'string' && ['Total', 'Telefono'].includes(header)) {
                        worksheet[cellAddress].s.alignment = { horizontal: 'left' };
                    }

                    if (typeof header === 'string' && header === 'Productos') {
                        worksheet[cellAddress].s.alignment = {
                            horizontal: 'left',
                            vertical: 'top',
                            wrapText: true,
                        };
                    }
                }
            }
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Órdenes');

        // Generar buffer y convertir a base64 para serialización
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        const base64Data = Buffer.from(buffer).toString('base64');

        return { success: true, data: base64Data };
    } catch (error) {
        console.error('Error exporting orders:', error);
        return { success: false, error: 'Ocurrió un error al generar el archivo Excel.' };
    }
}