'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function StockLevelIndicator({ quantity, reorderPoint = 0 }: { quantity: number, reorderPoint?: number | null }) {
  const getStatus = () => {
    if (quantity <= 0) {
      return { level: 'Habis', className: 'text-destructive', bgClassName: 'bg-destructive' };
    }
    if (reorderPoint && quantity <= reorderPoint) {
      return { level: 'Rendah', className: 'text-destructive', bgClassName: 'bg-destructive' };
    }
    return { level: 'Tersedia', className: 'text-chart-2', bgClassName: 'bg-chart-2' };
  };

  const { level, className, bgClassName } = getStatus();

  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-default">
                    <span className={cn("relative flex h-3 w-3 rounded-full", bgClassName)}>
                        {(level === 'Rendah' || level === 'Habis') && <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", bgClassName)}></span>}
                    </span>
                    <span className="font-medium">{quantity}</span>
                    <span className={cn("text-sm hidden sm:inline-block", className)}>({level})</span>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>Tingkat stok: {quantity} unit</p>
                <p>Titik pemesanan ulang: {reorderPoint ?? 'Belum diatur'}</p>
                {level === 'Rendah' && <p>Pertimbangkan untuk memesan ulang segera.</p>}
                {level === 'Habis' && <p>Barang habis. Segera pesan ulang.</p>}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
}
