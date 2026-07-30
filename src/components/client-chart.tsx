
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartData = [
  { month: "Jan", count: 12 },
  { month: "Fev", count: 25 },
  { month: "Mar", count: 18 },
  { month: "Avr", count: 32 },
  { month: "Mai", count: 22 },
  { month: "Juin", count: 45 },
]

const chartConfig = {
    count: {
      label: "Courriers",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

export function ClientChart({ data = chartData }: { data?: {month: string, count: number}[] }) {
  return (
    <div className="h-[250px] -ml-4">
        <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart
                accessibilityLayer
                data={data}
                margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 0,
                }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value}
                />
                 <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={30}
                 />
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            indicator="dot"
                            formatter={(value, name, item) => (
                                <>
                                    <span className="font-bold text-foreground">{`${item.payload.count} courriers`}</span>
                                </>
                            )}
                        />
                    }
                />
                <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={4}
                />
            </BarChart>
        </ChartContainer>
    </div>
  )
}

    