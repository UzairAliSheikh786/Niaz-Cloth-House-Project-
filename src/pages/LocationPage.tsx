import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  MessageCircle, 
  Clock, 
  Car, 
  Compass, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  CreditCard,
  Share2,
  Building,
  Sparkles
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useShop } from '../context/ShopContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { MapsGroundingAssistant } from '../components/MapsGroundingAssistant';

export const LocationPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { showToast } = useShop();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const storeWhatsApp = '0334-6565636';
  const storeWhatsAppClean = '03346565636';
  const storePhone = '0334-6565636';
  const storePhoneClean = '03346565636';
  const founderName = 'Haji Sh. Niaz Ahmed';
  const managementTitle = 'Sons of Haji Niaz Ahmed';
  const proprietorPhone = '0334-6565636';
  const storeLandline = '0334-6565636';
  const shopNumber = 'Shop # 170';

  const whatsappUrl = 'https://wa.me/923346565636?text=Assalam-o-Alaikum%2C%20I%20am%20inquiring%20about%20unstitched%20fabrics%20at%20Niaz%20Cloth%20House.';
  const googleMapsDirectionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=Shop+170+Paris+Bazaar,+Moti+Bazar,+Committee+Chowk,+Rawalpindi';
  const googleMapsViewUrl = 'https://maps.google.com/?q=Shop+170+Paris+Bazaar,+Moti+Bazar,+Committee+Chowk,+Rawalpindi';

  const fullAddress = 'Shop # 166-C, Paris Bazaar, Moti Bazar, Committee Chowk, Rawalpindi, Punjab 46000';
  const coordinates = '33.6062° N, 73.0645° E';

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      showToast(`${label} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Store location link copied to clipboard');
    }
  };

  const breadcrumbItems = [
    { name: 'Home', path: '/', page: 'home' as const },
    { name: 'Store Location & Timings', path: '/location' },
  ];

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen pb-14">
      {/* Crawlable Breadcrumbs */}
      <div className="border-b border-[#E2E8F0] bg-[#F5EFEB]/50">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
        
        {/* Header */}
        <div className="border-b border-[#E2E8F0] pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#0284C7]/10 text-[#0284C7] text-[11px] font-semibold uppercase tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>Historic Paris Bazaar · Rawalpindi · Est. 1970</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
                Visit Niaz Cloth House
              </h1>
              <p className="text-xs sm:text-sm text-[#1C1917]/70 font-sans mt-1 max-w-2xl leading-relaxed">
                Step inside our flagship cloth house founded in 1970 by Haji Sh. Niaz Ahmed. Inspect authentic Chinese Boski bolts, Wash and Wear Suiting, and Ladies, Gents &amp; Children cloth variety in person at Shop # 166-C.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleShare}
                className="px-3 py-2 bg-white border border-[#E2E8F0] hover:border-[#0284C7] text-xs font-semibold text-[#1C1917] flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Location</span>
              </button>

              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions in Google Maps</span>
              </a>
            </div>
          </div>
        </div>

        {/* AUTHENTIC PHYSICAL SHOP IDENTITY BOX (From Physical Store Packaging & Verified Records) */}
        <div className="bg-[#F8FAFC] border-2 border-[#0284C7]/30 p-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-5 border-b border-[#E2E8F0]">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] uppercase tracking-widest font-bold text-[#0284C7]">
                  Verified Shop Identity · Established 1970
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-300">
                  Verified Store Details
                </span>
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                  Niaz Cloth House
                </h2>
              </div>
              <p className="text-sm font-serif italic text-[#0284C7]">
                "Dress To Impress" — Ladies, Gents &amp; Children Cloth Variety
              </p>
            </div>

            <div className="p-4 bg-white border border-[#E2E8F0] text-right space-y-1 shrink-0">
              <span className="text-[10px] uppercase font-bold text-[#1C1917]/60 block font-sans">
                Primary Rawalpindi Branch
              </span>
              <p className="font-serif text-base font-bold text-[#1C1917]">
                Shop # 166-C Paris Bazaar
              </p>
              <p className="text-xs font-mono font-semibold text-[#0284C7]">
                Call / WhatsApp: 0334-6565636
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 text-xs">
            <div className="bg-white p-4 border border-[#E2E8F0] space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#1C1917]/60 font-bold block">
                Founder Legacy
              </span>
              <p className="font-semibold text-sm text-[#1C1917]">{founderName}</p>
              <p className="text-[11px] text-[#0284C7] font-medium">
                Managed by His Sons (Name Unchanged)
              </p>
              <a href="tel:03346565636" className="text-xs font-mono font-bold text-[#0284C7] hover:underline flex items-center gap-1 pt-0.5">
                <Phone className="w-3.5 h-3.5" />
                <span>0334-6565636</span>
              </a>
            </div>

            <div className="bg-white p-4 border border-[#E2E8F0] space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#1C1917]/60 font-bold block">
                Direct WhatsApp Support
              </span>
              <p className="font-semibold text-sm text-[#1C1917]">Instant Video &amp; Cuts</p>
              <a href="https://wa.me/923346565636" target="_blank" rel="noreferrer" className="text-xs font-mono font-bold text-[#4A5D4E] hover:underline flex items-center gap-1 pt-0.5">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>0334-6565636</span>
              </a>
            </div>

            <div className="bg-white p-4 border border-[#E2E8F0] space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#1C1917]/60 font-bold block">
                Shop Timings
              </span>
              <p className="font-semibold text-sm text-[#1C1917]">All 7 Days</p>
              <p className="text-xs font-semibold text-[#0284C7] flex items-center gap-1 pt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Monday to Sunday 10am-9pm</span>
              </p>
            </div>

            <div className="bg-white p-4 border border-[#E2E8F0] space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#1C1917]/60 font-bold block">
                Fabrics In Stock
              </span>
              <p className="font-semibold text-sm text-[#1C1917]">All 3 Departments</p>
              <p className="text-[11px] text-[#1C1917]/70 leading-normal">
                Ladies, Gents &amp; Children: Pure Silk Boski, Wash and Wear &amp; Karandi.
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid: Google Map Left / Info Cards Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Map & Live Navigation (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Embedded Google Map Frame */}
            <div className="bg-white border border-[#E2E8F0] p-2 shadow-sm relative group overflow-hidden">
              <div className="w-full aspect-[4/3] sm:aspect-[16/10] bg-[#F2EDE7] relative overflow-hidden">
                <iframe
                  title="Google Maps Location - Niaz Cloth House Shop 166-C Paris Bazaar Rawalpindi"
                  src="https://maps.google.com/maps?q=Shop+166-C+Paris+Bazaar,+Moti+Bazar,+Committee+Chowk,+Rawalpindi&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  className="w-full h-full"
                />

                {/* Floating Map Label Badge */}
                <div className="absolute top-3 left-3 bg-[#1C1917]/90 text-white p-2.5 shadow-lg border border-white/20 backdrop-blur-xs max-w-xs pointer-events-none">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-[#38BDF8]">
                    Flagship Shop # 166-C
                  </div>
                  <div className="font-serif text-xs font-bold truncate">
                    Niaz Cloth House Since 1970
                  </div>
                  <div className="text-[10px] text-white/80">
                    Paris Bazaar, Moti Bazar, Committee Chowk
                  </div>
                </div>
              </div>

              {/* Sandboxed privacy note */}
              <div className="px-3 pt-2 text-[10px] text-[#1C1917]/60 font-sans">
                Sandboxed third-party navigation embed. No personal tracking or cross-site profiling data is collected by Niaz Cloth House.
              </div>

              {/* Map Bottom Bar with Direct External Links */}
              <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#1C1917]/70">
                  <Compass className="w-4 h-4 text-[#0284C7]" />
                  <span>GPS: <strong className="font-mono text-[#1C1917]">{coordinates}</strong></span>
                  <button
                    onClick={() => handleCopy(coordinates, 'GPS Coordinates')}
                    className="p-1 text-[#0284C7] hover:text-[#0369A1]"
                    title="Copy coordinates"
                  >
                    {copiedField === 'GPS Coordinates' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={googleMapsViewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0284C7] hover:underline"
                  >
                    <span>Open in Google Maps App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 bg-white border border-[#E2E8F0] hover:border-[#0284C7] transition-colors flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between text-[#0284C7] mb-2">
                  <Navigation className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  <span className="text-[10px] uppercase font-bold text-[#0284C7]/80">Turn-by-Turn</span>
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#1C1917]">Google Maps</h4>
                  <p className="text-[11px] text-[#1C1917]/60 mt-0.5">Live routing to Shop # 166-C</p>
                </div>
              </a>

              <a
                href={`tel:${proprietorPhone}`}
                className="p-3.5 bg-white border border-[#E2E8F0] hover:border-[#0284C7] transition-colors flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between text-[#0284C7] mb-2">
                  <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] uppercase font-bold text-[#0284C7]/80">Management Desk</span>
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#1C1917]">{proprietorPhone}</h4>
                  <p className="text-[11px] text-[#1C1917]/60 mt-0.5">{managementTitle} · 0334-6565636</p>
                </div>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 bg-white border border-[#E2E8F0] hover:border-[#4A5D4E] transition-colors flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between text-[#4A5D4E] mb-2">
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] uppercase font-bold text-[#4A5D4E]">WhatsApp Desk</span>
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#1C1917]">{storeWhatsApp}</h4>
                  <p className="text-[11px] text-[#1C1917]/60 mt-0.5">Instant fabric photos, videos &amp; orders</p>
                </div>
              </a>
            </div>

            {/* Landmark Arrival Instructions Card */}
            <div className="bg-white border border-[#E2E8F0] p-6 space-y-4">
              <h3 className="font-serif text-base font-bold text-[#1C1917] flex items-center gap-2">
                <Car className="w-4 h-4 text-[#0284C7]" />
                <span>How to Reach Shop # 166-C (Landmark Guide)</span>
              </h3>

              <div className="space-y-3 text-xs text-[#1C1917]/80">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
                  <strong className="text-[#0284C7] block font-semibold mb-0.5">
                    1. By Metro Bus Transit:
                  </strong>
                  <p className="leading-relaxed">
                    Disembark at <strong>Committee Chowk Metro Station</strong>. Walk towards Moti Bazar gate (5 minutes). Enter Paris Bazaar textile lane — <strong>Shop # 166-C</strong> is situated centrally with prominent heritage Urdu signboards.
                  </p>
                </div>

                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
                  <strong className="text-[#0284C7] block font-semibold mb-0.5">
                    2. By Car, Uber, or Yango:
                  </strong>
                  <p className="leading-relaxed">
                    Set drop-off at <strong>Liaquat Road / Committee Chowk Entrance</strong> or <strong>Moti Bazar Chowk</strong>. Valet/public vehicle parking is accessible adjacent to Committee Chowk Plaza.
                  </p>
                </div>

                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
                  <strong className="text-[#0284C7] block font-semibold mb-0.5">
                    3. Landmark Recognition:
                  </strong>
                  <p className="leading-relaxed">
                    Ask any Paris Bazaar shopkeeper for <em>"Haji Sh. Niaz Ahmed Cloth House (Dukaan No. 166-C)"</em>. Our establishment has been operating at this exact location since 1970.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Google Maps Grounding Assistant */}
            <MapsGroundingAssistant />
          </div>

          {/* Right Column: Contact, Payments, Timings (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Official Store Card */}
            <div className="bg-white border border-[#E2E8F0] p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                    Store Address & Details
                  </h3>
                  <p className="text-[11px] text-[#0284C7] font-sans font-medium">
                    Central Wholesale & Retail Bazaar
                  </p>
                </div>
                <Building className="w-5 h-5 text-[#0284C7]" />
              </div>

              {/* Exact Address */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[#1C1917]/60 block font-semibold uppercase tracking-wider text-[10px]">
                  Physical Store Address
                </span>
                <p className="font-serif text-sm font-semibold text-[#1C1917] leading-snug">
                  {fullAddress}
                </p>
                <button
                  onClick={() => handleCopy(fullAddress, 'Address')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] hover:underline pt-1"
                >
                  {copiedField === 'Address' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'Address' ? 'Address Copied!' : 'Copy Address for Driver'}</span>
                </button>
              </div>

              {/* Official Contact Hotline */}
              <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
                <span className="text-[#1C1917]/60 block font-semibold uppercase tracking-wider text-[10px]">
                  Direct Shop Hotline / WhatsApp
                </span>
                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#4A5D4E]/10 flex items-center justify-center text-[#4A5D4E]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-base font-bold text-[#1C1917] block">
                        {storePhone}
                      </span>
                      <span className="text-[10px] text-[#4A5D4E] font-semibold block">
                        Call · WhatsApp · EasyPaisa · JazzCash
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(storePhoneClean, 'Phone Number')}
                    className="p-2 hover:bg-white text-[#0284C7] border border-transparent hover:border-[#E2E8F0] transition-colors"
                    title="Copy phone number"
                  >
                    {copiedField === 'Phone Number' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Verified Digital Payments Info Card */}
              <div className="pt-3 border-t border-[#E2E8F0] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#1C1917] text-[10px]">
                    Verified Payment Gateways
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Merchant
                  </span>
                </div>

                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-1.5 border-b border-[#E2E8F0]/60">
                    <span className="font-semibold text-[#1C1917]">EasyPaisa Account:</span>
                    <strong className="font-mono text-[#0284C7]">{storePhone}</strong>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-[#E2E8F0]/60">
                    <span className="font-semibold text-[#1C1917]">JazzCash Account:</span>
                    <strong className="font-mono text-[#0284C7]">{storePhone}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#1C1917]/70">Account Title:</span>
                    <span className="font-medium text-[#1C1917]">Muhammad Niaz / Niaz Cloth House</span>
                  </div>
                </div>
              </div>

              {/* Operating Timings */}
              <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
                <span className="text-[#1C1917]/60 block font-semibold uppercase tracking-wider text-[10px]">
                  Store Visiting Hours
                </span>
                <div className="space-y-1.5 text-xs text-[#1C1917]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#1C1917]/70">Store Timings:</span>
                    <strong className="font-semibold text-[#0284C7]">Monday to Sunday 10am-9pm</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#1C1917]/70">Friday Jummah Break:</span>
                    <span className="font-medium text-[#1C1917]">1:00 PM – 2:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#1C1917]/70">Website Orders:</span>
                    <span className="font-medium text-[#1C1917]">Dispatch cutoff at 9:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* In-Store Bespoke Concierge Box */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-[#0284C7] font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>What Awaits You at Our Paris Bazaar Shop</span>
              </div>
              <ul className="space-y-1.5 text-[#1C1917]/80 list-disc list-inside">
                <li>Touch and drape all 8, 10, and 6-pound pure Chinese Boski bolts.</li>
                <li>Feel the weight and premium hand of authentic Boski silk and Wash and Wear bolts.</li>
                <li>Custom unstitched cuts tailored to individual height and width preferences.</li>
                <li>Complimentary traditional Kahwa & cold refreshment for visiting families.</li>
              </ul>
            </div>

            {/* Official Registered Business Identity & Legal Trust */}
            <div className="bg-white border border-[#E2E8F0] p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <strong className="font-serif text-sm font-bold text-[#1C1917]">Registered Business Identity</strong>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-300">
                  Est. 1970
                </span>
              </div>
              <div className="space-y-1.5 text-[11px] text-[#1C1917]/75">
                <p><strong>Legal Trade Name:</strong> Niaz Cloth House</p>
                <p><strong>Founding Legacy:</strong> Haji Sh. Niaz Ahmed · Stewarded by His Sons (Name Unchanged)</p>
                <p><strong>Registered Address:</strong> Shop #170, Paris Bazaar, Moti Bazar, Committee Chowk, Rawalpindi, Punjab 46000</p>
                <p><strong>Contact Desk:</strong> 0334-6565636 · info@nch.com</p>
              </div>
              <div className="pt-2 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <button
                  onClick={() => navigateTo('privacy')}
                  className="text-[#0284C7] hover:underline font-semibold"
                >
                  DPDP Privacy Policy
                </button>
                <button
                  onClick={() => navigateTo('terms')}
                  className="text-[#0284C7] hover:underline font-semibold"
                >
                  Terms & Conditions
                </button>
                <button
                  onClick={() => navigateTo('terms')}
                  className="text-[#0284C7] hover:underline font-semibold"
                >
                  Order & Dispatch Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
