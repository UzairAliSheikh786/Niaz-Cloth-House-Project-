/**
 * Object-Oriented Architecture: Pricing & Discount Strategy Engine
 * Demonstrates:
 * 1. Abstraction: Abstract base strategy interface and implementation contracts.
 * 2. Polymorphism: Different discount algorithms execute through a common polymorphic method.
 * 3. Encapsulation: Pricing rules and free shipping thresholds encapsulated in cohesive classes.
 */

export interface PricingBreakdown {
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  finalTotal: number;
  isFreeShipping: boolean;
  appliedDiscountPercentage: number;
}

export abstract class AbstractPricingStrategy {
  protected readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }

  /**
   * Polymorphic method to calculate discount for an order line item or subtotal.
   */
  public abstract calculateDiscount(subtotal: number): number;
}

export class StandardRetailPricingStrategy extends AbstractPricingStrategy {
  constructor() {
    super('Standard Retail (No Promotional Markdown)');
  }

  public calculateDiscount(_subtotal: number): number {
    return 0;
  }
}

export class PromotionalSalePricingStrategy extends AbstractPricingStrategy {
  private readonly discountRate: number;

  constructor(discountRate: number) {
    super(`Promotional Campaign Sale (${discountRate}% Off)`);
    this.discountRate = Math.min(50, Math.max(1, discountRate));
  }

  public calculateDiscount(subtotal: number): number {
    return Math.round((subtotal * this.discountRate) / 100);
  }

  public getRate(): number {
    return this.discountRate;
  }
}

export class ClearanceDiscountPricingStrategy extends AbstractPricingStrategy {
  private readonly clearanceMarkdown: number;

  constructor(clearanceMarkdown: number = 25) {
    super(`Atelier Clearance (${clearanceMarkdown}% Off)`);
    this.clearanceMarkdown = clearanceMarkdown;
  }

  public calculateDiscount(subtotal: number): number {
    return Math.round((subtotal * this.clearanceMarkdown) / 100);
  }
}

/**
 * Domain Pricing Engine (Encapsulation of Order Pricing and Shipping Logic)
 */
export class PricingEngine {
  private _freeShippingThreshold: number;
  private _standardShippingFee: number;

  constructor(freeShippingThreshold: number = 5000, standardShippingFee: number = 250) {
    this._freeShippingThreshold = freeShippingThreshold;
    this._standardShippingFee = standardShippingFee;
  }

  public getFreeShippingThreshold(): number {
    return this._freeShippingThreshold;
  }

  public setFreeShippingThreshold(threshold: number): void {
    this._freeShippingThreshold = Math.max(0, threshold);
  }

  public getStandardShippingFee(): number {
    return this._standardShippingFee;
  }

  public setStandardShippingFee(fee: number): void {
    this._standardShippingFee = Math.max(0, fee);
  }

  /**
   * Calculates comprehensive order breakdown polymorphically.
   */
  public computeOrder(
    itemsSubtotal: number,
    strategy: AbstractPricingStrategy = new StandardRetailPricingStrategy()
  ): PricingBreakdown {
    const rawSubtotal = Math.max(0, itemsSubtotal);
    const discountTotal = strategy.calculateDiscount(rawSubtotal);
    const discountedSubtotal = Math.max(0, rawSubtotal - discountTotal);

    const isFreeShipping = discountedSubtotal >= this._freeShippingThreshold;
    const shippingFee = isFreeShipping ? 0 : this._standardShippingFee;
    const finalTotal = discountedSubtotal + shippingFee;

    const appliedDiscountPercentage = rawSubtotal > 0 ? Math.round((discountTotal / rawSubtotal) * 100) : 0;

    return {
      subtotal: rawSubtotal,
      discountTotal,
      shippingFee,
      finalTotal,
      isFreeShipping,
      appliedDiscountPercentage,
    };
  }
}
