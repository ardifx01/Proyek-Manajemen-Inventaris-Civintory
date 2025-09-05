'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Package, Warehouse, PackageX, AlertTriangle, ArrowDown, ArrowUp, BarChart, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StockMovementChart } from './stock-movement-chart';
import { LowStockTable } from './low-stock-table';
import { Button } from '../ui/button';
import Link from 'next/link';

type DashboardStats = {
  total_items: number;
  total_stock: number;
  low_stock_count: number;
  out_of_stock_count: number;
};

type StockMove = {
  date: string;
  in: number;
  out: number;
};

type LowStockItem = {
    id: string;
    name: string;
    code: string;
    quantity: number;
    reorder_point: number | null;
    unit: string;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [stockMoves, setStockMoves] = useState<StockMove[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // Fetch all items and their stock levels
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('id, name, code, reorder_point, units(name)');

        if (itemsError) throw itemsError;

        const { data: stockMovesData, error: stockMovesError } = await supabase
          .from('stock_moves')
          .select('item_id, quantity, type');

        if (stockMovesError) throw stockMovesError;

        const stockQuantities = new Map<string, number>();
        if (stockMovesData) {
          stockMovesData.forEach(move => {
            if (!move.item_id) return;
            const currentQty = stockQuantities.get(move.item_id) || 0;
            const moveQty = move.type === 'in' ? move.quantity : -move.quantity;
            stockQuantities.set(move.item_id, currentQty + moveQty);
          });
        }
        
        let total_stock = 0;
        let low_stock_count = 0;
        let out_of_stock_count = 0;
        const currentLowStockItems: LowStockItem[] = [];

        itemsData.forEach(item => {
          const quantity = stockQuantities.get(item.id) || 0;
          total_stock += quantity;

          if (quantity <= 0) {
            out_of_stock_count++;
          }
          if (item.reorder_point !== null && quantity > 0 && quantity <= item.reorder_point) {
            low_stock_count++;
            currentLowStockItems.push({
                id: item.id,
                name: item.name,
                code: item.code,
                quantity: quantity,
                reorder_point: item.reorder_point,
                unit: item.units?.name ?? 'N/A'
            });
          }
        });

        setStats({
          total_items: itemsData.length,
          total_stock,
          low_stock_count,
          out_of_stock_count,
        });
        setLowStockItems(currentLowStockItems);

        // Fetch last 7 days stock moves for chart
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentMoves, error: recentMovesError } = await supabase
            .from('stock_moves')
            .select('created_at, type, quantity')
            .gte('created_at', sevenDaysAgo.toISOString());
        
        if (recentMovesError) throw recentMovesError;

        const dailyMoves = new Map<string, { in: number; out: number }>();

        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const formattedDate = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
            dailyMoves.set(formattedDate, { in: 0, out: 0 });
        }

        recentMoves.forEach(move => {
            const date = new Date(move.created_at!).toLocaleDateString('en-CA');
            if (dailyMoves.has(date)) {
                const dayData = dailyMoves.get(date)!;
                if (move.type === 'in') {
                    dayData.in += move.quantity;
                } else {
                    dayData.out += move.quantity;
                }
            }
        });

        const chartData = Array.from(dailyMoves.entries())
            .map(([date, data]) => ({
                date: new Date(date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
                in: data.in,
                out: data.out,
            }))
            .reverse();
        
        setStockMoves(chartData);


      } catch (error: any) {
        toast.error('Gagal memuat data dasbor', {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Ringkasan inventaris dan pergerakan stok Anda.</p>
            </div>
            <Button asChild>
                <Link href="/inventory">
                    Kelola Inventaris
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jenis Barang</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats?.total_items}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jumlah Stok</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{stats?.total_stock}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Hampir Habis</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats?.low_stock_count}</div>}
            </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Habis</CardTitle>
            <PackageX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats?.out_of_stock_count}</div>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-muted-foreground"/>
                Pergerakan Stok (7 Hari Terakhir)
            </CardTitle>
            <CardDescription>
                Bagan ini menunjukkan total barang masuk dan keluar setiap hari.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             {loading ? <Skeleton className="h-[250px] w-full" /> : <StockMovementChart data={stockMoves} />}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
           <CardHeader>
            <CardTitle>Barang Stok Rendah</CardTitle>
            <CardDescription>
                Barang-barang ini perlu segera dipesan ulang.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ): (
                <LowStockTable items={lowStockItems} />
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
