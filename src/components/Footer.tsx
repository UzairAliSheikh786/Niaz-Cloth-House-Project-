import React from 'react';
import { Phone, MessageCircle, MapPin, Clock, Award, Shield, ShieldCheck, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const Footer: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <footer className="bg-[#141414] text-[#FAF9F6] pt-16 pb-12 border-t border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Strip (Editorial Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-[#2A2A2A] text-sm">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#D4AF37]/15 text-[#D4AF37] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold text-white tracking-wide">
                Over 55 Years of Purity (Est. 1970)
              </h4>
              <p className="text-white/60 text-xs mt-1 leading-relaxed">
                Single-origin spun Chinese Boski and extra-long staple Egyptian Giza cotton with authenticated thread counts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#D4AF37]/15 text-[#D4AF37] shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold text-white tracking-wide">
                100% Unstitched Suit Guarantee
              </h4>
              <p className="text-white/60 text-xs mt-1 leading-relaxed">
                Full 4.5m cuts for gentlemen and 3-piece sets for ladies with generous double width (54" Bara Arz) for tailoring.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#D4AF37]/15 text-[#D4AF37] shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold text-white tracking-wide">
                WhatsApp Concierge & COD
              </h4>
              <p className="text-white/60 text-xs mt-1 leading-relaxed">
                Direct WhatsApp consultation with master fabric consultants, nationwide Cash-on-Delivery across all cities of Pakistan.
              </p>
            </div>
          </div>
        </div>



        {/* Navigation & Brand Directory */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-14 border-b border-[#38332E]">
          {/* Brand Story Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl tracking-tight text-white font-bold">
                  Niaz Cloth House
                </span>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#D4A373] font-medium mt-1">
                Since 1970 · "Dress To Impress" · Ladies, Gents & Children Cloth Variety
              </span>
            </div>
            <p className="text-sm text-white/70 max-w-md leading-relaxed">
              Founded in 1970 by <strong>Haji Sh. Niaz Ahmed</strong>. Today, the family legacy is faithfully carried forward by his sons with the shop name proudly unchanged: <strong>Niaz Cloth House</strong>. We curate genuine Chinese Boski silk bolts, crisp Egyptian Latha cotton, Kamalia Khaddar, and fine unstitched lawns for Ladies, Gents &amp; Children.
            </p>
            <div className="pt-2 text-xs text-white/60 space-y-1.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4A373] shrink-0 mt-0.5" />
                <span>Shop # 166-C, Paris Bazaar, Moti Bazar, Committee Chowk, Rawalpindi, 46000, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4A373] shrink-0" />
                <span>Monday to Sunday: 10:00 AM – 9:00 PM PKT</span>
              </div>
            </div>
          </div>

          {/* Men's Collections */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#D4A373]">
              Men's Suiting
            </p>
            <ul className="space-y-2 text-sm text-white/75">
              <li>
                <button
                  onClick={() => navigateTo('men-summer')}
                  className="hover:text-white transition-colors text-left font-medium text-[#D4A373]"
                >
                  Men's Summer Edition
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('men-winter')}
                  className="hover:text-white transition-colors text-left font-medium text-[#D4A373]"
                >
                  Men's Winter Edition
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Men', fabric: 'Boski Silk' })}
                  className="hover:text-white transition-colors"
                >
                  8-Pound Pure Boski Silk
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Men', fabric: 'Latha Cotton' })}
                  className="hover:text-white transition-colors"
                >
                  Egyptian Giza Latha
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Men', fabric: 'Pure Khaddar' })}
                  className="hover:text-white transition-colors"
                >
                  Kamalia Handloom Khaddar
                </button>
              </li>
            </ul>
          </div>

          {/* Women's Collections */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#D4A373]">
              Women's Festive
            </p>
            <ul className="space-y-2 text-sm text-white/75">
              <li>
                <button
                  onClick={() => navigateTo('women-summer')}
                  className="hover:text-white transition-colors text-left font-medium text-[#D4A373]"
                >
                  Women's Summer Edition
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('women-winter')}
                  className="hover:text-white transition-colors text-left font-medium text-[#D4A373]"
                >
                  Women's Winter Edition
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Women', fabric: 'Luxury Lawn' })}
                  className="hover:text-white transition-colors text-left"
                >
                  80s Combed Lawn 3-Piece
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Women', fabric: 'Embroidered Chiffon' })}
                  className="hover:text-white transition-colors text-left"
                >
                  Bamberg Chiffon Festive
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Women', fabric: 'Silk Jacquard' })}
                  className="hover:text-white transition-colors text-left"
                >
                  Banarasi Zari Jacquard
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Trust Policies (DPDP & Consumer Rights) */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#D4A373]">
              Legal & Trust
            </p>
            <ul className="space-y-2 text-sm text-white/75">
              <li>
                <button
                  onClick={() => navigateTo('privacy')}
                  className="hover:text-white transition-colors text-left flex items-center gap-1.5"
                >
                  <span>Privacy Policy (DPDP)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('terms')}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('cookies')}
                  className="hover:text-white transition-colors text-left"
                >
                  Cookies Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('terms')}
                  className="hover:text-white transition-colors text-left text-white/75"
                >
                  Fabric Order Terms
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('admin')}
                  className="hover:text-white transition-colors text-left text-[#D4A373] font-medium flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Store Admin Panel</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))}
                  className="text-xs text-[#D4A373] hover:underline transition-colors text-left flex items-center gap-1 pt-1"
                >
                  <span>Cookie Settings</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Concierge & Ordering */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#D4A373]">
              Direct Orders & Support
            </p>
            <p className="text-xs text-white/70 leading-relaxed">
              Order directly via WhatsApp or consult with our shop experts for suit cuts and advice.
            </p>
            <div className="space-y-2 pt-1">
              <a
                href="https://wa.me/923346565636?text=Assalam-o-Alaikum%20Niaz%20Cloth%20House%2C%20I%20am%20inquiring%20about%20unstitched%20fabrics."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4A5D4E] hover:bg-[#586e5d] text-white text-xs font-medium tracking-wide transition-colors shadow-sm w-full sm:w-auto"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: 0334-6565636</span>
              </a>

              <div className="text-[11px] text-white/70 font-sans space-y-0.5">
                <p>Call / Desk: <strong className="text-white">0334-6565636</strong></p>
                <p>Shop Timings: <strong className="text-white">Monday to Sunday 10am-9pm</strong></p>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigateTo('admin')}
                className="text-xs text-white/50 hover:text-white/90 underline transition-colors text-left"
              >
                Staff Portal · Inventory & Orders
              </button>
            </div>
          </div>
        </div>

        {/* Helpful Customer Notices */}
        <div className="py-6 border-b border-[#38332E] grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] text-white/65 leading-relaxed font-sans">
          <div className="space-y-1">
            <strong className="text-[#D4A373] block uppercase tracking-wider text-[10px]">
              Soak Cotton & Khaddar in Water (Tarr-Karna)
            </strong>
            <p>
              Before stitching, please soak pure cotton Latha and Khaddar in clean water for 2 hours (Tarr-Karna) and dry in the shade.
            </p>
          </div>

          <div className="space-y-1">
            <strong className="text-[#D4A373] block uppercase tracking-wider text-[10px]">
              Color Shade Note
            </strong>
            <p>
              Fabric color may look slightly different depending on your mobile screen brightness and outdoor sunlight.
            </p>
          </div>

          <div className="space-y-1">
            <strong className="text-[#D4A373] block uppercase tracking-wider text-[10px]">
              Fresh Cut from Rolls
            </strong>
            <p>
              All fabrics are measured and cleanly cut from fresh fabric rolls especially for each customer order.
            </p>
          </div>
        </div>

        {/* Bottom Legal & Copyright Notice */}
        <div className="pt-8 flex flex-col lg:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <p>© 1970–{new Date().getFullYear()} Niaz Cloth House. All rights reserved.</p>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-white/50 text-[11px]">
              Shop # 166-C Paris Bazaar, Committee Chowk, Rawalpindi. All textile imagery & brand marks are proprietary.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[11px]">
            <button onClick={() => navigateTo('privacy')} className="hover:text-white transition-colors">
              Privacy Notice
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => navigateTo('terms')} className="hover:text-white transition-colors">
              Terms & Conditions
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => navigateTo('refund')} className="hover:text-white transition-colors">
              Order & Dispatch Policy
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => navigateTo('cookies')} className="hover:text-white transition-colors">
              Cookies
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => navigateTo('location')} className="hover:text-white transition-colors text-[#D4A373] flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>Shop # 166-C Paris Bazaar</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
