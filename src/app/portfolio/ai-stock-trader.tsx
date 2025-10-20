'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { getStockTradeSuggestion } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { BrainCircuit, Lightbulb, TrendingUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInvestments } from '@/lib/data';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';


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

interface AIStockTraderProps {
    marketData: { name: string; value: number; change: number }[];
}

export function AIStockTrader({ marketData }: AIStockTraderProps) {
  const [state, formAction] = useActionState(getStockTradeSuggestion, initialState);
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(undefined);

  const { investments, isLoading: investmentsLoading } = useInvestments();

  useEffect(() => {
    // This will only run on the client, after initial hydration
    setDate(new Date());
  }, []);
  
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
            <div className="flex flex-col items-center gap-4">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border self-center"
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                />
                <input type="hidden" name="analysisDate" value={date ? format(date, 'yyyy-MM-dd') : ''} />
                <input type="hidden" name="investments" value={JSON.stringify(investments || [])} />
                <input type="hidden" name="marketData" value={JSON.stringify(marketData || [])} />
                 {state.data?.profitAnalysis && state.data.profitAnalysis.length > 0 && (
                    <div className="space-y-2 w-full">
                         <h4 className="font-semibold text-center">Profit-Potential Analysis</h4>
                         <ChartContainer config={{}} className="w-full h-[250px]">
                            <BarChart data={state.data.profitAnalysis} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="stock" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `₹${value / 1000}k`} />
                                <ChartTooltip
                                    content={<ChartTooltipContent formatter={(value, name, entry) => (
                                        <div>
                                            <p className="font-bold text-foreground">{entry.payload.stock}</p>
                                            <p className="text-sm text-muted-foreground">Potential Profit: <span className="font-semibold text-foreground">₹{Number(value).toLocaleString()}</span></p>
                                        </div>
                                    )}/>}
                                />
                                <Bar dataKey="potentialProfit" radius={4}>
                                     {state.data.profitAnalysis.map((entry: any) => (
                                        <Cell key={`cell-${entry.stock}`} fill={entry.stock === state.data.stockToSell ? "hsl(var(--chart-1))" : "hsl(var(--chart-3))"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </div>
                 )}
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
                        <CardContent className="space-y-4">
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
