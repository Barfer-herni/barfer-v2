'use client';

import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  ClipboardList 
} from 'lucide-react';
import { Survey } from '@/types/surveys';
import { deleteSurvey } from '@/lib/services/services/barfer/surveys/surveys';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SurveysViewClientProps {
  initialSurveys: Survey[];
  locale: string;
}

export function SurveysViewClient({ initialSurveys, locale }: SurveysViewClientProps) {
  const [surveys, setSurveys] = useState<Survey[]>(initialSurveys);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta encuesta?')) {
      const result = await deleteSurvey(id);
      if (result.success) {
        setSurveys(surveys.filter(s => s._id !== id));
        toast.success('Encuesta eliminada correctamente');
      } else {
        toast.error('Error al eliminar la encuesta');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Activa</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactiva</Badge>;
      case 'draft':
        return <Badge variant="outline">Borrador</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case 'post-purchase':
        return 'Post-compra';
      case 'homepage':
        return 'Home';
      case 'manual':
        return 'Manual';
      default:
        return trigger;
    }
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Trigger</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Preguntas</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {surveys.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                No se encontraron encuestas.
              </TableCell>
            </TableRow>
          ) : (
            surveys.map((survey) => (
              <TableRow key={survey._id}>
                <TableCell className="font-medium">{survey.title}</TableCell>
                <TableCell>{getTriggerLabel(survey.trigger)}</TableCell>
                <TableCell>{getStatusBadge(survey.status)}</TableCell>
                <TableCell>{survey.questions?.length || 0} preguntas</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => router.push(`/${locale}/admin/surveys/${survey._id}/responses`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver respuestas
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => router.push(`/${locale}/admin/surveys/${survey._id}/edit`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(survey._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
