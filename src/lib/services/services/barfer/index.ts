// BARFER SERVICES - Solo servicios que usan apiClient o son utilidades

// ===== ORDERS =====
export { getOrders } from './getOrders';
export { deleteOrder } from './deleteOrder';
export { createOrder } from './createOrder';

// ===== STOCK =====
export {
    createStockMongo,
    getStockByPuntoEnvioMongo,
    getStockByIdMongo,
    updateStockMongo,
    deleteStockMongo
} from './stockService';

// ===== DETALLE DE ENVÍO =====
export {
    createDetalleEnvioMongo,
    getDetalleEnvioByPuntoEnvioMongo,
    getDetalleEnvioByIdMongo,
    updateDetalleEnvioMongo,
    deleteDetalleEnvioMongo
} from './detalleEnvioService';

// ===== UTILIDADES =====
export {
    mapSelectOptionToDBFormat,
    processOrderItems,
    type ProductMapping
} from './productMapping';

export { calculateSalesFromOrders } from './calculateSalesForStock';
