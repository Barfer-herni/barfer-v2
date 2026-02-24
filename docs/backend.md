# Backend API - Barfer Admin Panel

## 1. Resumen General

### Arquitectura Actual

El frontend es una aplicacion Next.js 15 (App Router) que actualmente opera con **Server Actions** (no REST API). Toda la logica de negocio se ejecuta en el servidor a traves de funciones `'use server'` que acceden directamente a MongoDB y PostgreSQL.

**Para el nuevo backend se necesita replicar toda esta logica como una API REST** que el frontend pueda consumir reemplazando las Server Actions por llamadas HTTP.

### Stack Actual del Frontend
- **Framework:** Next.js 15.1.9 (App Router)
- **Base de datos actual:** MongoDB (driver nativo) + PostgreSQL (Prisma ORM)
- **Autenticacion:** Cookie-based con JSON token (`auth-token`)
- **Hashing de passwords:** bcryptjs con 12 salt rounds

### Modulos del Sistema
1. **Auth** - Autenticacion, usuarios, permisos
2. **Table** - Pedidos minoristas (CRUD, duplicar, backup)
3. **Express** - Pedidos express, stock, puntos de envio
4. **Mayoristas** - Clientes mayoristas, puntos de venta, estadisticas
5. **Clients** - Gestion de clientes, WhatsApp, Email
6. **Prices** - Precios por seccion/producto/peso, productos gestor
7. **Salidas** - Gastos/egresos, categorias, metodos de pago, proveedores
8. **Balance** - Balance mensual (ingresos vs egresos)
9. **Analytics** - Estadisticas de ventas, clientes, productos
10. **Repartos** - Planificacion de repartos semanales
11. **Account** - Gestion de usuarios del sistema

---

## 2. Sistema de Autenticacion

### Flujo de Login

```
POST /api/auth/sign-in
Body: { email: string, password: string }
Response: {
  success: boolean,
  user?: { id: string, name: string, email: string, role: string },
  token?: string,     // JWT o session token
  message?: string,
  error?: string
}
```

**Proceso:**
1. Buscar usuario por email en la coleccion `users_gestor`
2. Verificar password con `bcrypt.compare(password, hashedPassword)` (12 salt rounds)
3. Si es valido, generar token con: `{ id, email, role, permissions }`
4. Retornar token (el frontend lo almacena como cookie `auth-token`)

### Flujo de Registro

```
POST /api/auth/sign-up
Body: { name: string, lastName: string, email: string, password: string }
Response: {
  success: boolean,
  user?: { id: string, name: string, email: string, role: string },
  message?: string,
  error?: string
}
```

**Proceso:**
1. Verificar que el email no exista
2. Hashear password con `bcrypt.hash(password, 12)`
3. El primer usuario creado recibe rol `admin`; los siguientes, rol `user`
4. Permission default: `['account:view_own']`

### Flujo de Logout

```
POST /api/auth/sign-out
Headers: { Authorization: Bearer <token> }
Response: { success: boolean }
```

### Obtener Usuario Actual

```
GET /api/auth/me
Headers: { Authorization: Bearer <token> }
Response: {
  id: string,
  name: string,
  lastName: string,
  email: string,
  role: 'admin' | 'user',
  permissions: string[],
  puntoEnvio?: string | string[]
}
```

**Nota:** Siempre obtener los datos frescos de la base de datos, no del token.

### Roles y Permisos

**Roles:**
- `admin` - Acceso total (tiene TODOS los permisos hardcodeados)
- `user` - Acceso limitado segun su array de `permissions`

**Lista completa de permisos:**

| Modulo | Permisos |
|--------|----------|
| Analytics | `analytics:view`, `analytics:export` |
| Users | `users:view`, `users:create`, `users:edit`, `users:delete` |
| Account | `account:view_own`, `account:edit_own`, `account:change_password`, `account:manage_users` |
| Admin | `admin:full_access`, `admin:system_settings` |
| Clients | `clients:view`, `clients:create`, `clients:edit`, `clients:delete`, `clients:view_analytics`, `clients:send_email`, `clients:send_whatsapp` |
| Table | `table:view`, `table:export`, `table:delete`, `table:edit` |
| Balance | `balance:view`, `balance:export` |
| Prices | `prices:view`, `prices:edit` |
| Salidas | `outputs:view`, `outputs:export`, `outputs:create`, `outputs:edit`, `outputs:delete`, `outputs:view_statistics`, `outputs:view_all_categories`, `outputs:view_category:<NOMBRE_CATEGORIA>` |
| Mayoristas | `mayoristas:view`, `mayoristas:create`, `mayoristas:edit`, `mayoristas:delete`, `mayoristas:view_statistics`, `mayoristas:view_matrix` |
| Express | `express:view`, `express:create`, `express:edit`, `express:delete` |

**Permisos dinamicos por categoria de salida:**
- Formato: `outputs:view_category:<NOMBRE_EN_MAYUSCULAS>`
- Ejemplo: `outputs:view_category:ALQUILER`

### Rutas Protegidas (Middleware)

| Ruta Frontend | Permiso Requerido |
|---------------|-------------------|
| `/admin/analytics` | `analytics:view` |
| `/admin/clients` | `clients:view` |
| `/admin/clients/email` | `clients:send_email` |
| `/admin/clients/whatsapp` | `clients:send_whatsapp` |
| `/admin/account` | `account:view_own` |
| `/admin/table` | `table:view` |
| `/admin/balance` | `balance:view` |
| `/admin/salidas` | `outputs:view` |
| `/admin/prices` | `prices:view` |
| `/admin/express` | `express:view` |
| `/admin/repartos` | `table:view` |
| `/admin/mayoristas` | `mayoristas:view` |

**Rutas publicas (sin auth):** `/sign-in`, `/sign-up`, `/api/webhooks`, `/api/cron`, `/access-denied`

---

## 3. Lista Completa de Endpoints por Modulo

> **Convencion:** Todos los endpoints autenticados requieren header `Authorization: Bearer <token>`. Los que requieren permisos especificos lo indican con `[permiso]`.

