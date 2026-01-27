'use server';
/**
 * @fileOverview Generates a concise study guide from lecture notes (PDF).
 *
 * - generateStudyGuide - A function that handles the study guide generation process.
 * - GenerateStudyGuideInput - The input type for the generateStudyGuide function.
 * - GenerateStudyGuideOutput - The return type for the generateStudyGuide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudyGuideInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document containing lecture notes, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  question: z.string().describe('The question to answer using the PDF content.'),
});
export type GenerateStudyGuideInput = z.infer<typeof GenerateStudyGuideInputSchema>;

const GenerateStudyGuideOutputSchema = z.object({
  studyGuide: z.string().describe('A concise study guide summarizing the key concepts from the lecture notes.'),
});
export type GenerateStudyGuideOutput = z.infer<typeof GenerateStudyGuideOutputSchema>;

export async function generateStudyGuide(input: GenerateStudyGuideInput): Promise<GenerateStudyGuideOutput> {
  return generateStudyGuideFlow(input);
}

const generateStudyGuidePrompt = ai.definePrompt({
  name: 'generateStudyGuidePrompt',
  input: {schema: GenerateStudyGuideInputSchema},
  output: {schema: GenerateStudyGuideOutputSchema},
  prompt: `You are an AI assistant designed to generate concise study guides from lecture notes.

  Please answer the following question using ONLY the information from the provided PDF content. If the answer is not present, respond with: 'The information is not available in the document.'

  Question: {{{question}}}

  PDF Content: {{media url=pdfDataUri}}
  `,
});

const generateStudyGuideFlow = ai.defineFlow(
  {
    name: 'generateStudyGuideFlow',
    inputSchema: GenerateStudyGuideInputSchema,
    outputSchema: GenerateStudyGuideOutputSchema,
  },
  async input => {
    const {output} = await generateStudyGuidePrompt(input);
    return output!;
  }
);
