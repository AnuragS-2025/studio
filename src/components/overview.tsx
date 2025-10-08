"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { getExpenseChartData } from "@/lib/data"
import { ChartTooltipContent } from "./ui/chart"

export function Overview() {
  const data = getExpenseChartData()

  return (
    <ResponsiveContainer width="100%" height={350}>
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
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent
              formatter={(value, name) => (
                <div className="flex flex-col">
                  <span className="capitalize text-muted-foreground">{name}</span>
                  <span className="font-bold">${value.toLocaleString()}</span>
                </div>
              )}
          />}
        />
        <Bar dataKey="income" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
