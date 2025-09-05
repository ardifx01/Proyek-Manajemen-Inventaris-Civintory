'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { InventoryItem } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '../ui/skeleton';
import { useAudio } from '@/hooks/use-audio';

const formSchema = z.object({
  item_id: z.string().uuid({ message: "Silakan pilih barang." }),
  quantity: z.coerce.number().int().positive({ message: "Jumlah harus berupa angka positif." }),
  reason: z.enum(['Pemakaian Normal', 'Rusak', 'Hilang', 'Lainnya']),
});

type StockOutFormProps = {
  items: InventoryItem[];
  onStockRemoved: () => void;
  loading: boolean;
};

export function StockOutForm({ items, onStockRemoved, loading }: StockOutFormProps) {
  const { playSound } = useAudio();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      reason: 'Pemakaian Normal',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { error } = await supabase.from('stock_moves').insert({
        item_id: values.item_id,
        quantity: values.quantity,
        type: 'out',
        reason: values.reason,
      });

      if (error) throw error;
      
      const selectedItem = items.find(item => item.id === values.item_id);
      toast.success('Stok Dikeluarkan', {
        description: `Berhasil mengeluarkan ${values.quantity} unit "${selectedItem?.name}" dari stok.`,
      });
      playSound('success');
      form.reset({
        item_id: undefined,
        quantity: 1,
        reason: 'Pemakaian Normal'
      });
      onStockRemoved();
    } catch (error: any) {
      toast.error('Gagal Mengeluarkan Stok', {
        description: error.message,
      });
      playSound('error');
    }
  }
  
  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-4 w-52 mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-36" />
            </CardFooter>
        </Card>
    )
  }

  return (
    <Card className="hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-card/90 backdrop-blur-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Barang Keluar</CardTitle>
            <CardDescription>Catat barang yang dikeluarkan dari inventaris.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="item_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Barang</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="shadow-inner bg-background/50">
                        <SelectValue placeholder="Pilih barang..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>{item.code} - {item.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="shadow-inner bg-background/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan Keluar</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="shadow-inner bg-background/50">
                        <SelectValue placeholder="Pilih alasan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pemakaian Normal">Pemakaian Normal</SelectItem>
                      <SelectItem value="Rusak">Rusak</SelectItem>
                      <SelectItem value="Hilang">Hilang</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" variant="destructive" className="w-full" disabled={form.formState.isSubmitting}>
               {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Keluarkan Barang
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
