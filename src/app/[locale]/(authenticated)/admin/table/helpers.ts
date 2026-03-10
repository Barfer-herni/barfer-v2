import { AVAILABLE_PRODUCTS, RAW_PRODUCTS, COMPLEMENT_PRODUCTS, FORBIDDEN_PRODUCTS_FOR_RETAIL, DAY_COLORS } from './constants';

// Función para obtener productos según el tipo de cliente
// NOTA: Esta función ahora es un fallback. Los productos reales se obtienen desde la base de datos
export const getProductsByClientType = (clientType: 'minorista' | 'mayorista') => {
    if (clientType === 'mayorista') {
        // Combinar todas las listas y eliminar duplicados
        const allProducts = [...AVAILABLE_PRODUCTS, ...RAW_PRODUCTS, ...COMPLEMENT_PRODUCTS];
        const uniqueProducts = [...new Set(allProducts)];
        return uniqueProducts;
    }
    // Excluir productos prohibidos para minorista
    const allProducts = [...AVAILABLE_PRODUCTS, ...RAW_PRODUCTS, ...COMPLEMENT_PRODUCTS];
    const filtered = allProducts.filter(product =>
        !FORBIDDEN_PRODUCTS_FOR_RETAIL.some(f => product.trim().toLowerCase().startsWith(f.toLowerCase()))
    );
    // Eliminar duplicados
    return [...new Set(filtered)];
};

// Función para obtener productos desde la base de datos (colección prices)
export const getProductsFromDatabase = async (clientType: 'minorista' | 'mayorista'): Promise<{
    products: string[];
    productsWithDetails: Array<{
        section: string;
        product: string;
        weight: string | null;
        formattedName: string;
    }>;
}> => {
    try {
        const { getProductsFromPricesAction } = await import('./actions');
        const result = await getProductsFromPricesAction();

        if (result.success && result.products && result.productsWithDetails) {
            // Filtrar productos según el tipo de cliente
            if (clientType === 'minorista') {
                // Excluir productos prohibidos para minorista Y productos RAW
                // Los productos RAW solo están disponibles para mayoristas
                const filteredProducts = result.products.filter((product: any) => {
                    // Excluir productos prohibidos para minorista
                    const isNotForbidden = !FORBIDDEN_PRODUCTS_FOR_RETAIL.some(f =>
                        product.toLowerCase().includes(f.toLowerCase())
                    );

                    // Excluir productos RAW
                    const isNotRaw = !product.toLowerCase().includes('raw');

                    // Para productos de la sección OTROS, solo permitir BOX DE COMPLEMENTOS y HUESOS CARNOSOS
                    let isAllowedOtros = true;
                    const productLower = product.toLowerCase();
                    if (productLower.includes('garras') ||
                        productLower.includes('cornalitos') ||
                        productLower.includes('huesos recreativos') ||
                        productLower.includes('caldo de huesos')) {
                        isAllowedOtros = false;
                    }

                    return isNotForbidden && isNotRaw && isAllowedOtros;
                });

                const filteredDetails = result.productsWithDetails.filter((detail: any) => {
                    // Excluir productos prohibidos para minorista
                    const isNotForbidden = !FORBIDDEN_PRODUCTS_FOR_RETAIL.some(f =>
                        detail.formattedName.toLowerCase().includes(f.toLowerCase())
                    );

                    // Excluir productos RAW
                    const isNotRaw = detail.section !== 'RAW';

                    // Para la sección OTROS, solo permitir BOX DE COMPLEMENTOS y HUESOS CARNOSOS
                    let isAllowedOtros = true;
                    if (detail.section === 'OTROS') {
                        const productName = detail.product.toLowerCase();
                        isAllowedOtros = productName.includes('box de complementos') ||
                            productName.includes('huesos carnosos') ||
                            productName.includes('hueso carnoso');
                    }

                    return isNotForbidden && isNotRaw && isAllowedOtros;
                });

                return {
                    products: filteredProducts,
                    productsWithDetails: filteredDetails
                };
            }
            // Para mayoristas, devolver todos los productos (incluyendo RAW)
            return {
                products: result.products,
                productsWithDetails: result.productsWithDetails
            };
        }

        // Fallback a productos hardcodeados si hay error
        console.warn('Error obteniendo productos de la base de datos, usando fallback');
        const fallbackProducts = getProductsByClientType(clientType);
        return {
            products: fallbackProducts,
            productsWithDetails: fallbackProducts.map(product => ({
                section: '',
                product: product,
                weight: null,
                formattedName: product
            }))
        };
    } catch (error) {
        console.error('Error en getProductsFromDatabase:', error);
        // Fallback a productos hardcodeados
        const fallbackProducts = getProductsByClientType(clientType);
        return {
            products: fallbackProducts,
            productsWithDetails: fallbackProducts.map(product => ({
                section: '',
                product: product,
                weight: null,
                formattedName: product
            }))
        };
    }
};

