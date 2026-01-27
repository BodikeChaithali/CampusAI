
'use server';

import { generateStudyGuide } from '@/ai/flows/generate-study-guide-from-lecture-notes';

export interface AskQuestionState {
  answer: string | null;
  error: string | null;
  timestamp?: number;
}

export async function askQuestion(
  prevState: AskQuestionState,
  formData: FormData
): Promise<AskQuestionState> {
  const question = formData.get('question') as string;
  const pdf = formData.get('pdf') as File;

  if (!question || question.trim().length === 0) {
    return { answer: null, error: 'Please enter a question.' };
  }

  if (!pdf || pdf.size === 0) {
    return { answer: null, error: 'Please upload a PDF document.' };
  }

  if (pdf.type !== 'application/pdf') {
    return { answer: null, error: 'Please upload a valid PDF file.' };
  }


  try {
    const fileBuffer = await pdf.arrayBuffer();
    const base64 = Buffer.from(fileBuffer).toString('base64');
    const dataUri = `data:${pdf.type};base64,${base64}`;

    const result = await generateStudyGuide({
      pdfDataUri: dataUri,
      question: question,
    });

    if (!result || !result.studyGuide) {
      return {
        answer: null,
        error: 'The AI could not generate an answer. Please try again.',
      };
    }

    return { answer: result.studyGuide, error: null, timestamp: Date.now() };
  } catch (error) {
    console.error(error);
    return {
      answer: null,
      error: 'An unexpected error occurred. Please check the server logs.',
    };
  }
}
