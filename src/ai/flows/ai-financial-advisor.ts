
'use server';

/**
 * @fileOverview An AI-powered financial advisor flow.
 *
 * - aiFinancialAdvisor - A function that provides personalized financial advice and insights.
 * - AiFinancialAdvisorInput - The input type for the aiFinancialAdvisor function.
 * - AiFinancialAdvisorOutput - The return type for the aiFinancialAdvisor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiFinancialAdvisorInputSchema = z.object({
  financialData: z
    .string()
    .describe(
      'A detailed summary of the user\'s financial situation, including income, expenses, assets, and debts.'
    ),
  financialGoals: z
    .string()
    .describe('The user\'s financial goals, such as retirement, buying a home, or paying off debt.'),
});
export type AiFinancialAdvisorInput = z.infer<typeof AiFinancialAdvisorInputSchema>;

const ChartDataItemSchema = z.object({
    name: z.string().describe("Category name for the chart data point."),
    value: z.number().describe("The numerical value for the category.")
});

const BarChartDataItemSchema = z.object({
    name: z.string().describe("Category name for the chart data point."),
    current: z.number().describe("The current spending value for the category."),
    recommended: z.number().describe("The recommended spending value for the category.")
});

const AiFinancialAdvisorOutputSchema = z.object({
  analysis: z
    .string()
    .describe('A brief analysis of the user\'s overall financial health.'),
  recommendations: z
    .array(z.string())
    .describe(
      'A list of 3-5 specific, actionable recommendations for the user to improve their financial situation.'
    ),
  insights: z
    .string()
    .describe('Interesting insights or potential opportunities based on the provided data.'),
  idealBudget: z.array(ChartDataItemSchema).describe("An array of objects representing an ideal budget allocation for a pie chart. Example: [{name: 'Housing', value: 30}, {name: 'Food', value: 15}] where value is a percentage."),
  spendingComparison: z.array(BarChartDataItemSchema).describe("An array of objects for a bar chart comparing current vs. recommended monthly spending across a few key categories. Example: [{name: 'Eating Out', current: 5000, recommended: 3000}]"),
});
export type AiFinancialAdvisorOutput = z.infer<typeof AiFinancialAdvisorOutputSchema>;

export async function aiFinancialAdvisor(
  input: AiFinancialAdvisorInput
): Promise<AiFinancialAdvisorOutput> {
  return aiFinancialAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiFinancialAdvisorPrompt',
  input: {schema: AiFinancialAdvisorInputSchema},
  output: {schema: AiFinancialAdvisorOutputSchema},
  prompt: `You are a financial advisor. Analyze the user's financial data and goals to provide personalized advice and insights. All financial figures are in Indian Rupees (₹). Do not use the dollar sign ($).

Financial Data: {{{financialData}}}

Financial Goals: {{{financialGoals}}}

Provide a structured response with an analysis, a list of recommendations, and key insights.
Also, provide data for two charts:
1.  'idealBudget': A pie chart data representing an ideal budget allocation in percentages. Choose 4-5 relevant categories (e.g., Housing, Food, Savings, Wants, Needs). The sum of values should be 100.
2.  'spendingComparison': A bar chart data comparing the user's current monthly spending with your recommended spending for 3-4 key categories where they can save money.
`,
});

const aiFinancialAdvisorFlow = ai.defineFlow(
  {
    name: 'aiFinancialAdvisorFlow',
    inputSchema: AiFinancialAdvisorInputSchema,
    outputSchema: AiFinancialAdvisorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
