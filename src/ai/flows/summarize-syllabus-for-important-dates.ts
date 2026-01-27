'use server';
/**
 * @fileOverview Summarizes a syllabus PDF to extract important dates.
 *
 * - summarizeSyllabus - A function that handles the syllabus summarization process.
 * - SummarizeSyllabusInput - The input type for the summarizeSyllabus function.
 * - SummarizeSyllabusOutput - The return type for the summarizeSyllabus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSyllabusInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document containing a course syllabus, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeSyllabusInput = z.infer<typeof SummarizeSyllabusInputSchema>;

const SummarizeSyllabusOutputSchema = z.object({
  importantDates: z
    .string()
    .describe('A list of important dates (deadlines, exam dates, etc.) extracted from the syllabus.'),
});
export type SummarizeSyllabusOutput = z.infer<typeof SummarizeSyllabusOutputSchema>;

export async function summarizeSyllabus(input: SummarizeSyllabusInput): Promise<SummarizeSyllabusOutput> {
  return summarizeSyllabusFlow(input);
}

const summarizeSyllabusPrompt = ai.definePrompt({
  name: 'summarizeSyllabusPrompt',
  input: {schema: SummarizeSyllabusInputSchema},
  output: {schema: SummarizeSyllabusOutputSchema},
  prompt: `You are an AI assistant designed to extract important dates from a course syllabus.  The course syllabus is in the form of a PDF.

  Please identify and list all the important dates (deadlines, exam dates, assignment dates, etc.) from the provided PDF content. Ensure the dates are easy to read and understand.

  PDF Content: {{media url=pdfDataUri}}
  `,
});

const summarizeSyllabusFlow = ai.defineFlow(
  {
    name: 'summarizeSyllabusFlow',
    inputSchema: SummarizeSyllabusInputSchema,
    outputSchema: SummarizeSyllabusOutputSchema,
  },
  async input => {
    const {output} = await summarizeSyllabusPrompt(input);
    return output!;
  }
);
