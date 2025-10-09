
'use server';

/**
 * @fileOverview A flow for scanning a bill and extracting expense details.
 *
 * - scanBill - A function that handles the bill scanning process.
 */

import {ai} from '@/ai/genkit';
import { ScanBillInputSchema, ScanBillOutputSchema, type ScanBillInput } from '@/ai/schemas/scan-bill-schemas';


export async function scanBill(
  input: ScanBillInput
): Promise<import('@/ai/schemas/scan-bill-schemas').ScanBillOutput> {
  return scanBillFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scanBillPrompt',
  input: {schema: ScanBillInputSchema},
  output: {schema: ScanBillOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert expense tracker. Analyze the provided bill/receipt image and extract the following information:
  - Vendor: The name of the store or service provider.
  - Amount: The total amount of the bill.
  - Date: The date of the transaction. Format it as YYYY-MM-DD.
  - Category: Classify the expense into one of the following categories: Food, Transport, Social, Utilities, Shopping, Investment, Housing, Other.
  - Description: Create a brief description of the purchase.

  Photo: {{media url=photoDataUri}}`,
});

const scanBillFlow = ai.defineFlow(
  {
    name: 'scanBillFlow',
    inputSchema: ScanBillInputSchema,
    outputSchema: ScanBillOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
