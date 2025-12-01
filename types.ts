
export interface VideoCase {
  id: string;
  category: string; // e.g., Catering, Retail, Cleaning
  subcategory?: string; // e.g., Fast Food, Hotpot
  region: string;
  robotType: string; // e.g., BellaBot, KettyBot
  clientName: string;
  videoUrl: string;
  rating: number; // 1-5
  keywords: string[];
  description?: string;
}

export interface FilterState {
  search: string;
  category: string;
  region: string;
  robotType: string;
}

export interface UserProfile {
  email: string;
  name: string;
  picture: string;
}

export interface AdminUser {
  email: string;
  addedBy?: string;
  addedAt?: string;
}

export type CrudAction = 'create' | 'update' | 'delete' | 'getAdmins' | 'addAdmin' | 'deleteAdmin';

export interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
}
