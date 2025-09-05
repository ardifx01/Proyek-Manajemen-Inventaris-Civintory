'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { InventoryItem } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Badge } from '../ui/badge';
import { useAudio } from '@/hooks/use-audio';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama barang minimal harus 2 karakter.',
  }),
  code: z.string().min(1, {
    message: 'Kode barang wajib diisi.',
  }),
  category_id: z.string().uuid().nullable().optional(),
  unit_id: z.string().uuid().nullable().optional(),
  reorder_point: z.coerce.number().int().min(0).optional(),
});

type EditItemFormProps = {
  item: InventoryItem;
  onUpdate: (item: InventoryItem) => void;
  onOpenChange: (open: boolean) => void;
};

type Category = { id: string; name: string };
type Unit = { id: string; name: string };

const NONE_VALUE = '_none_';

function isPalindrome(str: string): boolean {
  if (!str) return false;
  const cleanStr = str.toLowerCase().replace(/[\W_]/g, '');
  const reversedStr = cleanStr.split('').reverse().join('');
  return cleanStr === reversedStr;
}

export function EditItemForm({ item, onUpdate, onOpenChange }: EditItemFormProps) {
  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const { playSound } = useAudio();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item.name,
      code: item.code,
      category_id: item.category_id,
      unit_id: item.unit_id,
      reorder_point: item.reorder_point ?? 0,
    },
  });
  
  const itemName = form.watch('name');
  const isItemNamePalindrome = useMemo(() => isPalindrome(itemName), [itemName]);

  useEffect(() => {
    async function fetchData() {
      const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('id, name');
      if (categoriesError) {
        toast.error("Gagal mengambil kategori", { description: categoriesError.message });
      } else {
        setCategories(categoriesData);
      }

      const { data: unitsData, error: unitsError } = await supabase.from('units').select('id, name');
      if (unitsError) {
        toast.error("Gagal mengambil unit", { description: unitsError.message });
      } else {
        setUnits(unitsData);
      }
    }
    fetchData();
  }, []);
  
  useEffect(() => {
      onOpenChange(open);
  },[open, onOpenChange])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .update({
          name: values.name,
          code: values.code,
          category_id: values.category_id === NONE_VALUE ? null : values.category_id,
          unit_id: values.unit_id === NONE_VALUE ? null : values.unit_id,
          reorder_point: values.reorder_point,
        })
        .eq('id', item.id)
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
        `)
        .single();
      
      if (itemError) throw new Error(itemError.message);

      const updatedItem: InventoryItem = {
        ...item, 
        id: itemData.id,
        name: itemData.name,
        code: itemData.code,
        category: itemData.categories?.name ?? 'N/A',
        unit: itemData.units?.name ?? 'N/A',
        reorder_point: itemData.reorder_point,
        category_id: itemData.category_id,
        unit_id: itemData.unit_id,
        is_palindrome: isPalindrome(itemData.name)
      };

      onUpdate(updatedItem);
      form.reset();
      setOpen(false);
      toast.success('Barang Diperbarui', {
        description: `"${updatedItem.name}" telah diperbarui.`,
      });
      playSound('success');
    } catch (error: any) {
      toast.error('Galat', {
        description: error.message || 'Gagal memperbarui barang.',
      });
      playSound('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Barang</DialogTitle>
          <DialogDescription>
            Perbarui detail untuk barang inventaris Anda.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Barang</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. Kodok" {...field} />
                  </FormControl>
                  <div className="pt-1 text-sm text-muted-foreground">
                    {isItemNamePalindrome ? (
                       <Badge variant="secondary" className="border-green-600/50 text-green-600">
                        Palindrom
                      </Badge>
                    ) : (
                      <Badge variant="outline">Bukan Palindrom</Badge>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Barang</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. SKU-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>Tanpa Kategori</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="unit_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       <SelectItem value={NONE_VALUE}>Tanpa Unit</SelectItem>
                       {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="reorder_point"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titik Pemesanan Ulang</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="cth. 10" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Memperbarui...' : 'Perbarui Barang'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
