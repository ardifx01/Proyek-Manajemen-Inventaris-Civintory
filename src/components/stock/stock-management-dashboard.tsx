'use client';

import { useState, useEffect, useCallback } from 'react';
import { InventoryItem, StockMove } from '@/lib/types';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { StockInForm } from './stock-in-form';
import { StockOutForm } from './stock-out-form';
import { RecentTransactions } from './recent-transactions';

function isPalindrome(str: string): boolean {
  if (!str) return false;
  const cleanStr = str.toLowerCase().replace(/[\W_]/g, '');
  const reversedStr = cleanStr.split('').reverse().join('');
  return cleanStr === reversedStr;
}

export function StockManagementDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<StockMove[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select(`
          id,
          name,
          code
        `)
        .order('name', { ascending: true });

      if (itemsError) throw itemsError;

       const { data: moves, error: movesError } = await supabase
        .from('stock_moves')
        .select(`
          id,
          created_at,
          quantity,
          type,
          condition,
          reason,
          items ( name, code )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (movesError) throw movesError;

      const mappedItems: InventoryItem[] = items.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        quantity: 0, 
        lastUpdated: '', 
        category: '', 
        unit: '', 
        reorder_point: 0,
        category_id: null,
        unit_id: null,
        is_palindrome: isPalindrome(item.name)
      }));
      setInventory(mappedItems);

      const mappedMoves: StockMove[] = moves.map(move => ({
        id: move.id,
        item: move.items ? `${move.items.code} - ${move.items.name}` : 'Barang Tidak Dikenal',
        type: move.type as 'in' | 'out',
        quantity: move.quantity,
        timestamp: move.created_at!,
        condition: move.condition,
        reason: move.reason,
      }));
      setTransactions(mappedMoves);

    } catch (error: any) {
      toast.error('Gagal mengambil data', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleTransactionSuccess = () => {
    fetchData(); 
  }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Manajemen Stok</h1>
        <p className="text-muted-foreground mt-1">Catat pergerakan stok masuk dan keluar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockInForm items={inventory} onStockAdded={handleTransactionSuccess} loading={loading} />
        <StockOutForm items={inventory} onStockRemoved={handleTransactionSuccess} loading={loading} />
      </div>

      <RecentTransactions transactions={transactions} loading={loading} />
    </div>
  );
}
