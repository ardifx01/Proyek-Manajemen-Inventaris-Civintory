'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';
import { Loader2, Upload } from 'lucide-react';
import { useAudio } from '@/hooks/use-audio';

type CsvRow = {
  code: string;
  name: string;
  category?: string;
  unit?: string;
  reorder_point?: number;
};

type ImportCsvDialogProps = {
  onImportSuccess: () => void;
};

export function ImportCsvDialog({ onImportSuccess }: ImportCsvDialogProps) {
  const [open, setOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { playSound } = useAudio();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Tidak ada berkas yang dipilih', {
        description: 'Silakan pilih berkas CSV untuk diimpor.',
      });
      return;
    }

    setIsImporting(true);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const { data, errors } = results;

        if (errors.length > 0) {
          toast.error('Gagal mem-parsing CSV', {
            description: `Galat pada baris ${errors[0].row}: ${errors[0].message}`,
          });
          playSound('error');
          setIsImporting(false);
          return;
        }
        
        try {
            // CATATAN: Ini adalah impor yang disederhanakan. Tidak menangani kategori/unit,
            // dan akan gagal jika barang dengan kode yang sama sudah ada karena batasan UNIQUE.
            // Implementasi yang lebih kuat akan memeriksa barang yang ada dan memperbaruinya,
            // dan juga menyelesaikan nama kategori/unit ke ID masing-masing.
          const itemsToInsert = data.map(row => ({
            id: crypto.randomUUID(),
            code: row.code,
            name: row.name,
            reorder_point: row.reorder_point ? Number(row.reorder_point) : 0,
          }));
          
          const { error: insertError } = await supabase.from('items').upsert(itemsToInsert, { onConflict: 'code' });

          if (insertError) {
            throw insertError;
          }

          toast.success('Impor Berhasil', {
              description: 'Inventaris telah diperbarui dari berkas CSV.',
          });
          playSound('success');
          onImportSuccess();
          setOpen(false);
          setFile(null);
        } catch (error: any) {
          toast.error('Gagal mengimpor data', {
            description: error.message,
          });
          playSound('error');
        } finally {
          setIsImporting(false);
        }
      },
      error: (error) => {
         toast.error('Gagal mem-parsing berkas CSV', {
            description: error.message,
         });
         playSound('error');
         setIsImporting(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Impor CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Impor Barang dari CSV</DialogTitle>
          <DialogDescription>
            Unggah berkas CSV untuk menambah atau memperbarui barang di inventaris Anda. Berkas
            harus memiliki kolom 'code' dan 'name'. Kolom opsional adalah 'category', 'unit', dan 'reorder_point'.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="csv-file" className="text-right">
              Berkas CSV
            </Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleImport} disabled={isImporting || !file}>
            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isImporting ? 'Mengimpor...' : 'Impor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
