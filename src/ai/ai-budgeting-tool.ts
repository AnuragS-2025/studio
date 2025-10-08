'use server';

/**
 * @fileOverview This file defines a Genkit flow for an AI-driven budgeting tool.
 *
 * The tool provides personalized recommendations to optimize a user's budget and tracks their spending habits.
 * @param {BudgetingToolInput} input - The input data for the budgeting tool, including income, expenses, and financial goals.
 * @returns {BudgetingToolOutput} - The output containing budget analysis, recommendations, and spending insights.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BudgetingToolInputSchema = z.object({
  income: z.number().describe('Monthly income'),
  expenses: z
    .array(z.object({
      category: z.string().describe('Expense category'),
      amount: z.number().describe('Expense amount'),
    }))
    .describe('List of expenses'),
  financialGoals: z
    .array(z.string())
    .describe('List of financial goals (e.g., retirement, home purchase)'),
  spendingHabitsDescription: z
    .string()
    .optional()
    .describe('Optional description of spending habits'),
});
export type BudgetingToolInput = z.infer<typeof BudgetingToolInputSchema>;

const BudgetingToolOutputSchema = z.object({
  budgetAnalysis: z.string().describe('Analysis of the current budget'),
  recommendations: z.string().describe('AI-driven recommendations for budget optimization'),
  spendingInsights: z.string().describe('Insights into spending habits and potential areas for savings'),
});
export type BudgetingToolOutput = z.infer<typeof BudgetingToolOutputSchema>;

export async function generateBudgetingAdvice(input: BudgetingToolInput): Promise<BudgetingToolOutput> {
  return budgetingToolFlow(input);
}

const budgetingToolPrompt = ai.definePrompt({
  name: 'budgetingToolPrompt',
  input: {schema: BudgetingToolInputSchema},
  output: {schema: BudgetingToolOutputSchema},
  prompt: `You are an AI financial advisor. Analyze the user's budget and provide personalized recommendations to optimize their spending and achieve their financial goals.

  Income: {{{income}}}
  Expenses:
  {{#each expenses}}
  - Category: {{{category}}}, Amount: {{{amount}}}
  {{/each}}
  Financial Goals: {{#each financialGoals}}{{{this}}}, {{/each}}
  Spending Habits Description: {{{spendingHabitsDescription}}}

  Provide a detailed budget analysis, specific recommendations for improvement, and insights into their spending habits. Be encouraging and helpful.
  Format the output as follows:

  Budget Analysis: [Your analysis here]
  Recommendations: [Your recommendations here]
  Spending Insights: [Your spending insights here]`,
});

const budgetingToolFlow = ai.defineFlow(
  {
    name: 'budgetingToolFlow',
    inputSchema: BudgetingToolInputSchema,
    outputSchema: BudgetingToolOutputSchema,
  },
  async input => {
    const {output} = await budgetingToolPrompt(input);
    return output!;
  }
);
