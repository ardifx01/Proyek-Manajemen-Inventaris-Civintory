'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartTooltipContent,
  ChartTooltip,
  ChartContainer
} from '@/components/ui/chart';
import { CardDescription } from '../ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';

type ChartData = {
  date: string;
  in: number;
  out: number;
};

export function StockMovementChart({ data }: { data: ChartData[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-[250px] w-full items-center justify-center">
                <CardDescription>Tidak ada data pergerakan stok untuk ditampilkan.</CardDescription>
            </div>
        )
    }

  return (
    <ChartContainer config={{
        in: { label: 'Masuk', color: 'hsl(var(--chart-2))' },
        out: { label: 'Keluar', color: 'hsl(var(--chart-1))' }
    }} className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} accessibilityLayer>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                />
                <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                allowDecimals={false}
                />
                <ChartTooltip
                cursor={false}
                content={
                    <ChartTooltipContent
                    indicator="dot"
                    formatter={(value, name) => (
                        <div className="flex items-center gap-2">
                        {name === 'in' ? <ArrowUp className="h-4 w-4 text-green-500" /> : <ArrowDown className="h-4 w-4 text-red-500" />}
                        <span className="capitalize">{name === 'in' ? 'Masuk' : 'Keluar'}</span>
                        <span className="font-bold ml-auto">{value}</span>
                        </div>
                    )}
                    />
                }
                />
                <Bar dataKey="in" fill="var(--color-in)" radius={4} />
                <Bar dataKey="out" fill="var(--color-out)" radius={4} />
            </BarChart>
        </ResponsiveContainer>
    </ChartContainer>
  );
}
