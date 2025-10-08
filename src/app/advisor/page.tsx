import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdvisorForm } from './advisor-form';

export default function AdvisorPage() {
  return (
    <div className="grid flex-1 items-start gap-2 p-2">
      <Card>
        <CardHeader>
          <CardTitle>AI Financial Advisor</CardTitle>
          <CardDescription>
            Get personalized financial advice and insights by detailing your financial situation and goals below. Our AI will analyze your information and provide actionable recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdvisorForm />
        </CardContent>
      </Card>
    </div>
  );
}
