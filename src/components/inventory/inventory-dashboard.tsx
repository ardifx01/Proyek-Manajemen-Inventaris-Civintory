'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { InventoryItem } from '@/lib/types';
import { AddItemForm } from './add-item-form';
import { InventoryTable } from './inventory-table';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Upload, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { ImportCsvDialog } from './import-csv-dialog';
import Papa from 'papaparse';
import { useAudio } from '@/hooks/use-audio';

type Category = { id: string; name: string };
type StockStatus = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

function isPalindrome(str: string): boolean {
  if (!str) return false;
  const cleanStr = str.toLowerCase().replace(/[\W_]/g, '');
  const reversedStr = cleanStr.split('').reverse().join('');
  return cleanStr === reversedStr;
}

export function InventoryDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const { playSound } = useAudio();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatus, setStockStatus] = useState<StockStatus>('all');
  const [isImporting, setIsImporting] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select(`
        id,
        name,
        code,
        created_at,
        reorder_point,
        category_id,
        unit_id,
        categories ( name ),
        units ( name, symbol )
      `);

    if (itemsError) {
      toast.error('Gagal mengambil inventaris', {
        description: itemsError.message,
      });
      setInventory([]);
    } else {
       const { data: moves, error: movesError } = await supabase
        .from('stock_moves')
        .select('item_id, quantity, type');

      if (movesError) {
        toast.error('Gagal mengambil data stok', {
          description: movesError.message,
        });
      }

      const stockQuantities = new Map<string, number>();
      if (moves) {
        moves.forEach(move => {
          if (!move.item_id) return;
          const currentQty = stockQuantities.get(move.item_id) || 0;
          const moveQty = move.type === 'in' ? move.quantity : -move.quantity;
          stockQuantities.set(move.item_id, currentQty + moveQty);
        });
      }

      const inventoryItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        quantity: stockQuantities.get(item.id) || 0,
        lastUpdated: item.created_at,
        category: item.categories?.name ?? 'N/A',
        unit: item.units?.name ?? 'N/A',
        reorder_point: item.reorder_point,
        category_id: item.category_id,
        unit_id: item.unit_id,
        is_palindrome: isPalindrome(item.name),
      }));
      setInventory(inventoryItems);
    }
  }, []);
  
  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from('categories').select('id, name');
    if (error) {
       toast.error("Gagal mengambil kategori", { description: error.message });
    } else {
      setCategories(data);
    }
  }, []);


  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([fetchInventory(), fetchCategories()]);
      setLoading(false);
    }
    loadData();
  }, [fetchInventory, fetchCategories]);


  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      // Search filter
      const matchesSearch = searchTerm.length > 2 ? 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) : true;

      // Category filter
      const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;

      // Stock status filter
      const matchesStockStatus = () => {
        switch (stockStatus) {
          case 'in_stock':
            return item.quantity > (item.reorder_point ?? 0);
          case 'low_stock':
            return item.quantity <= (item.reorder_point ?? 0) && item.quantity > 0;
          case 'out_of_stock':
            return item.quantity <= 0;
          case 'all':
          default:
            return true;
        }
      };

      return matchesSearch && matchesCategory && matchesStockStatus();
    });
  }, [inventory, searchTerm, selectedCategory, stockStatus]);

  const handleAddItem = (newItem: InventoryItem) => {
    setInventory(prev => [newItem, ...prev]);
  };
  
  const handleDeleteItem = (itemId: string) => {
    setInventory(prev => prev.filter(item => item.id !== itemId));
  };
  
  const handleUpdateItem = (updatedItem: InventoryItem) => {
     setInventory(prev => {
      const existingItem = prev.find(item => item.id === updatedItem.id);
      const quantity = existingItem ? existingItem.quantity : 0;
      return prev.map(item => item.id === updatedItem.id ? { ...updatedItem, quantity } : item);
    });
  };

  const handleExport = () => {
    const dataToExport = filteredItems.map(item => ({
      'Kode': item.code,
      'Nama': item.name,
      'Kategori': item.category,
      'Jumlah': item.quantity,
      'Unit': item.unit,
      'Titik Pemesanan Ulang': item.reorder_point,
    }));
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventaris.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSound('success');
  }

  const handleImportSuccess = () => {
    fetchInventory(); // Refresh the inventory list
  }


  if (loading && inventory.length === 0) {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-9 w-72 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-28" />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-40 mb-2" />
                    <Skeleton className="h-5 w-80" />
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                    <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                    <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                                    <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                                    <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                                    <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                                    <TableHead className="text-right"><Skeleton className="h-5 w-24" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-5 w-24" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Inventaris</h1>
          <p className="text-muted-foreground mt-1">Kelola barang dan lacak tingkat stok Anda.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            <ImportCsvDialog onImportSuccess={handleImportSuccess} />
            <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Ekspor CSV
            </Button>
            <AddItemForm onAddItem={handleAddItem} />
        </div>
      </div>
      
       <Card className="bg-card/90 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2 relative">
               <label htmlFor="search-item" className="text-sm font-medium sr-only">Cari</label>
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input
                    id="search-item"
                    placeholder="Cari berdasarkan nama atau kode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 shadow-inner bg-background/50"
                />
            </div>
            <div className="space-y-2">
              <label htmlFor="category-filter" className="text-sm font-medium">Kategori</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category-filter" className="shadow-inner bg-background/50">
                  <SelectValue placeholder="Filter berdasarkan kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="stock-filter" className="text-sm font-medium">Status Stok</label>
               <Select value={stockStatus} onValueChange={(v) => setStockStatus(v as StockStatus)}>
                <SelectTrigger id="stock-filter" className="shadow-inner bg-background/50">
                  <SelectValue placeholder="Filter berdasarkan status stok" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="in_stock">Stok Tersedia</SelectItem>
                  <SelectItem value="low_stock">Stok Rendah</SelectItem>
                  <SelectItem value="out_of_stock">Stok Habis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <InventoryTable items={filteredItems} onDelete={handleDeleteItem} onUpdate={handleUpdateItem} isLoading={loading} />
    </div>
  );
}
