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
  condition: z.enum(['Layak Pakai', 'Tidak Layak Pakai']),
});

type StockInFormProps = {
  items: InventoryItem[];
  onStockAdded: () => void;
  loading: boolean;
};

export function StockInForm({ items, onStockAdded, loading }: StockInFormProps) {
  const { playSound } = useAudio();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      condition: 'Layak Pakai',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { error } = await supabase.from('stock_moves').insert({
        item_id: values.item_id,
        quantity: values.quantity,
        type: 'in',
        condition: values.condition,
      });

      if (error) throw error;
      
      const selectedItem = items.find(item => item.id === values.item_id);
      toast.success('Stok Ditambahkan', {
        description: `Berhasil menambahkan ${values.quantity} unit "${selectedItem?.name}" ke stok.`,
      });
      playSound('success');
      form.reset({
        item_id: undefined,
        quantity: 1,
        condition: 'Layak Pakai',
      });
      onStockAdded();
    } catch (error: any) {
      toast.error('Gagal Menambahkan Stok', {
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
                <Skeleton className="h-4 w-48 mt-1" />
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
                 <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
    )
  }

  return (
    <Card className="hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-card/90 backdrop-blur-sm">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                <CardTitle>Barang Masuk</CardTitle>
                <CardDescription>Catat barang baru yang masuk ke inventaris.</CardDescription>
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
                    name="condition"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Kondisi</FormLabel>
                         <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger className="shadow-inner bg-background/50">
                            <SelectValue placeholder="Pilih kondisi" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Layak Pakai">Layak Pakai</SelectItem>
                            <SelectItem value="Tidak Layak Pakai">Tidak Layak Pakai</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Tambah Stok
                    </Button>
                </CardFooter>
            </form>
      </Form>
    </Card>
  );
}