### 3.1 Auth & Account

#### Usuarios del Sistema

```
GET /api/users
[account:manage_users]
Response: { users: UserGestor[], total: number }
```

```
GET /api/users/:id
[account:manage_users]
Response: UserGestor
```

```
POST /api/users
[account:manage_users]
Body: {
  name: string,            // min 1 char
  lastName: string,        // min 1 char
  email: string,           // email valido
  password: string,        // min 6 chars
  role: 'admin' | 'user',
  permissions?: string[],
  puntoEnvio?: string | string[]   // puede ser string o array de strings
}
Response: { success: boolean, message: string }
```

```
PUT /api/users/:id
[account:manage_users]
Body: {
  name?: string,
  lastName?: string,
  email?: string,
  password?: string,       // opcional en update
  role?: 'admin' | 'user',
  permissions?: string[],
  puntoEnvio?: string | string[]
}
Response: { success: boolean, message: string }
```

```
DELETE /api/users/:id
[account:manage_users]
Response: { success: boolean, message: string }
```

```
PUT /api/users/:id/category-permissions
[account:manage_users]
Body: { permissions: string[] }
Validacion: No puede modificar sus propios permisos de categoria
Response: { success: boolean, message: string }
```

#### Perfil Propio

```
PUT /api/account/profile
[account:edit_own]
Body: { name: string, lastName: string, email: string }
Response: { success: boolean, message: string }
```

```
PUT /api/account/password
[account:change_password]
Body: {
  currentPassword: string,
  newPassword: string,       // min 6 chars
  confirmPassword: string    // debe coincidir con newPassword
}
Response: { success: boolean, message: string }
```

---

### 3.2 Table (Pedidos)

```
GET /api/orders?pageIndex=0&pageSize=20&search=&from=&to=&orderType=&sorting=
Response: {
  orders: Order[],
  pageCount: number,
  total: number
}
Nota: Excluye pedidos express (paymentMethod !== 'bank-transfer' y sameDayDelivery !== true)
```

```
POST /api/orders
Body: Order (ver modelo abajo)
Validacion: Normaliza telefono, calcula precio
Response: { success: boolean, order?: Order, error?: string }
```

```
PUT /api/orders/:id
Body: Partial<Order>
Validacion: Normaliza telefono, guarda backup antes de actualizar, normaliza horarios de schedule
Response: { success: boolean, order?: Order, error?: string }
```

```
DELETE /api/orders/:id
Nota: Guarda backup antes de eliminar
Response: { success: boolean, error?: string }
```

```
POST /api/orders/:id/duplicate
Nota: Recalcula precio, normaliza telefono
Response: { success: boolean, order?: Order, error?: string, message?: string }
```

```
PUT /api/orders/status/bulk
Body: { ids: string[], status: string }
Response: { success: boolean }
```

```
POST /api/orders/backup/undo
Nota: Restaura ultimo backup
Response: { success: boolean, action?: string, error?: string }
```

```
DELETE /api/orders/backup/all
Response: { success: boolean, error?: string }
```

```
GET /api/orders/backup/count
Response: { success: boolean, count: number }
```

```
POST /api/orders/migrate-client-type
Response: { success: boolean }
```

#### Calculo de Precios

```
POST /api/orders/calculate-price
Body: {
  items: Array<{
    name: string,
    options: Array<{ name: string, quantity: number }>
  }>,
  orderType: 'minorista' | 'mayorista',
  paymentMethod: string,
  deliveryDate?: string | Date
}
Response: { success: boolean, total?: number, itemPrices?: any, error?: string }
```

```
POST /api/orders/calculate-exact-price
Body: {
  formattedProduct: string,
  orderType: 'minorista' | 'mayorista',
  paymentMethod: string,
  deliveryDate?: string | Date
}
Response: { success: boolean, price?: number, error?: string }
```

```
GET /api/orders/products-from-prices
Response: { success: boolean, products: any[], productsWithDetails: any[] }
```

#### Busqueda de Mayoristas (desde Table)

```
GET /api/mayoristas/search?q=<searchTerm>
Nota: minimo 2 caracteres
Response: { success: boolean, puntosVenta: Mayorista[] }
```

---

### 3.3 Express

#### Pedidos Express

```
GET /api/express/orders?puntoEnvio=&from=&to=
Nota: Filtra por paymentMethod='bank-transfer' OR sameDayDelivery=true OR puntoEnvio existe
Response: { success: boolean, orders: Order[] }
Autorizacion: Valida acceso al puntoEnvio del usuario
```

```
POST /api/express/orders/:id/duplicate
Body: { targetPuntoEnvio: string }
Nota: Recalcula precio, valida telefono, verifica acceso al punto de envio destino
Response: { success: boolean, order?: Order, error?: string }
```

```
PUT /api/express/orders/:id/estado
Body: { estadoEnvio: 'pendiente' | 'pidiendo' | 'en-viaje' | 'listo' }
Response: { success: boolean, error?: string }
```

#### Stock

```
GET /api/express/stock?puntoEnvio=<nombre>
Autorizacion: Valida acceso al puntoEnvio del usuario
Response: { success: boolean, stock: Stock[] }
```

```
POST /api/express/stock
Body: {
  puntoEnvio: string,
  section?: string,
  producto: string,
  peso?: string,
  stockInicial: number,
  llevamos: number,
  pedidosDelDia: number,
  stockFinal?: number,     // calculado: stockInicial + llevamos - pedidosDelDia
  fecha?: string
}
Response: { success: boolean, message?: string }
```

```
PUT /api/express/stock/:id
Body: {
  section?: string,
  stockInicial?: number,
  llevamos?: number,
  pedidosDelDia?: number,
  stockFinal?: number
}
Response: { success: boolean, message?: string }
```

```
POST /api/express/stock/initialize
Body: { puntoEnvio: string, date: string }
Autorizacion: Valida acceso al puntoEnvio
Response: { success: boolean, error?: string }
```

```
GET /api/express/stock/products
Response: { success: boolean, products: ProductForStock[] }
```

