import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useShop } from '../context/ShopContext';

export const FloatingWhatsAppButton: React.FC = () => {
  const { currentPage, productId } = useNavigation();
  const { products, isCheckoutOpen } = useShop();
  const [isHovered, setIsHovered] = useState(false);

  // Hide when checkout modal is open to avoid blocking form fields
  if (isCheckoutOpen) return null;

  // Phone number: 0334-6565636 (international: 923346565636)
  const phoneNumber = '923346565636';

  // Construct message based on current page
  let defaultMessage = 'Hello Niaz Cloth House, I am inquiring about your unstitched fabrics collection.';

  if (currentPage === 'product-detail' && productId) {
    const currentProduct = products.find((p) => p.id === productId || p.slug === productId);
    if (currentProduct) {
      defaultMessage = `Hello Niaz Cloth House, I am inquiring about *${currentProduct.title}* (₨ ${currentProduct.price.toLocaleString('en-PK')}). Please share available cuts and international/domestic delivery details.`;
    }
  } else if (currentPage === 'location') {
    defaultMessage = 'Hello Niaz Cloth House, I am planning to visit your Paris Bazaar shop in Rawalpindi. Please share directions and store timings.';
  }

  const whatsappHref = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside
      aria-label="Store Customer Service WhatsApp"
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 select-none print:hidden"
    >
      <div className="relative flex items-center justify-end">
        {/* Subtle Tooltip for Desktop / Hover */}
        <div
          role="tooltip"
          className={`hidden md:block absolute right-full mr-3 bottom-1/2 translate-y-1/2 transition-all duration-200 pointer-events-none ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
        >
          <div className="bg-[#1C1917] text-[#F8FAFC] text-xs py-2 px-3.5 shadow-xl border border-white/10 whitespace-nowrap space-y-0.5 text-right">
            <span className="font-semibold block text-[#38BDF8] text-[11px] uppercase tracking-wider">
              Niaz Cloth House Support
            </span>
            <span className="block text-[11px] text-white/90 font-mono">
              0334-6565636 · Daily 10AM–9PM
            </span>
            <span className="block text-[10px] text-white/60">
              Sons of Haji Niaz Ahmed Desk
            </span>
          </div>
        </div>

        {/* Floating WhatsApp Action Button */}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Chat with Niaz Cloth House on WhatsApp (0334-6565636)"
          className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BD5A] active:bg-[#1BA84F] text-[#060608] px-4 py-3 rounded-full shadow-[0_8px_24px_rgba(37,211,102,0.35)] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]"
        >
          <svg
            className="w-5 h-5 fill-current shrink-0 text-[#060608]"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="text-xs font-bold tracking-wide text-[#060608]">
            WhatsApp
          </span>
        </a>
      </div>
    </aside>
  );
};
