
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { getGoalRecommendations } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  message: '',
  errors: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Generating...' : 'Get Recommendations'}
      <Target className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function GoalForm() {
  const [state, formAction] = useActionState(getGoalRecommendations, initialState);
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="goal">Financial Goal</Label>
          <Input id="goal" name="goal" placeholder="e.g., Buy a house" />
           {state.errors?.goal && <p className="text-sm text-destructive">{state.errors.goal.join(', ')}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeHorizonYears">Time Horizon (Years)</Label>
          <Input id="timeHorizonYears" name="timeHorizonYears" type="number" placeholder="e.g., 5" />
          {state.errors?.timeHorizonYears && <p className="text-sm text-destructive">{state.errors.timeHorizonYears.join(', ')}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentSavings">Current Savings (₹)</Label>
          <Input id="currentSavings" name="currentSavings" type="number" placeholder="e.g., 20000" />
           {state.errors?.currentSavings && <p className="text-sm text-destructive">{state.errors.currentSavings.join(', ')}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
          <Input id="monthlyIncome" name="monthlyIncome" type="number" placeholder="e.g., 5000" />
           {state.errors?.monthlyIncome && <p className="text-sm text-destructive">{state.errors.monthlyIncome.join(', ')}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthlyExpenses">Monthly Expenses (₹)</Label>
          <Input id="monthlyExpenses" name="monthlyExpenses" type="number" placeholder="e.g., 3000" />
          {state.errors?.monthlyExpenses && <p className="text-sm text-destructive">{state.errors.monthlyExpenses.join(', ')}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="riskTolerance">Risk Tolerance</Label>
          <Select name="riskTolerance" defaultValue="medium">
            <SelectTrigger id="riskTolerance">
              <SelectValue placeholder="Select risk tolerance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          {state.errors?.riskTolerance && <p className="text-sm text-destructive">{state.errors.riskTolerance.join(', ')}</p>}
        </div>
      </div>
      <SubmitButton />

      {state.data && (
        <Card className="mt-6 bg-secondary/50 dark:bg-secondary/20 border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-accent" />
              Your Goal Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="whitespace-pre-wrap">{state.data.recommendations}</p>
            <div className="font-semibold text-primary">{state.data.estimatedTimeToGoal}</div>
          </CardContent>
        </Card>
      )}
    </form>
  );
}

    