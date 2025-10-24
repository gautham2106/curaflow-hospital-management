'use server';

/**
 * @fileOverview Generates a summary of the current patient queue status.
 *
 * - generateQueueSummary - A function that generates the queue summary.
 * - QueueSummaryInput - The input type for the generateQueueSummary function.
 * - QueueSummaryOutput - The return type for the generateQueueSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QueueSummaryInputSchema = z.object({
  patientCount: z.number().describe('The current number of patients in the queue.'),
  estimatedWaitTime: z.string().describe('The estimated average wait time for patients in the queue.'),
  bottlenecks: z.string().describe('Any identified bottlenecks in the patient flow.'),
});
export type QueueSummaryInput = z.infer<typeof QueueSummaryInputSchema>;

const QueueSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the current patient queue status.'),
});
export type QueueSummaryOutput = z.infer<typeof QueueSummaryOutputSchema>;

export async function generateQueueSummary(input: QueueSummaryInput): Promise<QueueSummaryOutput> {
  return generateQueueSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'queueSummaryPrompt',
  input: {schema: QueueSummaryInputSchema},
  output: {schema: QueueSummaryOutputSchema},
  prompt: `You are a helpful assistant that summarizes the current patient queue status for a hospital receptionist.

  Provide a concise and informative summary using the following information:

  Patient Count: {{{patientCount}}}
  Estimated Wait Time: {{{estimatedWaitTime}}}
  Bottlenecks: {{{bottlenecks}}}

  Summary:`,
});

const generateQueueSummaryFlow = ai.defineFlow(
  {
    name: 'generateQueueSummaryFlow',
    inputSchema: QueueSummaryInputSchema,
    outputSchema: QueueSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
