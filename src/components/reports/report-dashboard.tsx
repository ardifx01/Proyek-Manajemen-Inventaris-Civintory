'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, startOfWeek, endOfWeek, startOfMonth } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Skeleton } from '../ui/skeleton';

type ReportData = {
  date: string;
  item: string;
  type: 'Masuk' | 'Keluar';
  quantity: number;
  details: string;
};

type Period = 'hari-ini' | 'minggu-ini' | 'bulan-ini';
type TransactionType = 'semua' | 'masuk' | 'keluar';

export function ReportDashboard() {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [filteredData, setFilteredData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<Period>('hari-ini');
  const [transactionType, setTransactionType] = useState<TransactionType>('semua');

  const fetchAndFilterData = useCallback(async () => {
    setLoading(true);
    
    let query = supabase
      .from('stock_moves')
      .select(`
        created_at,
        quantity,
        type,
        condition,
        reason,
        items ( name, code )
      `);

    const now = new Date();
    if (period === 'hari-ini') {
        const today_start = format(now, 'yyyy-MM-dd') + 'T00:00:00';
        const today_end = format(now, 'yyyy-MM-dd') + 'T23:59:59';
        query = query.gte('created_at', today_start).lte('created_at', today_end);
    } else if (period === 'minggu-ini') {
        const start = startOfWeek(now);
        const end = endOfWeek(now);
        query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
    } else if (period === 'bulan-ini') {
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
    }

    if (transactionType !== 'semua') {
      const typeToFilter = transactionType === 'masuk' ? 'in' : 'out';
      query = query.eq('type', typeToFilter);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      toast.error('Gagal mengambil laporan', {
        description: error.message,
      });
      setReportData([]);
      setFilteredData([]);
    } else {
      const formattedData: ReportData[] = data.map(move => ({
        date: move.created_at!,
        item: move.items ? `${move.items.code} - ${move.items.name}` : 'Barang Tidak Dikenal',
        type: move.type === 'in' ? 'Masuk' : 'Keluar',
        quantity: move.quantity,
        details: (move.condition || move.reason) ?? '-',
      }));
      setReportData(formattedData);
      setFilteredData(formattedData);
    }
    setLoading(false);
  }, [period, transactionType]);


  useEffect(() => {
    fetchAndFilterData();
  }, [fetchAndFilterData]);

  const totalMasuk = filteredData.filter(d => d.type === 'Masuk').reduce((sum, item) => sum + item.quantity, 0);
  const totalKeluar = filteredData.filter(d => d.type === 'Keluar').reduce((sum, item) => sum + item.quantity, 0);
  const totalTransaksi = filteredData.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Laporan Inventaris</h1>
      </div>

      <Card className="bg-card/90 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label htmlFor="periode" className="text-sm font-medium">Periode</label>
              <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                <SelectTrigger id="periode" className="shadow-inner bg-background/50">
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hari-ini">Hari Ini</SelectItem>
                  <SelectItem value="minggu-ini">Minggu Ini</SelectItem>
                  <SelectItem value="bulan-ini">Bulan Ini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="jenis-transaksi" className="text-sm font-medium">Jenis Transaksi</label>
              <Select value={transactionType} onValueChange={(v) => setTransactionType(v as TransactionType)}>
                <SelectTrigger id="jenis-transaksi" className="shadow-inner bg-background/50">
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua</SelectItem>
                  <SelectItem value="masuk">Barang Masuk</SelectItem>
                  <SelectItem value="keluar">Barang Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-card/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Barang Masuk</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : totalMasuk}</div>
            </CardContent>
        </Card>
         <Card className="hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-card/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Barang Keluar</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : totalKeluar}</div>
            </CardContent>
        </Card>
         <Card className="hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-card/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            </Header>
            <CardContent>
                <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : totalTransaksi}</div>
            </CardContent>
        </Card>
      </div>

      <Card className="bg-card/90 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="border rounded-md shadow-inner bg-background/30">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TANGGAL</TableHead>
                  <TableHead>BARANG</TableHead>
                  <TableHead>JENIS</TableHead>
                  <TableHead className="text-right">JUMLAH</TableHead>
                  <TableHead>KONDISI/ALASAN</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <TableRow key={index} className="transition-shadow hover:shadow-md">
                      <TableCell>{format(new Date(row.date), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell className="font-medium">{row.item}</TableCell>
                      <TableCell>
                        <Badge variant={row.type === 'Masuk' ? 'secondary' : 'destructive'} className={row.type === 'Masuk' ? 'text-green-600 border-green-600/50 shadow-sm' : 'shadow-sm'}>
                          {row.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{row.quantity}</TableCell>
                      <TableCell>{row.details}</TableCell>
                    </TableRow>
                  ))
                ) : (
                   <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Tidak ada data untuk periode yang dipilih.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