#### Puntos de Envio

```
GET /api/express/puntos-envio
Response: { success: boolean, puntosEnvio: PuntoEnvio[] }
```

```
POST /api/express/puntos-envio
Body: { nombre: string, cutoffTime?: string }
Response: { success: boolean, message?: string }
```

```
PUT /api/express/puntos-envio/:id
Body: { nombre?: string, cutoffTime?: string }
Response: { success: boolean, message?: string }
```

```
DELETE /api/express/puntos-envio/:id
[express:delete] + isAdmin
Response: { success: boolean, message?: string }
```

#### Delivery Areas

```
GET /api/express/delivery-areas
Response: { success: boolean, deliveryAreas: DeliveryArea[] }
```

#### Detalle de Envio

```
GET /api/express/detalle-envio?puntoEnvio=<nombre>
Autorizacion: Valida acceso al puntoEnvio
Response: { success: boolean, detalleEnvio: DetalleEnvio[] }
```

#### Pedidos del Dia

```
GET /api/express/pedidos-del-dia?puntoEnvio=<nombre>&date=<ISO_date>
Response: { success: boolean, count: number }
```

#### Prioridad de Pedidos

```
GET /api/express/order-priority?fecha=<YYYY-MM-DD>&puntoEnvio=<nombre>
Autorizacion: Valida acceso al puntoEnvio
Response: { success: boolean, ... }
```

```
POST /api/express/order-priority
Body: { fecha: string, puntoEnvio: string, orderIds: string[] }
Autorizacion: Valida acceso al puntoEnvio
Response: { success: boolean, error?: string }
```

---

### 3.4 Mayoristas

```
GET /api/mayoristas?pageIndex=0&pageSize=20&search=&zona=&activo=true&sortBy=&sortDesc=false
Response: {
  success: boolean,
  mayoristas: Mayorista[],
  total: number,
  pageCount: number
}
```

```
GET /api/mayoristas/:id
Response: { success: boolean, mayorista: Mayorista }
```

```
POST /api/mayoristas
Body: MayoristaCreateInput (ver modelo)
Response: { success: boolean, error?: string }
```

```
PUT /api/mayoristas/:id
Body: MayoristaUpdateInput (ver modelo)
Response: { success: boolean, error?: string }
```

```
DELETE /api/mayoristas/:id
Response: { success: boolean, error?: string }
```

```
POST /api/mayoristas/:id/kilos
Body: { mes: number, anio: number, kilos: number }
Response: { success: boolean, error?: string }
```

#### Estadisticas

```
GET /api/mayoristas/ventas-por-zona
Response: VentasStats[]
```

```
GET /api/mayoristas/puntos-venta-stats?from=&to=
Response: PuntoVentaStats
```

```
GET /api/mayoristas/productos-matrix?from=&to=
Nota: Convierte from/to a year/month
Response: ProductoMatrixData[]
```

---

### 3.5 Clients

#### WhatsApp Contact Tracking

```
POST /api/clients/whatsapp/mark-contacted
Body: { clientEmails: string[] }
Validacion: Array no vacio
Response: { success: boolean, error?: string }
```

```
POST /api/clients/whatsapp/unmark-contacted
Body: { clientEmails: string[] }
Response: { success: boolean, error?: string }
```

```
POST /api/clients/whatsapp/contact-status
Body: { clientEmails: string[] }
Response: { success: boolean, data: WhatsAppContactStatus[] }
```

```
POST /api/clients/hide
Body: { clientEmails: string[] }
Response: { success: boolean, error?: string }
```

```
POST /api/clients/show
Body: { clientEmails: string[] }
Response: { success: boolean, error?: string }
```

```
POST /api/clients/visibility-status
Body: { clientEmails: string[] }
Response: { success: boolean, data: ClientVisibilityStatus[] }
```

#### Email

```
POST /api/clients/email/send-bulk
Body: { subject: string, content: string, selectedClients: string[] }
Autenticacion: Requiere usuario logueado
Response: { success: boolean, message?: string, error?: string }
```

```
POST /api/clients/email/schedule-campaign
Body: {
  campaignName: string,
  scheduleCron: string,
  targetAudience: { type: 'behavior' | 'spending', category: string },
  emailTemplateId: string
}
Autenticacion: Requiere usuario logueado
Response: { success: boolean, message?: string, error?: string }
```

#### Email Templates

```
POST /api/clients/email/templates
Body: { name: string, subject: string, content: string, description?: string }
Autenticacion: Requiere usuario logueado (createdBy = userId)
Response: { success: boolean, error?: string }
```

```
DELETE /api/clients/email/templates/:id
Autenticacion: Requiere usuario logueado
Response: { success: boolean, error?: string }
```

---

### 3.6 Prices

```
GET /api/prices
[prices:view]
Response: { success: boolean, prices: Price[], total: number }
```

```
GET /api/prices/by-month?month=<1-12>&year=<YYYY>
[prices:view]
Response: { success: boolean, prices: Price[], total: number }
```

```
POST /api/prices
[prices:edit]
Body: CreatePriceData
Response: { success: boolean, message: string }
```

```
PUT /api/prices/:id
[prices:edit]
Body: { price: number }
Response: { success: boolean, message: string }
```

```
DELETE /api/prices/:id
[prices:edit]
Response: { success: boolean, message: string }
```

```
POST /api/prices/initialize
[prices:edit]
Nota: Inicializa precios default
Response: { success: boolean, message: string }
```

```
POST /api/prices/initialize-period
[prices:edit]
Body: { month: number, year: number }
Response: { success: boolean, message: string }
```

```
GET /api/prices/unique-products
[prices:view]
Response: { success: boolean, products: string[] }
```

```
DELETE /api/prices/product
[prices:edit]
Body: { section: string, product: string, weight: string | null }
Response: { success: boolean, message: string, deletedCount: number }
```

```
PUT /api/prices/product
[prices:edit]
Body: {
  oldSection: string,
  oldProduct: string,
  oldWeight: string | null,
  newData: { section?: string, product?: string, weight?: string | null }
}
Response: { success: boolean, message: string, updatedCount: number }
```

