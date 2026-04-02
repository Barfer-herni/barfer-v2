import { SurveyForm } from '../../components/SurveyForm';
import { getSurveyById } from '@/lib/services/services/barfer/surveys/surveys';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editar Encuesta | Admin Barfer',
  description: 'Modifica los campos de tu encuesta.',
};

interface EditSurveyPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function EditSurveyPage({ params }: EditSurveyPageProps) {
  const { id, locale } = await params;
  const survey = await getSurveyById(id);

  if (!survey) {
    notFound();
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <SurveyForm initialData={survey} locale={locale} />
    </div>
  );
}
