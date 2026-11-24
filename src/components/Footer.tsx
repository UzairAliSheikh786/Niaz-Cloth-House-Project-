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
import { CurrencyConverterToggle } from './CurrencyConverterToggle';

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
    <footer className="bg-[#050507] text-[#F7F4EE] pt-16 pb-10 border-t border-[#C5A059]/25 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Newsletter & VIP Fabric Alerts Strip */}
        <div className="border-b border-white/10 pb-12 mb-12 flex flex-col md:flex-row items-center justify-between gap-8 min-w-0">
          <div className="min-w-0 w-full md:w-auto">
            <h3 className="font-serif text-xl tracking-[0.14em] uppercase text-[#D4AF37] mb-1 break-words">
              Join The Heritage Registry
            </h3>
            <p className="text-xs text-[#F7F4EE]/60 font-normal break-words">
              Subscribe for new Shahi releases, unstitched drops, and private previews.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md min-w-0">
            <div className="flex items-center border border-[#C5A059]/35 bg-[#0D0D11] focus-within:border-[#D4AF37] min-w-0">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full min-w-0 px-3.5 sm:px-4 py-3 bg-transparent text-xs text-[#F7F4EE] placeholder-[#F7F4EE]/40 focus:outline-none"
              />
              <button
                type="submit"
                className="py-3 px-4 sm:px-6 bg-[#D4AF37] hover:bg-[#E5C158] text-[#060608] text-xs font-semibold tracking-widest uppercase transition-colors shrink-0"
              >
                {subscribed ? 'Subscribed' : 'Join'}
              </button>
            </div>
            {subscribed && (
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Thank you for subscribing to Niaz Cloth House alerts!</span>
              </p>
            )}
          </form>
        </div>

        {/* 2. Four Main Navigation Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-14 border-b border-neutral-800 text-xs min-w-0">
          {/* Col 1: About Niaz Cloth House */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4 sm:pr-6 min-w-0">
            <h4 className="font-sans font-black text-sm tracking-[0.2em] uppercase text-white break-words">
              NIAZ CLOTH HOUSE
            </h4>
            <p className="text-neutral-400 leading-relaxed font-normal break-words">
              Established in 1970 by <strong>Haji Sh. Niaz Ahmed</strong> in Paris Bazaar, Rawalpindi. We curate authentic unstitched designer lawn, embroidered 3-piece festive suits, and men’s signature fabrics (Wash & Wear, Cotton, Khaddar, Lelan & Pure Boski).
            </p>
            <div className="pt-2 space-y-2 text-neutral-400 min-w-0">
              <div className="flex items-start gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span className="min-w-0 break-words">Shop # 166-C / # 170 Paris Bazaar, Committee Chowk, Rawalpindi</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a 
                  href="https://wa.me/923346565636" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors min-w-0 break-words"
                >
                  WhatsApp: 0334-6565636
                </a>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="w-4 h-4 text-white shrink-0" />
                <span className="min-w-0 break-words">Mon – Sun: 10:00 AM – 9:00 PM PKT</span>
              </div>
              <div className="pt-3 mt-3 border-t border-white/10 max-w-xs">
                <CurrencyConverterToggle variant="expanded" />
              </div>
            </div>
          </div>

          {/* Col 2: Women's Embroidered */}
          <div className="space-y-3 min-w-0">
            <h5 className="font-bold tracking-widest uppercase text-white font-sans text-xs break-words">
              Embroidered Brands
            </h5>
            <ul className="space-y-2 text-neutral-400 min-w-0">
              {WOMEN_EMBROIDERY_BRANDS.slice(0, 8).map((b) => (
                <li key={b} className="min-w-0">
                  <button
                    onClick={() => navigateTo('shop', { gender: 'Women', craftType: 'Embroidery', brand: b })}
                    className="hover:text-white transition-colors text-left max-w-full break-words [overflow-wrap:anywhere]"
                  >
                    {b}
                  </button>
                </li>
              ))}
              <li className="min-w-0">
                <button
                  onClick={() => navigateTo('shop', { gender: 'Women', craftType: 'Embroidery' })}
                  className="text-white font-semibold hover:underline text-left max-w-full break-words"
                >
                  View All Embroidered →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Printed & Men's */}
          <div className="space-y-3 min-w-0">
            <h5 className="font-bold tracking-widest uppercase text-white font-sans text-xs break-words">
              Men's Fabrics
            </h5>
            <ul className="space-y-2 text-neutral-400 min-w-0">
              {MENS_FABRICS.map((f) => (
                <li key={f} className="min-w-0">
                  <button
                    onClick={() => navigateTo('shop', { gender: 'Men', fabric: f })}
                    className="hover:text-white transition-colors text-left max-w-full break-words [overflow-wrap:anywhere]"
                  >
                    {f} Suiting
                  </button>
                </li>
              ))}
              <li className="pt-2 border-t border-neutral-800 min-w-0">
                <button
                  onClick={() => navigateTo('shop', { gender: 'Women', craftType: 'Printed' })}
                  className="text-white font-semibold hover:underline text-left max-w-full break-words"
                >
                  Printed Collection (Bin Saeed, Five Star) →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Customer Care & Information */}
          <div className="space-y-3 min-w-0">
            <h5 className="font-bold tracking-widest uppercase text-white font-sans text-xs break-words">
              Customer Care
            </h5>
            <ul className="space-y-2 text-neutral-400 min-w-0">
              <li className="min-w-0">
                <button onClick={() => navigateTo('location')} className="hover:text-white transition-colors text-left max-w-full break-words">
                  Paris Bazaar Store Location
                </button>
              </li>
              <li className="min-w-0">
                <button onClick={() => navigateTo('terms')} className="hover:text-white transition-colors text-left max-w-full break-words">
                  Shipping & Nationwide COD
                </button>
              </li>
              <li className="min-w-0">
                <button onClick={() => navigateTo('refund')} className="hover:text-white transition-colors text-left max-w-full break-words">
                  7-Day Return & Exchange
                </button>
              </li>
              <li className="min-w-0">
                <button onClick={() => navigateTo('privacy')} className="hover:text-white transition-colors text-left max-w-full break-words">
                  Privacy Policy
                </button>
              </li>
              <li className="min-w-0">
                <button onClick={() => navigateTo('ux-reel')} className="hover:text-[#D4AF37] text-[#E8D5A7] transition-colors text-left max-w-full break-words">
                  10 UX States Tutorial Reel
                </button>
              </li>
              <li className="min-w-0">
                <button onClick={() => navigateTo('admin')} className="hover:text-white transition-colors text-left max-w-full break-words">
                  Merchant Admin Portal
                </button>
              </li>
              <li className="pt-2 min-w-0">
                <a
                  href="https://wa.me/923346565636?text=Hello%20Niaz%20Cloth%20House!%20I%20have%20an%20inquiry%20regarding%20an%20order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold max-w-full break-words"
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="min-w-0 break-words">Direct WhatsApp Help</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Bottom Bar: Copyright & Payment Icons */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500 text-center md:text-left min-w-0">
          <p className="min-w-0 break-words">© {new Date().getFullYear()} Niaz Cloth House (NCH). All Rights Reserved. Paris Bazaar, Rawalpindi.</p>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-3 gap-y-1.5 text-[11px] uppercase tracking-wider font-semibold text-neutral-400 min-w-0 max-w-full">
            <span>Cash on Delivery</span>
            <span aria-hidden="true">·</span>
            <span>Direct Bank Transfer</span>
            <span aria-hidden="true">·</span>
            <span>JazzCash / EasyPaisa</span>
            <span aria-hidden="true">·</span>
            <span>WhatsApp Order</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
