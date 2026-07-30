
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  clients: {
    label: "Clients",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function AdminChart({ data }: { data: {name: string, clients: number}[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
            />
            <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
            />
            <ChartTooltip
                cursor={{ fill: 'hsl(var(--secondary))' }}
                content={<ChartTooltipContent 
                    formatter={(value) => `${value} client(s)`}
                    indicator="dot"
                />}
            />
            <Bar dataKey="clients" fill="var(--color-clients)" radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
    </ChartContainer>
  )
}
