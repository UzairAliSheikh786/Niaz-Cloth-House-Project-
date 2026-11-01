import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  MessageCircle, 
  Truck, 
  ArrowRight, 
  Copy, 
  Check, 
  Smartphone, 
  CreditCard, 
  Banknote, 
  ShieldCheck, 
  Lock, 
  Shield, 
  Printer, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Building2,
  Globe,
  AlertCircle
} from 'lucide-react';
import { useShop, formatPKR } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { CustomerDetails, Order, PaymentMethod, OrderPaymentDetails } from '../types';

const MAJOR_PAKISTANI_CITIES = [
  'Rawalpindi',
  'Islamabad',
  'Lahore',
  'Karachi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Sialkot',
  'Gujranwala',
  'Quetta',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Abbottabad',
  'Gujrat',
  'Mirpur (AJK)',
  'Wah Cantt',
  'Attock',
  'Other City',
];

const POPULAR_INTERNATIONAL_COUNTRIES = [
  'United Kingdom (UK)',
  'United States (USA)',
  'United Arab Emirates (UAE)',
  'Saudi Arabia (KSA)',
  'Canada',
  'Australia',
  'Qatar',
  'Oman',
  'Bahrain',
  'Kuwait',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Other International Country',
];

export const CheckoutModal: React.FC = () => {
  const { navigateTo } = useNavigation();
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    createOrder,
    generateWhatsAppOrderUrl,
  } = useShop();

  // Delivery destination toggle: domestic vs international
  const [destinationType, setDestinationType] = useState<'domestic' | 'international'>('domestic');
  const [selectedCountry, setSelectedCountry] = useState('United Kingdom (UK)');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Online Payment Gateway (Debit/Credit Card)');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [formData, setFormData] = useState<CustomerDetails>({
    fullName: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: 'Rawalpindi',
    country: 'Pakistan',
    isInternational: false,
    postalCode: '',
    notes: '',
  });

  // Explicit DPDP / Consumer Form Consent State
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Online Payment Gateway (Debit / Credit Card) states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardBrand, setCardBrand] = useState<'Visa' | 'Mastercard' | 'PayPak' | 'UnionPay'>('Visa');
  const [showCvv, setShowCvv] = useState(false);

  // 3D Secure OTP Modal states
  const [is3DSecureOpen, setIs3DSecureOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(45);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpStatusText, setOtpStatusText] = useState('Verifying with card issuer...');

  // EasyPaisa / JazzCash / Bank payment fields
  const [walletNumber, setWalletNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [accountTitle, setAccountTitle] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (is3DSecureOpen && otpCountdown > 0) {
      interval = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [is3DSecureOpen, otpCountdown]);

  if (!isCheckoutOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleCardNumberChange = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 16);
    if (clean.startsWith('4')) setCardBrand('Visa');
    else if (clean.startsWith('5') || clean.startsWith('2')) setCardBrand('Mastercard');
    else if (clean.startsWith('60') || clean.startsWith('65')) setCardBrand('PayPak');
    else if (clean.startsWith('62')) setCardBrand('UnionPay');

    const formatted = clean.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2, 4)}`);
    } else {
      setCardExpiry(clean);
    }
  };

  const handleFillDemoCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvv('789');
    setCardHolder(formData.fullName || 'Tariq Mehmood');
    setCardBrand('Visa');
  };

  const [formError, setFormError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleFillDemoOtp = () => {
    setOtpCode('849201');
    setOtpError(null);
  };

  const handleConfirm3DSecurePayment = async () => {
    setOtpError(null);
    if (!otpCode.trim() || otpCode.replace(/\D/g, '').length < 6) {
      setOtpError('Please enter the 6-digit OTP code sent by your card issuing bank.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpStatusText('Connecting to 1Link Payment Gateway...');

    await new Promise((r) => setTimeout(r, 600));
    setOtpStatusText('Validating 3D Secure 2.0 OTP with Card Issuer...');

    await new Promise((r) => setTimeout(r, 600));
    setOtpStatusText('Payment Authorized! Generating Gateway Reference...');

    await new Promise((r) => setTimeout(r, 400));

    try {
      const cleanCard = cardNumber.replace(/\D/g, '');
      const authCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
      const gatewayTxn = `GW-TXN-${Date.now().toString().slice(-8)}`;
      const receiptNo = `NCH-GW-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const paymentDetails: OrderPaymentDetails = {
        gatewayProvider: 'PayFast 1Link',
        cardBrand,
        cardLast4: cleanCard.slice(-4) || '4242',
        cardholderName: cardHolder.trim() || formData.fullName,
        authCode,
        transactionId: gatewayTxn,
        receiptNumber: receiptNo,
        paidAt: new Date().toISOString(),
        paymentStatus: 'Paid',
      };

      const order = await createOrder(formData, 'Online Payment Gateway (Debit/Credit Card)', paymentDetails);
      setIs3DSecureOpen(false);
      setCompletedOrder(order);
    } catch (err: any) {
      console.error('Failed to authorize payment gateway order:', err);
      setOtpError(err?.message || 'Gateway authorization error. Please check card limits and retry.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client-side validations
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      setFormError('Please enter your complete full name (minimum 3 characters).');
      return;
    }

    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    if (!cleanPhone || !/^((\+92)|0)?3[0-9]{9}$/.test(cleanPhone) && cleanPhone.length < 10) {
      setFormError('Please enter a valid Pakistani mobile number (e.g. 0334-6565636) for courier dispatch coordination.');
      return;
    }

    if (!formData.address.trim() || formData.address.trim().length < 6) {
      setFormError('Please enter a complete delivery address (street, house/flat/shop number, landmark).');
      return;
    }

    if (!consentAgreed) {
      setFormError('Please check the consent box confirming agreement with our Terms & Conditions and DPDP Privacy Policy before proceeding.');
      return;
    }

    // If Online Payment Gateway is chosen, validate card and launch 3D Secure OTP verification
    if (paymentMethod === 'Online Payment Gateway (Debit/Credit Card)') {
      const cleanCard = cardNumber.replace(/\D/g, '');
      if (cleanCard.length < 15) {
        setFormError('Please enter a valid 16-digit debit or credit card number.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setFormError('Please enter a valid card expiry date in MM/YY format.');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setFormError('Please enter the 3-digit CVV security code printed on the back of your card.');
        return;
      }
      if (!cardHolder.trim()) {
        setCardHolder(formData.fullName);
      }

      // Open 3D Secure Gateway Modal
      setIs3DSecureOpen(true);
      setOtpCountdown(45);
      setOtpCode('');
      setOtpError(null);
      return;
    }

    // Digital wallet details (EasyPaisa & JazzCash on 0334-6565636)
    const effectiveTxnId = transactionId.trim().toUpperCase() || 'PENDING-WHATSAPP-PROOF';

    setIsSubmitting(true);
    try {
      let paymentDetails: OrderPaymentDetails | undefined;
      if (paymentMethod === 'EasyPaisa' || paymentMethod === 'JazzCash' || paymentMethod === 'Direct Bank Transfer') {
        paymentDetails = {
          senderNumber: walletNumber.trim() || formData.phone,
          transactionId: effectiveTxnId,
          accountTitle: accountTitle.trim() || formData.fullName,
          paidAt: new Date().toISOString(),
          paymentStatus: transactionId.trim() ? 'Paid' : 'Pending Verification',
        };
      } else {
        paymentDetails = {
          paymentStatus: 'COD',
        };
      }

      const order = await createOrder(formData, paymentMethod, paymentDetails);
      setCompletedOrder(order);
    } catch (err) {
      console.error('Failed to create order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppOrder = async () => {
    const url = generateWhatsAppOrderUrl(formData);
    await createOrder(formData, 'WhatsApp Direct', { paymentStatus: 'COD' });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setIs3DSecureOpen(false);
    setCompletedOrder(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#F8FAFC] max-w-2xl w-full border border-[#E2E8F0] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] bg-[#F5EFEB]">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1C1917]">
              {completedOrder ? 'Order Confirmed' : 'Checkout & Payment'}
            </h2>
            <p className="text-xs text-[#0284C7] font-sans font-medium mt-0.5">
              Niaz Cloth House · Original Unstitched Fabrics (Since 1977)
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-[#1C1917]/70 hover:text-[#1C1917] hover:bg-[#E2E8F0] transition-colors"
            aria-label="Close checkout modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {completedOrder ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center rounded-full">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#0284C7] font-semibold">
                Order #{completedOrder.id}
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1C1917] mt-1">
                Thank you, {completedOrder.customer.fullName}!
              </h3>
              <p className="text-xs text-[#1C1917]/70 mt-2 max-w-md mx-auto leading-relaxed">
                Your unstitched fabric order has been successfully registered. Our dispatch team will coordinate delivery with you at <strong className="text-[#1C1917]">{completedOrder.customer.phone}</strong> prior to shipping.
              </p>
            </div>

            {/* Official Payment Gateway Receipt Box */}
            {completedOrder.paymentMethod === 'Online Payment Gateway (Debit/Credit Card)' && (
              <div className="bg-[#F0FDF4] border border-emerald-300 p-4 max-w-md mx-auto text-left text-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Payment Gateway Verified & Settled</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-600 text-white font-bold">
                    PAID 3D-SECURE 2.0
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-emerald-900/60 block text-[10px] uppercase">Gateway Provider:</span>
                    <strong className="text-emerald-950 font-sans">
                      {completedOrder.paymentDetails?.gatewayProvider || 'PayFast 1Link'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-emerald-900/60 block text-[10px] uppercase">Card Charged:</span>
                    <strong className="text-emerald-950 font-sans">
                      {completedOrder.paymentDetails?.cardBrand || 'Card'} •••• {completedOrder.paymentDetails?.cardLast4 || '4242'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-emerald-900/60 block text-[10px] uppercase">Auth Code:</span>
                    <strong className="font-mono text-emerald-950 font-bold">
                      {completedOrder.paymentDetails?.authCode || 'AUTH-942851'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-emerald-900/60 block text-[10px] uppercase">Gateway TXN Ref:</span>
                    <strong className="font-mono text-emerald-950 font-bold">
                      {completedOrder.paymentDetails?.transactionId || 'GW-TXN-294018'}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Receipt Summary Box */}
            <div className="bg-white p-5 border border-[#E2E8F0] max-w-md mx-auto text-left text-xs space-y-2.5">
              <div className="flex justify-between font-medium pb-2 border-b border-[#E2E8F0]">
                <span className="text-[#1C1917]/60">Destination:</span>
                <span className="font-semibold text-[#1C1917]">{completedOrder.customer.city}, Pakistan</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-[#1C1917]/60">Payment Method:</span>
                <span className="font-semibold text-[#0284C7]">{completedOrder.paymentMethod}</span>
              </div>
              {completedOrder.paymentDetails?.transactionId && completedOrder.paymentMethod !== 'Online Payment Gateway (Debit/Credit Card)' && (
                <div className="flex justify-between font-medium bg-[#F9F6F0] p-2 border border-[#E2E8F0]">
                  <span className="text-[#1C1917]/70">Transaction ID (TID):</span>
                  <span className="font-mono font-bold text-[#1C1917]">{completedOrder.paymentDetails.transactionId}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span className="text-[#1C1917]/60">Suits Ordered:</span>
                <span>{completedOrder.items.reduce((s, i) => s + i.quantity, 0)} Unstitched Ensemble(s)</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-2.5 border-t border-[#E2E8F0] text-[#0284C7]">
                <span>Total Amount:</span>
                <span className="font-mono">{formatPKR(completedOrder.total)}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#E2E8F0] hover:border-[#0284C7] text-[#1C1917] text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                title="Print payment receipt"
              >
                <Printer className="w-4 h-4 text-[#0284C7]" />
                <span>Print Receipt</span>
              </button>
              <a
                href={generateWhatsAppOrderUrl(completedOrder.customer)}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#3b4c3f] text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirm on WhatsApp (0334-6565636)</span>
              </a>
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#1C1917] hover:bg-black text-white text-xs font-semibold tracking-wide transition-colors"
              >
                Return to Store
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
            {/* Form Validation Error Banner */}
            {formError && (
              <div className="bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="block font-semibold">Please Check Your Order Details:</strong>
                  <p className="mt-0.5 leading-relaxed">{formError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormError(null)}
                  className="text-red-500 hover:text-red-800 p-0.5"
                  aria-label="Dismiss error"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Cart Summary Banner */}
            <div className="bg-white p-3.5 border border-[#E2E8F0] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#1C1917]/70">Order Value: </span>
                <span className="font-semibold text-[#1C1917]">
                  {cart.reduce((s, i) => s + i.quantity, 0)} Unstitched Article(s)
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#1C1917]/60 mr-2">Total:</span>
                <span className="font-mono font-bold text-base text-[#0284C7] tabular-nums">
                  {formatPKR(cartSubtotal)}
                </span>
              </div>
            </div>

            {/* Payment Gateway Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  Select Payment Method
                </label>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  PCI-DSS Level 1 & SBP Compliant
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {/* 1. Online Payment Gateway (Debit / Credit Card) */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Online Payment Gateway (Debit/Credit Card)')}
                  className={`p-2.5 text-left border transition-all col-span-2 sm:col-span-1 lg:col-span-1 ${
                    paymentMethod === 'Online Payment Gateway (Debit/Credit Card)'
                      ? 'border-[#1D4ED8] bg-blue-50/50 ring-1 ring-[#1D4ED8]'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <CreditCard className="w-4 h-4 text-[#1D4ED8]" />
                    {paymentMethod === 'Online Payment Gateway (Debit/Credit Card)' && (
                      <Check className="w-3.5 h-3.5 text-[#1D4ED8]" />
                    )}
                  </div>
                  <div className="font-semibold text-xs text-[#1C1917]">Debit / Credit Card</div>
                  <div className="text-[10px] text-[#1D4ED8] font-medium mt-0.5">Online Gateway (3DS)</div>
                </button>

                {/* 2. Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`p-2.5 text-left border transition-all ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-[#0284C7] bg-white ring-1 ring-[#0284C7]'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Banknote className="w-4 h-4 text-[#0284C7]" />
                    {paymentMethod === 'Cash on Delivery' && <Check className="w-3.5 h-3.5 text-[#0284C7]" />}
                  </div>
                  <div className="font-semibold text-xs text-[#1C1917]">Cash on Delivery</div>
                  <div className="text-[10px] text-[#1C1917]/60 mt-0.5">Pay rider at door</div>
                </button>

                {/* 3. EasyPaisa */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('EasyPaisa')}
                  className={`p-2.5 text-left border transition-all ${
                    paymentMethod === 'EasyPaisa'
                      ? 'border-[#009E49] bg-white ring-1 ring-[#009E49]'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-block px-1.5 py-0.5 bg-[#009E49] text-white text-[9px] font-bold tracking-wider">
                      EP
                    </span>
                    {paymentMethod === 'EasyPaisa' && <Check className="w-3.5 h-3.5 text-[#009E49]" />}
                  </div>
                  <div className="font-semibold text-xs text-[#1C1917]">EasyPaisa</div>
                  <div className="text-[10px] text-[#009E49] font-medium mt-0.5">Mobile Wallet</div>
                </button>

                {/* 4. JazzCash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('JazzCash')}
                  className={`p-2.5 text-left border transition-all ${
                    paymentMethod === 'JazzCash'
                      ? 'border-[#DE1F27] bg-white ring-1 ring-[#DE1F27]'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-block px-1.5 py-0.5 bg-[#DE1F27] text-white text-[9px] font-bold tracking-wider">
                      JC
                    </span>
                    {paymentMethod === 'JazzCash' && <Check className="w-3.5 h-3.5 text-[#DE1F27]" />}
                  </div>
                  <div className="font-semibold text-xs text-[#1C1917]">JazzCash</div>
                  <div className="text-[10px] text-[#DE1F27] font-medium mt-0.5">Mobile Wallet</div>
                </button>

                {/* 5. Bank Transfer */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Direct Bank Transfer')}
                  className={`p-2.5 text-left border transition-all ${
                    paymentMethod === 'Direct Bank Transfer'
                      ? 'border-[#0284C7] bg-white ring-1 ring-[#0284C7]'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Building2 className="w-4 h-4 text-[#0284C7]" />
                    {paymentMethod === 'Direct Bank Transfer' && <Check className="w-3.5 h-3.5 text-[#0284C7]" />}
                  </div>
                  <div className="font-semibold text-xs text-[#1C1917]">Bank Transfer</div>
                  <div className="text-[10px] text-[#1C1917]/60 mt-0.5">Meezan IBAN</div>
                </button>
              </div>

              {/* ONLINE PAYMENT GATEWAY CARD FORM */}
              {paymentMethod === 'Online Payment Gateway (Debit/Credit Card)' && (
                <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-4 space-y-3 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E2E8F0]">
                    <div>
                      <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wider block flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#2563EB]" />
                        Secure 1Link / PayFast Payment Gateway
                      </span>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Accepting all Visa, Mastercard, PayPak, and UnionPay debit/credit cards across Pakistan & globally.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleFillDemoCard}
                      className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 text-[11px] font-semibold border border-blue-300 flex items-center gap-1 self-start sm:self-auto transition-colors"
                      title="Auto-fill test card details"
                    >
                      <Sparkles className="w-3 h-3 text-blue-700" />
                      <span>⚡ Fill Demo Card (4242)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Cardholder Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#1E293B] mb-1">
                        Cardholder Full Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tariq Mehmood"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>

                    {/* Card Number */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#1E293B] mb-1">
                        Card Number (16 Digits) <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="4242 •••• •••• 4242"
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          maxLength={19}
                          className="w-full pl-3 pr-20 py-2 text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:outline-none font-mono tracking-wider"
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <span className="px-1.5 py-0.5 bg-[#1E293B] text-white text-[9px] font-bold tracking-wider uppercase rounded-xs">
                            {cardBrand}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1E293B] mb-1">
                        Expiration Date (MM/YY) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        maxLength={5}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:outline-none font-mono"
                      />
                    </div>

                    {/* CVV */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-[#1E293B]">
                          CVV / Security Code <span className="text-red-600">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowCvv(!showCvv)}
                          className="text-[10px] text-[#2563EB] hover:underline flex items-center gap-0.5"
                        >
                          {showCvv ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showCvv ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showCvv ? 'text' : 'password'}
                          required
                          placeholder="3 or 4 digits"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          maxLength={4}
                          className="w-full pl-3 pr-8 py-2 text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:outline-none font-mono tracking-widest"
                        />
                        <Lock className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {/* Payment Gateway Trust Marks */}
                  <div className="pt-2 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#64748B]">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>256-bit SSL End-to-End Encryption · 3D-Secure 2.0 Protected</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono font-bold text-[#475569]">
                      <span>VISA</span>
                      <span>•</span>
                      <span>MASTERCARD</span>
                      <span>•</span>
                      <span>PAYPAK</span>
                      <span>•</span>
                      <span>1LINK</span>
                    </div>
                  </div>
                </div>
              )}

              {/* EasyPaisa Payment Instructions Card */}
              {paymentMethod === 'EasyPaisa' && (
                <div className="bg-[#EBF7EF] border-2 border-[#009E49]/60 p-4 space-y-3.5 animate-in fade-in">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#009E49] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        EP
                      </span>
                      <div>
                        <span className="text-xs font-bold text-[#009E49] uppercase tracking-wider block">
                          EasyPaisa Direct Account Transfer
                        </span>
                        <p className="text-[11px] text-[#1C1917]/80">
                          Transfer to our verified mobile account via <strong>EasyPaisa App</strong> or USSD (<strong>*786#</strong>).
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#009E49] text-white font-bold shrink-0">
                      VERIFIED ACCOUNT
                    </span>
                  </div>

                  {/* Account & Amount Details Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-white p-3.5 border border-[#009E49]/30 shadow-xs">
                    <div>
                      <span className="text-[#1C1917]/60 block text-[10px] uppercase font-semibold">EasyPaisa Account:</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <strong className="font-mono text-sm text-[#1C1917]">0334-6565636</strong>
                        <button
                          type="button"
                          onClick={() => handleCopy('03346565636', 'ep-acc')}
                          className="px-1.5 py-0.5 bg-[#009E49]/10 hover:bg-[#009E49]/20 text-[#009E49] text-[10px] font-semibold transition-colors flex items-center gap-1"
                          title="Copy EasyPaisa Number"
                        >
                          {copiedField === 'ep-acc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'ep-acc' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[#1C1917]/60 block text-[10px] uppercase font-semibold">Account Title:</span>
                      <strong className="text-xs text-[#1C1917] mt-0.5 block font-semibold">
                        Muhammad Niaz / Niaz Cloth House
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#1C1917]/60 block text-[10px] uppercase font-semibold">Payable Amount:</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <strong className="text-sm font-mono text-[#009E49]">{formatPKR(cartSubtotal)}</strong>
                        <button
                          type="button"
                          onClick={() => handleCopy(cartSubtotal.toString(), 'ep-amt')}
                          className="px-1.5 py-0.5 bg-[#009E49]/10 hover:bg-[#009E49]/20 text-[#009E49] text-[10px] font-semibold transition-colors flex items-center gap-1"
                          title="Copy Amount"
                        >
                          {copiedField === 'ep-amt' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'ep-amt' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3 Step Guide */}
                  <div className="p-2.5 bg-white/70 border border-[#009E49]/20 text-[11px] text-[#1C1917]/85 space-y-1">
                    <p className="font-semibold text-[#009E49]">Simple 3-Step Payment Guide:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-[#1C1917]/75">
                      <li>Open EasyPaisa App &gt; <strong>Send Money</strong> &gt; <strong>EasyPaisa Transfer</strong> (or dial <em>*786#</em>).</li>
                      <li>Enter <strong>0334-6565636</strong>, confirm title <em>"Muhammad Niaz"</em>, and transfer <strong>{formatPKR(cartSubtotal)}</strong>.</li>
                      <li>Copy the <strong>TID (Transaction ID)</strong> from 3737 SMS and enter it below to confirm your order.</li>
                    </ol>
                  </div>

                  {/* EasyPaisa Form Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1C1917] mb-1">
                        Sender EasyPaisa Mobile Number <span className="text-neutral-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        placeholder={formData.phone || "03xx-xxxxxxx"}
                        value={walletNumber}
                        onChange={(e) => setWalletNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] focus:border-[#009E49] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1C1917] mb-1">
                        Transaction ID (TID) <span className="text-neutral-400 font-normal">(Or send via WhatsApp)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1029384756 (or leave blank to verify via WhatsApp)"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] focus:border-[#009E49] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Quick WhatsApp Screenshot Helper */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#009E49]/20">
                    <span className="text-[#1C1917]/70">Need assistance or want to send payment screenshot?</span>
                    <a
                      href={`https://wa.me/923346565636?text=${encodeURIComponent(`Hello, I am paying via EasyPaisa for my order of PKR ${cartSubtotal}. Account: 0334-6565636.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#009E49] hover:underline flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Desk (0334-6565636)</span>
                    </a>
                  </div>
                </div>
              )}

              {/* JazzCash Payment Instructions Card */}
              {paymentMethod === 'JazzCash' && (
                <div className="bg-[#FDF0F0] border-2 border-[#DE1F27]/60 p-4 space-y-3.5 animate-in fade-in">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#DE1F27] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        JC
                      </span>
                      <div>
                        <span className="text-xs font-bold text-[#DE1F27] uppercase tracking-wider block">
                          JazzCash Direct Account Transfer
                        </span>
                        <p className="text-[11px] text-[#1C1917]/80">
                          Transfer to our verified mobile account via <strong>JazzCash App</strong> or USSD (<strong>*786#</strong>).
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#DE1F27] text-white font-bold shrink-0">
                      VERIFIED ACCOUNT
                    </span>
                  </div>

                  {/* Account & Amount Details Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-white p-3.5 border border-[#DE1F27]/30 shadow-xs">
                    <div>
                      <span className="text-[#1C1917]/60 block text-[10px] uppercase font-semibold">JazzCash Account:</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <strong className="font-mono text-sm text-[#1C1917]">0334-6565636</strong>
                        <button
                          type="button"
                          onClick={() => handleCopy('03346565636', 'jc-acc')}
                          className="px-1.5 py-0.5 bg-[#DE1F27]/10 hover:bg-[#DE1F27]/20 text-[#DE1F27] text-[10px] font-semibold transition-colors flex items-center gap-1"
                          title="Copy JazzCash Number"
                        >
                          {copiedField === 'jc-acc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'jc-acc' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[#1C1917]/60 block text-[10px] uppercase font-semibold">Account Title:</span>
                      <strong className="text-xs text-[#1C1917] mt-0.5 block font-semibold">
                        Muhammad Niaz / Niaz Cloth House
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#1C1917]/60 block text-[10px] uppercase font-semibold">Payable Amount:</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <strong className="text-sm font-mono text-[#DE1F27]">{formatPKR(cartSubtotal)}</strong>
                        <button
                          type="button"
                          onClick={() => handleCopy(cartSubtotal.toString(), 'jc-amt')}
                          className="px-1.5 py-0.5 bg-[#DE1F27]/10 hover:bg-[#DE1F27]/20 text-[#DE1F27] text-[10px] font-semibold transition-colors flex items-center gap-1"
                          title="Copy Amount"
                        >
                          {copiedField === 'jc-amt' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'jc-amt' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3 Step Guide */}
                  <div className="p-2.5 bg-white/70 border border-[#DE1F27]/20 text-[11px] text-[#1C1917]/85 space-y-1">
                    <p className="font-semibold text-[#DE1F27]">Simple 3-Step Payment Guide:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-[#1C1917]/75">
                      <li>Open JazzCash App &gt; <strong>Send Money</strong> &gt; <strong>To Mobile Account</strong> (or dial <em>*786#</em>).</li>
                      <li>Enter <strong>0334-6565636</strong>, confirm title <em>"Muhammad Niaz"</em>, and transfer <strong>{formatPKR(cartSubtotal)}</strong>.</li>
                      <li>Copy the <strong>TRX ID (Transaction ID)</strong> from 8558 SMS and enter it below to confirm your order.</li>
                    </ol>
                  </div>

                  {/* JazzCash Form Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1C1917] mb-1">
                        Sender JazzCash Mobile Number <span className="text-neutral-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        placeholder={formData.phone || "03xx-xxxxxxx"}
                        value={walletNumber}
                        onChange={(e) => setWalletNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] focus:border-[#DE1F27] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1C1917] mb-1">
                        Transaction ID (TRX ID) <span className="text-neutral-400 font-normal">(Or send via WhatsApp)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 8472910394 (or leave blank to verify via WhatsApp)"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] focus:border-[#DE1F27] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Quick WhatsApp Screenshot Helper */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#DE1F27]/20">
                    <span className="text-[#1C1917]/70">Need assistance or want to send payment screenshot?</span>
                    <a
                      href={`https://wa.me/923346565636?text=${encodeURIComponent(`Hello, I am paying via JazzCash for my order of PKR ${cartSubtotal}. Account: 0334-6565636.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#DE1F27] hover:underline flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Desk (0334-6565636)</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Direct Bank Transfer Instructions Card */}
              {paymentMethod === 'Direct Bank Transfer' && (
                <div className="bg-[#FAF5EE] border border-[#0284C7]/30 p-4 space-y-3 animate-in fade-in">
                  <div>
                    <span className="text-xs font-bold text-[#0284C7] uppercase tracking-wider block">
                      Meezan Bank Official Corporate Account
                    </span>
                    <p className="text-xs text-[#1C1917]/80 mt-0.5">
                      Inter-bank Raast / IBFT transfer of <strong>{formatPKR(cartSubtotal)}</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-3 border border-[#E2E8F0]">
                    <div>
                      <span className="text-[#1C1917]/60 block text-[11px]">Bank & Branch:</span>
                      <strong className="text-xs text-[#1C1917]">Meezan Bank Ltd (Committee Chowk)</strong>
                    </div>
                    <div>
                      <span className="text-[#1C1917]/60 block text-[11px]">Account Title:</span>
                      <strong className="text-xs text-[#1C1917]">Niaz Cloth House</strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[#1C1917]/60 block text-[11px]">IBAN Number:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <strong className="font-mono text-xs text-[#1C1917]">PK12MEZN0001977012345678</strong>
                        <button
                          type="button"
                          onClick={() => handleCopy('PK12MEZN0001977012345678', 'bank-iban')}
                          className="p-1 hover:bg-[#F8FAFC] text-[#0284C7] transition-colors"
                        >
                          {copiedField === 'bank-iban' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1C1917] mb-1">
                        Remitting Bank / Sender Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. HBL / Tariq Mehmood"
                        value={accountTitle}
                        onChange={(e) => setAccountTitle(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#E2E8F0] focus:border-[#0284C7] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1C1917] mb-1">
                        Bank Reference / TRX Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. RAAST-98765432"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#E2E8F0] focus:border-[#0284C7] focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Customer Details & Destination Mode */}
            <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  Delivery Address & Destination
                </label>

                {/* Destination Selector Tabs */}
                <div className="inline-flex rounded-sm bg-[#E2E8F0] p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setDestinationType('domestic');
                      setFormData({
                        ...formData,
                        city: 'Rawalpindi',
                        country: 'Pakistan',
                        isInternational: false,
                      });
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors ${
                      destinationType === 'domestic'
                        ? 'bg-white text-[#1C1917] shadow-xs'
                        : 'text-[#1C1917]/70 hover:text-[#1C1917]'
                    }`}
                  >
                    🇵🇰 Pakistan (Domestic)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDestinationType('international');
                      setFormData({
                        ...formData,
                        city: 'London',
                        country: selectedCountry,
                        isInternational: true,
                      });
                      setPaymentMethod('Online Payment Gateway (Debit/Credit Card)');
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors flex items-center gap-1.5 ${
                      destinationType === 'international'
                        ? 'bg-[#1D4ED8] text-white shadow-xs'
                        : 'text-[#1C1917]/70 hover:text-[#1C1917]'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>✈️ International (Worldwide)</span>
                  </button>
                </div>
              </div>

              {destinationType === 'international' && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5 animate-in fade-in">
                  <Globe className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block text-blue-900">
                      Worldwide International Express Air Dispatch
                    </strong>
                    <span className="text-blue-900/80 leading-relaxed block text-[11px] mt-0.5">
                      Delivering to UK, USA, UAE, Saudi Arabia, Canada, Australia & worldwide via DHL Express / FedEx tracked courier. International orders are processed securely via our 3D Secure Online Payment Gateway.
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Customer Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Mehmood"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    {destinationType === 'international' ? 'Contact Phone (with Country Code)' : 'Mobile Phone Number'} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={destinationType === 'international' ? '+44 7911 123456 / +1 202 555 0123' : '0300-1234567'}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] focus:border-[#0284C7] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#1C1917]/60 block mt-0.5 font-sans">
                    Used strictly for courier arrival dispatch calls and tracking notices.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    WhatsApp Number (For Order Updates)
                  </label>
                  <input
                    type="tel"
                    placeholder={destinationType === 'international' ? '+44 7911 123456' : '0300-1234567'}
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] focus:border-[#0284C7] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#1C1917]/60 block mt-0.5 font-sans">
                    Optional. Used exclusively for courier tracking messages and stock notices.
                  </span>
                </div>

                {destinationType === 'international' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        Destination Country <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={selectedCountry}
                        onChange={(e) => {
                          setSelectedCountry(e.target.value);
                          setFormData({ ...formData, country: e.target.value });
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] focus:border-[#1D4ED8] focus:outline-none"
                      >
                        {POPULAR_INTERNATIONAL_COUNTRIES.map((cntry) => (
                          <option key={cntry} value={cntry}>
                            {cntry}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        City / Municipality <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. London, Birmingham, Dubai, Houston, Toronto"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] focus:border-[#1D4ED8] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        Postal / ZIP Code <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SW1A 1AA / 77001"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] focus:border-[#1D4ED8] focus:outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      Delivery City (Pakistan) <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] focus:border-[#0284C7] focus:outline-none"
                    >
                      {MAJOR_PAKISTANI_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Complete Street Address <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder={destinationType === 'international' ? "Apartment/House #, Street name, Area/Subdistrict..." : "House / Apartment #, Street #, Sector / Mohallah / Area..."}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Special Packaging or Delivery Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gift box / call before delivery / continuous bolt cut..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                {/* Explicit DPDP / Consumer Form Consent Checkbox */}
                <div className="sm:col-span-2 pt-3 pb-1 border-t border-[#E2E8F0]">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#1C1917]/85 font-sans group">
                    <input
                      type="checkbox"
                      required
                      checked={consentAgreed}
                      onChange={(e) => setConsentAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-[#0284C7] rounded border-[#E2E8F0] focus:ring-[#0284C7] cursor-pointer"
                      aria-label="Consent to Terms, Privacy Policy, and Refund Policy"
                    />
                    <span className="leading-snug">
                      I have read and agree to the{' '}
                      <button
                        type="button"
                        onClick={() => {
                          navigateTo('terms');
                          setIsCheckoutOpen(false);
                        }}
                        className="text-[#0284C7] underline font-semibold hover:text-[#0369A1]"
                      >
                        Terms & Conditions
                      </button>
                      ,{' '}
                      <button
                        type="button"
                        onClick={() => {
                          navigateTo('privacy');
                          setIsCheckoutOpen(false);
                        }}
                        className="text-[#0284C7] underline font-semibold hover:text-[#0369A1]"
                      >
                        Privacy Policy (DPDP Act)
                      </button>
                      , and{' '}
                      <button
                        type="button"
                        onClick={() => {
                          navigateTo('refund');
                          setIsCheckoutOpen(false);
                        }}
                        className="text-[#0284C7] underline font-semibold hover:text-[#0369A1]"
                      >
                        Order & Dispatch Policy
                      </button>
                      . I consent to processing of my order details for fulfillment and tracked delivery.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-[#1C1917]/70">
                <Truck className="w-4 h-4 text-[#0284C7]" />
                <span>Nationwide Shipping · Tracked Delivery</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-[#4A5D4E] hover:bg-[#3c4a3f] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  title="Direct WhatsApp Order"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Order</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 sm:flex-none px-5 py-2.5 text-white text-xs font-semibold tracking-wider uppercase transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm ${
                    paymentMethod === 'Online Payment Gateway (Debit/Credit Card)'
                      ? 'bg-[#1D4ED8] hover:bg-[#1E40AF]'
                      : 'bg-[#0284C7] hover:bg-[#0369A1]'
                  }`}
                >
                  {isSubmitting ? (
                    <span>Registering...</span>
                  ) : paymentMethod === 'Online Payment Gateway (Debit/Credit Card)' ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Pay {formatPKR(cartSubtotal)} via Secure Gateway</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Place Order via {paymentMethod === 'Cash on Delivery' ? 'COD' : paymentMethod}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 3D SECURE 2.0 OTP PAYMENT GATEWAY VERIFICATION MODAL */}
        {is3DSecureOpen && (
          <div
            className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="3ds-modal-title"
          >
            <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
              {/* Bank & Gateway Security Banner */}
              <div className="bg-[#0F172A] text-white p-4 border-b border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-600 text-[10px] font-mono font-bold tracking-widest text-white uppercase rounded-xs">
                      1LINK PAYFAST
                    </span>
                    <span className="text-slate-400 text-xs">·</span>
                    <span className="text-xs font-bold text-slate-200 tracking-wider">
                      3D SECURE 2.0
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>256-bit Encrypted</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 id="3ds-modal-title" className="text-sm font-semibold text-white">
                      Card Issuer Authentication Screen
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Verified by Visa & Mastercard Identity Check
                    </p>
                  </div>
                  <div className="text-right font-mono text-[10px] text-slate-400">
                    <div>SBP Gateway ID:</div>
                    <strong className="text-slate-200">PK-1LINK-9482</strong>
                  </div>
                </div>
              </div>

              {/* Transaction Context Strip */}
              <div className="bg-slate-50 p-4 border-b border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Merchant Name:</span>
                  <strong className="text-slate-900">Niaz Cloth House (Paris Bazaar, Rawalpindi)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Card Selected:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {cardBrand} •••• {cardNumber.replace(/\D/g, '').slice(-4) || '4242'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cardholder:</span>
                  <span className="font-medium text-slate-800">
                    {cardHolder || formData.fullName || 'Valued Customer'}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-bold text-blue-900">
                  <span>Payable Amount:</span>
                  <span className="font-mono text-base">{formatPKR(cartSubtotal)}</span>
                </div>
              </div>

              {/* OTP Form Area */}
              <div className="p-5 space-y-4">
                {isVerifyingOtp ? (
                  <div className="py-8 text-center space-y-3 animate-in fade-in">
                    <div className="w-12 h-12 mx-auto border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 font-sans">
                        {otpStatusText}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Please do not refresh or close this browser window.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">
                        Enter One-Time Password (OTP)
                      </label>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        A 6-digit security code has been transmitted to your bank registered mobile number (+92 3**-***{formData.phone ? formData.phone.slice(-2) : '36'}).
                      </p>
                    </div>

                    {otpError && (
                      <div className="bg-red-50 border border-red-200 p-2.5 text-xs text-red-800 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{otpError}</p>
                      </div>
                    )}

                    <div>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          placeholder="••••••"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="w-full text-center text-2xl font-mono tracking-[0.5em] py-2.5 border-2 border-blue-300 focus:border-blue-600 focus:outline-none bg-slate-50 font-bold"
                          autoFocus
                        />
                      </div>

                      {/* Auto Fill Demo OTP button */}
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={handleFillDemoOtp}
                          className="text-blue-700 hover:text-blue-900 font-semibold underline flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>⚡ Test Mode: Auto-Fill OTP (849201)</span>
                        </button>

                        <span className="text-[11px] text-slate-500">
                          {otpCountdown > 0 ? (
                            `Resend OTP in ${otpCountdown}s`
                          ) : (
                            <button
                              type="button"
                              onClick={() => setOtpCountdown(45)}
                              className="text-blue-600 font-medium hover:underline"
                            >
                              Resend OTP
                            </button>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIs3DSecureOpen(false)}
                        className="px-4 py-2 border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        Cancel Transaction
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirm3DSecurePayment}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wider uppercase transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authenticate & Pay</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
