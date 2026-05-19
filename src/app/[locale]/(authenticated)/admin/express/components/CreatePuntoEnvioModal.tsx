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
import type { WeeklySchedule, DateException } from '@/lib/services/types/barfer';

interface CreatePuntoEnvioModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPuntoEnvioCreated: () => void;
}

const defaultWeeklySchedule: WeeklySchedule = {
    monday: { isOpen: true, cutoffTime: '15:00' },
    tuesday: { isOpen: true, cutoffTime: '15:00' },
    wednesday: { isOpen: true, cutoffTime: '15:00' },
    thursday: { isOpen: true, cutoffTime: '15:00' },
    friday: { isOpen: true, cutoffTime: '15:00' },
    saturday: { isOpen: true, cutoffTime: '15:00' },
    sunday: { isOpen: false, cutoffTime: '15:00' },
};

const dayNames: Record<keyof WeeklySchedule, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
};

export function CreatePuntoEnvioModal({
    open,
    onOpenChange,
    onPuntoEnvioCreated,
}: CreatePuntoEnvioModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [nombre, setNombre] = useState('');
    const [cutoffTime, setCutoffTime] = useState('');
    const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(defaultWeeklySchedule);
    const [exceptions, setExceptions] = useState<DateException[]>([]);
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
                weeklySchedule,
                exceptions,
            });

            if (result.success) {
                toast({
                    title: '¡Éxito!',
                    description: result.message || 'Punto de envío creado correctamente',
                });

                // Resetear formulario
                setNombre('');
                setCutoffTime('');
                setWeeklySchedule(defaultWeeklySchedule);
                setExceptions([]);
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
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-2">
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
                            <Label htmlFor="cutoffTime">Hora de Corte Por Defecto</Label>
                            <Input
                                id="cutoffTime"
                                type="time"
                                value={cutoffTime}
                                onChange={(e) => setCutoffTime(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="mt-4">
                            <h4 className="font-medium text-sm mb-3">Días Laborables y Horarios</h4>
                            <div className="grid gap-3">
                                {Object.entries(weeklySchedule).map(([day, config]) => (
                                    <div key={day} className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 w-32 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={config.isOpen}
                                                onChange={(e) => setWeeklySchedule(prev => ({
                                                    ...prev,
                                                    [day]: { ...prev[day as keyof WeeklySchedule], isOpen: e.target.checked }
                                                }))}
                                                disabled={isLoading}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm">{dayNames[day as keyof WeeklySchedule]}</span>
                                        </label>
                                        <Input
                                            type="time"
                                            value={config.cutoffTime}
                                            onChange={(e) => setWeeklySchedule(prev => ({
                                                ...prev,
                                                [day]: { ...prev[day as keyof WeeklySchedule], cutoffTime: e.target.value }
                                            }))}
                                            disabled={!config.isOpen || isLoading}
                                            className="w-32 h-8"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium text-sm">Feriados / Excepciones</h4>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setExceptions([...exceptions, { date: new Date().toISOString().split('T')[0], isOpen: false, cutoffTime: '15:00' }])}
                                    disabled={isLoading}
                                >
                                    + Agregar
                                </Button>
                            </div>
                            <div className="grid gap-3">
                                {exceptions.map((exc, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                                        <Input
                                            type="date"
                                            value={exc.date}
                                            onChange={(e) => {
                                                const newExc = [...exceptions];
                                                newExc[index].date = e.target.value;
                                                setExceptions(newExc);
                                            }}
                                            disabled={isLoading}
                                            className="h-8 flex-1"
                                        />
                                        <label className="flex items-center gap-1 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={exc.isOpen}
                                                onChange={(e) => {
                                                    const newExc = [...exceptions];
                                                    newExc[index].isOpen = e.target.checked;
                                                    setExceptions(newExc);
                                                }}
                                                disabled={isLoading}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-xs">Abre</span>
                                        </label>
                                        {exc.isOpen && (
                                            <Input
                                                type="time"
                                                value={exc.cutoffTime || ''}
                                                onChange={(e) => {
                                                    const newExc = [...exceptions];
                                                    newExc[index].cutoffTime = e.target.value;
                                                    setExceptions(newExc);
                                                }}
                                                disabled={isLoading}
                                                className="h-8 w-24"
                                            />
                                        )}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-red-500"
                                            onClick={() => setExceptions(exceptions.filter((_, i) => i !== index))}
                                            disabled={isLoading}
                                        >
                                            X
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <span className="text-red-500 text-sm mt-2">{error}</span>
                        )}
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

