import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  PackageCheck,
  Scissors,
  Truck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageCircle,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useShop, formatPKR } from '../context/ShopContext';
import { Order, OrderStatus } from '../types';

interface TrackedItemSummary {
  title: string;
  fabric?: string;
  quantity: number;
  selectedColor?: string;
}

interface TrackedOrderResult {
  id: string;
  date: string;
  status: OrderStatus;
  subtotal?: number;
  shipping?: number;
  total: number;
  itemsCount: number;
  items: TrackedItemSummary[];
  city: string;
  paymentMethod: string;
  source: 'local' | 'server' | 'cloud';
}

interface OrderTrackerProps {
  initialOrderId?: string;
  compact?: boolean;
}

const ORDER_STAGES: {
  key: OrderStatus;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: 'Pending',
    label: 'Order Received',
    description: 'Order logged and queued for verification.',
    icon: Clock,
  },
  {
    key: 'Processing',
    label: 'Fabric Cut & Check',
    description: 'Unstitched meters measured and inspected.',
    icon: Scissors,
  },
  {
    key: 'Shipped',
    label: 'Courier Dispatched',
    description: 'Handed to courier for tracked delivery.',
    icon: Truck,
  },
  {
    key: 'Delivered',
    label: 'Delivered',
    description: 'Parcel delivered to patron address.',
    icon: PackageCheck,
  },
];

const STAGE_INDEX: Record<OrderStatus, number> = {
  Pending: 0,
  Processing: 1,
  Shipped: 2,
  Delivered: 3,
};

