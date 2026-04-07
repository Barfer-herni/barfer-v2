export interface Question {
  questionId: string;
  text: string;
  type: 'text' | 'number' | 'single-choice' | 'multiple-choice' | 'rating';
  options?: string[];
  required: boolean;
  order: number;
  metadata?: Record<string, any>;
}

export interface Survey {
  _id: string;
  title: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  trigger: 'post-purchase' | 'homepage' | 'manual';
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  questionId: string;
  questionText: string;
  value: any;
  metadata?: Record<string, any>;
}

export interface SurveyResponse {
  _id: string;
  surveyId: string;
  userId: string | { _id: string; email: string; name?: string };
  orderId?: string | { _id: string; [key: string]: any };
  answers: Answer[];
  completedAt: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields (if any)
  userEmail?: string;
  userName?: string;
  shippingType?: string;
}