```
PUT /api/prices/product/price-types
[prices:edit]
Body: {
  section: string,
  product: string,
  weight: string | null,
  oldPriceTypes: string[],
  newPriceTypes: string[]
}
Response: { success: boolean, message: string, addedCount: number, removedCount: number }
```

```
POST /api/prices/normalize-capitalization
[prices:edit]
Response: { success: boolean, message: string, updated: number }
```

```
POST /api/prices/remove-duplicates
[prices:edit]
Response: { success: boolean, message: string, removed: number }
```

#### Productos Gestor (Catalogo de productos)

```
GET /api/productos-gestor
[prices:view]
Response: { success: boolean, productos: ProductoGestor[], total: number }
```

```
POST /api/productos-gestor
[prices:edit]
Body: CreateProductoGestorData
Response: { success: boolean, message: string }
```

```
PUT /api/productos-gestor/:id
[prices:edit]
Body: UpdateProductoGestorData
Response: { success: boolean, message: string }
```

```
DELETE /api/productos-gestor/:id
[prices:edit]
Response: { success: boolean, message: string }
```

```
POST /api/productos-gestor/initialize
[prices:edit]
Response: { success: boolean, message: string }
```

---

### 3.7 Salidas (Gastos/Egresos)

#### Salidas

```
GET /api/salidas
Nota: Aplica filtro de permisos por categoria del usuario
Response: { salidas: Salida[], total: number }
```

```
GET /api/salidas/paginated?pageIndex=0&pageSize=20&filters[tipo]=&filters[categoriaId]=&filters[metodoPagoId]=&filters[from]=&filters[to]=
Response: { salidas: Salida[], total: number, pageCount: number }
```

```
POST /api/salidas
[outputs:create]
Body: CreateSalidaMongoInput (ver modelo)
Response: { success: boolean, error?: string }
```

```
PUT /api/salidas/:id
[outputs:edit]
Body: UpdateSalidaMongoInput
Response: { success: boolean, error?: string }
```

```
DELETE /api/salidas/:id
[outputs:delete]
Response: { success: boolean, error?: string }
```

```
POST /api/salidas/:id/duplicate
[outputs:create]
Response: { success: boolean, salida?: Salida, error?: string }
```

```
GET /api/salidas/by-date-range?startDate=&endDate=
Response: { salidas: Salida[] }
```

```
GET /api/salidas/by-category/:categoriaId
Response: { salidas: Salida[] }
```

```
GET /api/salidas/details-by-category/:categoriaId?startDate=&endDate=
Response: { success: boolean, salidas: Salida[] }
```

#### Estadisticas de Salidas

```
GET /api/salidas/stats/by-month?year=&month=
Response: SalidasStats
```

```
GET /api/salidas/stats/categories?startDate=&endDate=
Response: CategoryAnalytics
```

```
GET /api/salidas/stats/types?startDate=&endDate=
Response: TypeAnalytics
```

```
GET /api/salidas/stats/monthly?categoriaId=&startDate=&endDate=
Response: MonthlyAnalytics
```

```
GET /api/salidas/stats/overview?startDate=&endDate=
Response: OverviewAnalytics
```

#### Categorias de Salidas

```
GET /api/salidas/categorias
Response: { categorias: Categoria[] }
```

```
POST /api/salidas/categorias
Body: { nombre: string }
Response: { success: boolean }
```

```
DELETE /api/salidas/categorias/:id
[outputs:delete]
Response: { success: boolean }
```

```
POST /api/salidas/categorias/initialize
[admin:full_access]
Response: { success: boolean }
```

#### Metodos de Pago

```
GET /api/salidas/metodos-pago
Response: { metodosPago: MetodoPago[] }
```

```
POST /api/salidas/metodos-pago
Body: { nombre: string }
Response: { success: boolean }
```

```
POST /api/salidas/metodos-pago/initialize
[admin:full_access]
Response: { success: boolean }
```

#### Proveedores

```
GET /api/proveedores
Response: { proveedores: Proveedor[] }
Nota: Incluye $lookup join con categorias y metodos_pago
```

```
GET /api/proveedores/all
Nota: Incluye inactivos
Response: { proveedores: Proveedor[] }
```

```
GET /api/proveedores/:id
Response: { proveedor: Proveedor }
```

```
POST /api/proveedores
[outputs:create]
Body: CreateProveedorMongoInput
Response: { success: boolean }
```

```
PUT /api/proveedores/:id
[outputs:edit]
Body: UpdateProveedorMongoInput
Response: { success: boolean }
```

```
DELETE /api/proveedores/:id
[outputs:delete]
Response: { success: boolean }
```

```
GET /api/proveedores/search?q=<searchTerm>
Response: { proveedores: Proveedor[] }
```

#### Categorias de Proveedores

```
GET /api/proveedores/categorias
Response: { categorias: CategoriaProveedor[] }
```

```
POST /api/proveedores/categorias
[outputs:create]
Body: CreateCategoriaProveedorMongoInput
Response: { success: boolean }
```

```
PUT /api/proveedores/categorias/:id
[outputs:edit]
Body: UpdateCategoriaProveedorMongoInput
Response: { success: boolean }
```

```
DELETE /api/proveedores/categorias/:id
[outputs:delete]
Response: { success: boolean }
```

```
POST /api/proveedores/categorias/initialize
[admin:full_access]
Response: { success: boolean }
```

---

### 3.8 Balance

```
GET /api/balance/monthly?startDate=&endDate=
Response: {
  success: boolean,
  data: BalanceMonthlyData[]
}
```

**Estructura de BalanceMonthlyData:**
```typescript
{
  month: number,
  year: number,
  entradasMinorista: number,
  entradasMayorista: number,
  entradasExpress: number,
  totalEntradas: number,
  salidas: number,
  gastosOrdinarios: number,     // Marca BARFER + SLR
  gastosExtraordinarios: number,
  resultadoSinExtraordinarios: number,
  resultadoConExtraordinarios: number,
  precioPorKg: number,
  totalKilos: number
}
```

