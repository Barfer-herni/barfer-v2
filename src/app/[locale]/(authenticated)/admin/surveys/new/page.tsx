import { SurveyForm } from '../components/SurveyForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nueva Encuesta | Admin Barfer',
  description: 'Crea una nueva encuesta para tus clientes.',
};

interface NewSurveyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewSurveyPage({ params }: NewSurveyPageProps) {
  const { locale } = await params;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <SurveyForm locale={locale} />
    </div>
  );
}
