import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Cookie, 
  RotateCcw, 
  Lock, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  Mail, 
  MapPin, 
  Scale, 
  Printer, 
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
  Sparkles,
  Truck
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { Breadcrumbs } from '../components/Breadcrumbs';

export type PolicyTab = 'privacy' | 'terms' | 'cookies' | 'refund';

interface LegalPageProps {
  initialTab?: PolicyTab;
}

export const LegalPage: React.FC<LegalPageProps> = ({ initialTab = 'privacy' }) => {
  const { navigateTo, currentPage } = useNavigation();

  // Determine active tab from route or prop
  const resolveTab = (): PolicyTab => {
    if (currentPage === 'privacy') return 'privacy';
    if (currentPage === 'terms') return 'terms';
    if (currentPage === 'cookies') return 'cookies';
    if (currentPage === 'refund') return 'refund';
    return initialTab;
  };

  const [activeTab, setActiveTab] = useState<PolicyTab>(resolveTab());

  // Keep in sync if currentPage changes
  React.useEffect(() => {
    if (currentPage === 'privacy' || currentPage === 'terms' || currentPage === 'cookies' || currentPage === 'refund') {
      setActiveTab(currentPage);
    }
  }, [currentPage]);

  const handleTabChange = (tab: PolicyTab) => {
    setActiveTab(tab);
    navigateTo(tab);
  };

  const triggerCookieModal = () => {
    window.dispatchEvent(new CustomEvent('openCookieSettings'));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen py-10 sm:py-14 font-sans text-[#1C1917]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb & Legal Header */}
        <div className="border-b border-[#E2E8F0] pb-6">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { name: 'Home', path: '/', page: 'home' as const },
                {
                  name:
                    activeTab === 'privacy'
                      ? 'Privacy Policy (DPDP)'
                      : activeTab === 'terms'
                      ? 'Terms & Conditions'
                      : activeTab === 'cookies'
                      ? 'Cookies Policy'
                      : 'Fabric Order Policy',
                  path:
                    activeTab === 'privacy'
                      ? '/privacy-policy'
                      : activeTab === 'terms'
                      ? '/terms-and-conditions'
                      : activeTab === 'cookies'
                      ? '/cookie-policy'
                      : '/refund-policy',
                },
              ]}
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified Legal Framework · DPDP Act Compliant</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
                Customer Trust & Legal Governance
              </h1>
              <p className="text-xs sm:text-sm text-[#1C1917]/75 font-sans mt-1 max-w-2xl leading-relaxed">
                Niaz Cloth House (Established 1970, 170 Paris Bazaar, Rawalpindi). Transparent, consumer-first legal agreements, data protection disclosures, and customer service commitments.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 bg-white border border-[#E2E8F0] hover:border-[#0284C7] text-xs font-semibold text-[#1C1917] flex items-center gap-1.5 transition-colors shadow-xs"
                title="Print policy document"
              >
                <Printer className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Print Document</span>
              </button>

              <button
                type="button"
                onClick={triggerCookieModal}
                className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Cookie className="w-3.5 h-3.5" />
                <span>Cookie Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4-Tab Navigation Selector */}
        <nav
          aria-label="Policy Navigation Tabs"
          className="flex items-center border-b border-[#E2E8F0] overflow-x-auto scrollbar-none gap-2 sm:gap-4"
        >
          <button
            type="button"
            onClick={() => handleTabChange('privacy')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'privacy'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-[#1C1917]/70 hover:text-[#1C1917] hover:border-gray-300'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy Policy (DPDP)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('terms')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'terms'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-[#1C1917]/70 hover:text-[#1C1917] hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms & Conditions (T&C)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('cookies')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'cookies'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-[#1C1917]/70 hover:text-[#1C1917] hover:border-gray-300'
            }`}
          >
            <Cookie className="w-4 h-4" />
            <span>Cookies Policy</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('refund')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'refund'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-[#1C1917]/70 hover:text-[#1C1917] hover:border-gray-300'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Order & Dispatch Policy</span>
          </button>
        </nav>

        {/* ============================================================ */}
        {/* TAB 1: PRIVACY POLICY (DPDP ACT & GDPR COMPLIANT) */}
        {/* ============================================================ */}
        {activeTab === 'privacy' && (
          <article className="space-y-8 bg-white p-6 sm:p-10 border border-[#E2E8F0] shadow-xs">
            <header className="border-b border-[#E2E8F0] pb-6 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold">
                  DPDP Act (2023/2024 Standards)
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-amber-100 text-amber-900 font-bold">
                  Effective Date: October 2026
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-blue-100 text-blue-800 font-bold">
                  Document ID: NCH-PRIV-2026-v2
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                Privacy Policy & Personal Data Governance
              </h2>
              <p className="text-xs text-[#1C1917]/70">
                Issued by Niaz Cloth House, operating from 170 Paris Bazaar, Rawalpindi, Pakistan.
              </p>
            </header>

            {/* Quick Summary Callout */}
            <div className="p-4 bg-[#F8FAFC] border-l-4 border-[#0284C7] text-xs space-y-2 leading-relaxed">
              <h3 className="font-bold text-[#0284C7] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>Our Clear Privacy Commitment</span>
              </h3>
              <p>
                We do not sell, rent, or barter your personal contact information to any marketing broker, data harvester, or ad exchange. We collect only what is strictly necessary to fulfill your unstitched fabric order, provide courier Cash-on-Delivery delivery tracking, and provide direct customer support over WhatsApp or phone.
              </p>
            </div>

            {/* Section 1: Data Controller / Fiduciary Identity */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                1. Data Fiduciary & Identity
              </h3>
              <p>
                For the purposes of the <strong>Digital Personal Data Protection (DPDP) Act</strong>, the <strong>General Data Protection Regulation (GDPR)</strong>, and Pakistani electronic commerce regulations, the Data Fiduciary (Controller) is:
              </p>
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                <div>
                  <span className="text-[#1C1917]/60 block font-semibold text-[10px] uppercase">Legal Trade Entity:</span>
                  <strong className="text-[#1C1917]">Niaz Cloth House (Established 1977)</strong>
                </div>
                <div>
                  <span className="text-[#1C1917]/60 block font-semibold text-[10px] uppercase">Registered Shop Address:</span>
                  <span className="text-[#1C1917]">170 PARIS BAZAAR, Moti Bazar, Committee Chowk, Rawalpindi, Punjab 46000, Pakistan</span>
                </div>
                <div>
                  <span className="text-[#1C1917]/60 block font-semibold text-[10px] uppercase">Official Helpline:</span>
                  <span className="font-mono text-[#0284C7] font-bold">0334-6565636</span>
                </div>
                <div>
                  <span className="text-[#1C1917]/60 block font-semibold text-[10px] uppercase">Official Privacy Email:</span>
                  <span className="text-[#1C1917]">privacy@nch.com</span>
                </div>
              </div>
            </section>

            {/* Section 2: Necessary Data We Collect (Data Minimization) */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                2. Categories of Personal Data Collected (Data Minimization Principle)
              </h3>
              <p>
                In strict adherence to the principle of <em>Data Minimization</em>, we exclusively collect personal details that you voluntarily submit for legitimate transactional purposes:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  <strong>Customer Identity & Delivery Information:</strong> Full name, physical courier delivery address, postal code, and city within Pakistan.
                </li>
                <li>
                  <strong>Direct Contact Coordinates:</strong> Mobile phone number (used for courier delivery dispatch calls and Cash-on-Delivery confirmation) and WhatsApp number (for order status alerts and inquiry responses).
                </li>
                <li>
                  <strong>Transaction & Ledger Records:</strong> Unstitched fabric article codes, order value in PKR, payment mode (Cash-on-Delivery, EasyPaisa, or JazzCash), and courier dispatch tracking numbers.
                </li>
                <li>
                  <strong>Technical Session Data:</strong> Ephemeral session tokens, shopping bag state, and cookie consent preferences stored locally in your browser.
                </li>
              </ul>
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <strong>What We Never Collect:</strong> We never collect sensitive personal information, biometric data, religious beliefs, or credit/debit card numbers. All mobile payments (EasyPaisa/JazzCash) are completed directly within your own banking app.
              </div>
            </section>

            {/* Section 3: Lawful Basis for Processing */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                3. Lawful Basis for Processing
              </h3>
              <p>
                Under the DPDP framework, we process your personal data under the following legitimate grounds:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0]">
                  <strong className="text-[#0284C7] block mb-1">Contractual Fulfillment</strong>
                  <p className="text-[#1C1917]/75">Processing necessary to package, dispatch, and deliver your unstitched suits via national courier services.</p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0]">
                  <strong className="text-[#0284C7] block mb-1">Explicit Consent</strong>
                  <p className="text-[#1C1917]/75">Where you opt-in to WhatsApp customer support or accept functional and analytical cookie preferences.</p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0]">
                  <strong className="text-[#0284C7] block mb-1">Statutory Compliance</strong>
                  <p className="text-[#1C1917]/75">Maintaining tax, invoice, and commercial records in accordance with Pakistani commercial statutes.</p>
                </div>
              </div>
            </section>

            {/* Section 4: Data Principal Rights under DPDP Act */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                4. Your Rights as a Data Principal
              </h3>
              <p>
                As a valued customer and Data Principal, you possess clear rights over your personal data:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-[#E2E8F0] space-y-1">
                  <strong className="text-[#1C1917] block font-serif">Right to Access & Summary</strong>
                  <p className="text-[#1C1917]/70">You may request a digital copy of all personal records and order histories held by Niaz Cloth House.</p>
                </div>
                <div className="p-3 bg-white border border-[#E2E8F0] space-y-1">
                  <strong className="text-[#1C1917] block font-serif">Right to Correction & Rectification</strong>
                  <p className="text-[#1C1917]/70">You may update incorrect delivery addresses, phone numbers, or account profiles at any time.</p>
                </div>
                <div className="p-3 bg-white border border-[#E2E8F0] space-y-1">
                  <strong className="text-[#1C1917] block font-serif">Right to Erasure ('Right to be Forgotten')</strong>
                  <p className="text-[#1C1917]/70">You may demand the complete deletion of your customer profile, order history, and contact data once fulfillment is finalized.</p>
                </div>
                <div className="p-3 bg-white border border-[#E2E8F0] space-y-1">
                  <strong className="text-[#1C1917] block font-serif">Right to Withdraw Consent</strong>
                  <p className="text-[#1C1917]/70">You may revoke consent for non-essential cookies or WhatsApp communication at any time with immediate effect.</p>
                </div>
              </div>
            </section>

            {/* Section 5: Data Retention & Security */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                5. Data Retention & Cryptographic Security
              </h3>
              <p>
                We enforce technical and organizational safeguards:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
                <li><strong>SSL/TLS Encryption:</strong> All browser-to-server data transmissions are protected via 256-bit TLS encryption.</li>
                <li><strong>Retention Schedule:</strong> Order records are archived for a maximum of 24 months to satisfy tax compliance, after which they are permanently expunged.</li>
                <li><strong>Restricted Staff Access:</strong> Only authenticated staff members at 170 Paris Bazaar with verified role credentials can view dispatch manifests.</li>
              </ul>
            </section>

            {/* Section 6: Grievance Redressal Officer */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed pt-2">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                6. Grievance Redressal & Data Protection Officer
              </h3>
              <p>
                In compliance with DPDP provisions, Niaz Cloth House has appointed a dedicated Grievance Officer. If you have concerns, requests for data deletion, or compliance queries:
              </p>
              <div className="p-5 bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#1C1917]/60 block uppercase text-[10px] font-semibold">Grievance Officer:</span>
                    <strong className="text-sm font-serif text-[#1C1917]">Muhammad Uzair Niaz</strong>
                  </div>
                  <div>
                    <span className="text-[#1C1917]/60 block uppercase text-[10px] font-semibold">Designation:</span>
                    <span className="text-[#1C1917]">Data Protection Lead & Customer Support</span>
                  </div>
                  <div>
                    <span className="text-[#1C1917]/60 block uppercase text-[10px] font-semibold">Direct Email:</span>
                    <a href="mailto:grievance@nch.com" className="text-[#0284C7] font-semibold hover:underline">
                      grievance@nch.com
                    </a>
                  </div>
                  <div>
                    <span className="text-[#1C1917]/60 block uppercase text-[10px] font-semibold">Official Phone / WhatsApp:</span>
                    <span className="font-mono text-[#0284C7] font-bold">0334-6565636</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#1C1917]/70 pt-2 border-t border-[#E2E8F0]">
                  <strong>Statutory Response Timeline:</strong> All grievances are formally investigated and resolved within <strong>7 business days</strong> of receipt.
                </p>
              </div>
            </section>
          </article>
        )}

        {/* ============================================================ */}
        {/* TAB 2: TERMS & CONDITIONS (T&C) */}
        {/* ============================================================ */}
        {activeTab === 'terms' && (
          <article className="space-y-8 bg-white p-6 sm:p-10 border border-[#E2E8F0] shadow-xs">
            <header className="border-b border-[#E2E8F0] pb-6 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-blue-100 text-blue-900 font-bold">
                  Commercial Agreement
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-amber-100 text-amber-900 font-bold">
                  Effective: 2026 Season
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-gray-100 text-gray-800 font-bold">
                  Version 4.1
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                Terms & Conditions of Sale
              </h2>
              <p className="text-xs text-[#1C1917]/70">
                Operating terms governing all retail unstitched fabric purchases from Niaz Cloth House.
              </p>
            </header>

            {/* Crucial Unstitched Notice */}
            <div className="p-4 bg-[#F8FAFC] border-l-4 border-[#0284C7] text-xs space-y-1.5 leading-relaxed">
              <strong className="text-[#0284C7] block font-semibold uppercase text-[11px]">
                Notice of Unstitched Fabric Nature (Not Tailor Made)
              </strong>
              <p>
                Niaz Cloth House specializes exclusively in pure, unstitched textile cuts. Our garments are supplied in standard raw bolts (generous 4.5m / 54-inch wide cuts for gentlemen and 3-piece complete fabrics for ladies). We do not provide tailoring or stitching services.
              </p>
            </div>

            {/* Section 1: Ordering & Verification */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                1. Order Placement & Telephonic / WhatsApp Verification
              </h3>
              <p>
                Orders placed via our website or directly through WhatsApp are subject to confirmation. Due to high demand for authentic unstitched pure Chinese Boski and Wash and Wear Suiting, our staff may contact you via WhatsApp or voice call at <strong>0334-6565636</strong> to verify your delivery address before courier dispatch.
              </p>
            </section>

            {/* Section 2: Pricing & Payment Gateways */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                2. Pricing & Approved Payment Gateways
              </h3>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
                <li><strong>Currency:</strong> All prices are displayed and billed in Pakistani Rupees (PKR) inclusive of domestic packaging.</li>
                <li><strong>Cash on Delivery (COD):</strong> Payable in cash upon parcel handover to courier delivery personnel nationwide across Pakistan.</li>
                <li><strong>Digital Wallets:</strong> Verified merchant transfers to official accounts:
                  <ul className="list-none pl-4 pt-1 space-y-0.5 text-[11px] font-mono text-[#0284C7]">
                    <li>• EasyPaisa Account: <strong>0334-6565636</strong> (Title: Muhammad Niaz)</li>
                    <li>• JazzCash Account: <strong>0334-6565636</strong> (Title: Muhammad Niaz)</li>
                  </ul>
                </li>
              </ul>
            </section>

            {/* Section 3: Consumer Safeguards (Fabric Pre-Shrinkage & Screen Hue Variance) */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                3. Fabric Care Disclaimers & Risk Disclosures
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200">
                  <strong className="text-amber-900 block font-semibold mb-0.5">
                    A. Natural Fiber Pre-Shrinkage (Tarr-Karna / Soaking Mandatory):
                  </strong>
                  <p className="text-amber-950/80 leading-relaxed">
                    Pure 100% natural cotton (Latha), handloom Khaddar, and raw spun Karandi fibers naturally contract upon initial moisture contact. Customers and tailors are strictly advised to soak the uncut fabric in clean water for at least 2 hours and air-dry in shade before scissors cut. Niaz Cloth House is not liable for shrinkage after stitching.
                  </p>
                </div>

                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
                  <strong className="text-[#1C1917] block font-semibold mb-0.5">
                    B. Digital Screen Hue & Color Variance:
                  </strong>
                  <p className="text-[#1C1917]/75 leading-relaxed">
                    While our textile photography is captured in calibrated daylight studios, minor 5% to 8% color shade variations may occur due to diverse display screen color temperatures (AMOLED, Retina, LCD).
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Image Copyright & Intellectual Property */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                4. Image Copyright & Intellectual Property Protection
              </h3>
              <p>
                All photographs, textile roll presentations, banners, brand wordmarks ("Niaz Cloth House", "Since 1977"), product descriptions, and technical fabric specifications are proprietary intellectual property. Unauthorized downloading, commercial catalog copying, or scraping of these assets is legally actionable under the Copyright Ordinance of Pakistan.
              </p>
            </section>

            {/* Section 5: Governing Law & Jurisdiction */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                5. Governing Law & Jurisdiction
              </h3>
              <p>
                These Terms and Conditions are governed by and construed in accordance with the substantive laws of the Islamic Republic of Pakistan. Any legal proceedings or dispute resolutions shall be subject to the exclusive jurisdiction of the competent civil courts of <strong>Rawalpindi, Punjab, Pakistan</strong>.
              </p>
            </section>
          </article>
        )}

        {/* ============================================================ */}
        {/* TAB 3: COOKIES POLICY */}
        {/* ============================================================ */}
        {activeTab === 'cookies' && (
          <article className="space-y-8 bg-white p-6 sm:p-10 border border-[#E2E8F0] shadow-xs">
            <header className="border-b border-[#E2E8F0] pb-6 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold">
                  Granular User Control
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-purple-100 text-purple-900 font-bold">
                  Zero Third-Party Ad Trackers
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                Cookies & Local Storage Policy
              </h2>
              <p className="text-xs text-[#1C1917]/70">
                Detailed disclosure of browser cookies, local web storage, and your privacy toggles.
              </p>
            </header>

            {/* Quick Management Trigger */}
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <strong className="text-sm font-serif text-[#1C1917] block">Manage Your Cookie Preferences Now</strong>
                <p className="text-xs text-[#1C1917]/70 mt-0.5">Toggle optional performance and functional cookies at any time.</p>
              </div>
              <button
                type="button"
                onClick={triggerCookieModal}
                className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
              >
                Open Cookie Settings
              </button>
            </div>

            {/* Section 1: What Are Cookies */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                1. What Are Cookies and Local Storage?
              </h3>
              <p>
                Cookies and browser local storage are small text packets saved to your device when visiting web domains. They allow our website to remember your unstitched suits inside your shopping cart as you navigate between Men’s and Women’s pages without losing your selection.
              </p>
            </section>

            {/* Section 2: Detailed Cookie Breakdown Table */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                2. Categories of Cookies Used
              </h3>

              <div className="overflow-x-auto border border-[#E2E8F0]">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#1C1917]">
                    <tr>
                      <th className="py-2.5 px-3">Cookie Category</th>
                      <th className="py-2.5 px-3">Purpose & Technical Usage</th>
                      <th className="py-2.5 px-3">Retention</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-[#1C1917]/80">
                    <tr>
                      <td className="py-3 px-3 font-semibold text-[#1C1917]">
                        Strictly Necessary
                      </td>
                      <td className="py-3 px-3">
                        Maintains cart items, shopping bag counts, checkout step state, and stores your privacy consent selection.
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">Session / 1 Year</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold">Always Required</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-[#1C1917]">
                        Functional Preferences
                      </td>
                      <td className="py-3 px-3">
                        Remembers your selected fabric weight filters (GSM), thread counts, and preferred seasonal category.
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">6 Months</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold">User Opt-In</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-[#1C1917]">
                        Performance & Analytics
                      </td>
                      <td className="py-3 px-3">
                        Anonymized aggregate performance logs (catalog load speeds, UI responsiveness) with zero third-party data broker sharing.
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">30 Days</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold">User Opt-In</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3: Third Party Embeds (Google Maps) */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                3. Third-Party Embeds & Sandboxed iframes
              </h3>
              <p>
                To help customers easily find our physical store at 170 Paris Bazaar, Rawalpindi, our Location page embeds an interactive Google Maps frame. We configure this embed with strict security:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
                <li><code>loading="lazy"</code> to ensure no network calls occur until you scroll to the map.</li>
                <li><code>referrerpolicy="no-referrer-when-downgrade"</code> to prevent leaking browsing data.</li>
                <li>No advertising tracking scripts from social networks or data brokers are loaded.</li>
              </ul>
            </section>
          </article>
        )}

        {/* ============================================================ */}
        {/* TAB 4: FABRIC ORDER & DISPATCH POLICY */}
        {/* ============================================================ */}
        {activeTab === 'refund' && (
          <article className="space-y-8 bg-white p-6 sm:p-10 border border-[#E2E8F0] shadow-xs">
            <header className="border-b border-[#E2E8F0] pb-6 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#0284C7]/10 text-[#0284C7] font-bold">
                  Fresh Cut Guarantee
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-blue-100 text-blue-900 font-bold">
                  Cash on Delivery &amp; Mobile Wallet
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                Fabric Order &amp; Delivery Policy
              </h2>
              <p className="text-xs text-[#1C1917]/70">
                Transparent guidance on custom-cut unstitched Pakistani textiles and courier dispatch.
              </p>
            </header>

            {/* Policy Highlights Banner */}
            <div className="p-5 bg-[#F8FAFC] border border-[#E2E8F0] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#0284C7]/10 text-[#0284C7] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-sm font-serif text-[#1C1917]">Authentic Yardage Guarantee</strong>
                  <p className="text-[#1C1917]/70 mt-0.5">Every bolt cut is measured precisely with authentic unstitched yardage.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#0284C7]/10 text-[#0284C7] shrink-0">
                  <Truck className="w-5 h-5 text-[#0284C7]" />
                </div>
                <div>
                  <strong className="block text-sm font-serif text-[#1C1917]">Nationwide Courier Delivery</strong>
                  <p className="text-[#1C1917]/70 mt-0.5">Dispatched across 200+ Pakistani cities with live courier tracking.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#0284C7]/10 text-[#0284C7] shrink-0">
                  <Phone className="w-5 h-5 text-[#0284C7]" />
                </div>
                <div>
                  <strong className="block text-sm font-serif text-[#1C1917]">Direct Desk Support</strong>
                  <p className="text-[#1C1917]/70 mt-0.5">Assistance via official WhatsApp (0334-6565636) for any delivery inquiries.</p>
                </div>
              </div>
            </div>

            {/* Section 1: Custom-Cut Unstitched Textile Policy (No Returns) */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                1. Custom-Cut Unstitched Textile Terms (Final Sale)
              </h3>
              <p>
                All unstitched fabrics (Boski silk, Wash and Wear, Kamalia Khaddar, Karandi, and Lawn) are individually measured and cut from rolls specifically for your order. Because each piece is cut to custom customer orders:
              </p>
              <div className="p-4 bg-amber-50/70 border border-amber-200 text-amber-950 text-xs space-y-2">
                <strong className="font-semibold block text-amber-900">
                  Custom-Cut Policy:
                </strong>
                <p>
                  Once fabric is measured and cut from the wholesale bolt, returns, exchanges, and cancellations are not available. Please verify your selected fabric, yardage, color, and weight before confirming your order.
                </p>
              </div>

              <div className="p-4 bg-red-50/60 border border-red-200 text-red-950 text-xs space-y-2">
                <strong className="font-semibold block text-red-900">
                  Strict Exclusions:
                </strong>
                <ul className="list-disc list-inside space-y-1">
                  <li>No returns, exchanges, or refund claims once bolts are measured and cut from master rolls.</li>
                  <li>Fabrics that have been tailored, scissor-cut, soaked in water (tarr-karna), or washed.</li>
                  <li>Custom-cut bolts from wholesale master rolls are final sale.</li>
                </ul>
              </div>
            </section>

            {/* Section 2: Transit Damage & Discrepancy Replacement */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                2. Transit Damage & Discrepancy Replacement
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <div>
                    <strong className="text-[#1C1917] block font-semibold">Immediate WhatsApp Notification (Within 24 Hours)</strong>
                    <p className="text-[#1C1917]/70 mt-0.5">
                      In the rare event that your courier parcel arrives damaged or with an incorrect suit dispatched, message our Paris Bazaar desk at <strong>0334-6565636</strong> within <strong>24 hours</strong> of delivery with unboxing photos.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <div>
                    <strong className="text-[#1C1917] block font-semibold">Prompt Exchange Dispatch</strong>
                    <p className="text-[#1C1917]/70 mt-0.5">
                      Our dispatch team will immediately review your inquiry and arrange a complimentary replacement dispatch at zero additional courier cost to you.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Nationwide Courier Delivery Terms */}
            <section className="space-y-3 text-xs sm:text-sm text-[#1C1917]/85 leading-relaxed">
              <h3 className="font-serif text-lg font-bold text-[#1C1917] border-b border-[#E2E8F0] pb-1">
                3. Courier Delivery & Tracking
              </h3>
              <p className="text-xs text-[#1C1917]/80">
                Parcels are dispatched daily from our Paris Bazaar shop via trusted domestic couriers (TCS, Leopards, and PostEx). Standard transit duration is 2 to 4 working days across Pakistan. Customers receive a live tracking SMS upon shipment. Cash on Delivery (COD), EasyPaisa, and JazzCash payments are accepted.
              </p>
            </section>
          </article>
        )}

        {/* Bottom Contact & Verification Help Strip */}
        <div className="p-6 bg-white border border-[#E2E8F0] flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0284C7]/10 text-[#0284C7] rounded-full shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif font-bold text-sm text-[#1C1917] block">
                Have questions about our policies or orders?
              </span>
              <p className="text-[#1C1917]/70">
                Call or WhatsApp our Paris Bazaar desk at <strong className="font-mono text-[#0284C7]">0334-6565636</strong> (Monday to Sunday 10am-9pm).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/location"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('location');
              }}
              className="px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0284C7] text-[#1C1917] font-semibold transition-colors"
            >
              Visit Store at 170 Paris Bazaar
            </a>
            <a
              href="https://wa.me/923346565636?text=Hello%2C%20I%20have%20an%20inquiry%20regarding%20store%20policies."
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#3d4d40] text-white font-semibold transition-colors"
            >
              WhatsApp Support
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
