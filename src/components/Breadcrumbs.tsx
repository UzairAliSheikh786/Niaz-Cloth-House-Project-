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
    <nav aria-label="Breadcrumb" className="w-full py-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <ol className="flex items-center flex-wrap gap-1.5 text-xs text-[#1C1917]/70 font-sans">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#1C1917]/40 shrink-0" aria-hidden="true" />}
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-semibold text-[#0284C7] truncate max-w-[200px] sm:max-w-xs"
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
                  className="hover:text-[#0284C7] transition-colors flex items-center gap-1 hover:underline"
                >
                  {index === 0 && <Home className="w-3.5 h-3.5" aria-hidden="true" />}
                  <span>{item.name}</span>
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
