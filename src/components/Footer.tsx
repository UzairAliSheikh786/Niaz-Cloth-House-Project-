import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  MessageCircle, 
  Mail, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { WOMEN_EMBROIDERY_BRANDS, WOMEN_PRINTED_BRANDS, MENS_FABRICS } from '../types';

export const Footer: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#111111] text-white pt-16 pb-10 border-t border-neutral-800 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Newsletter & VIP Fabric Alerts Strip (Limelight fast-fashion signature) */}
        <div className="border-b border-neutral-800 pb-12 mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="font-sans font-black text-xl tracking-[0.16em] uppercase text-white mb-1">
              BE THE FIRST TO KNOW
            </h3>
            <p className="text-xs text-neutral-400 font-normal">
              Subscribe for new lawn drops, festive embroidered releases, and VIP sale previews.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md">
            <div className="flex items-center border border-neutral-700 bg-neutral-900 focus-within:border-white">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
              <button
                type="submit"
                className="py-3 px-6 bg-white hover:bg-neutral-200 text-black text-xs font-bold tracking-widest uppercase transition-colors shrink-0"
              >
                {subscribed ? 'Subscribed!' : 'Join'}
              </button>
            </div>
            {subscribed && (
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Thank you for subscribing to Niaz Cloth House alerts!</span>
              </p>
            )}
          </form>
        </div>

        {/* 2. Four Main Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-14 border-b border-neutral-800 text-xs">
          {/* Col 1: About Niaz Cloth House */}
          <div className="col-span-2 lg:col-span-2 space-y-4 pr-6">
            <h4 className="font-sans font-black text-sm tracking-[0.2em] uppercase text-white">
              NIAZ CLOTH HOUSE
            </h4>
            <p className="text-neutral-400 leading-relaxed font-normal">
              Established in 1970 by <strong>Haji Sh. Niaz Ahmed</strong> in Paris Bazaar, Rawalpindi. We curate authentic unstitched designer lawn, embroidered 3-piece festive suits, and men’s signature fabrics (Wash & Wear, Cotton, Khaddar, Lelan & Pure Boski).
            </p>
            <div className="pt-2 space-y-2 text-neutral-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>Shop # 166-C / # 170 Paris Bazaar, Committee Chowk, Rawalpindi</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a 
                  href="https://wa.me/923346565636" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp: 0334-6565636
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white shrink-0" />
                <span>Mon – Sun: 10:00 AM – 9:00 PM PKT</span>
              </div>
            </div>
          </div>

          {/* Col 2: Women's Embroidered */}
          <div className="space-y-3">
            <h5 className="font-bold tracking-widest uppercase text-white font-sans text-xs">
              Embroidered Brands
            </h5>
            <ul className="space-y-2 text-neutral-400">
              {WOMEN_EMBROIDERY_BRANDS.slice(0, 8).map((b) => (
                <li key={b}>
                  <button
                    onClick={() => navigateTo('shop', { gender: 'Women', craftType: 'Embroidery', brand: b })}
                    className="hover:text-white transition-colors text-left"
                  >
                    {b}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Women', craftType: 'Embroidery' })}
                  className="text-white font-semibold hover:underline"
                >
                  View All Embroidered →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Printed & Men's */}
          <div className="space-y-3">
            <h5 className="font-bold tracking-widest uppercase text-white font-sans text-xs">
              Men's Fabrics
            </h5>
            <ul className="space-y-2 text-neutral-400">
              {MENS_FABRICS.map((f) => (
                <li key={f}>
                  <button
                    onClick={() => navigateTo('shop', { gender: 'Men', fabric: f })}
                    className="hover:text-white transition-colors text-left"
                  >
                    {f} Suiting
                  </button>
                </li>
              ))}
              <li className="pt-2 border-t border-neutral-800">
                <button
                  onClick={() => navigateTo('shop', { gender: 'Women', craftType: 'Printed' })}
                  className="text-white font-semibold hover:underline"
                >
                  Printed Collection (Bin Saeed, Five Star) →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Customer Care & Information */}
          <div className="space-y-3">
            <h5 className="font-bold tracking-widest uppercase text-white font-sans text-xs">
              Customer Care
            </h5>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <button onClick={() => navigateTo('location')} className="hover:text-white transition-colors text-left">
                  Paris Bazaar Store Location
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('terms')} className="hover:text-white transition-colors text-left">
                  Shipping & Nationwide COD
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('refund')} className="hover:text-white transition-colors text-left">
                  7-Day Return & Exchange
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('privacy')} className="hover:text-white transition-colors text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('admin')} className="hover:text-white transition-colors text-left">
                  Merchant Admin Portal
                </button>
              </li>
              <li className="pt-2">
                <a
                  href="https://wa.me/923346565636?text=Hello%20Niaz%20Cloth%20House!%20I%20have%20an%20inquiry%20regarding%20an%20order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Direct WhatsApp Help</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Bottom Bar: Copyright & Payment Icons */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Niaz Cloth House (NCH). All Rights Reserved. Paris Bazaar, Rawalpindi.</p>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
            <span>Cash on Delivery</span>
            <span>·</span>
            <span>Direct Bank Transfer</span>
            <span>·</span>
            <span>JazzCash / EasyPaisa</span>
            <span>·</span>
            <span>WhatsApp Order</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
