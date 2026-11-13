/**
 * Object-Oriented Architecture: Order Lifecycle State Machine
 * Demonstrates:
 * 1. State Pattern (OOP Polymorphism): Order states handle dispatch actions differently.
 * 2. Encapsulation: State transitions are guarded and validated internally.
 * 3. Abstraction: Clean public interface for transitioning order stages.
 */

import type { Order, OrderStatus } from '../../types';

export abstract class AbstractOrderState {
  protected readonly statusName: OrderStatus;

  constructor(statusName: OrderStatus) {
    this.statusName = statusName;
  }

  public getStatusName(): OrderStatus {
    return this.statusName;
  }

  public abstract canCancel(): boolean;
  public abstract canDispatch(): boolean;
  public abstract canDeliver(): boolean;
  public abstract getNextAvailableStatuses(): OrderStatus[];
}

export class PendingOrderState extends AbstractOrderState {
  constructor() {
    super('Pending');
  }

  public canCancel(): boolean {
    return true;
  }

  public canDispatch(): boolean {
    return true;
  }

  public canDeliver(): boolean {
    return false;
  }

  public getNextAvailableStatuses(): OrderStatus[] {
    return ['Processing', 'Shipped', 'Delivered'];
  }
}

export class ProcessingOrderState extends AbstractOrderState {
  constructor() {
    super('Processing');
  }

  public canCancel(): boolean {
    return true;
  }

  public canDispatch(): boolean {
    return true;
  }

  public canDeliver(): boolean {
    return false;
  }

  public getNextAvailableStatuses(): OrderStatus[] {
    return ['Pending', 'Shipped', 'Delivered'];
  }
}

export class ShippedOrderState extends AbstractOrderState {
  constructor() {
    super('Shipped');
  }

  public canCancel(): boolean {
    return false;
  }

  public canDispatch(): boolean {
    return false;
  }

  public canDeliver(): boolean {
    return true;
  }

  public getNextAvailableStatuses(): OrderStatus[] {
    return ['Processing', 'Delivered'];
  }
}

export class DeliveredOrderState extends AbstractOrderState {
  constructor() {
    super('Delivered');
  }

  public canCancel(): boolean {
    return false;
  }

  public canDispatch(): boolean {
    return false;
  }

  public canDeliver(): boolean {
    return false;
  }

  public getNextAvailableStatuses(): OrderStatus[] {
    return ['Shipped']; // Can reopen if returned
  }
}

/**
 * Encapsulated Domain Order Entity
 */
export class DomainOrder {
  private readonly _order: Order;
  private _state: AbstractOrderState;

  constructor(order: Order) {
    this._order = { ...order };
    this._state = DomainOrder.resolveState(order.status);
  }

  public static resolveState(status: OrderStatus): AbstractOrderState {
    switch (status) {
      case 'Processing':
        return new ProcessingOrderState();
      case 'Shipped':
        return new ShippedOrderState();
      case 'Delivered':
        return new DeliveredOrderState();
      case 'Pending':
      default:
        return new PendingOrderState();
    }
  }

  public getId(): string {
    return this._order.id;
  }

  public getCustomerName(): string {
    return this._order.customer?.fullName || 'Valued Guest';
  }

  public getTotal(): number {
    return this._order.total;
  }

  public getStatus(): OrderStatus {
    return this._state.getStatusName();
  }

  public canTransitionTo(nextStatus: OrderStatus): boolean {
    // Current status is always a valid idempotent selection
    if (nextStatus === this._state.getStatusName()) {
      return true;
    }
    return this._state.getNextAvailableStatuses().includes(nextStatus);
  }

  public transitionTo(nextStatus: OrderStatus): boolean {
    if (!this.canTransitionTo(nextStatus)) {
      return false;
    }
    this._state = DomainOrder.resolveState(nextStatus);
    this._order.status = nextStatus;
    return true;
  }

  public toOrder(): Order {
    return {
      ...this._order,
      status: this._state.getStatusName(),
    };
  }
}
