import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  Layers, 
  Scissors, 
  Truck, 
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

interface OnboardingStep {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: { title: string; detail: string }[];
  tag: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    badge: 'Paris Bazaar · Since 1970',
    title: 'Welcome to Niaz Cloth House',
    subtitle: 'The Premier Sanctuary of Authentic Pakistani Unstitched Textiles',
    description:
      'Founded in 1970 by Haji Sh. Niaz Ahmed in Rawalpindi’s historic textile hub and stewarded today by his sons, our house has maintained an unyielding pledge for over five decades: zero pre-stitched compromises, certified pure yarns, and genuine weight grades.',
    highlights: [
      { title: 'Paris Bazaar Heritage', detail: 'Historic Shop #166-C / #170, Moti Bazaar, Rawalpindi' },
      { title: 'Family Stewardship', detail: 'Preserving authentic unstitched standards with name proudly unchanged' },
      { title: 'Direct Yardage Cuts', detail: 'Tailor-ready bolts inspected by master clothiers' },
    ],
    tag: 'Step 1 of 4',
  },
  {
    badge: 'Popular Fabrics',
    title: 'Pure Boski, Wash and Wear & Khaddar',
    subtitle: '100% Pure Natural Fabrics with Guaranteed Quality',
    description:
      'We test every roll to make sure you get 100% genuine cloth without mixed synthetic polyester. From original Chinese mulberry Boski silk to combed cotton, choose the best cloth for your shalwar kameez.',
    highlights: [
      { title: 'Chinese Boski Silk', detail: 'Original 6lb summer, 8lb all-season, and 10lb winter weights' },
      { title: 'Combed Cotton Latha', detail: 'Superfine combed cotton with crisp finish for Friday prayers' },
      { title: 'Kamalia Khaddar & Karandi', detail: 'Traditional handspun warm textures for winter' },
    ],
    tag: 'Step 2 of 4',
  },
  {
    badge: 'Tailoring & Care Tips',
    title: 'Fabric Length & Soaking (Tarr-Karna)',
    subtitle: 'Helpful Tips Before Giving Your Suit to Your Tailor (Darzi)',
    description:
      'To make sure your suit fits perfectly without shrinking, follow our simple sizing and washing instructions.',
    highlights: [
      { title: 'Standard Suit Cut', detail: '4.5 meters with 54-inch double width (Bara Arz) for height up to 6’2”' },
      { title: 'Tarr-Karna (Water Soak)', detail: 'Soak pure cotton and Latha in cold water for 2 hours and dry in shade' },
      { title: 'Extra Length Cuts', detail: '4.75m to 5m cuts available for tall heights or loose kalidaar kurtas' },
    ],
    tag: 'Step 3 of 4',
  },
  {
    badge: 'Seamless Service',
    title: 'Nationwide COD & AI Concierge',
    subtitle: 'Direct Ordering via Web, WhatsApp, or Interactive Concierge',
    description:
      'Experience modern convenience backed by traditional shop hospitality. Enjoy Cash on Delivery across Pakistan, fast dispatch from Rawalpindi, and real-time guidance from our AI Fabric Concierge.',
    highlights: [
      { title: 'Cash on Delivery (COD)', detail: 'Free nationwide parcel delivery across all major cities and towns' },
      { title: 'WhatsApp Direct (0334-6565636)', detail: 'Instant order confirmations and parcel tracking updates' },
      { title: 'AI Concierge & Video Runway', detail: 'Interactive advice on suit yardage, care tips, and drape previews' },
    ],
    tag: 'Step 4 of 4',
  },
];

export const OnboardingTutorial: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { navigateTo } = useNavigation();

  // Tutorial opens on demand when triggered, respecting zero arrival popup rule
  useEffect(() => {
    // Only initialized, no automatic popup
  }, []);

  // Listen for custom trigger event to replay tutorial from help links
  useEffect(() => {
    const handleReplay = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };
    window.addEventListener('openOnboardingTutorial', handleReplay);
    return () => window.removeEventListener('openOnboardingTutorial', handleReplay);
  }, []);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('nch_onboarding_completed_v2', 'true');
    } catch {}
    setIsOpen(false);
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
    >
      <div className="bg-[#F8FAFC] max-w-lg w-full border border-[#E2E8F0] shadow-2xl overflow-hidden relative my-6 animate-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="bg-[#1C1917] text-[#F8FAFC] p-5 border-b border-[#38332E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0284C7]/30 border border-[#38BDF8]/60 flex items-center justify-center text-[#38BDF8]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#38BDF8] block">
                {step.badge}
              </span>
              <h2 id="onboarding-modal-title" className="font-serif text-base font-bold text-white">
                {step.title}
              </h2>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded-sm"
            aria-label="Skip onboarding guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-[#E2E8F0] h-1 flex">
          {ONBOARDING_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-full flex-1 transition-all duration-300 ${
                idx <= currentStep ? 'bg-[#0284C7]' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1C1917] leading-snug">
              {step.subtitle}
            </h3>
            <p className="text-xs text-[#1C1917]/75 mt-2 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Highlights Cards */}
          <div className="space-y-2.5 pt-1">
            {step.highlights.map((h, i) => (
              <div
                key={i}
                className="p-3 bg-white border border-[#E2E8F0] flex items-start gap-3 shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-[#F5EFEB] text-[#0284C7] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-2" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#1C1917]">{h.title}</h4>
                  <p className="text-[11px] text-[#1C1917]/70 mt-0.5 leading-normal">{h.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
            <div className="text-xs font-mono text-[#1C1917]/50">
              {step.tag}
            </div>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="py-2 px-3 text-xs font-medium text-[#1C1917]/80 hover:text-[#1C1917] hover:bg-[#F2ECE5] transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="py-2 px-4 bg-[#0284C7] hover:bg-[#0369A1] active:bg-[#075985] text-white text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>{currentStep === ONBOARDING_STEPS.length - 1 ? 'Explore Catalog' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
