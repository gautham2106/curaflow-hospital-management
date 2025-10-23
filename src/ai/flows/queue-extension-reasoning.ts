'use server';

/**
 * @fileOverview Analyzes the context of a doctor's request to extend a patient's visit and suggests a suitable reason.
 *
 * - suggestExtensionReason - A function that suggests the most appropriate reason for extending a patient's visit.
 * - SuggestExtensionReasonInput - The input type for the suggestExtensionReason function.
 * - SuggestExtensionReasonOutput - The return type for the suggestExtensionReason function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestExtensionReasonInputSchema = z.object({
  doctorRequest: z.string().describe('The doctor\'s request for extending the patient\'s visit.'),
  availableReasons: z.array(z.string()).describe('The predefined list of available reasons for extending the visit.'),
});
export type SuggestExtensionReasonInput = z.infer<typeof SuggestExtensionReasonInputSchema>;

const SuggestExtensionReasonOutputSchema = z.object({
  suggestedReason: z.string().describe('The most appropriate reason for extending the visit based on the doctor\'s request.'),
});
export type SuggestExtensionReasonOutput = z.infer<typeof SuggestExtensionReasonOutputSchema>;

export async function suggestExtensionReason(input: SuggestExtensionReasonInput): Promise<SuggestExtensionReasonOutput> {
  return suggestExtensionReasonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestExtensionReasonPrompt',
  input: {schema: SuggestExtensionReasonInputSchema},
  output: {schema: SuggestExtensionReasonOutputSchema},
  prompt: `You are an AI assistant helping a receptionist determine the reason for a doctor\'s request to extend a patient\'s visit.

  Given the doctor\'s request and a list of available reasons, select the most appropriate reason that best fits the context of the request.

  Doctor\'s Request: {{{doctorRequest}}}

  Available Reasons:
  {{#each availableReasons}}
  - {{{this}}}
  {{/each}}

  Suggested Reason:`,
});

const suggestExtensionReasonFlow = ai.defineFlow(
  {
    name: 'suggestExtensionReasonFlow',
    inputSchema: SuggestExtensionReasonInputSchema,
    outputSchema: SuggestExtensionReasonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
