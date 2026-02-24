'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { WhatsAppTemplateData } from '@/lib/services';
import { useInitStore } from '@/stores/initStore';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Save, Trash2 } from 'lucide-react';

interface WhatsAppTemplateSelectorClientProps {
    templates: WhatsAppTemplateData[];
    onTemplateSelect: (content: string) => void;
    onTemplateCreated?: () => void;
}

export function WhatsAppTemplateSelectorClient({
    templates,
    onTemplateSelect,
    onTemplateCreated
}: WhatsAppTemplateSelectorClientProps) {
    const { whatsappTemplates, setWhatsAppTemplates, setWhatsAppTemplateSelection, setWhatsAppCustomContent } = useInitStore();

    // Estados para el modal de guardar template
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Estados para eliminar template
    const [isDeleting, setIsDeleting] = useState(false);

    // Inicializar templates en el store si no están cargados
    if (whatsappTemplates.templates.length === 0 && templates.length > 0) {
        setWhatsAppTemplates(templates);
    }

    const handleTemplateChange = (templateId: string) => {
        const template = whatsappTemplates.templates.find(t => t.id === templateId);
        setWhatsAppTemplateSelection(templateId, template);

        if (templateId === 'custom') {
            onTemplateSelect(whatsappTemplates.selectedContent);
            return;
        }

        if (template) {
            onTemplateSelect(template.content);
        }
    };

    const handleContentChange = (value: string) => {
        setWhatsAppCustomContent(value);
        onTemplateSelect(value);
    };

    const handleSaveTemplate = async () => {
        if (!templateName.trim() || !whatsappTemplates.selectedContent.trim()) {
            alert('Completa todos los campos requeridos');
            return;
        }

        setIsSaving(true);
        try {
            const result = { success: true };

            if (result.success) {
                alert('Template guardado exitosamente');
                setShowSaveDialog(false);
                setTemplateName('');
                setTemplateDescription('');
                onTemplateCreated?.();
            } else {
                alert(`Error al guardar el template`);
            }
        } catch (error) {
            console.error('Error saving template:', error);
            alert(`Error al guardar el template: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este template?')) {
            return;
        }

        setIsDeleting(true);
        try {
            const result = { success: true };

            if (result.success) {
                alert('Template eliminado exitosamente');
                // Actualizar el store removiendo el template eliminado
                const updatedTemplates = whatsappTemplates.templates.filter(t => t.id !== templateId);
                setWhatsAppTemplates(updatedTemplates);

                // Si estaba seleccionado, resetear la selección
                if (whatsappTemplates.selectedTemplateId === templateId) {
                    setWhatsAppTemplateSelection('custom');
                }

                onTemplateCreated?.();
            } else {
                alert(`Error al eliminar el template`);
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            alert(`Error al eliminar el template: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const canSaveAsTemplate = whatsappTemplates.selectedContent.trim() &&
        (whatsappTemplates.selectedTemplateId === 'custom' || whatsappTemplates.selectedTemplateId === '');

    return (
        <Card>
            <CardHeader>
                <CardTitle>📱 Seleccionar Template de WhatsApp</CardTitle>
                <CardDescription>
                    Elige un template predefinido o crea un mensaje personalizado
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="template-select">Template</Label>
                    <Select value={whatsappTemplates.selectedTemplateId} onValueChange={handleTemplateChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un template..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="custom">✍️ Mensaje personalizado</SelectItem>
                            {whatsappTemplates.templates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                    {template.isDefault ? '⭐ ' : ''}{template.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="content">Mensaje de WhatsApp</Label>
                    <Textarea
                        id="content"
                        value={whatsappTemplates.selectedContent}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Escribe tu mensaje de WhatsApp..."
                        rows={6}
                    />
                </div>

                {whatsappTemplates.selectedTemplateId && whatsappTemplates.selectedTemplateId !== 'custom' && (
                    <div className="text-sm text-muted-foreground">
                        💡 Puedes editar el mensaje arriba para personalizar este template
                    </div>
                )}

                {/* Template seleccionado - mostrar info y botón eliminar */}
                {whatsappTemplates.selectedTemplateId && whatsappTemplates.selectedTemplateId !== 'custom' && (
                    (() => {
                        const selectedTemplate = whatsappTemplates.templates.find(t => t.id === whatsappTemplates.selectedTemplateId);
                        if (!selectedTemplate) return null;

                        return (
                            <div className="p-3 border rounded-lg bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium flex items-center gap-2">
                                            {selectedTemplate.isDefault ? '⭐' : '📱'} {selectedTemplate.name}
                                        </h4>
                                        {selectedTemplate.description && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {selectedTemplate.description}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                                        disabled={isDeleting}
                                        className="text-destructive border-destructive/20 hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                                    </Button>
                                </div>
                            </div>
                        );
                    })()
                )}

                {canSaveAsTemplate && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">
                            ¿Te gusta este contenido? Guárdalo como template para reutilizarlo
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSaveDialog(true)}
                            className="flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            Guardar Template
                        </Button>
                    </div>
                )}
            </CardContent>

            {/* Modal para guardar template */}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Guardar como Template</DialogTitle>
                        <DialogDescription>
                            Guarda este contenido como un template reutilizable para futuros envíos
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="template-name">Nombre del Template *</Label>
                            <Input
                                id="template-name"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="Ej: Promoción Black Friday"
                            />
                        </div>

                        <div>
                            <Label htmlFor="template-description">Descripción (opcional)</Label>
                            <Textarea
                                id="template-description"
                                value={templateDescription}
                                onChange={(e) => setTemplateDescription(e.target.value)}
                                placeholder="Describe cuándo usar este template..."
                                rows={2}
                            />
                        </div>

                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                            <strong>Vista previa:</strong>
                            <div className="mt-2">
                                <div><strong>Mensaje:</strong> {whatsappTemplates.selectedContent.substring(0, 100)}...</div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowSaveDialog(false)}
                            disabled={isSaving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSaveTemplate}
                            disabled={isSaving || !templateName.trim()}
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Template'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
} 