// Función para filtrar productos por búsqueda
export const getFilteredProducts = (clientType: 'minorista' | 'mayorista', searchTerm: string) => {
    const products = getProductsByClientType(clientType);
    if (!searchTerm) return products;

    return products.filter(product =>
        product.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

// Función para determinar el color de la fila
export const shouldHighlightRow = (row: any) => {
    const status = row.original.status?.toLowerCase();
    const notesOwn = row.original.notesOwn || '';

    // Verificar si es un pedido duplicado
    if (notesOwn.toLowerCase().includes('duplicado')) return 'orange';

    // Estados entregados/confirmados
    if (status === 'delivered') return 'green';

    return null;
};

// Función para determinar el color de fondo de la celda de fecha
export const getDateCellBackgroundColor = (deliveryDay: string | Date | { $date: string }) => {
    if (!deliveryDay) return '';

    // Usar la función helper para crear una fecha local
    const date = createLocalDate(deliveryDay);
    const day = date.getDay();
    return DAY_COLORS[day as keyof typeof DAY_COLORS] || '';
};

// Función para determinar el color de fondo de la celda de estado
export const getStatusCellBackgroundColor = (status: string, paymentMethod: string) => {
    if (status === 'pending' && paymentMethod !== 'cash') {
        return 'bg-red-500';
    }
    if (status === 'confirmed') {
        return 'bg-green-600';
    }
    return '';
};

// Función para crear el objeto de orden por defecto
export const createDefaultOrderData = () => ({
    status: 'pending',
    total: '', // Campo vacío para forzar al usuario a ingresar un valor
    subTotal: 0,
    shippingPrice: 0,
    notes: '',
    notesOwn: '',
    paymentMethod: '',
    orderType: 'minorista' as 'minorista' | 'mayorista',
    address: {
        address: '',
        city: '',
        phone: '',
        betweenStreets: '',
        floorNumber: '',
        departmentNumber: '',
    },
    user: {
        name: '',
        lastName: '',
        email: '',
    },
    items: [{
        id: '',
        name: '',
        fullName: '',
        description: '',
        images: [],
        options: [{
            name: 'Default',
            price: 0,
            quantity: 1,
        }],
        price: 0,
        salesCount: 0,
        discountApllied: 0,
    }],
    deliveryArea: {
        _id: '',
        description: '',
        coordinates: [],
        schedule: '',
        orderCutOffHour: 18,
        enabled: true,
        sameDayDelivery: false,
        sameDayDeliveryDays: [],
        whatsappNumber: '',
        sheetName: '',
    },
    deliveryDay: '',
    puntoEnvio: '', // Punto de envío para órdenes express (bank-transfer)
});

// Función para extraer el peso del nombre del producto
export const extractWeightFromProductName = (productName: string): string => {
    if (!productName) return 'Default';

    console.log(`🔍 extractWeightFromProductName: Analizando "${productName}"`);

    // Patrones que NO son peso (productos que no necesitan extracción)
    const nonWeightPatterns = [
        /\b\d+\s*x\s*\d+\b/i,        // "traquea x1", "producto x2", etc.
        /\b\d+\s*U\b/i,               // "1 U", "2 U", etc.
        /\b\d+\s*unidades?\b/i,       // "1 unidad", "2 unidades", etc.
        /\b\d+\s*pcs?\b/i,            // "1 pc", "2 pcs", etc.
        /\b\d+\s*piezas?\b/i,         // "1 pieza", "2 piezas", etc.
        /\b\d+\s*capsulas?\b/i,       // "1 capsula", "2 capsulas", etc.
        /\b\d+\s*tabletas?\b/i,       // "1 tableta", "2 tabletas", etc.
        /\b\d+\s*comprimidos?\b/i,    // "1 comprimido", "2 comprimidos", etc.
    ];

    // Si el producto coincide con patrones que NO son peso, devolver el valor original
    for (const pattern of nonWeightPatterns) {
        if (pattern.test(productName)) {
            console.log(`🚫 Producto "${productName}" no necesita extracción de peso`);
            return 'Default';
        }
    }

    // Buscar patrones de peso al final del nombre
    const weightPatterns = [
        /\b(\d+)\s*kg\b/i,           // 10kg, 5 kg, etc.
        /\b(\d+)\s*KG\b/,            // 10KG, 5 KG, etc.
        /\b(\d+)\s*Kg\b/,            // 10Kg, 5 Kg, etc.
        /\b(\d+)\s*gramos?\b/i,      // 500 gramos, 500 gramo, etc.
        /\b(\d+)\s*g\b/i,            // 500g, 500 g, etc.
        /\b(\d+)\s*G\b/,             // 500G, 500 G, etc.
        /\b(\d+)\s*litros?\b/i,      // 1 litro, 1 litros, etc.
        /\b(\d+)\s*l\b/i,            // 1l, 1 l, etc.
        /\b(\d+)\s*L\b/,             // 1L, 1 L, etc.
    ];

    for (const pattern of weightPatterns) {
        const match = productName.match(pattern);
        if (match) {
            const weight = match[1];
            const unit = match[0].replace(weight, '').trim();

            // Normalizar la unidad
            if (unit.toLowerCase().includes('kg') || unit.toLowerCase().includes('kilo')) {
                const result = `${weight}KG`;
                return result;
            } else if (unit.toLowerCase().includes('gramo') || unit.toLowerCase().includes('g')) {
                const result = `${weight}G`;
                return result;
            } else if (unit.toLowerCase().includes('litro') || unit.toLowerCase().includes('l')) {
                const result = `${weight}L`;
                return result;
            }
            // Si no se reconoce la unidad, devolver el valor encontrado
            const result = match[0].toUpperCase();
            return result;
        }
    }

    // Si no se encuentra peso, buscar en patrones específicos conocidos
    const knownPatterns = [
        { pattern: /\bBIG DOG\b.*?\((\d+)\s*kg\)/i, unit: 'kg' },
        { pattern: /\b(\d+)\s*medallones?\s*de\s*(\d+)\s*g/i, unit: 'G' },
    ];

    for (const { pattern, unit } of knownPatterns) {
        const match = productName.match(pattern);
        if (match) {
            if (unit === 'G' && match[2]) {
                // Para medallones, calcular el peso total
                const medallones = parseInt(match[1]);
                const pesoMedallon = parseInt(match[2]);
                const pesoTotal = medallones * pesoMedallon;
                return `${pesoTotal}G`;
            } else if (match[1]) {
                return `${match[1]}${unit}`;
            }
        }
    }
    return 'Default';
};

// Función para extraer el nombre base del producto (sin el peso)
export const extractBaseProductName = (productName: string): string => {
    if (!productName) return '';

    // Patrones que NO son peso (productos que no necesitan extracción)
    const nonWeightPatterns = [
        /\b\d+\s*x\s*\d+\b/i,        // "traquea x1", "producto x2", etc.
    ];

    // Si el producto coincide con patrones que NO son peso, devolver el nombre original
    for (const pattern of nonWeightPatterns) {
        if (pattern.test(productName)) {
            return productName;
        }
    }

    let baseName = productName;

    // NORMALIZACIÓN: Convertir nombres "Barfer box Perro Pollo 5kg" a "BOX PERRO POLLO"
    // Patrón para productos Barfer
    const barferPattern = /^barfer\s+box\s+(.+?)(?:\s+\d+\s*kg|\s*$)/i;
    const barferMatch = baseName.match(barferPattern);

    if (barferMatch) {
        // Extraer la parte después de "barfer box" y convertir a formato estándar
        const productType = barferMatch[1].trim();
        const words = productType.split(' ').map(word => word.toUpperCase());
        baseName = `BOX ${words.join(' ')}`;
        return baseName;
    }

    // NORMALIZACIÓN: Convertir nombres "BIG DOG (15kg) - POLLO" a "BIG DOG POLLO"
    const bigDogPattern = /^big\s+dog\s*\([^)]*\)\s*-\s*(.+?)$/i;
    const bigDogMatch = baseName.match(bigDogPattern);

    if (bigDogMatch) {
        const variant = bigDogMatch[1].trim().toUpperCase();
        baseName = `BIG DOG ${variant}`;
        return baseName;
    }

    // NORMALIZACIÓN: Para productos que ya están en formato "BOX PERRO POLLO 5KG", remover solo el peso
    // Buscar patrones de peso al final del nombre y removerlos
    const weightPatterns = [
        /\s+\d+\s*kg\b/i,           // 10kg, 5 kg, etc.
        /\s+\d+\s*KG\b/,            // 10KG, 5 KG, etc.
        /\s+\d+\s*Kg\b/,            // 10Kg, 5 Kg, etc.
        /\s+\d+\s*U\b/i,            // 1U, 2 U, etc.
        /\s+\d+\s*gramos?\b/i,      // 500 gramos, 500 gramo, etc.
        /\s+\d+\s*g\b/i,            // 500g, 500 g, etc.
        /\s+\d+\s*G\b/,             // 500G, 500 G, etc.
        /\s+\d+\s*litros?\b/i,      // 1 litro, 1 litros, etc.
        /\s+\d+\s*l\b/i,            // 1l, 1 l, etc.
        /\s+\d+\s*L\b/,             // 1L, 1 L, etc.
    ];

    // Remover patrones de peso encontrados
    for (const pattern of weightPatterns) {
        baseName = baseName.replace(pattern, '');
    }

    // Remover patrones específicos conocidos
    const specificPatterns = [
        /\s*\([^)]*\)/g,            // Remover paréntesis y su contenido
        /\s*-\s*[^-]*$/g,           // Remover guiones y contenido después del último guión
    ];

    for (const pattern of specificPatterns) {
        baseName = baseName.replace(pattern, '');
    }

    // Normalizar a mayúsculas si es un producto BOX o BIG DOG
    if (baseName.toUpperCase().startsWith('BOX ') || baseName.toUpperCase().startsWith('BIG DOG')) {
        baseName = baseName.toUpperCase();
    }

    // Limpiar espacios extra y retornar
    return baseName.trim();
};

