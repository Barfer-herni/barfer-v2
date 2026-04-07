'use client';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  User, 
  Calendar, 
  BarChart3,
  Search,
  ArrowUpDown
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Survey, SurveyResponse } from '@/types/surveys';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface ResponsesViewClientProps {
  survey: Survey;
  responses: SurveyResponse[];
  locale: string;
}

export function ResponsesViewClient({ survey, responses, locale }: ResponsesViewClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const formatValue = (value: any) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    return String(value);
  };

  const renderId = (id: any) => {
    if (typeof id === 'object' && id !== null) {
      return id.email || id._id || JSON.stringify(id);
    }
    return String(id);
  };

  // Calculate statistics for questions with options
  const stats = survey.questions
    .filter(q => (q.type === 'single-choice' || q.type === 'multiple-choice') && q.options && q.options.length > 0)
    .map(question => {
      const counts: Record<string, number> = {};
      question.options?.forEach(opt => counts[opt] = 0);
      
      responses.forEach(res => {
        const answer = res.answers.find(a => a.questionId === question.questionId);
        if (answer && answer.value) {
          if (Array.isArray(answer.value)) {
            answer.value.forEach((val: any) => {
              const valStr = String(val);
              if (counts[valStr] !== undefined) counts[valStr]++;
              else counts[valStr] = (counts[valStr] || 0) + 1;
            });
          } else {
            const valStr = String(answer.value);
            if (counts[valStr] !== undefined) counts[valStr]++;
            else counts[valStr] = (counts[valStr] || 0) + 1;
          }
        }
      });
      
      return {
        id: question.questionId,
        text: question.text,
        counts: Object.entries(counts).sort((a, b) => b[1] - a[1])
      };
    });

  const filteredResponses = responses.filter(res => {
    const userString = renderId(res.userId).toLowerCase();
    if (searchQuery && !userString.includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    for (const [questionId, value] of Object.entries(filters)) {
      if (!value || value === "all") continue;
      
      const answer = res.answers.find(a => a.questionId === questionId);
      if (!answer) return false;
      
      const answerVal = answer.value;
      if (Array.isArray(answerVal)) {
        if (!answerVal.map(String).includes(value)) return false;
      } else {
        if (String(answerVal) !== value) return false;
      }
    }
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.completedAt).getTime();
    const dateB = new Date(b.completedAt).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.push(`/${locale}/admin/surveys`)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{survey.title}</h2>
          <p className="text-sm text-muted-foreground">{responses.length} respuestas recibidas</p>
        </div>
      </div>

      {/* Stats Section */}
      {stats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.id} className="border-primary/20 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  {stat.text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stat.counts.map(([option, count]) => (
                    <div key={option} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground truncate mr-2" title={option}>
                        {option}
                      </span>
                      <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table Section */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 pb-4">
          <CardTitle className="text-lg font-bold">Detalle de Respuestas</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            {stats.length > 0 && stats.map(stat => (
              <Select 
                key={stat.id} 
                value={filters[stat.id] || "all"} 
                onValueChange={(val) => setFilters(prev => ({ ...prev, [stat.id]: val }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={stat.text.length > 20 ? stat.text.substring(0, 20) + "..." : stat.text} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las respuestas</SelectItem>
                  {stat.counts.map(([option]) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {responses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border rounded-lg bg-card">
              <p>Todavía no hay respuestas para esta encuesta.</p>
            </div>
          ) : (
            <div className="rounded-md border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-[200px]">Usuario</TableHead>
                      <TableHead className="w-[180px]">
                        <Button 
                          variant="ghost" 
                          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                          className="-ml-4 hover:bg-transparent flex items-center"
                        >
                          Fecha
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      {survey.questions.map((q) => (
                        <TableHead key={q.questionId} className="min-w-[150px]">
                          {q.text}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResponses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={survey.questions.length + 2} className="h-24 text-center">
                          No se encontraron resultados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredResponses.map((response) => (
                        <TableRow key={response._id} className="group">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate max-w-[170px]" title={renderId(response.userId)}>
                                {renderId(response.userId)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(response.completedAt), "d/MM/yy HH:mm", { locale: es })}
                            </div>
                          </TableCell>
                          {survey.questions.map((q) => {
                            const answer = response.answers.find(a => a.questionId === q.questionId);
                            return (
                              <TableCell key={q.questionId} className="text-sm">
                                {answer ? formatValue(answer.value) : <span className="text-muted-foreground/30">-</span>}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
