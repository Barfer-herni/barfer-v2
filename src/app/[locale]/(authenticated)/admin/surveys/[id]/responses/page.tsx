import { getSurveyById, getSurveyResponses } from '@/lib/services/services/barfer/surveys/surveys';
import { ResponsesViewClient } from '../../components/ResponsesViewClient';
import { notFound } from 'next/navigation';

interface SurveyResponsesPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function SurveyResponsesPage({ params }: SurveyResponsesPageProps) {
  const { locale, id } = await params;

  const [survey, responses] = await Promise.all([
    getSurveyById(id),
    getSurveyResponses(id)
  ]);

  if (!survey) {
    notFound();
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <ResponsesViewClient 
        survey={survey} 
        responses={responses} 
        locale={locale} 
      />
    </div>
  );
}
