
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { getFinancialAdvice } from '@/lib/actions';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const initialState = {
  message: '',
  errors: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Analyzing...' : 'Get Advice'}
      <Sparkles className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function AdvisorForm() {
  const [state, formAction] = useActionState(getFinancialAdvice, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message === 'Validation failed' && state.errors) {
        const errorMessages = Object.values(state.errors).flat().join('\n');
        toast({
            variant: "destructive",
            title: "Error",
            description: errorMessages,
        });
    }
  }, [state, toast]);


  return (
    <form action={formAction} className="space-y-4">
      <div className="grid w-full gap-4">
        <div className="grid w-full gap-1.5">
          <Label htmlFor="financialData">Financial Data</Label>
          <Textarea
            id="financialData"
            name="financialData"
            placeholder="Describe your income, expenses, assets, and debts..."
            className="min-h-32"
          />
          {state.errors?.financialData && <p className="text-sm text-destructive">{state.errors.financialData.join(', ')}</p>}
        </div>
        <div className="grid w-full gap-1.5">
          <Label htmlFor="financialGoals">Financial Goals</Label>
          <Textarea
            id="financialGoals"
            name="financialGoals"
            placeholder="What are your financial goals (e.g., retirement, buying a home)?"
            className="min-h-24"
          />
          {state.errors?.financialGoals && <p className="text-sm text-destructive">{state.errors.financialGoals.join(', ')}</p>}
        </div>
      </div>
      <SubmitButton />

      {state.data && (
        <Card className="mt-6 bg-secondary/50 dark:bg-secondary/20 border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-accent" />
              Your Personalized Advice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Analysis</h3>
              <p className="text-muted-foreground">{state.data.analysis}</p>
            </div>
            <Separator />
             <div>
              <h3 className="font-semibold text-lg mb-4">Recommendations</h3>
              <ul className="space-y-3">
                {state.data.recommendations?.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-lg mb-2">Key Insights</h3>
              <p className="text-muted-foreground">{state.data.insights}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
