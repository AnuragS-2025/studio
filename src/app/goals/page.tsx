import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoalForm } from './goal-form';

export default function GoalPage() {
  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Automated Goal Setting</CardTitle>
          <CardDescription>
            Define your financial goals and let our AI provide a roadmap to achieve them. Fill in your details to get personalized recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoalForm />
        </CardContent>
      </Card>
    </div>
  );
}
