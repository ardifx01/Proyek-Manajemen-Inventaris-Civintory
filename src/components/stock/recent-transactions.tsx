'use client';

import { StockMove } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

type RecentTransactionsProps = {
  transactions: StockMove[];
  loading: boolean;
};

export function RecentTransactions({ transactions, loading }: RecentTransactionsProps) {
  return (
    <Card className="bg-card/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Riwayat Transaksi Terkini</CardTitle>
        <CardDescription>Menampilkan 10 transaksi stok terakhir.</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="border rounded-md shadow-inner bg-background/30">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[150px]">WAKTU</TableHead>
                        <TableHead>BARANG</TableHead>
                        <TableHead className="w-[100px]">JENIS</TableHead>
                        <TableHead className="w-[100px] text-right">JUMLAH</TableHead>
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
                    ) : transactions.length > 0 ? (
                        transactions.map((move) => (
                            <TableRow key={move.id} className="transition-shadow hover:shadow-md">
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {format(new Date(move.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                            </TableCell>
                            <TableCell className="font-medium">{move.item}</TableCell>
                            <TableCell>
                                <Badge variant={move.type === 'in' ? 'secondary' : 'destructive'} className={move.type === 'in' ? 'text-green-600 border-green-600/50 shadow-sm' : 'shadow-sm'}>
                                {move.type === 'in' ? 'Masuk' : 'Keluar'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">{move.quantity}</TableCell>
                            <TableCell className="text-muted-foreground">{move.condition || move.reason}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                            Belum ada transaksi.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
         </div>
      </CardContent>
    </Card>
  );
}
