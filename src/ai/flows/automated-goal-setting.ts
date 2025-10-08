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
    .describe('AI-driven recommendations on how to achieve the financial goal.'),
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
  prompt: `You are a financial advisor providing advice to a user on how to achieve their financial goals.

  The user's goal is: {{goal}}
  Their current savings are: {{currentSavings}}
  Their monthly income is: {{monthlyIncome}}
  Their monthly expenses are: {{monthlyExpenses}}
  Their risk tolerance is: {{riskTolerance}}
  Their time horizon is: {{timeHorizonYears}} years

  Based on this information, provide specific and actionable recommendations on how the user can achieve their goal.
  Also estimate how long it will take to achieve the goal, and include that in the answer.
  Be concise and provide the answer in a conversational style.
  Ensure that recommendations are tailored to the user's risk tolerance and time horizon.
  If the goal cannot be achieved with the current parameters, suggest more realistic parameters.
  The recommendations should include information about how the user can adjust their parameters.
  Do not mention that you are an AI, just provide the recommendations.
  Make sure to provide an estimated time to goal, even if the recommendations involve adjusting parameters.
  Limit the estimated time to goal to weeks, months, or years.
  For example, if the time to goal is a fraction of a year, then answer in terms of months.  If the time to goal is between 1 and 2 years, then answer in terms of years.  If the time to goal is less than a month, then answer in terms of weeks.
  If the time to goal is over two years, answer in terms of years.
  Make the estimatedTimeToGoal be the last sentence in the recommendations.
  Do not specify amounts to be saved, give strategies for saving.  If there are strategies that do involve saving specific amounts, be sure to mention they are only examples and may not reflect actual savings.
  Ensure that the user's risk tolerance and time horizon are accounted for when generating the recommendations.
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