**Logica de calculo:**
- Agrupa pedidos por mes/anio
- Clasifica por orderType + paymentMethod:
  - Express: `paymentMethod === 'bank-transfer'`
  - Mayorista: `orderType === 'mayorista'`
  - Minorista: el resto
- Cruza con salidas por fecha
- Clasifica gastos como ORDINARIO/EXTRAORDINARIO por tipo
- Calcula peso total de items para precioPorKg

---

### 3.9 Analytics

```
GET /api/analytics/client-categorization
Response: ClientAnalytics (categorizacion por comportamiento y gasto)
```

```
GET /api/analytics/client-categories-stats
Response: ClientCategoriesStats
```

```
GET /api/analytics/client-general-stats
Response: ClientGeneralStats
```

```
GET /api/analytics/clients-paginated?pageIndex=0&pageSize=20&...
Response: PaginatedClientsResponse
```

```
GET /api/analytics/orders-by-day?from=&to=&puntoEnvio=
Response: Array<{ date: string, count: number, total: number, orders: Order[] }>
```

```
GET /api/analytics/orders-by-month?from=&to=
Response: Array<{ month: string, count: number, total: number }>
```

```
GET /api/analytics/revenue-by-day?from=&to=&puntoEnvio=
Response: RevenueData[]
```

```
GET /api/analytics/average-order-value?from=&to=
Response: { value: number }
```

```
GET /api/analytics/category-sales
Response: CategorySalesStats[]
```

```
GET /api/analytics/customer-frequency
Response: FrequencyData[]
```

```
GET /api/analytics/customer-insights
Response: CustomerInsightMetrics
```

```
GET /api/analytics/payment-method-stats
Response: PaymentStats[]
```

```
GET /api/analytics/payments-by-period?from=&to=
Response: PaymentTimePeriodData[]
```

```
GET /api/analytics/product-sales?limit=10
Response: ProductSalesData[]
```

```
GET /api/analytics/products-by-period?from=&to=
Response: ProductData[]
```

```
GET /api/analytics/product-timeline?product=&from=&to=
Response: TimelineData[]
```

```
GET /api/analytics/purchase-frequency
Response: FrequencyDistribution
```

```
GET /api/analytics/delivery-type-stats-by-month
Response: DeliveryTypeStats[]
```

```
GET /api/analytics/quantity-stats-by-month
Response: QuantityStats[]
```

**Logica de categorizacion de clientes:**
- **Comportamiento** (basado en `daysSinceLastOrder`):
  - `new` - Nuevo (primer pedido reciente)
  - `active` - Activo (compro recientemente)
  - `possible-inactive` - Posible inactivo
  - `lost` - Perdido (mucho tiempo sin comprar)
  - `recovered` - Recuperado
  - `tracking` - En seguimiento
- **Gasto** (basado en `monthlyWeight` en kg):
  - `premium` - Alto volumen
  - `standard` - Volumen medio
  - `basic` - Bajo volumen

---

### 3.10 Repartos

```
GET /api/repartos
Response: { success: boolean, data: RepartosData }
Nota: Deduplica por weekKey (toma el mas reciente)
```

```
POST /api/repartos/week
Body: { weekKey: string, weekData: WeekData }
Nota: Upsert - inserta o actualiza, elimina duplicados
Response: { success: boolean, message?: string }
```

```
PUT /api/repartos/entry
Body: { weekKey: string, dayKey: string, rowIndex: number, entry: Partial<RepartoEntry> }
Response: { success: boolean, message?: string }
```

```
POST /api/repartos/toggle-completion
Body: { weekKey: string, dayKey: string, rowIndex: number }
Response: { success: boolean, message?: string }
```

```
POST /api/repartos/initialize-week
Body: { weekKey: string }
Response: { success: boolean, message?: string }
```

```
DELETE /api/repartos/cleanup-old-weeks
Response: { success: boolean, deletedCount: number }
```

```
POST /api/repartos/add-row
Body: { weekKey: string, dayKey: string }
Response: { success: boolean, message?: string }
```

```
DELETE /api/repartos/remove-row
Body: { weekKey: string, dayKey: string, rowIndex: number }
Response: { success: boolean, message?: string }
```

---

### 3.11 Cron Jobs

```
GET /api/cron
Sin autenticacion
Funcionalidad:
1. Busca campanas de email activas (scheduled_email_campaigns)
2. Evalua cron expressions para ver si deben ejecutarse (ventana de 2 min)
3. Obtiene template de email y clientes por categoria
4. Envia emails masivos via Resend
5. Ejecuta stock rollover (checkAndPerformStockRollover)
Response: { message: 'Cron job executed successfully.' }
```

---

### 3.12 Categorias Disponibles (para permisos)

```
GET /api/categorias/available
Response: { success: boolean, categories: string[] }
Nota: Retorna nombres de categorias activas de la coleccion 'categorias'
```

---

## 4. Modelos de Datos (Esquemas)

### 4.1 MongoDB Collections

#### orders
```typescript
{
  _id: ObjectId,
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled',
  total: number,
  subTotal: number,
  shippingPrice: number,
  items: [{
    id: string,
    name: string,
    description?: string,
    images?: string[],
    options: [{
      name: string,
      price: number,
      quantity: number,
      stock: number
    }],
    price: number,
    salesCount?: number,
    discountApplied?: number
  }],
  notes?: string,
  notesOwn?: string,
  address: {
    address: string,
    city: string,
    phone: string,
    betweenStreets?: string,
    floorNumber?: string,
    departmentNumber?: string,
    zipCode: string,
    email: string,
    firstName: string,
    lastName: string,
    reference?: string
  },
  user: {
    _id: string,
    email: string,
    name: string,
    lastName?: string,
    phoneNumber?: string,
    role: number
  },
  paymentMethod: string,
  coupon?: object | null,
  deliveryArea: {
    _id: string,
    description: string,
    coordinates: number[][],
    schedule: string,
    orderCutOffHour: number,
    enabled: boolean,
    sameDayDelivery: boolean,
    sameDayDeliveryDays: string[],
    whatsappNumber: string,
    sheetName: string,
    puntoEnvio?: string
  },
  orderType: 'minorista' | 'mayorista',
  deliveryDay: string,
  puntoEnvio?: string,
  estadoEnvio?: 'pendiente' | 'pidiendo' | 'en-viaje' | 'listo',
  whatsappContactedAt?: Date | 'ocultado',
  createdAt: Date,
  updatedAt: Date
}
```

