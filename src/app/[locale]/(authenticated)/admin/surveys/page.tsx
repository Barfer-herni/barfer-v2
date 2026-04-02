import { getAllSurveys } from '@/lib/services/services/barfer/surveys/surveys';
import { SurveysViewClient } from './components/SurveysViewClient';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { requirePermission } from '@/lib/auth/server-permissions';
import Link from 'next/link';

interface SurveysPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SurveysPage({ params }: SurveysPageProps) {
  // Verificar permisos (asumiendo que existe un permiso para ver encuestas o usamos uno general de admin)
  // await requirePermission('admin:view'); 
  const { locale } = await params;

  const surveys = await getAllSurveys();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Encuestas
          </h1>
          <p className="text-muted-foreground">
            Gestiona las encuestas y visualiza las respuestas de los usuarios.
          </p>
        </div>
        <Button asChild variant="default" className="w-full sm:w-auto">
          <Link href={`/${locale}/admin/surveys/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Encuesta
          </Link>
        </Button>
      </div>

      <SurveysViewClient initialSurveys={surveys} locale={locale} />
    </div>
  );
}
