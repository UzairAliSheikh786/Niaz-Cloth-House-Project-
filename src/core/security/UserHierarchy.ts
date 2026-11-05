/**
 * Object-Oriented Architecture: User Role Hierarchy
 * Demonstrates Abstraction, Inheritance, and Polymorphism.
 */

import { PatronProfile } from '../../context/AuthContext';

export abstract class AbstractUser {
  protected readonly uid: string;
  protected readonly email: string;
  protected readonly displayName: string;
  protected readonly photoURL?: string;
  protected isOnline: boolean;
  protected readonly createdAt: string;

  constructor(profile: Partial<PatronProfile> & { uid: string; email: string }) {
    this.uid = profile.uid;
    this.email = profile.email;
    this.displayName = profile.displayName || profile.email.split('@')[0];
    this.photoURL = profile.photoURL;
    this.isOnline = profile.isOnline ?? false;
    this.createdAt = profile.createdAt || new Date().toISOString();
  }

  public getUid(): string {
    return this.uid;
  }

  public getEmail(): string {
    return this.email;
  }

  public getDisplayName(): string {
    return this.displayName;
  }

  public getPhotoURL(): string | undefined {
    return this.photoURL;
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public setOnlineStatus(online: boolean): void {
    this.isOnline = online;
  }

  abstract getRole(): string;
  abstract canManageInventory(): boolean;
  abstract canManageOrders(): boolean;
  abstract canViewSystemLogs(): boolean;
  abstract canPurgeUsers(): boolean;

  public toProfile(): PatronProfile {
    return {
      uid: this.uid,
      email: this.email,
      displayName: this.displayName,
      photoURL: this.photoURL,
      isOnline: this.isOnline,
      role: this.getRole(),
      createdAt: this.createdAt,
    };
  }
}

/**
 * Super Administrator (Owner: uzairaliuzairali640@gmail.com)
 */
export class SuperAdminUser extends AbstractUser {
  public getRole(): string {
    return 'Super Administrator';
  }

  public canManageInventory(): boolean {
    return true;
  }

  public canManageOrders(): boolean {
    return true;
  }

  public canViewSystemLogs(): boolean {
    return true;
  }

  public canPurgeUsers(): boolean {
    return true;
  }
}

/**
 * Store Administrator (Staff / Operations)
 */
export class StoreAdminUser extends AbstractUser {
  public getRole(): string {
    return 'Store Administrator';
  }

  public canManageInventory(): boolean {
    return true;
  }

  public canManageOrders(): boolean {
    return true;
  }

  public canViewSystemLogs(): boolean {
    return true;
  }

  public canPurgeUsers(): boolean {
    return false;
  }
}

/**
 * Registered Patron / Customer
 */
export class PatronUser extends AbstractUser {
  public getRole(): string {
    return 'Registered Patron';
  }

  public canManageInventory(): boolean {
    return false;
  }

  public canManageOrders(): boolean {
    return false;
  }

  public canViewSystemLogs(): boolean {
    return false;
  }

  public canPurgeUsers(): boolean {
    return false;
  }
}

/**
 * Polymorphic User Factory
 */
export class UserFactory {
  public static createUser(profile: PatronProfile): AbstractUser {
    const email = profile.email?.toLowerCase().trim();
    if (email === 'uzairaliuzairali640@gmail.com') {
      return new SuperAdminUser(profile);
    }
    if (email === 'admin@nch.com' || email === 'admin@niazclothhouse.com') {
      return new StoreAdminUser(profile);
    }
    return new PatronUser(profile);
  }
}
