
'use server';

import { aiFinancialAdvisor, AiFinancialAdvisorInput, AiFinancialAdvisorOutput } from '@/ai/flows/ai-financial-advisor';
import { automatedGoalSetting, AutomatedGoalSettingInput } from '@/ai/flows/automated-goal-setting';
import { scanBill } from '@/ai/flows/scan-bill-flow';
import { ScanBillInputSchema } from '@/ai/schemas/scan-bill-schemas';
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

const serverScanBillSchema = z.object({
    photoDataUri: z.string().min(1, 'Please provide an image.'),
});

export async function scanBillAction(prevState: any, formData: FormData) {
    const validatedFields = serverScanBillSchema.safeParse({
        photoDataUri: formData.get('photoDataUri'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
            data: null,
        };
    }
    
    const { photoDataUri } = validatedFields.data;

    try {
        const result = await scanBill({ photoDataUri });
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
});

export async function addExpenseAction(prevState: any, formData: FormData) {
    const validatedFields = addExpenseSchema.safeParse({
        description: formData.get('description'),
        amount: formData.get('amount'),
        date: formData.get('date'),
        category: formData.get('category'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
            data: null,
        };
    }
    
    const newTransaction = {
        ...validatedFields.data,
        type: 'expense' as const,
    };

    try {
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

const addIncomeSchema = z.object({
    description: z.string().min(1, 'Description is required.'),
    amount: z.coerce.number().min(0.01, 'Amount must be greater than 0.'),
    date: z.string().min(1, 'Date is required.'),
    category: z.enum(['Salary', 'Freelance', 'Investment', 'Other']),
});

export async function addIncomeAction(prevState: any, formData: FormData) {
    const validatedFields = addIncomeSchema.safeParse({
        description: formData.get('description'),
        amount: formData.get('amount'),
        date: formData.get('date'),
        category: formData.get('category'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
            data: null,
        };
    }
    
    const newTransaction = {
        ...validatedFields.data,
        type: 'income' as const,
    };

    try {
        revalidatePath('/');
        return {
            message: 'Success',
            errors: null,
            data: newTransaction,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return {
            message: `An error occurred while adding the income: ${errorMessage}`,
            errors: null,
            data: null,
        };
    }
}

const updateProfileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters long.'),
});

export async function updateProfileAction(prevState: any, formData: FormData) {
  const validatedFields = updateProfileSchema.safeParse({
    displayName: formData.get('displayName'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed',
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
    };
  }

  try {
    revalidatePath('/');
    return {
      message: 'Success',
      errors: null,
      data: { displayName: validatedFields.data.displayName },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      message: `An error occurred while updating the profile: ${errorMessage}`,
      errors: null,
      data: null,
    };
  }
}
