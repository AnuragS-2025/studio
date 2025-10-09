
'use server';

import { aiFinancialAdvisor, AiFinancialAdvisorInput } from '@/ai/flows/ai-financial-advisor';
import { automatedGoalSetting, AutomatedGoalSettingInput } from '@/ai/flows/automated-goal-setting';
import { scanBill } from '@/ai/flows/scan-bill-flow';
import { ScanBillInputSchema } from '@/ai/schemas/scan-bill-schemas';
import { addTransaction } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase/auth';

// NOTE: The Firebase Admin SDK should be used in server actions.
// However, to get the current user, we'd typically use a server-side
// auth library or pass the userId from the client. For simplicity in this
// context, we will adjust this later if auth mechanisms are more clearly defined.
// For now, we are removing the direct client-SDK call that causes the crash.

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
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      message: `An error occurred while getting financial advice: ${errorMessage}`,
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
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return {
            message: `An error occurred while getting recommendations: ${errorMessage}`,
            errors: null,
            data: null,
        };
    }
}


export async function scanBillAction(prevState: any, formData: FormData) {
    const validatedFields = ScanBillInputSchema.safeParse({
        photoDataUri: formData.get('photoDataUri'),
        userId: formData.get('userId'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
            data: null,
        };
    }
    
    const { photoDataUri, userId } = validatedFields.data;

    if (!photoDataUri) {
        return {
            message: 'Validation failed',
            errors: { photoDataUri: ['Please provide an image.'] },
            data: null,
        }
    }
    if (!userId) {
        return {
            message: 'User not authenticated.',
            errors: null,
            data: null,
        };
    }

    try {
        const result = await scanBill({ photoDataUri });
        
        // This is where you would use the Admin SDK to get firestore
        // For now, we are assuming addTransaction can handle it
        await addTransaction(userId, {
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
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return {
            message: `An error occurred while scanning the bill: ${errorMessage}`,
            errors: null,
            data: null,
        };
    }
}

const addExpenseSchema = z.object({
    description: z.string().min(1, 'Description is required.'),
    amount: z.coerce.number().min(0.01, 'Amount must be greater than 0.'),
    date: z.string().min(1, 'Date is required.'),
    category: z.enum(['Food', 'Transport', 'Social', 'Utilities', 'Shopping', 'Investment', 'Housing', 'Other']),
    userId: z.string().min(1, 'User ID is required.'),
});

export async function addExpenseAction(prevState: any, formData: FormData) {
    const validatedFields = addExpenseSchema.safeParse({
        description: formData.get('description'),
        amount: formData.get('amount'),
        date: formData.get('date'),
        category: formData.get('category'),
        userId: formData.get('userId'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
            data: null,
        };
    }
    
    const { userId, ...transactionData } = validatedFields.data;
    
    const newTransaction = {
        ...transactionData,
        type: 'expense' as const,
    };

    if (!userId) {
        return {
            message: 'User not authenticated.',
            errors: null,
            data: null,
        };
    }

    try {
        // This is where you would use the Admin SDK to get firestore
        // For now, we are assuming addTransaction can handle it
        await addTransaction(userId, newTransaction);
        revalidatePath('/');
        return {
            message: 'Success',
            errors: null,
            data: newTransaction,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return {
            message: `An error occurred while adding the expense: ${errorMessage}`,
            errors: null,
            data: null,
        };
    }
}
