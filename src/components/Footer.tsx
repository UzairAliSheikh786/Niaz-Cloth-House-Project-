import React from 'react';
import { Phone, MessageCircle, MapPin, Clock, Award, Shield, ShieldCheck, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const Footer: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <footer className="bg-[#0B132B] text-[#F8FAFC] pt-16 pb-12 border-t border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Strip (Editorial Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-[#1E293B] text-sm">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#0284C7]/20 text-[#38BDF8] shrink-0 border border-[#0284C7]/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold text-white tracking-wide">
                Over 55 Years of Purity (Est. 1970)
              </h4>
              <p className="text-[#94A3B8] text-xs mt-1 leading-relaxed">
                Authentic Wash & Wear, combed cotton, Kamalia Khaddar, Lelan, and pure Boski silk with certified yardage.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#0284C7]/20 text-[#38BDF8] shrink-0 border border-[#0284C7]/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold text-white tracking-wide">
                100% Unstitched Suit Guarantee
              </h4>
              <p className="text-[#94A3B8] text-xs mt-1 leading-relaxed">
                Full 4.5m cuts for gentlemen and 3-piece sets for ladies with generous double width (54" Bara Arz) for tailoring.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#0284C7]/20 text-[#38BDF8] shrink-0 border border-[#0284C7]/30">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold text-white tracking-wide">
                WhatsApp Concierge & COD
              </h4>
              <p className="text-[#94A3B8] text-xs mt-1 leading-relaxed">
                Direct WhatsApp consultation with fabric consultants, nationwide Cash-on-Delivery across all cities of Pakistan.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation & Brand Directory */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-14 border-b border-[#1E293B]">
          {/* Brand Story Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl tracking-tight text-white font-bold">
                  Niaz Cloth House
                </span>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#38BDF8] font-medium mt-1 font-mono">
                Since 1970 · "Dress To Impress" · Rawalpindi
              </span>
            </div>
            <p className="text-sm text-[#94A3B8] max-w-md leading-relaxed">
              Founded in 1970 by <strong>Haji Sh. Niaz Ahmed</strong>. Today, the family legacy is faithfully carried forward by his sons with the shop name proudly unchanged: <strong>Niaz Cloth House</strong>. We curate authentic Wash & Wear, combed cotton, Kamalia Khaddar, Lelan, pure Boski silk, and designer unstitched lawn collections.
            </p>
            <div className="pt-2 text-xs text-[#94A3B8] space-y-1.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                <span>Shop # 166-C / # 170 Paris Bazaar, Moti Bazar, Committee Chowk, Rawalpindi, 46000, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <span>Monday to Sunday: 10:00 AM – 9:00 PM PKT</span>
              </div>
            </div>
          </div>

          {/* Men's Collections */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#38BDF8] font-mono">
              Men's Fabrics
            </p>
            <ul className="space-y-2 text-sm text-[#CBD5E1]">
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Men', fabric: 'Wash & Wear' })}
                  className="hover:text-white transition-colors text-left"
                >
                  Wash & Wear Suiting
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Men', fabric: 'Cotton' })}
                  className="hover:text-white transition-colors text-left"
                >
                  Pure Combed Cotton
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Men', fabric: 'Khaddar' })}
                  className="hover:text-white transition-colors text-left"
                >
                  Kamalia Khaddar
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Men', fabric: 'Lelan' })}
                  className="hover:text-white transition-colors text-left"
                >
                  Textured Lelan
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Men', fabric: 'Boski' })}
                  className="hover:text-white transition-colors text-left"
                >
                  Pure Boski Silk
                </button>
              </li>
            </ul>
          </div>

          {/* Women's Collections */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#38BDF8] font-mono">
              Women's Ensembles
            </p>
            <ul className="space-y-2 text-sm text-white/75">
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Women', craftType: 'Embroidery' })}
                  className="hover:text-white transition-colors text-left font-medium text-[#38BDF8]"
                >
                  ★ Embroidered Collection
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Women', craftType: 'Printed' })}
                  className="hover:text-white transition-colors text-left font-medium text-[#38BDF8]"
                >
                  ★ Printed Collection
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Women', brand: 'Johara' })}
                  className="hover:text-white transition-colors text-left text-sm text-[#CBD5E1]"
                >
                  Johara & Bin Rashid
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Women', brand: 'Bin Saeed' })}
                  className="hover:text-white transition-colors text-left text-sm text-[#CBD5E1]"
                >
                  Bin Saeed & Safina Lawn
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { gender: 'Women', brand: 'Tawakkal' })}
                  className="hover:text-white transition-colors text-left text-sm text-[#CBD5E1]"
                >
                  Tawakkal & Bonanza Luxury
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Trust Policies (DPDP & Consumer Rights) */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#38BDF8]">
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
                  className="hover:text-white transition-colors text-left text-[#38BDF8] font-medium flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Store Admin Panel</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))}
                  className="text-xs text-[#38BDF8] hover:underline transition-colors text-left flex items-center gap-1 pt-1"
                >
                  <span>Cookie Settings</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Concierge & Ordering */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#38BDF8]">
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
            <strong className="text-[#38BDF8] block uppercase tracking-wider text-[10px]">
              Soak Cotton & Khaddar in Water (Tarr-Karna)
            </strong>
            <p>
              Before stitching, please soak pure cotton Latha and Khaddar in clean water for 2 hours (Tarr-Karna) and dry in the shade.
            </p>
          </div>

          <div className="space-y-1">
            <strong className="text-[#38BDF8] block uppercase tracking-wider text-[10px]">
              Color Shade Note
            </strong>
            <p>
              Fabric color may look slightly different depending on your mobile screen brightness and outdoor sunlight.
            </p>
          </div>

          <div className="space-y-1">
            <strong className="text-[#38BDF8] block uppercase tracking-wider text-[10px]">
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
            <button onClick={() => navigateTo('location')} className="hover:text-white transition-colors text-[#38BDF8] flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>Shop # 166-C Paris Bazaar</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
