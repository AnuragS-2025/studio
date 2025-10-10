
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { getStockTradeSuggestion } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { BrainCircuit, Lightbulb, TrendingUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInvestments, getMarketData } from '@/lib/data';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState = {
  message: '',
  errors: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
        </>
      ) : (
        <>
            <BrainCircuit className="mr-2 h-4 w-4" />
            Get AI Suggestion
        </>
      )}
    </Button>
  );
}

export function AIStockTrader() {
  const [state, formAction] = useActionState(getStockTradeSuggestion, initialState);
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { investments, isLoading: investmentsLoading } = useInvestments();
  const marketData = getMarketData();

  useEffect(() => {
    if (state.message && state.message !== 'Success') {
        toast({
            variant: "destructive",
            title: "Error",
            description: state.message,
        });
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="text-primary"/>
            AI-Insighted Stock Trader
        </CardTitle>
        <CardDescription>
            Select a date and let our ML algorithm suggest which stock to sell to maximize your profit gains.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                />
                <input type="hidden" name="analysisDate" value={date ? format(date, 'yyyy-MM-dd') : ''} />
                <input type="hidden" name="investments" value={JSON.stringify(investments || [])} />
                <input type="hidden" name="marketData" value={JSON.stringify(marketData || [])} />
            </div>

            <div className="space-y-4">
                <SubmitButton />
                {state.data && (
                    <Card className="bg-secondary/50 dark:bg-secondary/20 border-accent">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp className="text-green-500" />
                                Recommendation: Sell {state.data.stockToSell}
                            </CardTitle>
                            <CardDescription>
                                Estimated Profit: <span className="font-bold text-green-500">₹{state.data.potentialProfit.toLocaleString('en-IN')}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Alert>
                                <Lightbulb className="h-4 w-4" />
                                <AlertTitle>AI Reasoning</AlertTitle>
                                <AlertDescription>
                                    {state.data.reasoning}
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                )}
                 {state.message && state.message !== 'Success' && (
                    <Alert variant="destructive">
                        <AlertTitle>Analysis Failed</AlertTitle>
                        <AlertDescription>
                            {state.message}
                        </AlertDescription>
                    </Alert>
                 )}
            </div>
        </form>
      </CardContent>
    </Card>
  );
}
