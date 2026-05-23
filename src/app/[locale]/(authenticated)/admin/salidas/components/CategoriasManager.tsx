'use client'

import { useState, useEffect } from 'react';
import { getAllCategoriasAction, createCategoriaAction, getAllCategoriasUnactiveAction, activateCategoriaAction } from '../actions';
import { DeleteCategoriaDialog } from './DeleteCategoriaDialog';
import { EditCategoriaDialog } from './EditCategoriaDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, Archive, RotateCcw } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface CategoriaData {
    id: string;
    nombre: string;
    descripcion?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export function CategoriasManager() {
    const [categorias, setCategorias] = useState<CategoriaData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingCategoria, setIsAddingCategoria] = useState(false);
    const [newCategoriaNombre, setNewCategoriaNombre] = useState('');

    // Estados para el diálogo de eliminación
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoriaToDelete, setCategoriaToDelete] = useState<CategoriaData | null>(null);

    // Estados para el diálogo de edición
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [categoriaToEdit, setCategoriaToEdit] = useState<CategoriaData | null>(null);

    // Estados para categorías inactivas
    const [unactiveDialogOpen, setUnactiveDialogOpen] = useState(false);
    const [categoriasInactivas, setCategoriasInactivas] = useState<CategoriaData[]>([]);
    const [isLoadingUnactive, setIsLoadingUnactive] = useState(false);
    const [activatingId, setActivatingId] = useState<string | null>(null);

    // Modal: categoría ya existe pero está desactivada
    const [inactiveExistsDialogOpen, setInactiveExistsDialogOpen] = useState(false);
    const [inactiveExistingCategoria, setInactiveExistingCategoria] = useState<{ id: string; nombre: string } | null>(null);
    const [isActivatingExisting, setIsActivatingExisting] = useState(false);

    // Modal: categoría ya existe y está activa
    const [activeExistsDialogOpen, setActiveExistsDialogOpen] = useState(false);
    const [activeExistingNombre, setActiveExistingNombre] = useState('');

    // Cargar categorías al montar el componente
    useEffect(() => {
        loadCategorias();
    }, []);

    const loadCategorias = async () => {
        setIsLoading(true);
        try {
            const result = await getAllCategoriasAction();
            if (result.success && result.categorias) {
                setCategorias(result.categorias.map((c: any) => ({
                    id: c._id,
                    nombre: c.nombre,
                    descripcion: c.descripcion,
                    isActive: c.isActive,
                    createdAt: c.createdAt,
                    updatedAt: c.updatedAt
                })));
            } else {
                toast({
                    title: "Error",
                    description: "Error al cargar las categorías",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error loading categorias:', error);
            toast({
                title: "Error",
                description: "Error inesperado al cargar las categorías",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCategoria = async () => {
        if (!newCategoriaNombre.trim()) {
            toast({
                title: "Error",
                description: "El nombre de la categoría es requerido",
                variant: "destructive",
            });
            return;
        }

        const normalizedNombre = newCategoriaNombre.trim().replace(/\s+/g, ' ').toUpperCase();

        setIsAddingCategoria(true);
        try {
            const activeMatch = categorias.find(c => c.nombre === normalizedNombre && c.isActive);
            if (activeMatch) {
                setActiveExistingNombre(normalizedNombre);
                setActiveExistsDialogOpen(true);
                return;
            }

            const inactiveResult = await getAllCategoriasUnactiveAction();
            if (inactiveResult.success && inactiveResult.categorias) {
                const inactiveMatch = inactiveResult.categorias.find(
                    (c: any) => c.nombre === normalizedNombre
                );
                if (inactiveMatch) {
                    setInactiveExistingCategoria({
                        id: inactiveMatch._id,
                        nombre: inactiveMatch.nombre,
                    });
                    setInactiveExistsDialogOpen(true);
                    return;
                }
            }

            const result = await createCategoriaAction(normalizedNombre);
            if (result.success) {
                toast({
                    title: "Categoría creada",
                    description: "La categoría ha sido creada exitosamente.",
                });
                setNewCategoriaNombre('');
                loadCategorias();
            } else if ((result as any).code === 'CATEGORY_INACTIVE') {
                setInactiveExistingCategoria({
                    id: (result as any).categoriaId,
                    nombre: (result as any).nombre,
                });
                setInactiveExistsDialogOpen(true);
            } else if ((result as any).code === 'CATEGORY_EXISTS') {
                setActiveExistingNombre((result as any).nombre || normalizedNombre);
                setActiveExistsDialogOpen(true);
            } else {
                const errorMessage = (result as any).message || (result as any).error || '';
                if (errorMessage.toLowerCase().includes('ya existe')) {
                    setActiveExistingNombre(normalizedNombre);
                    setActiveExistsDialogOpen(true);
                } else {
                    toast({
                        title: "Error",
                        description: errorMessage || "Error al crear la categoría",
                        variant: "destructive",
                    });
                }
            }
        } catch (error: any) {
            console.error('[CategoriasManager] Error creating categoria:', error);
            toast({
                title: "Error",
                description: error?.message || "Error inesperado al crear la categoría",
                variant: "destructive",
            });
        } finally {
            setIsAddingCategoria(false);
        }
    };

    const handleDeleteCategoria = (categoria: CategoriaData) => {
        setCategoriaToDelete(categoria);
        setDeleteDialogOpen(true);
    };

    const handleEditCategoria = (categoria: CategoriaData) => {
        setCategoriaToEdit(categoria);
        setEditDialogOpen(true);
    };

    const handleCategoriaDeleted = () => {
        loadCategorias(); // Recargar la lista después de eliminar
    };

    const mapCategoria = (c: any): CategoriaData => ({
        id: c._id,
        nombre: c.nombre,
        descripcion: c.descripcion,
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
    });

    const loadCategoriasInactivas = async () => {
        setIsLoadingUnactive(true);
        try {
            const result = await getAllCategoriasUnactiveAction();
            if (result.success && result.categorias) {
                setCategoriasInactivas(result.categorias.map(mapCategoria));
            } else {
                toast({
                    title: "Error",
                    description: "Error al cargar las categorías inactivas",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error loading inactive categorias:', error);
            toast({
                title: "Error",
                description: "Error inesperado al cargar las categorías inactivas",
                variant: "destructive",
            });
        } finally {
            setIsLoadingUnactive(false);
        }
    };

    const handleOpenUnactiveDialog = () => {
        setUnactiveDialogOpen(true);
        loadCategoriasInactivas();
    };

    const handleActivateCategoria = async (categoria: CategoriaData) => {
        setActivatingId(categoria.id);
        try {
            const result = await activateCategoriaAction(categoria.id);
            if (result.success) {
                toast({
                    title: "Categoría activada",
                    description: `"${categoria.nombre}" ha sido reactivada exitosamente.`,
                });
                setCategoriasInactivas(prev => prev.filter(c => c.id !== categoria.id));
                loadCategorias();
            } else {
                toast({
                    title: "Error",
                    description: (result as any).message || (result as any).error || "Error al activar la categoría",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error('[CategoriasManager] Error activating categoria:', error);
            toast({
                title: "Error",
                description: error?.message || "Error inesperado al activar la categoría",
                variant: "destructive",
            });
        } finally {
            setActivatingId(null);
        }
    };

    const handleActivateExistingCategoria = async () => {
        if (!inactiveExistingCategoria) return;

        setIsActivatingExisting(true);
        try {
            const result = await activateCategoriaAction(inactiveExistingCategoria.id);
            if (result.success) {
                toast({
                    title: "Categoría activada",
                    description: `"${inactiveExistingCategoria.nombre}" ha sido reactivada exitosamente.`,
                });
                setNewCategoriaNombre('');
                setInactiveExistsDialogOpen(false);
                setInactiveExistingCategoria(null);
                loadCategorias();
            } else {
                toast({
                    title: "Error",
                    description: (result as any).message || (result as any).error || "Error al activar la categoría",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Error inesperado al activar la categoría",
                variant: "destructive",
            });
        } finally {
            setIsActivatingExisting(false);
        }
    };

    const categoriasActivas = categorias.filter(cat => cat.isActive);

    return (
        <div className="space-y-6">
            {/* Sección para agregar nueva categoría */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Agregar Nueva Categoría
                    </CardTitle>
                    <CardDescription>
                        Crea una nueva categoría para organizar las salidas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="categoria-nombre">Nombre de la categoría</Label>
                            <Input
                                id="categoria-nombre"
                                value={newCategoriaNombre}
                                onChange={(e) => setNewCategoriaNombre(e.target.value)}
                                placeholder="Ej: SUELDOS, IMPUESTOS, etc."
                                disabled={isAddingCategoria}
                            />
                        </div>

                        <Button
                            onClick={handleAddCategoria}
                            disabled={isAddingCategoria || !newCategoriaNombre.trim()}
                            className="w-full"
                        >
                            {isAddingCategoria ? 'Creando...' : 'Crear Categoría'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de categorías activas */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <CardTitle>Categorías Activas</CardTitle>
                            <CardDescription>
                                Categorías disponibles para crear nuevas salidas
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleOpenUnactiveDialog}
                            className="shrink-0"
                        >
                            <Archive className="h-4 w-4 mr-2" />
                            Ver inactivas
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Cargando categorías...</div>
                    ) : categoriasActivas.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                            No hay categorías activas
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {categoriasActivas.map((categoria) => (
                                <div
                                    key={categoria.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium">{categoria.nombre}</div>
                                        {categoria.descripcion && (
                                            <div className="text-sm text-muted-foreground">
                                                {categoria.descripcion}
                                            </div>
                                        )}
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Creada: {new Date(categoria.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">Activa</Badge>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditCategoria(categoria)}
                                            className="text-blue-600 hover:text-blue-700"
                                            title="Editar"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteCategoria(categoria)}
                                            className="text-destructive hover:text-destructive"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={unactiveDialogOpen} onOpenChange={setUnactiveDialogOpen}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Categorías Inactivas</DialogTitle>
                        <DialogDescription>
                            Categorías desactivadas que podés reactivar
                        </DialogDescription>
                    </DialogHeader>

                    {isLoadingUnactive ? (
                        <div className="text-center py-6 text-muted-foreground">
                            Cargando categorías inactivas...
                        </div>
                    ) : categoriasInactivas.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            No hay categorías inactivas
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {categoriasInactivas.map((categoria) => (
                                <div
                                    key={categoria.id}
                                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-muted-foreground">
                                            {categoria.nombre}
                                        </div>
                                        {categoria.descripcion && (
                                            <div className="text-sm text-muted-foreground">
                                                {categoria.descripcion}
                                            </div>
                                        )}
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Desactivada: {new Date(categoria.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleActivateCategoria(categoria)}
                                        disabled={activatingId === categoria.id}
                                        className="text-green-600 hover:text-green-700"
                                    >
                                        <RotateCcw className="h-4 w-4 mr-1" />
                                        {activatingId === categoria.id ? 'Activando...' : 'Activar'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUnactiveDialogOpen(false)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo: categoría ya existe y está activa */}
            <Dialog open={activeExistsDialogOpen} onOpenChange={setActiveExistsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Categoría ya existente</DialogTitle>
                        <DialogDescription>
                            La categoría &quot;{activeExistingNombre}&quot; ya existe y está activa.
                            No podés crear otra con el mismo nombre.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setActiveExistsDialogOpen(false)}>
                            Entendido
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo: categoría ya existe pero está desactivada */}
            <Dialog open={inactiveExistsDialogOpen} onOpenChange={setInactiveExistsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Categoría ya existente</DialogTitle>
                        <DialogDescription>
                            La categoría &quot;{inactiveExistingCategoria?.nombre}&quot; ya existe en el sistema pero está desactivada.
                            ¿Querés reactivarla?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setInactiveExistsDialogOpen(false)}
                            disabled={isActivatingExisting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleActivateExistingCategoria}
                            disabled={isActivatingExisting}
                        >
                            {isActivatingExisting ? 'Activando...' : 'Activar categoría'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo de confirmación para eliminar */}
            {categoriaToDelete && (
                <DeleteCategoriaDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    categoria={categoriaToDelete}
                    onCategoriaDeleted={handleCategoriaDeleted}
                />
            )}

            {/* Diálogo para editar categoría */}
            {categoriaToEdit && (
                <EditCategoriaDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    categoria={categoriaToEdit}
                    onCategoriaUpdated={handleCategoriaDeleted}
                />
            )}
        </div>
    );
} 