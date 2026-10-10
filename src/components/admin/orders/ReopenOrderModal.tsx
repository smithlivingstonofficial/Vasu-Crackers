'use client';

import React, { useState } from 'react';
import { RotateCcw, X, Check, Loader2, Sparkles } from 'lucide-react';
import { Order, OrderStatus } from '@/types';

interface ReopenOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReopen: (newStatus: OrderStatus, reason?: string) => Promise<void>;
}

export function ReopenOrderModal({
  order,
  isOpen,
  onClose,
  onConfirmReopen,
}: ReopenOrderModalProps) {
  const [targetStatus, setTargetStatus] = useState<OrderStatus>('CONFIRMED');
  const [reopenNote, setReopenNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onConfirmReopen(targetStatus, reopenNote);
      onClose();
    } catch (err) {
      console.error('Reopen order failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-emerald-100 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-950 text-base">Reopen Order</h3>
              <span className="text-xs text-slate-500 font-mono">
                Order #{order.order_number}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block">
              Restore Order To Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetStatus('CONFIRMED')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  targetStatus === 'CONFIRMED'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                CONFIRMED (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setTargetStatus('PENDING')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  targetStatus === 'PENDING'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-black'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                PENDING
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block">
              Reopening Reason / Note (Optional)
            </label>
            <input
              type="text"
              value={reopenNote}
              onChange={(e) => setReopenNote(e.target.value)}
              placeholder="e.g. Customer reconfirmed delivery address"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            Reopening this order will reactivate it in your warehouse packing queue and allow full status progression.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Restoring...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirm Reopen Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
