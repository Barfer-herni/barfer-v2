// ==========================================
// SERVICIOS DEL SISTEMA
// ==========================================
export * from './authService';
export * from './uploadR2Image';
export * from './userService';

// ==========================================
// SERVICIOS MIGRADOS A BACKEND API
// ==========================================
export * from './salidasMongoService';
export * from './salidasAnalyticsMongoService';
export * from './categoriasMongoService';
export * from './metodosPagoMongoService';
export * from './categoriasProveedoresMongoService';
export * from './proveedoresMongoService';
export {
    createPuntoEnvioMongo,
    getAllPuntosEnvioMongo,
    getPuntoEnvioByIdMongo,
    updatePuntoEnvioMongo,
    deletePuntoEnvioMongo,
    getPuntoEnvioByNameMongo,
} from './puntoEnvioMongoService';
export * from './orderPriorityMongoService';

// ==========================================
// SERVICIOS DE BARFER E-COMMERCE
// ==========================================
export {
    mapSelectOptionToDBFormat,
    processOrderItems,
    type ProductMapping
} from './barfer/productMapping';

export {
    getOrders,
    deleteOrder,
    createOrder,
    createStockMongo,
    getStockByPuntoEnvioMongo,
    getStockByIdMongo,
    updateStockMongo,
    deleteStockMongo,
    createDetalleEnvioMongo,
    getDetalleEnvioByPuntoEnvioMongo,
    getDetalleEnvioByIdMongo,
    updateDetalleEnvioMongo,
    deleteDetalleEnvioMongo,
    calculateSalesFromOrders,
} from './barfer';
