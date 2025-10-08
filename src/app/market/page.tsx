import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMarketData } from "@/lib/data";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export default function MarketPage() {
  const marketData = getMarketData();

  return (
    <div className="grid flex-1 items-start gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Market Analysis</CardTitle>
          <CardDescription>
            Real-time stock market trends and insightful analysis.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {marketData.map((stock) => (
          <Card key={stock.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stock.name}</CardTitle>
              <div className={cn("text-sm font-bold", stock.change > 0 ? "text-accent" : "text-destructive")}>
                {stock.change > 0 ? "+" : ""}{stock.change.toFixed(2)}%
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stock.value.toLocaleString()}</div>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stock.chartData}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 0,
                    }}
                  >
                    <Tooltip
                      content={
                        <ChartTooltipContent
                          indicator="dot"
                          hideLabel
                          formatter={(value) => `$${value}`}
                        />
                      }
                    />
                    <Area
                      dataKey="value"
                      type="natural"
                      fill={stock.change > 0 ? "hsl(var(--accent))" : "hsl(var(--destructive))"}
                      fillOpacity={0.1}
                      stroke={stock.change > 0 ? "hsl(var(--accent))" : "hsl(var(--destructive))"}
                      stackId="a"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Top Movers</CardTitle>
          <CardDescription>Assets with the most significant price changes today.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketData
                .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
                .map((stock) => (
                  <TableRow key={stock.name}>
                    <TableCell className="font-medium">{stock.name}</TableCell>
                    <TableCell>${stock.value.toLocaleString()}</TableCell>
                    <TableCell className={cn("text-right font-semibold", stock.change > 0 ? "text-accent" : "text-destructive")}>
                      {stock.change > 0 ? "+" : ""}{stock.change.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
