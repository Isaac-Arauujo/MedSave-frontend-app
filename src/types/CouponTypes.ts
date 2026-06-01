export type CouponType = 'PERCENT' | 'FIXED';

export interface CouponResponse {
  id: number;
  code: string;
  type: CouponType;
  value: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
}

export interface CreateCouponRequest {
  code: string;
  type: CouponType;
  value: number;
  minOrderValue?: number;
  maxUses?: number;
  expiresAt: string;
}

export interface UpdateCouponRequest {
  code?: string;
  type?: CouponType;
  value?: number;
  minOrderValue?: number;
  maxUses?: number;
  expiresAt?: string;
  active?: boolean;
}

export interface ApplyCouponRequest {
  code: string;
}
