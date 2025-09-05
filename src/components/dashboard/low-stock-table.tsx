'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '../ui/badge';
import { CardDescription } from '../ui/card';
import Link from 'next/link';
import { Button } from '../ui/button';

type LowStockItem = {
    id: string;
    name: string;
    code: string;
    quantity: number;
    reorder_point: number | null;
    unit: string;
}

export function LowStockTable({ items }: { items: LowStockItem[] }) {
    if (!items || items.length === 0) {
        return (
            <div className="flex h-[150px] w-full items-center justify-center rounded-md border border-dashed">
                <CardDescription>Tidak ada barang dengan stok rendah.</CardDescription>
            </div>
        )
    }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Barang</TableHead>
            <TableHead className="text-right">Stok Saat Ini</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{item.code}</div>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="destructive">{item.quantity} {item.unit}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
       <div className="p-4 border-t">
          <Button size="sm" className="w-full" asChild>
            <Link href="/stock">Lakukan Pencatatan Stok</Link>
          </Button>
       </div>
    </div>
  );
}
