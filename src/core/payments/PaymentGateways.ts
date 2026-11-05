/**
 * Object-Oriented Architecture: Payment Gateway Domain
 * Demonstrates Abstraction, Encapsulation, and Polymorphism.
 */

import { PaymentMethod, OrderPaymentDetails, CustomerDetails } from '../../types';

export interface PaymentProcessingResult {
  success: boolean;
  transactionId?: string;
  status: 'Paid' | 'Pending Verification' | 'COD';
  instructions: string;
  error?: string;
}

export abstract class AbstractPaymentGateway {
  protected readonly gatewayName: PaymentMethod;
  protected readonly officialContactNumber: string = '0334-6565636';
  protected readonly officialAccountTitle: string = 'Niaz Cloth House / Muhammad Niaz';

  constructor(name: PaymentMethod) {
    this.gatewayName = name;
  }

  public getName(): PaymentMethod {
    return this.gatewayName;
  }

  public getOfficialNumber(): string {
    return this.officialContactNumber;
  }

  public getOfficialTitle(): string {
    return this.officialAccountTitle;
  }

  abstract validate(input: {
    amount: number;
    customer: CustomerDetails;
    paymentDetails?: OrderPaymentDetails;
  }): { isValid: boolean; error?: string };

  abstract process(input: {
    orderId: string;
    amount: number;
    customer: CustomerDetails;
    paymentDetails?: OrderPaymentDetails;
  }): Promise<PaymentProcessingResult>;

  abstract getInstructions(amount: number): string;
}

/**
 * Polymorphic EasyPaisa Implementation
 */
export class EasyPaisaGateway extends AbstractPaymentGateway {
  constructor() {
    super('EasyPaisa');
  }

  public validate(input: {
    amount: number;
    customer: CustomerDetails;
    paymentDetails?: OrderPaymentDetails;
  }): { isValid: boolean; error?: string } {
    if (input.amount <= 0) {
      return { isValid: false, error: 'Order total must be greater than zero.' };
    }
    return { isValid: true };
  }

  public async process(input: {
    orderId: string;
    amount: number;
    customer: CustomerDetails;
    paymentDetails?: OrderPaymentDetails;
  }): Promise<PaymentProcessingResult> {
    const tid = input.paymentDetails?.transactionId?.trim() || `EP-PENDING-${Date.now().toString().slice(-6)}`;
    return {
      success: true,
      transactionId: tid,
      status: input.paymentDetails?.transactionId ? 'Pending Verification' : 'Pending Verification',
      instructions: `Please transfer ₨ ${input.amount.toLocaleString()} via EasyPaisa to ${this.officialContactNumber} (${this.officialAccountTitle}) and send a screenshot to WhatsApp 0334-6565636.`,
    };
  }

  public getInstructions(amount: number): string {
    return `Send ₨ ${amount.toLocaleString()} to EasyPaisa Mobile Account: ${this.officialContactNumber} (Title: ${this.officialAccountTitle}).`;
  }
}

/**
 * Polymorphic JazzCash Implementation
 */
export class JazzCashGateway extends AbstractPaymentGateway {
  constructor() {
    super('JazzCash');
  }

  public validate(input: {
    amount: number;
    customer: CustomerDetails;
    paymentDetails?: OrderPaymentDetails;
  }): { isValid: boolean; error?: string } {
    if (input.amount <= 0) {
      return { isValid: false, error: 'Order total must be greater than zero.' };
    }
    return { isValid: true };
  }

  public async process(input: {
    orderId: string;
    amount: number;
    customer: CustomerDetails;
    paymentDetails?: OrderPaymentDetails;
  }): Promise<PaymentProcessingResult> {
    const tid = input.paymentDetails?.transactionId?.trim() || `JC-PENDING-${Date.now().toString().slice(-6)}`;
    return {
      success: true,
      transactionId: tid,
      status: 'Pending Verification',
      instructions: `Please transfer ₨ ${input.amount.toLocaleString()} via JazzCash to ${this.officialContactNumber} (${this.officialAccountTitle}) and share your transaction confirmation with WhatsApp 0334-6565636.`,
    };
  }

  public getInstructions(amount: number): string {
    return `Send ₨ ${amount.toLocaleString()} to JazzCash Account: ${this.officialContactNumber} (Title: ${this.officialAccountTitle}).`;
  }
}

/**
 * Polymorphic Cash On Delivery Implementation
 */
export class CashOnDeliveryGateway extends AbstractPaymentGateway {
  constructor() {
    super('Cash on Delivery');
  }

  public validate(input: {
    amount: number;
    customer: CustomerDetails;
  }): { isValid: boolean; error?: string } {
    if (!input.customer.address || input.customer.address.trim().length < 5) {
      return { isValid: false, error: 'A complete delivery address is required for Cash on Delivery.' };
    }
    return { isValid: true };
  }

  public async process(input: {
    orderId: string;
    amount: number;
    customer: CustomerDetails;
  }): Promise<PaymentProcessingResult> {
    return {
      success: true,
      status: 'COD',
      instructions: `Your parcel will be dispatched via express courier with open-delivery inspection. Please pay ₨ ${input.amount.toLocaleString()} in cash to the rider at your doorstep.`,
    };
  }

  public getInstructions(amount: number): string {
    return `Pay ₨ ${amount.toLocaleString()} in cash upon delivery to the courier rider.`;
  }
}

/**
 * Polymorphic Factory Dispatcher
 */
export class PaymentGatewayFactory {
  private static gateways: Map<PaymentMethod, AbstractPaymentGateway> = new Map();

  static {
    const ep = new EasyPaisaGateway();
    const jc = new JazzCashGateway();
    const cod = new CashOnDeliveryGateway();

    this.gateways.set('EasyPaisa', ep);
    this.gateways.set('JazzCash', jc);
    this.gateways.set('Cash on Delivery', cod);
  }

  public static getGateway(method: PaymentMethod): AbstractPaymentGateway {
    const gateway = this.gateways.get(method);
    if (!gateway) {
      // Default fallback to Cash on Delivery
      return this.gateways.get('Cash on Delivery')!;
    }
    return gateway;
  }
}
