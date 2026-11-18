import React, { useEffect } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigation, PageRoute } from '../context/NavigationContext';
import { generateBreadcrumbsJSONLD } from '../utils/seoData';

export interface BreadcrumbItem {
  name: string;
  path: string;
  page?: PageRoute;
  params?: any;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const { navigateTo } = useNavigation();

  useEffect(() => {
    // Inject Schema.org BreadcrumbList JSON-LD into head
    const existing = document.getElementById('breadcrumb-schema-jsonld');
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.id = 'breadcrumb-schema-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(
      generateBreadcrumbsJSONLD(items.map((i) => ({ name: i.name, path: i.path })))
    );
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('breadcrumb-schema-jsonld');
      if (el) el.remove();
    };
  }, [items]);

  return (
    <nav aria-label="Breadcrumb" className="w-full py-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-w-0">
      <ol className="flex items-center flex-wrap gap-1.5 text-xs text-[#F7F4EE]/60 font-sans min-w-0 max-w-full">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.path}-${index}`} className="flex items-center gap-1.5 min-w-0 max-w-full">
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#C5A059]/45 shrink-0" aria-hidden="true" />}
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-semibold text-[#D4AF37] min-w-0 max-w-full break-words [overflow-wrap:anywhere] leading-snug"
                >
                  {item.name}
                </span>
              ) : (
                <a
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.page) {
                      navigateTo(item.page, item.params);
                    } else if (item.path === '/') {
                      navigateTo('home');
                    } else if (item.path === '/shop') {
                      navigateTo('shop');
                    } else if (item.path === '/location') {
                      navigateTo('location');
                    } else if (item.path.includes('men-summer')) {
                      navigateTo('men-summer');
                    } else if (item.path.includes('men-winter')) {
                      navigateTo('men-winter');
                    } else if (item.path.includes('women-summer')) {
                      navigateTo('women-summer');
                    } else if (item.path.includes('women-winter')) {
                      navigateTo('women-winter');
                    }
                  }}
                  className="hover:text-[#D4AF37] transition-colors flex items-center gap-1 hover:underline min-w-0 max-w-full break-words [overflow-wrap:anywhere]"
                >
                  {index === 0 && <Home className="w-3.5 h-3.5 text-[#C5A059] shrink-0" aria-hidden="true" />}
                  <span className="min-w-0 break-words [overflow-wrap:anywhere]">{item.name}</span>
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
