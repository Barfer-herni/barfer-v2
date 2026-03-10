/**
 * Utilidades para mapear productos del select al formato de la base de datos
 */

export interface ProductMapping {
    name: string;
    option: string;
}

/**
 * Mapea una opción del select hacia el formato de la base de datos
 * @param selectOption - El texto completo del select (ej: "Barfer box Perro Cerdo 10kg")
 * @returns Objeto con el nombre y opción en formato DB
 */
export function mapSelectOptionToDBFormat(selectOption: string): ProductMapping {
    // NUEVO: Manejar formato de productos desde la base de datos (ej: "PERRO - BIG DOG VACA - 15KG")
    if (selectOption.includes(' - ')) {
        const parts = selectOption.split(' - ');

        if (parts.length >= 2) {
            const section = parts[0]; // PERRO, GATO, OTROS
            const product = parts[1]; // VACA, POLLO, BIG DOG VACA, etc.
            const weight = parts[2] || null; // 10KG, 5KG, etc.

            // Normalizar para comparación
            const productNormalized = product.trim().toUpperCase();

            if (section === 'PERRO') {
                // BIG DOG: En BD se guarda como "BIG DOG VACA" o "BIG DOG POLLO"
                // Pero en items debe ser: name="BIG DOG (15kg)", option="VACA"
                if (productNormalized.startsWith('BIG DOG')) {
                    // Extraer el sabor del nombre del producto
                    const sabor = productNormalized.replace('BIG DOG', '').trim();
                    const result = { name: 'BIG DOG (15kg)', option: sabor };
                    return result;
                } else {
                    // Es un BOX PERRO normal
                    const cleanName = product.startsWith('BOX ') ? product : `BOX PERRO ${product}`;
                    const result = { name: cleanName, option: weight || '' };
                    return result;
                }
            } else if (section === 'GATO') {
                const cleanName = product.startsWith('BOX ') ? product : `BOX GATO ${product}`;
                const result = { name: cleanName, option: weight || '' };
                return result;
            } else if (section === 'RAW') {
                const result = { name: product, option: weight || '' };
                return result;
            } else if (section === 'OTROS') {
                // Caso especial: si la sección es "OTROS" y el producto es "BOX DE COMPLEMENTOS"
                if (product === 'BOX DE COMPLEMENTOS') {
                    const result = {
                        name: 'BOX DE COMPLEMENTOS',
                        option: weight || '1 U'
                    };
                    return result;
                }

                const result = { name: product, option: weight || '' };
                return result;
            } else if (section === 'BOX DE COMPLEMENTOS') {
                // Caso especial: si la primera parte es "BOX DE COMPLEMENTOS", es un formato especial
                const result = {
                    name: 'BOX DE COMPLEMENTOS',
                    option: product || '1 U' // "1 U" es la segunda parte
                };
                return result;
            } else {
                const result = { name: product, option: weight || '' };
                return result;
            }
        }
    }

    // Si no es el formato de BD, usar la lógica antigua (texto normalizado)
    const normalizedSelect = selectOption.toLowerCase().trim();

    // Mapear productos GATO directamente (sin BOX)
    if (normalizedSelect.includes('gato') && !normalizedSelect.includes('barfer box')) {
        if (normalizedSelect.includes('vaca')) {
            if (normalizedSelect.includes('5kg')) {
                return { name: 'BOX GATO VACA', option: '5KG' };
            }
        }
        if (normalizedSelect.includes('pollo')) {
            if (normalizedSelect.includes('5kg')) {
                return { name: 'BOX GATO POLLO', option: '5KG' };
            }
        }
        if (normalizedSelect.includes('cordero')) {
            if (normalizedSelect.includes('5kg')) {
                return { name: 'BOX GATO CORDERO', option: '5KG' };
            }
        }
    }

    // Mapear productos PERRO directamente (sin BOX)
    if (normalizedSelect.includes('perro') && !normalizedSelect.includes('barfer box') && !normalizedSelect.includes('gato')) {
        if (normalizedSelect.includes('vaca')) {
            if (normalizedSelect.includes('5kg')) {
                return { name: 'BOX PERRO VACA', option: '5KG' };
            }
            if (normalizedSelect.includes('10kg')) {
                return { name: 'BOX PERRO VACA', option: '10KG' };
            }
        }
        if (normalizedSelect.includes('pollo')) {
            if (normalizedSelect.includes('5kg')) {
                return { name: 'BOX PERRO POLLO', option: '5KG' };
            }
            if (normalizedSelect.includes('10kg')) {
                return { name: 'BOX PERRO POLLO', option: '10KG' };
            }
        }
        if (normalizedSelect.includes('cerdo')) {
            if (normalizedSelect.includes('5kg')) {
                return { name: 'BOX PERRO CERDO', option: '5KG' };
            }
            if (normalizedSelect.includes('10kg')) {
                return { name: 'BOX PERRO CERDO', option: '10KG' };
            }
        }
        if (normalizedSelect.includes('cordero')) {
            if (normalizedSelect.includes('5kg')) {
                return { name: 'BOX PERRO CORDERO', option: '5KG' };
            }
            if (normalizedSelect.includes('10kg')) {
                return { name: 'BOX PERRO CORDERO', option: '10KG' };
            }
        }
    }

    // Mapear Barfer Box
    if (normalizedSelect.includes('barfer box')) {
        if (normalizedSelect.includes('perro')) {
            if (normalizedSelect.includes('pollo')) {
                if (normalizedSelect.includes('5kg')) {
                    return { name: 'BOX PERRO POLLO', option: '5KG' };
                }
                if (normalizedSelect.includes('10kg')) {
                    return { name: 'BOX PERRO POLLO', option: '10KG' };
                }
            }
            if (normalizedSelect.includes('cerdo')) {
                if (normalizedSelect.includes('5kg')) {
                    return { name: 'BOX PERRO CERDO', option: '5KG' };
                }
                if (normalizedSelect.includes('10kg')) {
                    return { name: 'BOX PERRO CERDO', option: '10KG' };
                }
            }
            if (normalizedSelect.includes('vaca')) {
                if (normalizedSelect.includes('5kg')) {
                    return { name: 'BOX PERRO VACA', option: '5KG' };
                }
                if (normalizedSelect.includes('10kg')) {
                    return { name: 'BOX PERRO VACA', option: '10KG' };
                }
            }
            if (normalizedSelect.includes('cordero')) {
                if (normalizedSelect.includes('5kg')) {
                    return { name: 'BOX PERRO CORDERO', option: '5KG' };
                }
                if (normalizedSelect.includes('10kg')) {
                    return { name: 'BOX PERRO CORDERO', option: '10KG' };
                }
            }
        }

        if (normalizedSelect.includes('gato')) {
            if (normalizedSelect.includes('pollo')) {
                if (normalizedSelect.includes('5kg')) {
                    return { name: 'BOX GATO POLLO', option: '5KG' };
                }
            }
            if (normalizedSelect.includes('vaca')) {
                if (normalizedSelect.includes('5kg')) {
                    return { name: 'BOX GATO VACA', option: '5KG' };
                }
            }
            if (normalizedSelect.includes('cordero')) {
                if (normalizedSelect.includes('5kg')) {
                    return { name: 'BOX GATO CORDERO', option: '5KG' };
                }
            }
        }
    }

    // Mapear Big Dog
    if (normalizedSelect.includes('big dog')) {
        if (normalizedSelect.includes('pollo')) {
            return { name: 'BIG DOG (15kg)', option: 'POLLO' };
        }
        if (normalizedSelect.includes('vaca')) {
            return { name: 'BIG DOG (15kg)', option: 'VACA' };
        }
        if (normalizedSelect.includes('cordero')) {
            return { name: 'BIG DOG (15kg)', option: 'CORDERO' };
        }
    }

    // Mapear complementos - IMPORTANTE: debe ir ANTES que huesos para evitar conflictos
    if (normalizedSelect.includes('caldo')) {
        return { name: 'CALDO DE HUESOS', option: '' };
    }

    // Mapear HUESO RECREATIVO - IMPORTANTE: debe ir ANTES que la verificación genérica de huesos
    if (normalizedSelect.includes('hueso recreativo') || normalizedSelect.includes('huesos recreativos')) {
        return { name: 'HUESOS RECREATIVOS', option: '' };
    }

    // Mapear Huesos Carnosos (pero no si es caldo de huesos o hueso recreativo)
    if (normalizedSelect.includes('huesos') && !normalizedSelect.includes('caldo') && !normalizedSelect.includes('recreativo')) {
        return { name: 'HUESOS CARNOSOS', option: '5KG' };
    }

    // Mapear Complementos
    if (normalizedSelect.includes('complementos')) {
        // Manejar el caso específico de "BOX DE COMPLEMENTOS - 1 U - x1"
        if (normalizedSelect.includes('box de complementos') && normalizedSelect.includes('1 u') && normalizedSelect.includes('x1')) {
            return { name: 'BOX DE COMPLEMENTOS', option: '1 U' };
        }
        // Caso general de complementos
        return { name: 'BOX DE COMPLEMENTOS', option: '1 U' };
    }

    // Mapear productos raw
    if (normalizedSelect.includes('traquea')) {
        if (normalizedSelect.includes('x1')) {
            return { name: 'TRAQUEA', option: 'X1' };
        }
        if (normalizedSelect.includes('x2')) {
            return { name: 'TRAQUEA', option: 'X2' };
        }
    }

    if (normalizedSelect.includes('orejas')) {
        // Detectar la variante (x100, x50, x1, etc.)
        if (normalizedSelect.includes('x100')) {
            return { name: 'OREJAS x100', option: '' };
        }
        if (normalizedSelect.includes('x50')) {
            return { name: 'OREJAS x50', option: '' };
        }
        if (normalizedSelect.includes('x1')) {
            return { name: 'OREJAS x1', option: '' };
        }
        // Si no se especifica variante, asumir que es el nombre completo
        return { name: selectOption.toUpperCase(), option: '' };
    }

    if (normalizedSelect.includes('pollo')) {
        if (normalizedSelect.includes('40grs')) {
            return { name: 'POLLO', option: '40GRS' };
        }
        if (normalizedSelect.includes('100grs')) {
            return { name: 'POLLO', option: '100GRS' };
        }
    }

    if (normalizedSelect.includes('higado')) {
        if (normalizedSelect.includes('40grs')) {
            return { name: 'HIGADO', option: '40GRS' };
        }
        if (normalizedSelect.includes('100grs')) {
            return { name: 'HIGADO', option: '100GRS' };
        }
    }

    if (normalizedSelect.includes('cornalitos')) {
        if (normalizedSelect.includes('30grs') || normalizedSelect.includes('30 grs') || normalizedSelect.includes('30gr')) {
            return { name: 'CORNALITOS', option: '30GRS' };
        }
        if (normalizedSelect.includes('200grs') || normalizedSelect.includes('200 grs') || normalizedSelect.includes('200gr')) {
            return { name: 'CORNALITOS', option: '200GRS' };
        }
        return { name: 'CORNALITOS', option: '' };
    }

    if (normalizedSelect.includes('garras')) {
        if (normalizedSelect.includes('300grs')) {
            return { name: 'GARRAS', option: '300GRS' };
        }
    }
    return { name: selectOption.toUpperCase(), option: '' };
}