#### users_gestor
```typescript
{
  _id: ObjectId,
  email: string,          // unique
  name: string,
  lastName: string,
  role: 'admin' | 'user',
  password: string,       // bcrypt hash (12 rounds)
  permissions: string[],  // default: ['account:view_own']
  puntoEnvio?: string | string[],
  createdAt: Date,
  updatedAt: Date
}
```

#### prices
```typescript
{
  _id: ObjectId,
  section: 'PERRO' | 'GATO' | 'OTROS' | 'RAW',
  product: string,
  weight?: string,        // ej: '5KG', '10KG'
  priceType: 'EFECTIVO' | 'TRANSFERENCIA' | 'MAYORISTA',
  price: number,
  isActive: boolean,
  effectiveDate: string,  // YYYY-MM-DD
  month: number,          // 1-12
  year: number,
  createdAt: Date,
  updatedAt: Date
}
```

#### productosGestor
```typescript
{
  _id: ObjectId,
  section: 'PERRO' | 'GATO' | 'OTROS' | 'RAW',
  product: string,
  weight?: string,
  priceTypes: ('EFECTIVO' | 'TRANSFERENCIA' | 'MAYORISTA')[],
  isActive: boolean,
  order: number,          // para ordenamiento
  createdAt: Date,
  updatedAt: Date
}
```