// Función para procesar un solo item (extraer peso y nombre base)
export const processSingleItem = (item: any): any => {
    if (!item.name || !item.name.trim()) return item;


    // Si ya tiene fullName y options.name no es 'Default', no procesar
    if (item.fullName && item.options?.[0]?.name && item.options[0].name !== 'Default') {
        return item;
    }

    // Si no tenemos fullName, usar el nombre actual
    const originalName = item.fullName || item.name;

    // PRIORIDAD 1: Si el nombre contiene " - " es formato de BD (ej: "PERRO - BIG DOG VACA - 15KG")
    if (originalName.includes(' - ')) {
        const dbFormat = mapSelectOptionToDBFormat(originalName);

        return {
            ...item,
            id: dbFormat.name,
            name: dbFormat.name,
            fullName: originalName,
            options: [{
                ...item.options?.[0],
                name: dbFormat.option
            }]
        };
    }

    // PRIORIDAD 2: Si el nombre parece ser una opción del select (contiene palabras clave)
    // usar el mapeo inverso para obtener el formato de la DB
    if (originalName.toLowerCase().includes('barfer box') ||
        originalName.toLowerCase().includes('big dog') ||
        originalName.toLowerCase().includes('huesos') ||
        originalName.toLowerCase().includes('traquea') ||
        originalName.toLowerCase().includes('orejas') ||
        originalName.toLowerCase().includes('pollo') ||
        originalName.toLowerCase().includes('higado') ||
        originalName.toLowerCase().includes('cornalitos') ||
        originalName.toLowerCase().includes('caldo') ||
        originalName.toLowerCase().includes('hueso recreativo') ||
        originalName.toLowerCase().includes('garras') ||
        originalName.toLowerCase().includes('complementos')) {

        const dbFormat = mapSelectOptionToDBFormat(originalName);

        return {
            ...item,
            id: dbFormat.name,
            name: dbFormat.name,
            fullName: originalName,
            options: [{
                ...item.options?.[0],
                name: dbFormat.option
            }]
        };
    }

    // Si no es un nombre de select, usar el procesamiento original
    // Extraer el peso del nombre del producto y asignarlo a la opción
    const weight = extractWeightFromProductName(originalName);
    // Extraer el nombre base del producto (sin peso)
    const baseName = extractBaseProductName(originalName);

    // Crear una copia del item para no modificar el original
    const processedItem = {
        ...item,
        id: baseName,        // ID también debe ser el nombre base (sin peso)
        name: baseName,      // Nombre base (sin peso)
        fullName: originalName, // Nombre completo original para referencia
        options: [{
            ...item.options?.[0],
            name: weight     // Peso extraído del nombre (5KG, 10KG, etc.) - NO del item original
        }]
    };
    return processedItem;
};

