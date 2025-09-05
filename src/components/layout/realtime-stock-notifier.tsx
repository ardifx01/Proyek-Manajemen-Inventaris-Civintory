'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { useAudio } from '@/hooks/use-audio';

export function RealtimeStockNotifier() {
  const { playSound } = useAudio();

  useEffect(() => {
    const channel = supabase
      .channel('stock-moves-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stock_moves' },
        async (payload) => {
          const newMove = payload.new as { item_id: string };
          if (!newMove.item_id) return;

          const itemId = newMove.item_id;

          // 1. Fetch item details (name, reorder_point)
          const { data: itemData, error: itemError } = await supabase
            .from('items')
            .select('name, reorder_point')
            .eq('id', itemId)
            .single();

          if (itemError || !itemData || itemData.reorder_point === null) {
            // No reorder point set, so no need to notify
            return;
          }

          // 2. Calculate current stock for the item
          const { data: moves, error: movesError } = await supabase
            .from('stock_moves')
            .select('quantity, type')
            .eq('item_id', itemId);

          if (movesError) {
            console.error("Error fetching stock moves:", movesError);
            return;
          }
          
          const currentStock = moves.reduce((acc, move) => {
             const moveQty = move.type === 'in' ? move.quantity : -move.quantity;
             return acc + moveQty;
          }, 0);

          // 3. Compare and show toast if stock is low
          if (currentStock <= itemData.reorder_point) {
            playSound('notification');
            toast.warning('Stok Menipis', {
                description: `Stok untuk ${itemData.name} telah mencapai level rendah (${currentStock} unit). Segera lakukan pemesanan ulang.`,
                icon: <AlertTriangle className="h-5 w-5" />,
                duration: 10000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playSound]);

  return null; // This component does not render anything
}
