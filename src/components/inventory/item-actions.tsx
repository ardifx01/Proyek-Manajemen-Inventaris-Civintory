'use client';

import { useState } from 'react';
import { MoreHorizontal, Trash2, Edit, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { InventoryItem } from '@/lib/types';
import { useAudio } from '@/hooks/use-audio';

interface ItemActionsProps {
  item: InventoryItem;
  onDelete: (id: string) => void;
  onEdit: () => void;
}

export function ItemActions({ item, onDelete, onEdit }: ItemActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const { playSound } = useAudio();

  const handleDelete = async () => {
    setIsDeleteLoading(true);
    try {
      // First, delete all related stock moves for this item
      const { error: movesError } = await supabase
        .from('stock_moves')
        .delete()
        .eq('item_id', item.id);

      if (movesError) {
        throw movesError;
      }

      // Then, delete the item itself
      const { error: itemError } = await supabase.from('items').delete().eq('id', item.id);

      if (itemError) {
        throw itemError;
      }

      toast.success('Barang Dihapus', {
        description: `"${item.name}" dan semua data terkaitnya telah berhasil dihapus.`,
      });
      playSound('success');
      onDelete(item.id);

    } catch (error: any) {
      toast.error('Gagal menghapus barang', {
        description: error.message || 'Terjadi galat tak terduga.',
      });
      playSound('error');
    } finally {
      setIsDeleteLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => console.log('View', item.id)}>
            <Eye className="mr-2 h-4 w-4" />
            Lihat Detail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus item secara permanen
              <span className="font-semibold"> "{item.name}" </span>
              dan semua data terkaitnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleteLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleteLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleteLoading ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
