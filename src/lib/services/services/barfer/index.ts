// BARFER SERVICES - Solo servicios que usan apiClient o son utilidades

// ===== ORDERS =====
export * from './orders/orders';

// ===== STOCK / EXPRESS =====
export * from './express/express';

// ===== PUNTOS DE ENVÍO =====
export * from './puntos-envio/puntos-envio';

// ===== AUTH =====
export * from './auth/auth';

// ===== USERS =====
export * from './users/users';

// ===== CATEGORÍAS =====
export * from './categorias/categorias';

// ===== MÉTODOS DE PAGO =====
export * from './metodos-pago/metodos-pago';

// ===== PROVEEDORES =====
export * from './proveedores/proveedores';

// ===== SALIDAS =====
export * from './salidas/salidas';

// ===== OTRAS ENTIDADES (Vacías por ahora) =====
export * from './puntos-ventas/puntos-ventas';
export * from './prices/prices';
export * from './balance/balance';
export * from './repartos/repartos';

// ===== UTILIDADES =====
export * from './utils/upload';
export {
    mapSelectOptionToDBFormat,
    processOrderItems,
    type ProductMapping
} from './productMapping';

export { calculateSalesFromOrders } from './calculateSalesForStock';