// Función para filtrar items válidos (solo valida, no procesa)
export const filterValidItems = (items: any[]) => {
    return items.filter(item => {
        // Verificar que el item tenga nombre y cantidad válida
        const hasValidName = item.name && item.name.trim() !== '';
        const hasValidQuantity = item.options?.[0]?.quantity > 0;
        return hasValidName && hasValidQuantity;
    });
};

// Función para validar entrada del campo de búsqueda
export const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Función para construir el nombre del archivo de exportación
export const buildExportFileName = (from?: string, to?: string) => {
    let fileName = 'ordenes';
    if (from && to) {
        if (from === to) {
            fileName = `ordenes-${from}`;
        } else {
            fileName = `ordenes-del-${from}-al-${to}`;
        }
    }
    return `${fileName}.xlsx`;
};

// Función para convertir base64 a blob
export const downloadBase64File = (base64Data: string, fileName: string) => {
    // Decodificar la cadena base64 a un array de bytes
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

// Función para crear una fecha local preservando la fecha original
// Las fechas en MongoDB se guardan en UTC, pero queremos interpretarlas en hora de Argentina (UTC-3)
export const createLocalDate = (dateInput: string | Date | { $date: string }): Date => {
    let dateStr: string;

    // Si es un objeto con $date, extraer el string
    if (typeof dateInput === 'object' && '$date' in dateInput) {
        dateStr = dateInput.$date;
    }
    // Si ya es un Date, convertir a ISO string
    else if (dateInput && typeof dateInput === 'object' && 'getTime' in dateInput) {
        dateStr = (dateInput as Date).toISOString();
    } else if (typeof dateInput === 'string') {
        dateStr = dateInput;
    } else {
        dateStr = new Date(dateInput as any).toISOString();
    }

    // Extraer solo la parte de fecha (YYYY-MM-DD) del string
    // Esto ignora completamente la hora y el timezone
    const datePart = dateStr.substring(0, 10);
    const [year, month, day] = datePart.split('-').map(Number);

    // Crear fecha local en Argentina usando el constructor con componentes
    // Esto crea una fecha a las 00:00:00 hora local (sin conversión de timezone)
    return new Date(year, month - 1, day);
};

// Función para crear una fecha ISO preservando la fecha local
export const createLocalDateISO = (date: Date): Date => {
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return localDate;
};

// Función para probar la normalización de nombres de productos
export const testProductNameNormalization = () => {
    const testCases = [
        'Barfer box Perro Pollo 5kg',
        'Barfer box Gato Vaca 5kg',
        'Barfer box Perro Cerdo 10kg',
        'BIG DOG (15kg) - POLLO',
        'BIG DOG (15kg) - VACA',
        'BOX PERRO POLLO 5KG',
        'BOX GATO CORDERO 5KG',
        'BOX PERRO POLLO 10KG',
        'HUESOS CARNOSOS 5KG',
        'BOX COMPLEMENTOS 1U'
    ];

    testCases.forEach(testCase => {
        const normalized = extractBaseProductName(testCase);
        const weight = extractWeightFromProductName(testCase);
    });
};

// Función para probar el procesamiento completo de items
export const testItemProcessing = () => {
    const testItems = [
        {
            name: 'BOX PERRO POLLO 10KG',
            options: [{ name: 'Default', price: 0, quantity: 1 }]
        },
        {
            name: 'Barfer box Gato Vaca 5kg',
            options: [{ name: 'Default', price: 0, quantity: 2 }]
        }
    ];

    testItems.forEach((item, index) => {
        const processed = processSingleItem(item);
    });
};

// Función para mapear productos desde la colección prices hacia el formato del select
export const mapPriceProductToSelectOption = (section: string, product: string, weight: string | null): string => {
    const parts = [section, product];
    if (weight) {
        parts.push(weight);
    }
    return parts.join(' - ');
};

// Función para mapear productos de la DB hacia las opciones del select
// NUEVA IMPLEMENTACIÓN: Usa directamente los valores de la base de datos
export const mapDBProductToSelectOption = (dbProductName: string, dbOptionName: string): string => {

    // Si ya tenemos un formato "section - product - weight", devolverlo tal como está
    if (dbProductName.includes(' - ')) {
        return dbProductName;
    }

    // DETECCIÓN DE DATOS CORRUPTOS: Si el nombre es solo una opción (ej: "1 U", "10KG", "x1")
    // y la opción es la misma, probablemente es un dato corrupto
    if (dbProductName === dbOptionName && (
        dbProductName.match(/^\d+\s*[A-Z]+$/i) || // "1 U", "10KG", etc.
        dbProductName.match(/^x\d+$/i) || // "x1", "x2", etc.
        dbProductName.match(/^\d+$/i) // Solo números
    )) {

        // Intentar corregir basándose en la opción
        if (dbOptionName === '1 U') {
            const corrected = 'OTROS - BOX DE COMPLEMENTOS - 1 U';
            return corrected;
        }

        // Para otros casos corruptos, devolver tal como está pero con advertencia
        const fallback = `${dbProductName} - ${dbOptionName}`;
        return fallback;
    }

    // Intentar reconstruir el formato completo "SECTION - PRODUCT - WEIGHT" desde el formato de DB
    // El formato de DB puede ser:
    // - "BOX PERRO VACA" + "10KG" -> "PERRO - VACA - 10KG"
    // - "BOX GATO POLLO" + "5KG" -> "GATO - POLLO - 5KG"
    // - "BIG DOG (15kg)" + "VACA" -> "PERRO - BIG DOG VACA - 15KG"
    // - "5KG" + "x1" -> No se puede reconstruir (datos corruptos), devolver tal cual

    let section = '';
    let product = '';
    let weight = dbOptionName || '';

    // Detectar sección y producto desde el nombre de DB
    if (dbProductName.startsWith('BOX PERRO ')) {
        section = 'PERRO';
        product = dbProductName.replace('BOX PERRO ', '');
    } else if (dbProductName.startsWith('BOX GATO ')) {
        section = 'GATO';
        product = dbProductName.replace('BOX GATO ', '');
    } else if (dbProductName.includes('BIG DOG')) {
        section = 'PERRO';
        // "BIG DOG (15kg)" + "VACA" -> "BIG DOG VACA"
        if (dbOptionName && dbOptionName.match(/^[A-Z]+$/)) {
            // La opción es el sabor (VACA, POLLO, etc)
            product = `BIG DOG ${dbOptionName}`;
            weight = '15KG';
        } else {
            product = dbProductName;
        }
    } else if (dbProductName.startsWith('HUESOS RECREATIVOS') ||
        dbProductName.startsWith('BOX DE COMPLEMENTOS')) {
        section = 'OTROS';
        product = dbProductName;
        // Estos productos no tienen peso adicional
        weight = '';
    } else if (dbProductName.startsWith('HUESOS CARNOSOS') || dbProductName.startsWith('HUESO CARNOSO')) {
        section = 'OTROS';
        // CORRECCIÓN: Si el producto es solo "HUESOS CARNOSOS" sin el peso, agregar "5KG"
        // porque en la BD se almacena como "HUESOS CARNOSOS 5KG"
        if (dbProductName === 'HUESOS CARNOSOS' || dbProductName === 'HUESO CARNOSO') {
            product = 'HUESOS CARNOSOS 5KG';
        } else {
            product = dbProductName;
        }
        // Estos productos no tienen peso adicional (el peso está en el nombre)
        weight = '';
    } else if (dbProductName.includes('OREJA') ||
        dbProductName.includes('TREAT') ||
        dbProductName.includes('TRAQUEA') ||
        dbProductName.includes('GARRAS') ||
        dbProductName.includes('CORNALITOS') ||
        dbProductName.includes('CALDO') ||
        dbProductName.includes('HIGADO') ||
        (dbProductName.includes('POLLO') && (dbProductName.includes('40GRS') || dbProductName.includes('100GRS')))) {
        section = 'RAW';
        product = dbProductName;
        // Para productos RAW, el peso/cantidad ya está en el nombre del producto
        // No agregar el dbOptionName como weight adicional
        weight = '';
    } else {
        // No se puede reconstruir, devolver tal cual
        if (dbOptionName && dbOptionName.trim() !== '') {
            return `${dbProductName} - ${dbOptionName}`;
        }
        return dbProductName;
    }

    // Construir el formato completo
    if (weight && weight.trim() !== '') {
        return `${section} - ${product} - ${weight}`;
    }
    return `${section} - ${product}`;
};

// Función para mapear desde la opción del select hacia el formato de la DB
// NUEVA IMPLEMENTACIÓN: Usa directamente los valores de la base de datos
export const mapSelectOptionToDBFormat = (selectOption: string): { name: string, option: string } => {
    // NUEVO: Manejar formato de productos desde la base de datos (ej: "PERRO - VACA - 10KG")
    if (selectOption.includes(' - ')) {
        const parts = selectOption.split(' - ');

        if (parts.length >= 2) {
            const section = parts[0]; // PERRO, GATO, OTROS
            const product = parts[1]; // VACA, POLLO, BIG DOG VACA, etc.
            const weight = parts[2] || null; // 10KG, 5KG, etc.
            // Caso especial: si la primera parte es "BOX DE COMPLEMENTOS", es un formato especial
            if (section === 'BOX DE COMPLEMENTOS') {
                const result = {
                    name: 'BOX DE COMPLEMENTOS',
                    option: product || '1 U' // "1 U" es la segunda parte
                };

                return result;
            }
            let cleanName = '';
            let mappedOption = weight || '';

            if (section === 'PERRO') {
                // BIG DOG: En BD se guarda como "BIG DOG VACA" o "BIG DOG POLLO"
                // Pero en items debe ser: name="BIG DOG (15kg)", option="VACA"

                // Normalizar para comparación (eliminar espacios extras y convertir a mayúsculas)
                const productNormalized = product.trim().toUpperCase();

                if (productNormalized.startsWith('BIG DOG')) {
                    // Extraer el sabor del nombre del producto
                    // "BIG DOG VACA" -> name="BIG DOG (15kg)", option="VACA"
                    const sabor = productNormalized.replace('BIG DOG', '').trim(); // Extraer "VACA", "POLLO", etc.
                    cleanName = 'BIG DOG (15kg)'; // Nombre base del producto
                    mappedOption = sabor; // El sabor como opción (VACA, POLLO, CORDERO)
                } else {
                    // Es un BOX PERRO normal
                    // Solo agregar "BOX PERRO" si el producto NO empieza con "BOX"
                    if (product.startsWith('BOX ')) {
                        cleanName = product; // Ya tiene el formato correcto
                    } else {
                        cleanName = `BOX PERRO ${product}`; // "BOX PERRO VACA", "BOX PERRO POLLO", etc.
                    }
                    mappedOption = weight || '';
                }
            } else if (section === 'GATO') {
                // Solo agregar "BOX GATO" si el producto NO empieza con "BOX"
                if (product.startsWith('BOX ')) {
                    cleanName = product; // Ya tiene el formato correcto
                } else {
                    cleanName = `BOX GATO ${product}`;
                }
            } else if (section === 'RAW') {
                // Para productos RAW, el nombre del producto ya incluye toda la información
                // (ej: "TRAQUEA X1", "OREJA X50", "POLLO 100GRS")
                // No hay peso adicional, todo está en el nombre
                cleanName = product;
                mappedOption = ''; // Los productos RAW no usan option, todo está en el nombre
            } else if (section === 'OTROS') {
                cleanName = product;
            } else {
                cleanName = product; // Solo usar el nombre del producto
            }

            // Caso especial: si el producto es "BOX DE COMPLEMENTOS", mantener el nombre completo
            if (product === 'BOX DE COMPLEMENTOS') {
                cleanName = 'BOX DE COMPLEMENTOS';
                mappedOption = weight || '1 U';
            }

            const result = {
                name: cleanName, // Nombre limpio sin guiones
                option: mappedOption // El peso o sabor como opción
            };
            return result;
        }
    }
    // Manejar casos específicos de productos que no están en formato BD
    const normalizedSelect = selectOption.toLowerCase().trim();

    // Mapear Complementos
    if (normalizedSelect.includes('complementos')) {
        const result = { name: 'BOX DE COMPLEMENTOS', option: '1 U' };
        return result;
    }

    // Mapear otros productos específicos si es necesario
    // ... (otros casos de compatibilidad)

    const fallbackResult = { name: selectOption.toUpperCase(), option: '' };
    return fallbackResult;
};

/**
 * Normaliza el formato de hora en el schedule, convirtiendo puntos (.) a dos puntos (:)
 * y mejorando el formato visual para que sea más legible
 * 
 * Ejemplos de conversión:
 * - "18.30" -> "18:30"
 * - "19.45" -> "19:45"
 * - "18.5" -> "18:05"
 * - "18.0" -> "18:00"
 * - "18hs" -> "18:00hs"
 * - "18 . 30" -> "18:30"
 * - "19 . 45" -> "19:45"
 * - "De 1830 a 2000hs aprox" -> "De 18:30 a 20:00hs aprox"
 * - "De 18hs a 19hs" -> "De 18:00hs a 19:00hs aprox"
 * - "APROXIMADAMENTE" -> "aprox"
 * 
 * @param schedule - El string del schedule que puede contener horas con . o :
 * @returns El schedule normalizado con : en lugar de . y formato visual mejorado
 */
export const normalizeScheduleTime = (schedule: string): string => {
    if (!schedule) return schedule;

    let normalized = schedule;

    // Primero: convertir "APROXIMADAMENTE" a "aprox" para que sea más corto
    normalized = normalized.replace(/\bAPROXIMADAMENTE\b/gi, 'aprox');

    // Segundo: buscar patrones con espacios como "18 . 30", "19 . 45" y convertirlos
    normalized = normalized.replace(/(\d{1,2})\s*\.\s*(\d{1,2})/g, (match, hour, minute) => {
        const paddedMinute = minute.padStart(2, '0');
        return `${hour}:${paddedMinute}`;
    });

    // Tercero: buscar patrones de hora como "18.30", "19.45", "10.15", etc.
    // Solo si no fueron convertidos en el paso anterior
    normalized = normalized.replace(/(\d{1,2})\.(\d{1,2})/g, (match, hour, minute) => {
        // Asegurar que los minutos tengan 2 dígitos
        const paddedMinute = minute.padStart(2, '0');
        return `${hour}:${paddedMinute}`;
    });

    // Cuarto: buscar patrones de solo hora como "18hs", "19hs" y convertirlos a "18:00hs", "19:00hs"
    // Solo si no tienen ya minutos
    normalized = normalized.replace(/(\d{1,2})(?<!:\d{2})hs/g, '$1:00hs');

    // Quinto: buscar patrones de 4 dígitos consecutivos (como "1830", "2000") y convertirlos a formato de hora
    // Esto convierte "1830" a "18:30" y "2000" a "20:00"
    normalized = normalized.replace(/(\d{1,2})(\d{2})(?=\s|hs|$|a|aprox)/g, (match, hour, minute) => {
        // Solo convertir si los minutos son válidos (00-59)
        const minuteNum = parseInt(minute);
        if (minuteNum >= 0 && minuteNum <= 59) {
            return `${hour}:${minute}`;
        }
        return match; // Si no son minutos válidos, mantener como está
    });

    // Sexto: agregar automáticamente "aprox" al final si no está presente
    // Solo si el schedule parece ser un rango de horas (contiene "de", "a", "hs")
    if (!normalized.toLowerCase().includes('aprox') &&
        (normalized.toLowerCase().includes('de') || normalized.toLowerCase().includes('a')) &&
        normalized.toLowerCase().includes('hs')) {
        normalized = normalized + ' aprox';
    }

    return normalized;
};

/**
 * Formatea un número de teléfono argentino según los estándares locales
 * 
 * Reglas de formateo:
 * - La Plata: 221 XXX-XXXX (7 dígitos después del 221)
 * - CABA y resto de Buenos Aires: 11-XXXX-XXXX o 15-XXXX-XXXX (8 dígitos después del 11 o 15)
 * 
 * Elimina prefijos como +54, +549, +54 9, 54, 0, 0221, (221), (+549)
 * 
 * @param phone - El número de teléfono en cualquier formato
 * @returns El número formateado según los estándares argentinos
 */
export const formatPhoneNumber = (phone: string): string => {
    if (!phone) return 'N/A';

    // Convertir a string y limpiar espacios
    let cleanPhone = phone.toString().trim();

    // Eliminar todos los caracteres no numéricos excepto guiones
    cleanPhone = cleanPhone.replace(/[^\d-]/g, '');

    // Eliminar guiones para procesar el número
    let digitsOnly = cleanPhone.replace(/-/g, '');

    // Eliminar prefijos comunes de Argentina
    const prefixesToRemove = [
        '549', '54', '0', '0221'
    ];

    // Buscar y eliminar prefijos al inicio
    for (const prefix of prefixesToRemove) {
        if (digitsOnly.startsWith(prefix)) {
            digitsOnly = digitsOnly.substring(prefix.length);
            break; // Solo eliminar el primer prefijo encontrado
        }
    }

    // Si el número empieza con 9 después de eliminar prefijos, eliminarlo también
    if (digitsOnly.startsWith('9')) {
        digitsOnly = digitsOnly.substring(1);
    }

    // Validar que tengamos un número válido
    if (digitsOnly.length < 7 || digitsOnly.length > 10) {
        return phone; // Devolver el original si no es válido
    }

    // Si el número tiene 7 dígitos, asumimos que es de La Plata y agregamos 221
    if (digitsOnly.length === 7) {
        digitsOnly = '221' + digitsOnly;
    }

    // Formatear según las reglas argentinas
    if (digitsOnly.startsWith('221')) {
        // La Plata: 221 XXX-XXXX
        return `221 ${digitsOnly.substring(3, 6)}-${digitsOnly.substring(6)}`;
    } else if (digitsOnly.startsWith('11')) {
        // CABA: 11-XXXX-XXXX
        return `11 ${digitsOnly.substring(2, 6)}-${digitsOnly.substring(6)}`;
    } else if (digitsOnly.startsWith('15')) {
        // Buenos Aires: 15-XXXX-XXXX
        return `15 ${digitsOnly.substring(2, 6)}-${digitsOnly.substring(6)}`;
    }

    // Si no coincide con ningún patrón conocido, devolver el número limpio
    return digitsOnly;
};

/**
 * Valida y normaliza un número de teléfono argentino antes de guardarlo
 * 
 * @param phone - El número de teléfono a validar y normalizar
 * @returns El número normalizado o null si no es válido
 */
export const validateAndNormalizePhone = (phone: string): string | null => {
    if (!phone) return null;

    // Convertir a string y limpiar espacios
    let cleanPhone = phone.toString().trim();

    // Eliminar todos los caracteres no numéricos excepto guiones
    cleanPhone = cleanPhone.replace(/[^\d-]/g, '');

    // Eliminar guiones para procesar el número
    let digitsOnly = cleanPhone.replace(/-/g, '');

    // Eliminar prefijos comunes de Argentina
    const prefixesToRemove = [
        '549', '54', '0', '0221'
    ];

    // Buscar y eliminar prefijos al inicio
    for (const prefix of prefixesToRemove) {
        if (digitsOnly.startsWith(prefix)) {
            digitsOnly = digitsOnly.substring(prefix.length);
            break; // Solo eliminar el primer prefijo encontrado
        }
    }

    // Si el número empieza con 9 después de eliminar prefijos, eliminarlo también
    if (digitsOnly.startsWith('9')) {
        digitsOnly = digitsOnly.substring(1);
    }

    // Validar que tengamos un número válido (mínimo 7 dígitos, máximo 10)
    if (digitsOnly.length < 7 || digitsOnly.length > 10) {
        return null;
    }

    // Si el número ya empieza con 221, 11 o 15, lo aceptamos directamente
    if (digitsOnly.startsWith('221') || digitsOnly.startsWith('11') || digitsOnly.startsWith('15')) {
        return digitsOnly;
    }

    // Si el número tiene 7 dígitos y estamos en La Plata, agregamos el 221
    if (digitsOnly.length === 7) {
        return '221' + digitsOnly;
    }

    // Si el número tiene 8 dígitos y no tiene prefijo, asumimos que es de CABA/BA y agregamos 11
    if (digitsOnly.length === 8) {
        return '11' + digitsOnly;
    }

    // Si llegamos aquí y tenemos 10 dígitos, lo aceptamos (ya sea con 221, 11 o 15)
    if (digitsOnly.length === 10) {
        return digitsOnly;
    }

    // Si no coincide con ningún patrón conocido, devolver null
    return null;
};

// Nueva función para calcular precio usando valores exactos de la DB
export const calculateExactPrice = async (
    formattedProduct: string,
    orderType: 'minorista' | 'mayorista',
    paymentMethod: string
): Promise<{ success: boolean; price?: number; error?: string }> => {
    try {
        const { calculateExactPriceAction } = await import('./actions');
        const result = await calculateExactPriceAction(formattedProduct, orderType, paymentMethod);
        return result;
    } catch (error) {
        console.error('Error in calculateExactPrice:', error);
        return {
            success: false,
            error: 'Error al calcular el precio'
        };
    }
}; 