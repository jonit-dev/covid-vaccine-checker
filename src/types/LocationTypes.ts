export interface AvailablePlace {
  id: string;
  name: string;
  appointmentUrl: string;
  phone: string;
  address: string;
  createdAt: Date;
}

export interface AvailablePlaceResponse {
  available: boolean;
  phone: string;
  address: string;
}
