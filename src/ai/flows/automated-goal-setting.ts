
'use server';

/**
 * @fileOverview A flow for setting financial goals and receiving automated recommendations.
 *
 * - automatedGoalSetting - A function that handles the goal setting process.
 * - AutomatedGoalSettingInput - The input type for the automatedGoalSetting function.
 * - AutomatedGoalSettingOutput - The return type for the automatedGoalSetting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedGoalSettingInputSchema = z.object({
  goal: z.string().describe('The financial goal (e.g., retirement, home purchase).'),
  currentSavings: z.number().describe('The user\'s current savings.'),
  monthlyIncome: z.number().describe('The user\'s monthly income.'),
  monthlyExpenses: z.number().describe('The user\'s monthly expenses.'),
  riskTolerance: z
    .enum(['low', 'medium', 'high'])
    .describe('The user\'s risk tolerance (low, medium, or high).'),
  timeHorizonYears: z
    .number()
    .describe('The number of years the user has to achieve the goal.'),
});
export type AutomatedGoalSettingInput = z.infer<typeof AutomatedGoalSettingInputSchema>;

const AutomatedGoalSettingOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('AI-driven recommendations on how to achieve the financial goal, formatted for readability with line breaks.'),
  estimatedTimeToGoal: z
    .string()
    .describe('Estimated time to achieve the goal based on current inputs.'),
});
export type AutomatedGoalSettingOutput = z.infer<typeof AutomatedGoalSettingOutputSchema>;

export async function automatedGoalSetting(
  input: AutomatedGoalSettingInput
): Promise<AutomatedGoalSettingOutput> {
  return automatedGoalSettingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedGoalSettingPrompt',
  input: {schema: AutomatedGoalSettingInputSchema},
  output: {schema: AutomatedGoalSettingOutputSchema},
  prompt: `You are a financial advisor providing advice to a user on how to achieve their financial goals. All financial figures are in Indian Rupees (₹). Do not use the dollar sign ($).

  The user's goal is: {{goal}}
  Their current savings are: {{currentSavings}}
  Their monthly income is: {{monthlyIncome}}
  Their monthly expenses are: {{monthlyExpenses}}
  Their risk tolerance is: {{riskTolerance}}
  Their time horizon is: {{timeHorizonYears}} years

  Based on this information, provide specific and actionable recommendations on how the user can achieve their goal.
  Also, provide a separate estimation of how long it will take to achieve the goal.
  
  Structure your response into two parts:
  1.  **recommendations**: A conversational and encouraging text with clear, actionable steps. Use line breaks to separate paragraphs and bullet points for lists to improve readability. Ensure that recommendations are tailored to the user's risk tolerance and time horizon. If the goal is not realistic with the current parameters, suggest adjustments.
  2.  **estimatedTimeToGoal**: A concise string stating the estimated time to reach the goal (e.g., "Approximately 5 years", "About 6 months").

  Do not mention that you are an AI.
`,
});

const automatedGoalSettingFlow = ai.defineFlow(
  {
    name: 'automatedGoalSettingFlow',
    inputSchema: AutomatedGoalSettingInputSchema,
    outputSchema: AutomatedGoalSettingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