/**
 * Procesa los items de una orden para convertir nombres del select al formato de la DB
 * @param items - Array de items de la orden
 * @returns Array de items procesados
 */
export function processOrderItems(items: any[]): any[] {

    if (!items || !Array.isArray(items)) {
        return items;
    }

    return items.map((item: any, index: number) => {
        // Si el item tiene fullName (texto del select), convertirlo al formato de la DB
        let itemName = item.name;
        let itemId = item.id;
        let itemOptions = item.options || [];

        // Verificar si el name es un texto del select (contiene "barfer box", "big dog", etc.)
        // IMPORTANTE: No procesar si ya está en formato de base de datos (contiene " - " y tiene estructura correcta)
        const isAlreadyDBFormat = item.name && item.name.includes(' - ') && (
            item.name.includes('BOX DE COMPLEMENTOS') ||
            item.name.includes('BOX PERRO') ||
            item.name.includes('BOX GATO') ||
            item.name.includes('BIG DOG') ||
            item.name.includes('HUESOS') ||
            item.name.includes('TRAQUEA') ||
            item.name.includes('OREJAS') ||
            item.name.includes('GARRAS') ||
            item.name.includes('CORNALITOS') ||
            item.name.includes('CALDO')
        );

        const isSelectText = item.name && !isAlreadyDBFormat && (
            item.name.toLowerCase().includes('barfer box') ||
            item.name.toLowerCase().includes('big dog') ||
            item.name.toLowerCase().includes('huesos') ||
            item.name.toLowerCase().includes('traquea') ||
            item.name.toLowerCase().includes('orejas') ||
            item.name.toLowerCase().includes('pollo') ||
            item.name.toLowerCase().includes('fullName') ||
            item.name.toLowerCase().includes('cornalitos') ||
            item.name.toLowerCase().includes('caldo') ||
            item.name.toLowerCase().includes('hueso recreativo') ||
            item.name.toLowerCase().includes('garras') ||
            item.name.toLowerCase().includes('complementos')
        );



        if (item.fullName && item.fullName !== item.name) {
            // El fullName es diferente al name, significa que viene del select
            const dbFormat = mapSelectOptionToDBFormat(item.fullName);
            itemName = dbFormat.name;
            itemId = dbFormat.name; // El ID debe ser el mismo que el name en formato DB

            // Actualizar la primera opción con el peso correcto
            if (itemOptions.length > 0 && dbFormat.option) {
                itemOptions[0] = {
                    ...itemOptions[0],
                    name: dbFormat.option
                };
            }
        } else if (isSelectText) {
            // El name es un texto del select, convertirlo al formato de la DB
            const dbFormat = mapSelectOptionToDBFormat(item.name);
            itemName = dbFormat.name;
            itemId = dbFormat.name; // El ID debe ser el mismo que el name en formato DB

            // Actualizar la primera opción con el peso correcto
            if (itemOptions.length > 0 && dbFormat.option) {
                itemOptions[0] = {
                    ...itemOptions[0],
                    name: dbFormat.option
                };
            }
        }

        // Crear un nuevo objeto solo con los campos necesarios para la DB
        const cleanItem: any = {
            id: itemId,
            name: itemName,
            description: item.description || '',
            images: item.images || [],
            options: itemOptions,
            price: item.price || 0,
            salesCount: item.salesCount || 0,
            discountApllied: item.discountApllied || 0
        };

        // IMPORTANTE: Preservar fullName si existe para poder reconstruir el nombre completo después
        if (item.fullName) {
            cleanItem.fullName = item.fullName;
        }

        // Asegurar que options tenga la estructura correcta
        if (cleanItem.options && Array.isArray(cleanItem.options)) {
            cleanItem.options = cleanItem.options.map((option: any) => ({
                name: option.name || '',
                price: option.price || 0,
                quantity: option.quantity || 1
            }));
        }
        return cleanItem;
    });
}
