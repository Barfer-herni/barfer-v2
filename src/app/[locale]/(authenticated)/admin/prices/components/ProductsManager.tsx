'use client'

import { useState, useEffect } from 'react';
import { PriceSection, PriceType } from '@/lib/services';
import { getAllUniqueProductsAction, deleteProductAction } from '../actions';
import { EditProductModal } from './EditProductModal';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Package, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
    section: PriceSection;
    product: string;
    weight: string | null;
    priceTypes: PriceType[];
    totalPrices: number;
    isActive: boolean;
}

interface ProductsManagerProps {
    userPermissions: string[];
}

export function ProductsManager({ userPermissions }: ProductsManagerProps) {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeletingProduct, setIsDeletingProduct] = useState<string | null>(null);

    // Verificar permisos del usuario
    const canEditPrices = userPermissions.includes('prices:edit');

    // Cargar productos únicos
    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const result = await getAllUniqueProductsAction();
            if (result.success) {
                setProducts(result.products || []);
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Error al cargar los productos",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error loading products:', error);
            toast({
                title: "Error",
                description: "Error al cargar los productos",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar productos al montar el componente
    useEffect(() => {
        loadProducts();
    }, []);

    // Manejar edición de producto
    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsEditModalOpen(true);
    };

    // Manejar cierre del modal de edición
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingProduct(null);
    };

    // Manejar actualización exitosa del producto
    const handleProductUpdated = () => {
        loadProducts(); // Recargar la lista
    };

    // Manejar eliminación de producto
    const handleDeleteProduct = async (product: Product) => {
        const productLabel = `${product.product}${product.weight ? ` (${product.weight})` : ''}`;
        if (!confirm(`¿Estás seguro de que quieres eliminar el producto "${productLabel}"? Se eliminarán todos los precios asociados.`)) {
            return;
        }

        const productKey = `${product.section}-${product.product}-${product.weight || 'no-weight'}`;
        setIsDeletingProduct(productKey);

        try {
            const result = await deleteProductAction(
                product.section,
                product.product,
                product.weight
            );

            if (result.success) {
                toast({
                    title: "Producto eliminado",
                    description: result.message || "El producto se eliminó exitosamente",
                });
                loadProducts();
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Error al eliminar el producto",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast({
                title: "Error",
                description: "Error inesperado al eliminar el producto",
                variant: "destructive"
            });
        } finally {
            setIsDeletingProduct(null);
        }
    };

    const getSectionLabel = (section: PriceSection) => {
        switch (section) {
            case 'PERRO': return 'PERRO';
            case 'GATO': return 'GATO';
            case 'OTROS': return 'OTROS';
            case 'RAW': return 'RAW';
            default: return section;
        }
    };

    const getSectionColor = (section: PriceSection) => {
        switch (section) {
            case 'PERRO': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'GATO': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'OTROS': return 'bg-green-100 text-green-800 border-green-200';
            case 'RAW': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Gestión de Productos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Cargando productos...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Gestión de Productos ({products.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {products.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No hay productos configurados.</p>
                        </div>
                    ) : (
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-semibold">Sección</TableHead>
                                        <TableHead className="font-semibold">Producto</TableHead>
                                        <TableHead className="font-semibold text-center">Peso</TableHead>
                                        <TableHead className="font-semibold text-center">Tipos de Precio</TableHead>
                                        <TableHead className="font-semibold text-center">Estado</TableHead>
                                        {canEditPrices && (
                                            <TableHead className="font-semibold text-center">Acciones</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product, index) => (
                                        <TableRow key={`${product.section}-${product.product}-${product.weight || 'no-weight'}-${index}`}>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`${getSectionColor(product.section)} font-medium`}
                                                >
                                                    {getSectionLabel(product.section)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {product.product}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {product.weight ? (
                                                    <Badge variant="secondary" className="font-mono">
                                                        {product.weight}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-wrap gap-1 justify-center">
                                                    {product.priceTypes.map((type) => (
                                                        <Badge key={type} variant="outline" className="text-xs">
                                                            {type.charAt(0) + type.slice(1).toLowerCase()}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={product.isActive ? "default" : "secondary"}>
                                                    {product.isActive ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </TableCell>
                                            {canEditPrices && (
                                                <TableCell className="text-center">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEditProduct(product)}
                                                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        title="Editar Producto"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteProduct(product)}
                                                        disabled={isDeletingProduct === `${product.section}-${product.product}-${product.weight || 'no-weight'}`}
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        title="Eliminar Producto"
                                                    >
                                                        {isDeletingProduct === `${product.section}-${product.product}-${product.weight || 'no-weight'}` ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal para editar producto */}
            <EditProductModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onProductUpdated={handleProductUpdated}
                product={editingProduct}
            />
        </div>
    );
}
