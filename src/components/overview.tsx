
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { getExpenseChartData } from "@/lib/data"
import { ChartContainer, ChartTooltipContent } from "./ui/chart"

export function Overview() {
  const data = getExpenseChartData()
  const chartConfig = {
    income: {
      label: "Income",
      color: "hsl(var(--chart-2))",
    },
    expenses: {
      label: "Expenses",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="w-full h-[350px]">
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent
              formatter={(value, name) => (
                <div className="flex flex-col">
                  <span className="capitalize text-muted-foreground">{name}</span>
                  <span className="font-bold">₹{Number(value).toLocaleString()}</span>
                </div>
              )}
          />}
        />
        <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

    