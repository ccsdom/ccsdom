
"use client"

import * as React from "react"
import { Pie, PieChart, Sector, Cell } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"

export function PlanDistributionChart({ data, totalClients }: { data: { plan: string, clients: number }[], totalClients: number }) {
    const chartData = React.useMemo(() => data.filter(item => item.clients > 0), [data]);

    const chartConfig = React.useMemo(() => {
        const config: ChartConfig = {};
        data.forEach((item, index) => {
            config[item.plan.toLowerCase()] = {
                label: item.plan,
                color: `hsl(var(--chart-${(index % 5) + 1}))`,
            }
        });
        return config;
    }, [data]);

    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>Répartition par Offre</CardTitle>
                <CardDescription>Distribution des clients actifs par abonnement.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent
                                hideLabel
                                formatter={(value, name) => [
                                    `${value} client(s)`,
                                    chartConfig[name as keyof typeof chartConfig]?.label || name,
                                ]}
                            />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="clients"
                            nameKey="plan"
                            innerRadius="60%"
                            strokeWidth={5}
                        >
                            {chartData.map((entry) => (
                                <Cell key={`cell-${entry.plan}`} fill={chartConfig[entry.plan.toLowerCase()]?.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm pt-4">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-medium leading-none">
                    {data.map(item => (
                        <div key={item.plan} className="flex items-center gap-2">
                           <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartConfig[item.plan.toLowerCase()]?.color }} />
                           {item.plan}
                        </div>
                    ))}
                </div>
                <div className="leading-none text-muted-foreground mt-2">
                    Aperçu des abonnements les plus populaires. Total: {totalClients} client(s) actif(s).
                </div>
            </CardFooter>
        </Card>
    )
}
