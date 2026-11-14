import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { OrderTracker } from '../components/OrderTracker';
import { useNavigation } from '../context/NavigationContext';

export const OrderTrackingPage: React.FC = () => {
  const { navigateTo, filterParams } = useNavigation();

  return (
    <div className="w-full bg-[#060608] text-[#F7F4EE] py-10 sm:py-16 min-h-[70vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigateTo('shop')}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#E8D5A7] hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Collections</span>
          </button>
        </div>

        <OrderTracker initialOrderId={filterParams.orderId || ''} />
      </div>
    </div>
  );
};
