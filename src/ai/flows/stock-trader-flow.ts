
'use server';

/**
 * @fileOverview An AI-powered stock trading assistant flow.
 *
 * - aiStockTrader - A function that suggests which stock to sell for maximum profit.
 * - AiStockTraderInput - The input type for the aiStockTrader function.
 * - AiStockTraderOutput - The return type for the aiStockTrader function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InvestmentSchema = z.object({
    name: z.string(),
    symbol: z.string(),
    quantity: z.number(),
    price: z.number(),
    value: z.number(),
    type: z.string(),
});

const MarketDataSchema = z.object({
    name: z.string(),
    value: z.number(),
    change: z.number(),
});

const AiStockTraderInputSchema = z.object({
  investments: z.array(InvestmentSchema).describe("The user's current investment portfolio."),
  marketData: z.array(MarketDataSchema).describe("Current market data for various stocks."),
  analysisDate: z.string().describe("The date for which the analysis is being performed (YYYY-MM-DD).")
});
export type AiStockTraderInput = z.infer<typeof AiStockTraderInputSchema>;

const AiStockTraderOutputSchema = z.object({
  stockToSell: z.string().describe("The symbol of the stock recommended to be sold."),
  reasoning: z.string().describe("A detailed explanation for why this stock was recommended for selling to maximize profit."),
  potentialProfit: z.number().describe("The estimated profit from selling the recommended stock."),
});
export type AiStockTraderOutput = z.infer<typeof AiStockTraderOutputSchema>;

export async function aiStockTrader(
  input: AiStockTraderInput
): Promise<AiStockTraderOutput> {
  return aiStockTraderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiStockTraderPrompt',
  input: {schema: AiStockTraderInputSchema},
  output: {schema: AiStockTraderOutputSchema},
  prompt: `You are an expert stock market analyst with a powerful ML algorithm. Your task is to analyze a user's investment portfolio and the current market data to recommend which single stock to sell to maximize profit. The analysis is for the date: {{{analysisDate}}}. All financial figures are in Indian Rupees (₹). Do not use the dollar sign ($).

  User's Portfolio:
  {{#each investments}}
  - Name: {{{name}}} ({{{symbol}}}), Quantity: {{{quantity}}}, Current Value: ₹{{{value}}}
  {{/each}}

  Market Data:
  {{#each marketData}}
  - Name: {{{name}}}, Current Price: ₹{{{value}}}, Daily Change: {{{change}}}%
  {{/each}}

  Based on the user's portfolio and the market data, identify the single best stock to sell to maximize profit. Provide the stock symbol, a detailed reasoning for your choice (considering factors like current gains, market trends, and potential for future decline), and the estimated potential profit from the sale.
`,
});

const aiStockTraderFlow = ai.defineFlow(
  {
    name: 'aiStockTraderFlow',
    inputSchema: AiStockTraderInputSchema,
    outputSchema: AiStockTraderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
