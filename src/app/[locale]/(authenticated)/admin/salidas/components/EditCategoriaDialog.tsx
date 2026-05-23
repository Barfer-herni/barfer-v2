'use client'

import { useState, useEffect } from 'react';
import { updateCategoriaAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface CategoriaData {
    id: string;
    nombre: string;
}

interface EditCategoriaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categoria: CategoriaData;
    onCategoriaUpdated: () => void;
}

export function EditCategoriaDialog({
    open,
    onOpenChange,
    categoria,
    onCategoriaUpdated,
}: EditCategoriaDialogProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [nombre, setNombre] = useState(categoria.nombre);

    useEffect(() => {
        if (open) {
            setNombre(categoria.nombre);
        }
    }, [open, categoria]);

    const handleUpdate = async () => {
        if (!nombre.trim()) {
            toast({
                title: "Error",
                description: "El nombre no puede estar vacío",
                variant: "destructive",
            });
            return;
        }

        if (nombre === categoria.nombre) {
            onOpenChange(false);
            return;
        }

        setIsUpdating(true);
        try {
            const result = await updateCategoriaAction(categoria.id, nombre);
            if (result.success) {
                toast({
                    title: "Categoría actualizada",
                    description: "El nombre ha sido actualizado exitosamente.",
                });
                onCategoriaUpdated();
                onOpenChange(false);
            } else {
                toast({
                    title: "Error",
                    description: (result as any).message || (result as any).error || "Error al actualizar la categoría",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error('Error updating categoria:', error);
            toast({
                title: "Error",
                description: error?.message || "Error inesperado al actualizar",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Categoría</DialogTitle>
                    <DialogDescription>
                        Modifica el nombre de la categoría seleccionada.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                    <Label htmlFor="edit-categoria-nombre">Nombre</Label>
                    <Input
                        id="edit-categoria-nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="mt-2"
                        disabled={isUpdating}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
                        Cancelar
                    </Button>
                    <Button onClick={handleUpdate} disabled={isUpdating || !nombre.trim()}>
                        {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