function mapLocalOrderToTracked(order: Order, source: 'local' | 'cloud' = 'local'): TrackedOrderResult {
  return {
    id: order.id,
    date: order.date,
    status: order.status || 'Pending',
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    itemsCount: order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0,
    items: (order.items || []).map((item) => ({
      title: item.product?.title || 'Unstitched Fabric Ensemble',
      fabric: item.product?.fabric,
      quantity: item.quantity || 1,
      selectedColor: item.selectedColor,
    })),
    city: order.customer?.city || 'Pakistan',
    paymentMethod: order.paymentMethod || 'Cash on Delivery',
    source,
  };
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  initialOrderId = '',
  compact = false,
}) => {
  const { orders } = useShop();
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [isSearching, setIsSearching] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrderResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const performLookup = useCallback(
    async (rawId: string) => {
      const normalizedId = rawId.trim().replace(/^#/, '').toUpperCase();
      if (!normalizedId) {
        setErrorMessage('Please enter an Order ID (for example: NCH-1977-1042).');
        setTrackedOrder(null);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setErrorMessage(null);
      setHasSearched(true);

      try {
        // 1. Check current session / local orders first
        const localMatch = orders.find((o) => o.id.toUpperCase() === normalizedId);
        if (localMatch) {
          setTrackedOrder(mapLocalOrderToTracked(localMatch, 'local'));
          return;
        }

        // 2. Query server tracking endpoint (safe non-PII response)
        try {
          const response = await fetch(`/api/orders/track/${encodeURIComponent(normalizedId)}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.id) {
              setTrackedOrder({
                id: data.id,
                date: data.date,
                status: data.status || 'Pending',
                subtotal: data.subtotal,
                shipping: data.shipping,
                total: Number(data.total) || 0,
                itemsCount: Number(data.itemsCount) || (Array.isArray(data.items) ? data.items.length : 1),
                items: Array.isArray(data.items) ? data.items : [],
                city: data.city || 'Pakistan',
                paymentMethod: data.paymentMethod || 'Cash on Delivery',
                source: 'server',
              });
              return;
            }
          }
        } catch {
          // Continue to authenticated Firestore lookup if backend unreachable
        }

        // 3. Check Firestore if user is authenticated (matches security rules for owner/admin)
        if (auth.currentUser) {
          try {
            const snap = await getDoc(doc(db, 'orders', normalizedId));
            if (snap.exists()) {
              const cloudOrder = snap.data() as Order;
              setTrackedOrder(mapLocalOrderToTracked(cloudOrder, 'cloud'));
              return;
            }
          } catch {
            // Permission or network fallback
          }
        }

        setTrackedOrder(null);
        setErrorMessage(
          `No order was found for reference "${normalizedId}". Double-check your confirmation receipt or contact our WhatsApp desk.`
        );
      } finally {
        setIsSearching(false);
      }
    },
    [orders]
  );

  useEffect(() => {
    if (initialOrderId && initialOrderId.trim()) {
      setOrderIdInput(initialOrderId);
      performLookup(initialOrderId);
    }
  }, [initialOrderId, performLookup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(orderIdInput);
  };

  const handleQuickFill = (sampleId: string) => {
    setOrderIdInput(sampleId);
    performLookup(sampleId);
  };

  const activeStageIndex = trackedOrder ? STAGE_INDEX[trackedOrder.status] ?? 0 : -1;

  const formattedDate = trackedOrder?.date
    ? new Date(trackedOrder.date).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recently placed';

  return (
    <div
      className={`w-full bg-[#0B0B0F] border border-[#C5A059]/30 text-[#F7F4EE] ${
        compact ? 'p-5 sm:p-7' : 'p-6 sm:p-10'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1.5">
          <p className="text-xs font-medium tracking-[0.22em] uppercase text-[#D4AF37]">
            Dispatch Verification
          </p>
          <h2
            className={`font-serif font-normal text-[#F7F4EE] ${
              compact ? 'text-2xl sm:text-3xl' : 'text-2xl sm:text-4xl'
            }`}
            style={{ textWrap: 'balance' }}
          >
            Track Your Order Status
          </h2>
          <p className="text-xs sm:text-sm text-[#F7F4EE]/70 max-w-xl leading-relaxed">
            Enter your Niaz Cloth House order reference to view live preparation, dispatch, and courier progress.
          </p>
        </div>

        <a
          href="https://wa.me/923346565636?text=Hello%20Niaz%20Cloth%20House!%20I%20would%20like%20an%20update%20on%20my%20order."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#E8D5A7] hover:text-[#D4AF37] border-b border-[#C5A059]/50 hover:border-[#D4AF37] pb-1 transition-colors whitespace-nowrap shrink-0 self-start md:self-auto"
        >
          <MessageCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>WhatsApp Desk · 0334-6565636</span>
        </a>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <label htmlFor="order-tracker-input" className="sr-only">
              Order ID
            </label>
            <Search className="w-4 h-4 text-[#C5A059]/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="order-tracker-input"
              type="text"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="Enter Order ID (e.g. NCH-1977-1042 or NCH-1970-12345)"
              className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-[#060608] border border-[#C5A059]/40 focus:border-[#D4AF37] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] text-sm font-mono text-[#F7F4EE] placeholder-[#F7F4EE]/40 uppercase tracking-wider"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="min-h-[44px] px-6 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-60 text-[#060608] text-xs font-semibold uppercase tracking-[0.18em] transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking</span>
              </>
            ) : (
              <>
                <span>Track Order</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Helpful Recent / Sample References (Clean inline text links, zero pill spam) */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#F7F4EE]/60">
          {orders.length > 0 ? (
            <>
              <span>Your recent orders:</span>
              {orders.slice(0, 3).map((ord, idx) => (
                <React.Fragment key={ord.id}>
                  {idx > 0 && <span aria-hidden="true">·</span>}
                  <button
                    type="button"
                    onClick={() => handleQuickFill(ord.id)}
                    className="font-mono text-[#E8D5A7] hover:text-[#D4AF37] underline underline-offset-4 transition-colors"
                  >
                    {ord.id}
                  </button>
                </React.Fragment>
              ))}
            </>
          ) : (
            <>
              <span>Sample order references:</span>
              <button
                type="button"
                onClick={() => handleQuickFill('NCH-1977-1042')}
                className="font-mono text-[#E8D5A7] hover:text-[#D4AF37] underline underline-offset-4 transition-colors"
              >
                NCH-1977-1042
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => handleQuickFill('NCH-1977-1041')}
                className="font-mono text-[#E8D5A7] hover:text-[#D4AF37] underline underline-offset-4 transition-colors"
              >
                NCH-1977-1041
              </button>
            </>
          )}
        </div>
      </form>

      {/* Error State */}
      {errorMessage && (
        <div
          role="alert"
          className="mt-6 p-4 bg-[#140C0E] border border-red-400/40 text-xs sm:text-sm text-red-200 flex items-start gap-3"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="leading-relaxed">{errorMessage}</p>
            <a
              href={`https://wa.me/923346565636?text=${encodeURIComponent(
                `Hello Niaz Cloth House, please check status for my order ID: ${orderIdInput.trim().toUpperCase()}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D4AF37] hover:underline"
            >
              <span>Verify via WhatsApp (0334-6565636)</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Tracked Order Progress Result */}
      {trackedOrder && (
        <div className="mt-7 pt-7 border-t border-white/10 space-y-7 animate-in fade-in duration-200">
          {/* Top Order Summary Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#F7F4EE]/65">
                <span className="font-mono font-semibold text-[#D4AF37] tracking-wider">
                  #{trackedOrder.id}
                </span>
                <span aria-hidden="true">·</span>
                <span>Placed {formattedDate}</span>
                <span aria-hidden="true">·</span>
                <span>{trackedOrder.city}</span>
                <span aria-hidden="true">·</span>
                <span>{trackedOrder.paymentMethod}</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#F7F4EE]">
                Current Stage: <span className="text-[#D4AF37]">{trackedOrder.status}</span>
              </h3>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="block text-[11px] uppercase tracking-[0.18em] text-[#F7F4EE]/55">
                Order Total
              </span>
              <span className="font-mono text-lg sm:text-xl font-semibold text-[#E8D5A7] tabular-nums">
                {formatPKR(trackedOrder.total)}
              </span>
            </div>
          </div>

          {/* 4-Stage Visual Progress Stepper */}
          <div aria-label="Order progress stages" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ORDER_STAGES.map((stage, index) => {
              const Icon = stage.icon;
              const isCompleted = index < activeStageIndex;
              const isCurrent = index === activeStageIndex;
              const isReached = index <= activeStageIndex;

              return (
                <div
                  key={stage.key}
                  className={`p-4 border transition-colors ${
                    isCurrent
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                      : isCompleted
                      ? 'border-[#C5A059]/40 bg-[#111116]'
                      : 'border-white/10 bg-[#08080B] opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs tabular-nums text-[#C5A059]">
                      0{index + 1}
                    </span>
                    <div
                      className={`w-8 h-8 flex items-center justify-center border ${
                        isReached
                          ? 'border-[#D4AF37]/60 text-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-white/15 text-[#F7F4EE]/45'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-[#F7F4EE]">
                    {stage.label}
                  </p>
                  <p className="text-xs text-[#F7F4EE]/65 mt-1 leading-relaxed">
                    {stage.description}
                  </p>
                  <p
                    className={`mt-2.5 text-[11px] font-medium uppercase tracking-wider ${
                      isCurrent
                        ? 'text-[#D4AF37]'
                        : isCompleted
                        ? 'text-[#E8D5A7]/85'
                        : 'text-[#F7F4EE]/40'
                    }`}
                  >
                    {isCurrent ? 'Active Stage' : isCompleted ? 'Completed' : 'Upcoming'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Itemized Fabric Summary */}
          {trackedOrder.items.length > 0 && (
            <div className="pt-5 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#F7F4EE]/65">
                <span className="uppercase tracking-[0.16em] text-[#C5A059] font-medium">
                  Ensembles in This Order ({trackedOrder.itemsCount})
                </span>
              </div>

              <div className="divide-y divide-white/10 border-t border-b border-white/10">
                {trackedOrder.items.map((item, idx) => (
                  <div
                    key={`${item.title}-${idx}`}
                    className="py-3 flex items-center justify-between gap-4 text-xs sm:text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[#F7F4EE] truncate">{item.title}</p>
                      <p className="text-xs text-[#F7F4EE]/55 mt-0.5">
                        {[item.fabric, item.selectedColor].filter(Boolean).join(' · ') || 'Unstitched Cut'}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-[#E8D5A7] tabular-nums shrink-0">
                      Qty {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quiet Initial Helper before first lookup */}
      {!hasSearched && !trackedOrder && !errorMessage && (
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#F7F4EE]/55">
          <span>Stages tracked: Order Received · Fabric Cut & Check · Courier Dispatched · Delivered</span>
          <span>Nationwide COD & DHL Express</span>
        </div>
      )}
    </div>
  );
};