#### stock
```typescript
{
  _id: ObjectId,
  puntoEnvio: string,
  section?: string,
  producto: string,
  peso?: string,
  stockInicial: number,
  llevamos: number,
  pedidosDelDia: number,
  stockFinal: number,     // = stockInicial + llevamos - pedidosDelDia
  fecha: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### puntos_envio
```typescript
{
  _id: ObjectId,
  nombre: string,
  cutoffTime?: string,    // HH:mm
  createdAt: Date,
  updatedAt: Date
}
```

#### detalle_envio
```typescript
{
  _id: ObjectId,
  puntoEnvio: string,
  fecha: string,          // YYYY-MM
  pollo?: number,
  vaca?: number,
  cerdo?: number,
  cordero?: number,
  bigDogPollo?: number,
  bigDogVaca?: number,
  totalPerro?: number,
  gatoPollo?: number,
  gatoVaca?: number,
  gatoCordero?: number,
  totalGato?: number,
  huesosCarnosos?: number,
  totalMes?: number,
  createdAt: Date,
  updatedAt: Date
}
```

#### order_priority
```typescript
{
  _id: ObjectId,
  fecha: string,          // YYYY-MM-DD
  puntoEnvio: string,
  orderIds: string[],     // lista ordenada de IDs
  createdAt: Date,
  updatedAt: Date
}
```

#### puntos_venta (Mayoristas)
```typescript
{
  _id: ObjectId,
  nombre: string,
  zona: 'CABA' | 'LA_PLATA' | 'OESTE' | 'NOROESTE' | 'NORTE' | 'SUR',
  frecuencia: 'SEMANAL' | 'QUINCENAL' | 'MENSUAL' | 'OCASIONAL',
  fechaInicioVentas: Date | string,
  fechaPrimerPedido?: Date | string,
  fechaUltimoPedido?: Date | string,
  tieneFreezer: boolean,
  cantidadFreezers?: number,
  capacidadFreezer?: number,
  tiposNegocio: ('PET_SHOP' | 'VETERINARIA' | 'PELUQUERIA')[],
  horarios?: string,
  kilosPorMes: [{ mes: number, anio: number, kilos: number }],
  contacto?: {
    telefono?: string,
    email?: string,
    direccion?: string
  },
  notas?: string,
  activo: boolean,
  createdAt?: Date,
  updatedAt?: Date
}
```

#### mayoristas (personas)
```typescript
{
  _id: ObjectId,
  user: {
    name: string,
    lastName: string,
    email?: string
  },
  address?: {
    address: string,
    city?: string,
    phone?: string
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### salidas
```typescript
{
  _id: ObjectId,
  fecha: Date,
  detalle: string,
  tipo: 'ORDINARIO' | 'EXTRAORDINARIO',
  marca?: string,
  monto: number,
  tipoRegistro: 'BLANCO' | 'NEGRO',
  categoriaId: string | ObjectId,
  metodoPagoId: string | ObjectId,
  proveedorId?: string | ObjectId,
  fechaLlegaFactura?: Date,
  fechaPagoFactura?: Date,
  comprobanteNumber?: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### categorias
```typescript
{
  _id: ObjectId,
  nombre: string,
  descripcion?: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### metodos_pago
```typescript
{
  _id: ObjectId,
  nombre: string,
  descripcion?: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### proveedores
```typescript
{
  _id: ObjectId,
  nombre: string,
  detalle: string,
  telefono: string,
  personaContacto: string,
  registro: 'BLANCO' | 'NEGRO',
  categoriaId?: string | ObjectId,
  metodoPagoId?: string | ObjectId,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
// En queries con $lookup se agrega:
// categoria?: { _id: string, nombre: string }
// metodoPago?: { _id: string, nombre: string }
```

#### categorias_proveedores
```typescript
{
  _id: ObjectId,
  nombre: string,
  descripcion?: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### repartos
```typescript
{
  _id: ObjectId,
  weekKey: string,        // identificador de semana
  data: {
    [dayKey: string]: [{
      id: string,
      text: string,
      isCompleted: boolean,
      createdAt?: Date,
      updatedAt?: Date
    }]
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### email_templates
```typescript
{
  _id: ObjectId,
  name: string,
  subject: string,
  content: string,
  description?: string,
  isDefault: boolean,
  createdBy: string,      // userId
  createdAt: Date,
  updatedAt: Date
}
```

#### whatsapp_templates
```typescript
{
  _id: ObjectId,
  name: string,
  content: string,
  description?: string,
  isDefault: boolean,
  createdBy: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### scheduled_email_campaigns
```typescript
{
  _id: ObjectId,
  name: string,
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED',
  targetAudience: {
    type: 'behavior' | 'spending',
    category: string
  },
  scheduleCron: string,     // formato cron (ej: '0 9 * * 1')
  emailTemplateId: string,
  createdBy: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### deliveryareas
```typescript
{
  _id: ObjectId,
  description: string,
  coordinates: number[][],
  schedule: string,
  orderCutOffHour: number,
  enabled: boolean,
  sameDayDelivery: boolean,
  sameDayDeliveryDays: string[],
  whatsappNumber: string,
  sheetName: string,
  puntoEnvio?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### 4.2 Enums Globales

```typescript
// Secciones de precio
type PriceSection = 'PERRO' | 'GATO' | 'OTROS' | 'RAW';

// Tipos de precio
type PriceType = 'EFECTIVO' | 'TRANSFERENCIA' | 'MAYORISTA';

// Tipos de salida
type TipoSalida = 'ORDINARIO' | 'EXTRAORDINARIO';

// Tipo de registro fiscal
type TipoRegistro = 'BLANCO' | 'NEGRO';

// Estado de campana
type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

// Estado de pedido
type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

// Tipo de pedido
type OrderType = 'minorista' | 'mayorista';

// Estado de envio
type EstadoEnvio = 'pendiente' | 'pidiendo' | 'en-viaje' | 'listo';

// Zona mayorista
type MayoristaZona = 'CABA' | 'LA_PLATA' | 'OESTE' | 'NOROESTE' | 'NORTE' | 'SUR';

// Frecuencia mayorista
type MayoristaFrecuencia = 'SEMANAL' | 'QUINCENAL' | 'MENSUAL' | 'OCASIONAL';

// Tipo negocio mayorista
type MayoristaTipoNegocio = 'PET_SHOP' | 'VETERINARIA' | 'PELUQUERIA';

// Categoria de comportamiento de cliente
type ClientBehaviorCategory = 'new' | 'active' | 'possible-inactive' | 'lost' | 'recovered' | 'tracking';

// Categoria de gasto de cliente
type ClientSpendingCategory = 'premium' | 'standard' | 'basic';

// Roles de usuario
type UserRole = 'admin' | 'user';
```

---

## 5. Integraciones Externas

### 5.1 Resend (Email)
- **Proposito:** Envio de emails transaccionales y masivos
- **SDK:** `resend` npm package
- **Funciones:**
  - `resend.batch.send(emails)` - Envio masivo
  - Templates con React Email components
- **Variables:** `RESEND_TOKEN`, `RESEND_FROM`

### 5.2 Cloudflare R2 (Almacenamiento de imagenes)
- **Proposito:** Upload, update y delete de imagenes
- **SDK:** `@aws-sdk/client-s3` (protocolo S3-compatible)
- **Bucket:** `r2-lucasdev`
- **Funciones:**
  - `uploadR2Image(formData)` - Upload nuevo
  - `updateR2Image(key, formData)` - Reemplazar existente
  - `deleteR2Image(key)` - Eliminar
  - `formatR2Url(key)` - Generar URL publica
- **Variables:** `CLOUDFLARE_R2_ENDPOINT`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_PUBLIC_DOMAIN`

### 5.3 Svix (Webhooks)
- **Proposito:** Gestion de webhooks salientes
- **SDK:** `svix` npm package
- **Funciones:**
  - `svix.message.create(orgId, payload)` - Enviar evento
  - `svix.authentication.appPortalAccess(orgId)` - Portal de webhooks
- **Variables:** `SVIX_TOKEN`

### 5.4 Arcjet (Seguridad)
- **Proposito:** Proteccion DDoS, deteccion de bots, rate limiting
- **SDK:** `@arcjet/next`
- **Integrado en:** Middleware de seguridad
- **Variables:** `ARCJET_KEY`

### 5.5 Liveblocks (Colaboracion en tiempo real)
- **Proposito:** Edicion colaborativa y presencia de usuarios
- **SDK:** `@liveblocks/client`, `@liveblocks/react`, `@liveblocks/node`
- **Funciones:**
  - Autenticacion de sesiones
  - Control de acceso a rooms
  - Presencia de usuarios (cursor, avatar)
- **Variables:** `LIVEBLOCKS_SECRET`

### 5.6 PostHog (Product Analytics)
- **Proposito:** Analytics de producto y feature flags
- **SDK:** `posthog-js`, `posthog-node`
- **Funciones:**
  - Tracking de eventos
  - Feature flags por usuario
- **Variables:** `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`

### 5.7 Knock (Notificaciones)
- **Proposito:** Notificaciones in-app y feed de notificaciones
- **SDK:** `@knocklabs/node`, `@knocklabs/react`
- **Funciones:**
  - Feed de notificaciones
  - Bell icon con badge
  - Popover de notificaciones
- **Variables:** `KNOCK_SECRET_API_KEY`, `NEXT_PUBLIC_KNOCK_API_KEY`, `NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID`

### 5.8 Sentry (Error Tracking)
- **Proposito:** Monitoreo de errores y performance
- **SDK:** `@sentry/nextjs`
- **Config:** 100% trace sampling, 100% error replay, 10% session replay
- **Variables:** `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`

### 5.9 BetterStack (Status Page)
- **Proposito:** Monitoreo de uptime y status page
- **API:** REST `https://uptime.betterstack.com/api/v2/monitors`
- **Variables:** `BETTERSTACK_API_KEY`, `BETTERSTACK_URL`

### 5.10 Google Analytics
- **Proposito:** Web analytics
- **SDK:** `@next/third-parties/google`
- **Variables:** `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### 5.11 Vercel Analytics
- **Proposito:** Core Web Vitals y performance
- **SDK:** `@vercel/analytics/react`
- **Variables:** Ninguna (siempre activo en Vercel)

### 5.12 Nosecone (Security Headers)
- **Proposito:** Content Security Policy y headers de seguridad
- **SDK:** `@nosecone/next`
- **Integrado en:** Middleware principal

### 5.13 Feature Flags
- **Proposito:** Gestion de feature flags y A/B testing
- **SDK:** `flags/next`
- **Integrado con:** PostHog para decisiones por usuario
- **Variables:** `FLAGS_SECRET`

---

## 6. Variables de Entorno

### Requeridas (Core)

| Variable | Tipo | Descripcion |
|----------|------|-------------|
| `DATABASE_URL` | string | Connection string PostgreSQL |
| `MONGODB_URL` | string | Connection string MongoDB |
| `JWT_SECRET` | string | Secret para tokens de sesion |

### Autenticacion (Opcionales)

| Variable | Tipo | Default | Descripcion |
|----------|------|---------|-------------|
| `SESSION_EXPIRY_DAYS` | string -> number | '30' | Dias de expiracion de sesion |
| `NEXT_PUBLIC_AUTH_SIGN_IN_URL` | string | '/sign-in' | URL de login |
| `NEXT_PUBLIC_AUTH_SIGN_UP_URL` | string | '/sign-up' | URL de registro |
| `NEXT_PUBLIC_AUTH_AFTER_SIGN_IN_URL` | string | '/' | Redirect post-login |
| `NEXT_PUBLIC_AUTH_AFTER_SIGN_UP_URL` | string | '/' | Redirect post-registro |

### Email (Resend)

| Variable | Tipo | Descripcion |
|----------|------|-------------|
| `RESEND_TOKEN` | string | API key de Resend |
| `RESEND_FROM` | string (email) | Email del remitente |

### Almacenamiento (Cloudflare R2)

| Variable | Tipo | Descripcion |
|----------|------|-------------|
| `CLOUDFLARE_R2_ENDPOINT` | string | Endpoint S3-compatible |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | string | Access key ID |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | string | Secret access key |
| `CLOUDFLARE_R2_PUBLIC_DOMAIN` | string | Dominio publico para URLs |

### Analytics y Monitoreo

| Variable | Tipo | Descripcion |
|----------|------|-------------|
| `NEXT_PUBLIC_POSTHOG_KEY` | string (phc_...) | PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | string (URL) | PostHog host |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | string (G-...) | Google Analytics ID |
| `NEXT_PUBLIC_SENTRY_DSN` | string (URL) | Sentry DSN |
| `SENTRY_ORG` | string | Sentry organization |
| `SENTRY_PROJECT` | string | Sentry project |
| `BETTERSTACK_API_KEY` | string | BetterStack API key |
| `BETTERSTACK_URL` | string | BetterStack status page URL |

### Seguridad

| Variable | Tipo | Descripcion |
|----------|------|-------------|
| `ARCJET_KEY` | string (ajkey_...) | Arcjet security key |
| `FLAGS_SECRET` | string | Feature flags secret |

### Colaboracion y Notificaciones

| Variable | Tipo | Descripcion |
|----------|------|-------------|
| `LIVEBLOCKS_SECRET` | string (sk_...) | Liveblocks server secret |
| `SVIX_TOKEN` | string (sk_/testsk_) | Svix webhook token |
| `KNOCK_SECRET_API_KEY` | string | Knock server API key |
| `NEXT_PUBLIC_KNOCK_API_KEY` | string | Knock client API key |
| `NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID` | string | Knock feed channel ID |

### URLs de la App

| Variable | Tipo | Default | Descripcion |
|----------|------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | string | http://localhost:3000 | URL principal |
| `NEXT_PUBLIC_WEB_URL` | string | http://localhost:3001 | URL web publica |
| `NEXT_PUBLIC_API_URL` | string | - | URL del backend API |

---

## Notas Importantes para el Backend

1. **Timezone:** El sistema maneja fechas en timezone Argentina (UTC-3). Los pedidos tienen conversiones especificas entre UTC y horario argentino para filtros por dia/rango.

2. **Calculo de precios:** La logica de calculo mapea `orderType` + `paymentMethod` a `PriceType`:
   - mayorista -> MAYORISTA
   - efectivo -> EFECTIVO
   - transfer/bank-transfer -> TRANSFERENCIA

3. **Peso de productos:** Se extrae del nombre del producto/opcion con regex. Casos especiales:
   - BIG DOG = 15kg
   - BOX GATO = 5kg, BOX default = 10kg
   - Productos excluidos del peso: OREJA, CORNALITO, GARRA, CALDO, COMPLEMENTO, items < 100g

4. **Backups de pedidos:** Antes de actualizar o eliminar un pedido, se guarda un backup en `orderBackups` para permitir undo.

5. **Normalizacion de telefono:** Se normaliza el formato de telefono en pedidos (sin espacios, con codigo de area).

6. **Normalizacion de horarios:** Los horarios de schedule se normalizan a formato "HH:MM" (convierte "18.30", "19hs", "1830" a "18:30").

7. **Agregaciones MongoDB:** Varias consultas usan `$lookup` para joins entre colecciones:
   - salidas -> categorias + metodos_pago
   - proveedores -> categorias + metodos_pago
   - detalle_envio -> puntos_envio

8. **Permisos por punto de envio:** Los usuarios con rol `user` pueden tener asignados uno o mas `puntoEnvio`. Las queries de express deben filtrar segun los puntos de envio asignados al usuario.

9. **WhatsApp tracking:** No hay integracion directa con WhatsApp API. Solo se trackea en la BD si un cliente fue contactado, ocultado o es visible. El campo `whatsappContactedAt` en orders puede ser una Date o el string `"ocultado"`.

10. **Stock rollover:** El cron job ejecuta `checkAndPerformStockRollover()` que migra stock del dia anterior al nuevo dia.
