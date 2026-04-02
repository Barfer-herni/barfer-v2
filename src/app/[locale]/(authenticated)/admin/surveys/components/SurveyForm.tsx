'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { Survey, Question } from '@/types/surveys';
import { createSurvey, updateSurvey } from '@/lib/services/services/barfer/surveys/surveys';
import { toast } from 'sonner';

interface SurveyFormProps {
  initialData?: Survey;
  locale: string;
}

export function SurveyForm({ initialData, locale }: SurveyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<string>(initialData?.status || 'draft');
  const [trigger, setTrigger] = useState<string>(initialData?.trigger || 'manual');
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions || [
      {
        questionId: Math.random().toString(36).substring(2, 11),
        text: '',
        type: 'text',
        required: false,
        order: 0,
        options: [],
      },
    ]
  );

  const addQuestion = () => {
    const newQuestion: Question = {
      questionId: Math.random().toString(36).substring(2, 11),
      text: '',
      type: 'text',
      required: false,
      order: questions.length,
      options: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.questionId !== id));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.questionId === id ? { ...q, ...updates } : q))
    );
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.questionId === questionId) {
          const options = q.options || [];
          return { ...q, options: [...options, ''] };
        }
        return q;
      })
    );
  };

  const updateOption = (questionId: string, index: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.questionId === questionId) {
          const options = [...(q.options || [])];
          options[index] = value;
          return { ...q, options };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: string, index: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.questionId === questionId) {
          const options = [...(q.options || [])];
          options.splice(index, 1);
          return { ...q, options };
        }
        return q;
      })
    );
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;

    [newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ];

    // Update orders
    const orderedQuestions = newQuestions.map((q, i) => ({ ...q, order: i }));
    setQuestions(orderedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('El título es requerido');
      return;
    }
    if (questions.length === 0) {
      toast.error('Debe haber al menos una pregunta');
      return;
    }
    if (questions.some((q) => !q.text.trim())) {
      toast.error('Todas las preguntas deben tener texto');
      return;
    }

    setIsSubmitting(true);
    const surveyData = {
      title,
      description,
      status: status as 'active' | 'inactive' | 'draft',
      trigger: trigger as 'post-purchase' | 'homepage' | 'manual',
      questions,
    };

    try {
      let result;
      if (initialData) {
        result = await updateSurvey(initialData._id, surveyData);
      } else {
        result = await createSurvey(surveyData);
      }

      if (result) {
        toast.success(initialData ? 'Encuesta actualizada' : 'Encuesta creada');
        router.push(`/${locale}/admin/surveys`);
        router.refresh();
      } else {
        toast.error('Error al guardar la encuesta');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur z-10 py-4 mb-6 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {initialData ? 'Editar Encuesta' : 'Nueva Encuesta'}
          </h1>
          <p className="text-muted-foreground">
            {initialData ? 'Modifica los campos de tu encuesta.' : 'Configura una nueva encuesta para tus usuarios.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Guardando...' : 'Guardar Encuesta'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>Detalles básicos de la encuesta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Encuesta de satisfacción post-compra"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Ayúdanos a mejorar tu experiencia..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="inactive">Inactiva</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trigger">Trigger (Lanzador)</Label>
                  <Select value={trigger} onValueChange={setTrigger}>
                    <SelectTrigger id="trigger">
                      <SelectValue placeholder="Seleccionar trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post-purchase">Post-compra</SelectItem>
                      <SelectItem value="homepage">Home</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Preguntas</h2>
              <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Pregunta
              </Button>
            </div>

            {questions.map((question, index) => (
              <Card key={question.questionId} className="relative">
                <CardHeader className="pb-3 pr-32">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">Pregunta {index + 1}</Badge>
                    {(question.type === 'single-choice' || question.type === 'multiple-choice') && (
                      <Badge variant="outline">Opción Múltiple</Badge>
                    )}
                  </div>
                  <div className="absolute right-4 top-4 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => moveQuestion(index, 'up')}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === questions.length - 1}
                      onClick={() => moveQuestion(index, 'down')}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeQuestion(question.questionId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={question.text}
                    onChange={(e) => updateQuestion(question.questionId, { text: e.target.value })}
                    placeholder="Texto de la pregunta..."
                    className="font-medium text-lg border-none shadow-none focus-visible:ring-0 p-0 h-auto min-h-[40px]"
                  />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Respuesta</Label>
                      <Select
                        value={question.type}
                        onValueChange={(val) => 
                          updateQuestion(question.questionId, { 
                            type: val as any,
                            options: (val === 'single-choice' || val === 'multiple-choice') ? (question.options?.length ? question.options : ['', '']) : []
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto Libre</SelectItem>
                          <SelectItem value="number">Número</SelectItem>
                          <SelectItem value="single-choice">Selección Única</SelectItem>
                          <SelectItem value="multiple-choice">Selección Múltiple</SelectItem>
                          <SelectItem value="rating">Calificación (1-5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch
                        id={`required-${question.questionId}`}
                        checked={question.required}
                        onCheckedChange={(checked) => updateQuestion(question.questionId, { required: checked })}
                      />
                      <Label htmlFor={`required-${question.questionId}`}>Requerida</Label>
                    </div>
                  </div>

                  {(question.type === 'single-choice' || question.type === 'multiple-choice') && (
                    <div className="space-y-3 pt-2 border-t mt-4">
                      <Label className="text-sm text-muted-foreground">Opciones de respuesta</Label>
                      {question.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(question.questionId, optIndex, e.target.value)}
                            placeholder={`Opción ${optIndex + 1}`}
                            className="h-9"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(question.questionId, optIndex)}
                            disabled={question.options!.length <= 2}
                            className="h-9 w-9"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addOption(question.questionId)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-2"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar opción
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button type="button" onClick={addQuestion} className="w-full h-12" variant="outline">
              <Plus className="mr-2 h-5 w-5" />
              Agregar Nueva Pregunta
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumen / Vista Previa</CardTitle>
              <CardDescription>Resumen de la configuración actual.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-4 bg-gray-50/50">
                <h3 className="font-bold text-base truncate">{title || 'Sin título'}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description || 'Sin descripción'}</p>
                
                <div className="mt-4 space-y-4 border-t pt-4">
                  {questions.slice(0, 3).map((q, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-xs font-medium truncate">
                        {i + 1}. {q.text || '...'}
                        {q.required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      <div className="text-[10px] text-muted-foreground italic px-2">
                        Tipo: {q.type}
                      </div>
                    </div>
                  ))}
                  {questions.length > 3 && (
                    <p className="text-xs text-center text-muted-foreground italic">
                      + {questions.length - 3} preguntas adicionales
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estado:</span>
                  <Badge variant={status === 'active' ? 'default' : 'secondary'} className="capitalize">
                    {status === 'active' ? 'Activa' : status === 'inactive' ? 'Inactiva' : 'Borrador'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trigger:</span>
                  <Badge variant="outline" className="capitalize">{trigger.replace('-', ' ')}</Badge>
                </div>
                <div className="flex justify-between text-sm border-t pt-3">
                  <span className="font-semibold">Total Preguntas:</span>
                  <span className="font-bold">{questions.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
