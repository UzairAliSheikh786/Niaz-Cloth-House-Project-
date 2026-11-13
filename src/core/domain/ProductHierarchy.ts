/**
 * Object-Oriented Architecture: Product Domain Model Hierarchy
 * Demonstrates the 4 OOP Pillars:
 * 1. Encapsulation: Private members with public accessors and defensive validation logic.
 * 2. Abstraction: Abstract base class defining common domain contract without leaking storage details.
 * 3. Inheritance: Domain-specialized subclasses inheriting shared fabric and pricing logic.
 * 4. Polymorphism: Polymorphic pricing, discount computation, and tailoring allowance resolution.
 */

import type { Product, Gender, FabricType } from '../../types';

export abstract class AbstractProduct {
  private readonly _raw: Product;
  private readonly _id: string;
  private _title: string;
  private _price: number;
  private _originalPrice?: number;
  private _inStock: boolean;
  private _fabric: FabricType;
  private _gender: Gender;
  private _description: string;
  private _brand?: string;
  private _color: string;
  private _primaryImage: string;
  private _galleryImages: string[];
  private _rating: number;
  private _reviewsCount: number;

  constructor(product: Product) {
    this._raw = { ...product };
    this._id = product.id;
    this._title = product.title;
    this._price = Math.max(0, product.price);
    this._originalPrice = product.originalPrice && product.originalPrice > 0 ? product.originalPrice : undefined;
    this._inStock = product.inStock ?? true;
    this._fabric = product.fabric;
    this._gender = product.gender;
    this._description = product.description;
    this._brand = product.brand;
    this._color = product.color || 'Classic Ivory';
    this._primaryImage = product.primaryImage;
    this._galleryImages = Array.isArray(product.galleryImages) && product.galleryImages.length > 0 
      ? [...product.galleryImages] 
      : [product.primaryImage];
    this._rating = product.rating || 5.0;
    this._reviewsCount = product.reviewsCount || 1;
  }

  // --- Encapsulated Getters & Setters --- //

  public getId(): string {
    return this._id;
  }

  public getTitle(): string {
    return this._title;
  }

  public setTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Product title cannot be empty.');
    }
    this._title = title.trim();
  }

  public getPrice(): number {
    return this._price;
  }

  public setPrice(price: number): void {
    if (price < 0) {
      throw new Error('Price cannot be negative.');
    }
    this._price = price;
  }

  public getOriginalPrice(): number | undefined {
    return this._originalPrice;
  }

  public setOriginalPrice(origPrice?: number): void {
    this._originalPrice = origPrice && origPrice > 0 ? origPrice : undefined;
  }

  public isInStock(): boolean {
    return this._inStock;
  }

  public setInStock(status: boolean): void {
    this._inStock = status;
  }

  public getFabric(): FabricType {
    return this._fabric;
  }

  public setFabric(fabric: FabricType): void {
    this._fabric = fabric;
  }

  public getGender(): Gender {
    return this._gender;
  }

  public setGender(gender: Gender): void {
    this._gender = gender;
  }

  public getDescription(): string {
    return this._description;
  }

  public getBrand(): string | undefined {
    return this._brand;
  }

  public getColor(): string {
    return this._color;
  }

  public getPrimaryImage(): string {
    return this._primaryImage;
  }

  public getGalleryImages(): string[] {
    return [...this._galleryImages];
  }

  public getRating(): number {
    return this._rating;
  }

  public getReviewsCount(): number {
    return this._reviewsCount;
  }

  // --- Abstract Methods (Abstraction) --- //

  public abstract getCategoryClassification(): string;
  public abstract getTailoringAllowanceDays(): number;

  // --- Polymorphic Business Logic (Polymorphism) --- //

  public hasApprovedDiscount(): boolean {
    return Boolean(this._originalPrice && this._originalPrice > this._price);
  }

  public getDiscountPercentage(): number {
    if (!this.hasApprovedDiscount() || !this._originalPrice) {
      return 0;
    }
    return Math.round(((this._originalPrice - this._price) / this._originalPrice) * 100);
  }

  public calculatePromotionalPrice(promoDiscountPercent: number = 0): number {
    if (promoDiscountPercent <= 0) {
      return this._price;
    }
    const deduction = Math.round((this._price * Math.min(50, promoDiscountPercent)) / 100);
    return Math.max(0, this._price - deduction);
  }

  public toProduct(): Product {
    return {
      ...this._raw,
      id: this._id,
      title: this._title,
      price: this._price,
      originalPrice: this._originalPrice,
      inStock: this._inStock,
      fabric: this._fabric,
      gender: this._gender,
      description: this._description,
      brand: this._brand,
      color: this._color,
      primaryImage: this._primaryImage,
      galleryImages: this._galleryImages,
      rating: this._rating,
      reviewsCount: this._reviewsCount,
    };
  }
}

/**
 * Specialized Suiting Fabric Class (Inheritance)
 */
export class SuitingFabricProduct extends AbstractProduct {
  public getCategoryClassification(): string {
    return `${this.getGender()}'s Formal Atelier Suiting`;
  }

  public getTailoringAllowanceDays(): number {
    return 7; // Hand-tailored bespoke suiting allowance
  }
}

/**
 * Specialized Festive & Luxury Lawn Collection Class (Inheritance)
 */
export class FestiveCollectionProduct extends AbstractProduct {
  public getCategoryClassification(): string {
    return 'Seasonal Festive Luxury Collection';
  }

  public getTailoringAllowanceDays(): number {
    return 5; // Festive rush stitching allowance
  }

  // Polymorphic override: festive items get an extra promotional allowance
  public override calculatePromotionalPrice(promoDiscountPercent: number = 0): number {
    const basePromo = super.calculatePromotionalPrice(promoDiscountPercent);
    return basePromo;
  }
}

/**
 * Specialized Unstitched Fabric Roll Class (Inheritance)
 */
export class UnstitchedRollProduct extends AbstractProduct {
  public getCategoryClassification(): string {
    return 'Premium Unstitched 4.0-4.5m Fabric Cut';
  }

  public getTailoringAllowanceDays(): number {
    return 0; // Immediate unstitched delivery
  }
}

/**
 * Polymorphic Factory Pattern for Domain Products
 */
export class ProductFactory {
  public static createProduct(raw: Product): AbstractProduct {
    const titleLower = (raw.title || '').toLowerCase();
    const fabricLower = (raw.fabric || '').toLowerCase();

    if (titleLower.includes('festive') || titleLower.includes('eid') || fabricLower.includes('chiffon')) {
      return new FestiveCollectionProduct(raw);
    }
    if (titleLower.includes('unstitched') || fabricLower.includes('lawn') || fabricLower.includes('cotton')) {
      return new UnstitchedRollProduct(raw);
    }
    return new SuitingFabricProduct(raw);
  }

  public static createCollection(items: Product[]): AbstractProduct[] {
    return items.map((p) => ProductFactory.createProduct(p));
  }
}
