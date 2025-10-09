
'use server';

import { aiFinancialAdvisor, AiFinancialAdvisorInput } from '@/ai/flows/ai-financial-advisor';
import { automatedGoalSetting, AutomatedGoalSettingInput } from '@/ai/flows/automated-goal-setting';
import { scanBill } from '@/ai/flows/scan-bill-flow';
import { ScanBillInputSchema } from '@/ai/schemas/scan-bill-schemas';
import { addTransaction } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const aiFinancialAdvisorSchema = z.object({
  financialData: z.string().min(10, "Please provide more details about your financial situation."),
  financialGoals: z.string().min(5, "Please describe your financial goals."),
});

export async function getFinancialAdvice(prevState: any, formData: FormData) {
  const validatedFields = aiFinancialAdvisorSchema.safeParse({
    financialData: formData.get('financialData'),
    financialGoals: formData.get('financialGoals'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed',
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
    };
  }

  try {
    const result = await aiFinancialAdvisor(validatedFields.data as AiFinancialAdvisorInput);
    return {
      message: 'Success',
      errors: null,
      data: result,
    };
  } catch (error) {
    return {
      message: 'An error occurred while getting financial advice.',
      errors: null,
      data: null,
    };
  }
}

const automatedGoalSettingSchema = z.object({
    goal: z.string().min(3, "Goal must be at least 3 characters."),
    currentSavings: z.coerce.number().min(0, "Current savings must be a positive number."),
    monthlyIncome: z.coerce.number().min(0, "Monthly income must be a positive number."),
    monthlyExpenses: z.coerce.number().min(0, "Monthly expenses must be a positive number."),
    riskTolerance: z.enum(['low', 'medium', 'high']),
    timeHorizonYears: z.coerce.number().min(1, "Time horizon must be at least 1 year."),
});


export async function getGoalRecommendations(prevState: any, formData: FormData) {
    const validatedFields = automatedGoalSettingSchema.safeParse({
        goal: formData.get('goal'),
        currentSavings: formData.get('currentSavings'),
        monthlyIncome: formData.get('monthlyIncome'),
        monthlyExpenses: formData.get('monthlyExpenses'),
        riskTolerance: formData.get('riskTolerance'),
        timeHorizonYears: formData.get('timeHorizonYears'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
            data: null,
        };
    }

    try {
        const result = await automatedGoalSetting(validatedFields.data as AutomatedGoalSettingInput);
        return {
            message: 'Success',
            errors: null,
            data: result,
        };
    } catch (error) {
        return {
            message: 'An error occurred while getting recommendations.',
            errors: null,
            data: null,
        };
    }
}


export async function scanBillAction(prevState: any, formData: FormData) {
    const validatedFields = ScanBillInputSchema.safeParse({
        photoDataUri: formData.get('photoDataUri'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
            data: null,
        };
    }

    if (!validatedFields.data.photoDataUri) {
        return {
            message: 'Validation failed',
            errors: { photoDataUri: ['Please provide an image.'] },
            data: null,
        }
    }

    try {
        const result = await scanBill({ photoDataUri: validatedFields.data.photoDataUri });
        
        addTransaction({
            id: crypto.randomUUID(),
            date: result.date,
            description: result.description,
            amount: result.amount,
            type: 'expense',
            category: result.category,
        });

        revalidatePath('/');

        return {
            message: 'Success',
            errors: null,
            data: result,
        };
    } catch (error) {
        console.error(error);
        return {
            message: 'An error occurred while scanning the bill.',
            errors: null,
            data: null,
        };
    }
}
