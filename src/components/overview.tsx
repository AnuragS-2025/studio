
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "./ui/chart"

const data = [
  { name: "Jan", income: 80000, expenses: 24000 },
  { name: "Feb", income: 82000, expenses: 31398 },
  { name: "Mar", income: 75000, expenses: 28800 },
  { name: "Apr", income: 85000, expenses: 35908 },
  { name: "May", income: 90000, expenses: 21800 },
  { name: "Jun", income: 88000, expenses: 36800 },
  { name: "Jul", income: 92000, expenses: 39300 },
]

export function Overview() {
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

    