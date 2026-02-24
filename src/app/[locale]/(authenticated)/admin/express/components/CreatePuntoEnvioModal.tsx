'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { createPuntoEnvioAction } from '../actions';

interface CreatePuntoEnvioModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPuntoEnvioCreated: () => void;
}

export function CreatePuntoEnvioModal({
    open,
    onOpenChange,
    onPuntoEnvioCreated,
}: CreatePuntoEnvioModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [nombre, setNombre] = useState('');
    const [cutoffTime, setCutoffTime] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }

        setIsLoading(true);

        try {
            const result = await createPuntoEnvioAction({
                nombre: nombre.trim(),
                cutoffTime: cutoffTime || undefined,
            });

            if (result.success) {
                toast({
                    title: '¡Éxito!',
                    description: result.message || 'Punto de envío creado correctamente',
                });

                // Resetear formulario
                setNombre('');
                setCutoffTime('');
                setError('');

                onPuntoEnvioCreated();
                onOpenChange(false);
            } else {
                toast({
                    title: 'Error',
                    description: result.message || 'Error al crear el punto de envío',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Ocurrió un error inesperado',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Crear Punto de Envío</DialogTitle>
                    <DialogDescription>
                        Crea un nuevo punto de envío. Se crearán automáticamente las tablas de órdenes, stock y detalle.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre del Punto de Envío *</Label>
                            <Input
                                id="nombre"
                                placeholder="Ej: Córdoba"
                                value={nombre}
                                onChange={(e) => {
                                    setNombre(e.target.value);
                                    setError('');
                                }}
                                className={error ? 'border-red-500' : ''}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cutoffTime">Hora de Corte (Opcional)</Label>
                            <Input
                                id="cutoffTime"
                                type="time"
                                placeholder="Ej: 16:00"
                                value={cutoffTime}
                                onChange={(e) => setCutoffTime(e.target.value)}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Hora límite para que los pedidos entren en el día actual.
                            </p>
                            {error && (
                                <span className="text-red-500 text-sm">{error}</span>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creando...' : 'Crear Punto de Envío'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

