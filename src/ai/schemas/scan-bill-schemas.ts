
import { z } from 'zod';

export const ScanBillInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a bill or receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ScanBillInput = z.infer<typeof ScanBillInputSchema>;

export const ScanBillOutputSchema = z.object({
  vendor: z.string().describe('The name of the vendor or store.'),
  amount: z.number().describe('The total amount of the bill.'),
  date: z.string().describe('The date of the transaction in YYYY-MM-DD format.'),
  category: z.enum(['Food', 'Transport', 'Social', 'Utilities', 'Shopping', 'Investment', 'Housing', 'Other']).describe('The expense category.'),
  description: z.string().describe('A short description of the expense.'),
});
export type ScanBillOutput = z.infer<typeof ScanBillOutputSchema>;
