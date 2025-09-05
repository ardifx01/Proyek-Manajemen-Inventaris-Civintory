'use client';

import { useState, useMemo } from 'react';
import { InventoryItem } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StockLevelIndicator } from './stock-level-indicator';
import { Badge } from '@/components/ui/badge';
import { ItemActions } from './item-actions';
import { EditItemForm } from './edit-item-form';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

type SortableColumn = keyof InventoryItem;

export function InventoryTable({ items, onDelete, onUpdate, isLoading }: { items: InventoryItem[], onDelete: (id: string) => void; onUpdate: (item: InventoryItem) => void; isLoading: boolean; }) {
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortableColumn; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending'});

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: SortableColumn) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (columnKey: SortableColumn) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  }


  return (
    <>
      <Card className="bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Daftar Barang</CardTitle>
          <CardDescription>Daftar semua barang di inventaris Anda. Klik header untuk mengurutkan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md shadow-inner bg-background/30">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">
                     <Button variant="ghost" onClick={() => requestSort('name')}>
                      Barang
                      <span className="ml-2">{getSortIcon('name')}</span>
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('code')}>
                      Kode
                      <span className="ml-2">{getSortIcon('code')}</span>
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('is_palindrome')}>
                      Palindrom
                      <span className="ml-2">{getSortIcon('is_palindrome')}</span>
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('category')}>
                      Kategori
                      <span className="ml-2">{getSortIcon('category')}</span>
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('quantity')}>
                      Stok
                      <span className="ml-2">{getSortIcon('quantity')}</span>
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('unit')}>
                      Unit
                      <span className="ml-2">{getSortIcon('unit')}</span>
                    </Button>
                  </TableHead>
                  <TableHead className="w-[50px]"><span className="sr-only">Aksi</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                    ))
                ) : sortedItems.length > 0 ? (
                  sortedItems.map((item) => (
                    <TableRow key={item.id} className="transition-shadow hover:shadow-lg">
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{item.code}</TableCell>
                       <TableCell>
                        {item.is_palindrome ? (
                          <Badge variant="secondary" className="border-green-600/50 text-green-600 shadow-sm">Ya</Badge>
                        ) : (
                          <Badge variant="outline" className="shadow-sm">Tidak</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                          <Badge variant="outline" className="shadow-sm">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <StockLevelIndicator quantity={item.quantity} reorderPoint={item.reorder_point} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                      <TableCell>
                        <ItemActions item={item} onDelete={onDelete} onEdit={() => setEditingItem(item)} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Tidak ada barang yang cocok dengan kriteria Anda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {editingItem && (
        <EditItemForm
          item={editingItem}
          onUpdate={(updatedItem) => {
            onUpdate(updatedItem);
            setEditingItem(null);
          }}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setEditingItem(null);
            }
          }}
        />
      )}
    </>
  );
}
