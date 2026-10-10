'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Check,
  Phone,
  MessageSquare,
  Ban,
  PackageX,
  MapPinOff,
  UserX,
  CreditCard,
  CopyX,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { Order } from '@/types';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

interface CancelOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (reason: string, notifyWhatsApp: boolean) => Promise<void>;
}

const PREDEFINED_REASONS = [
  {
    id: 'customer_request',
    label: 'Customer requested cancellation',
    description: 'Requested via Phone call or WhatsApp message',
    icon: MessageSquare,
  },
  {
    id: 'stock_issue',
    label: 'Out of stock / Stock damaged',
    description: 'Inventory shortfall in Sivakasi depot',
    icon: PackageX,
  },
  {
    id: 'address_issue',
    label: 'Address not serviceable',
    description: 'Carrier cannot deliver to customer pincode',
    icon: MapPinOff,
  },
  {
    id: 'unreachable',
    label: 'Customer unreachable / Invalid mobile',
    description: 'No response after multiple contact attempts',
    icon: UserX,
  },
  {
    id: 'payment_issue',
    label: 'Payment verification failed',
    description: 'Unable to verify payment or customer payment declined',
    icon: CreditCard,
  },
  {
    id: 'duplicate_test',
    label: 'Duplicate or test order',
    description: 'Customer created duplicate order by mistake',
    icon: CopyX,
  },
  {
    id: 'other',
    label: 'Other specific reason',
    description: 'Provide custom cancellation notes below',
    icon: HelpCircle,
  },
];

export function CancelOrderModal({
  order,
  isOpen,
  onClose,
  onConfirmCancel,
}: CancelOrderModalProps) {
  const [selectedReasonId, setSelectedReasonId] = useState<string>('customer_request');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [notifyWhatsApp, setNotifyWhatsApp] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const selectedObj = PREDEFINED_REASONS.find((r) => r.id === selectedReasonId);
      const baseReason = selectedObj ? selectedObj.label : 'Order cancelled by Admin';
      const finalReason = customNotes.trim()
        ? `${baseReason} - Note: ${customNotes.trim()}`
        : baseReason;

      await onConfirmCancel(finalReason, notifyWhatsApp);
      onClose();
    } catch (err) {
      console.error('Cancellation failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-red-100 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 bg-red-50/70 border-b border-red-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200 shadow-2xs">
              <Ban className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-slate-950 text-base">Cancel Order</h3>
                <span className="font-mono text-xs font-black bg-red-100 text-red-800 px-2 py-0.5 rounded-md border border-red-200">
                  {order.order_number}
                </span>
              </div>
              <p className="text-xs text-red-900/80 font-medium truncate mt-0.5">
                Customer: <strong className="font-bold">{order.customer_name}</strong> • Total: <strong className="font-mono">₹{order.grand_total.toLocaleString('en-IN')}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Reason Selection */}
          <div>
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-2">
              Select Reason for Cancellation
            </label>
            <div className="space-y-1.5">
              {PREDEFINED_REASONS.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedReasonId === r.id;

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReasonId(r.id)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-red-50/80 border-red-300 ring-2 ring-red-400/30 text-slate-950'
                        : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-red-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className={`block truncate ${isSelected ? 'font-black text-red-950' : 'font-bold'}`}>
                          {r.label}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate font-medium">
                          {r.description}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Notes Textarea */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block">
              Additional Notes / Customer Request Remarks
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Customer called saying they want to re-order next week, or warehouse ran out of Flower Pots Special..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </div>

          {/* WhatsApp Notification Toggle */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                <WhatsAppIcon className="w-4 h-4 fill-white" />
              </div>
              <div className="min-w-0">
                <span className="font-black text-emerald-950 block truncate">
                  Notify customer via WhatsApp
                </span>
                <span className="text-[10px] text-emerald-800 font-medium block truncate">
                  Opens pre-filled cancellation message for {order.customer_mobile}
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={notifyWhatsApp}
                onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#25D366]" />
            </label>
          </div>

          {/* Warning Message */}
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px] font-bold flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              This will mark the order as <strong>CANCELLED</strong> in the live database, update your ledger, and record an audit log entry.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Keep Order Active
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs shadow-md shadow-red-600/20 transition-all active:scale-98 cursor-pointer flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cancelling Order...</span>
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 stroke-[2.5]" />
                  <span>Confirm Order Cancellation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
