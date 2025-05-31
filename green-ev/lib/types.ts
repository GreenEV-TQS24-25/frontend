// Enums
export enum ConnectorType {
  SAEJ1772 = 'SAEJ1772',
  MENNEKES = 'MENNEKES',
  CHADEMO = 'CHADEMO',
  CCS = 'CCS'
}

export type UserRole = 'USER' | 'OPERATOR'
export type ChargingVelocity = 'NORMAL' | 'FAST' | 'FASTPP'
export type ChargingSpotState = 'OCCUPIED' | 'FREE' | 'OUT_OF_SERVICE'

// Interfaces
export interface Vehicle {
  id?: number;
  brand: string;
  model: string;
  licensePlate: string;
  connectorType: ConnectorType;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface ChargingStation {
  id?: number;
  name: string;
  lat: number;
  lon: number;
  operator?: User;
  photoUrl?: string;
}

export interface ChargingSpot {
  id?: number;
  station?: ChargingStation;
  powerKw: number;
  pricePerKwh: number;
  chargingVelocity?: ChargingVelocity;
  connectorType?: ConnectorType;
  state?: ChargingSpotState;
}

export interface Session {
  id?: number;
  uuid: string;
  vehicle?: Vehicle;
  chargingSpot?: ChargingSpot;
  startTime: string; // ISO date-time string
  duration?: number;
  totalCost?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  expires: number;
}

export interface StationsSpots {
  chargingStation: ChargingStation;
  spots: ChargingSpot[];
} 