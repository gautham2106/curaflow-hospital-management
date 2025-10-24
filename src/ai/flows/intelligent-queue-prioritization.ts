'use server';
/**
 * @fileOverview Prioritizes patients in a queue based on the urgency of their symptoms.
 *
 * - prioritizeQueue - A function that prioritizes a list of patients based on urgency.
 * - PrioritizeQueueInput - The input type for the prioritizeQueue function.
 * - PrioritizeQueueOutput - The return type for the prioritizeQueue function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PatientSchema = z.object({
  id: z.string().describe('The unique identifier for the patient.'),
  name: z.string().describe('The name of the patient.'),
  symptoms: z.string().describe('A description of the patient\'s symptoms upon check-in.'),
});

export type Patient = z.infer<typeof PatientSchema>;

const PrioritizeQueueInputSchema = z.object({
  patients: z.array(PatientSchema).describe('An array of patients in the queue.'),
});
export type PrioritizeQueueInput = z.infer<typeof PrioritizeQueueInputSchema>;

const PrioritizeQueueOutputSchema = z.array(PatientSchema).describe('A prioritized array of patients based on urgency.');
export type PrioritizeQueueOutput = z.infer<typeof PrioritizeQueueOutputSchema>;

export async function prioritizeQueue(input: PrioritizeQueueInput): Promise<PrioritizeQueueOutput> {
  return prioritizeQueueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeQueuePrompt',
  input: {schema: PrioritizeQueueInputSchema},
  output: {schema: PrioritizeQueueOutputSchema},
  prompt: `You are an AI assistant specialized in prioritizing patients in a hospital queue based on the urgency of their symptoms.

  Given the following list of patients with their symptoms, prioritize them from most urgent to least urgent. Explain your reasoning for each patient's priority.

  Patients:
  {{#each patients}}
  - ID: {{this.id}}, Name: {{this.name}}, Symptoms: {{this.symptoms}}
  {{/each}}

  Return the prioritized list of patients in JSON format.
  Ensure that the output is a valid JSON array of Patient objects.
  `, 
});

const prioritizeQueueFlow = ai.defineFlow(
  {
    name: 'prioritizeQueueFlow',
    inputSchema: PrioritizeQueueInputSchema,
    outputSchema: PrioritizeQueueOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
