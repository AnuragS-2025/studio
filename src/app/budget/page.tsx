import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getBudgets } from "@/lib/data";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function BudgetPage() {
  const budgets = getBudgets();

  const getProgressColor = (value: number) => {
    if (value > 90) return "bg-red-500";
    if (value > 75) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Budgeting Tool</CardTitle>
            <CardDescription>
              Manage your budgets and get AI-driven recommendations for optimization.
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const progress = (budget.spent / budget.limit) * 100;
            return (
              <Card key={budget.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{budget.category}</CardTitle>
                  <CardDescription>
                    <span className="font-semibold">${budget.spent.toFixed(2)}</span> spent of ${budget.limit.toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="h-2 [&>div]:bg-primary" />
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">{progress.toFixed(0)}% of your budget used</p>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        <Card className="border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-accent" />
              Optimize Your Budget
            </CardTitle>
            <CardDescription>
              Use our AI Advisor to get personalized tips on how to improve your budget and save more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Ready to take control of your spending? Describe your current budgeting challenges and goals to our AI Advisor for tailored strategies.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/advisor">Ask AI Advisor</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
