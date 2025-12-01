import { VideoCase, ApiResponse, AdminUser } from '../types';
import { INITIAL_DATA } from '../mockData';

// Placeholder for the Google Apps Script Web App URL
// Users should replace this after deploying their script
const API_URL = 'https://script.google.com/macros/s/AKfycbzr86FpNtxFOmG-2pGvm460mn4dW4dazZ9hPUzxfDq9UvBxHv8-rBXAeA0Olq1Xab3XpQ/exec'; 

class GasService {
  private localData: VideoCase[] = [...INITIAL_DATA];
  // Mock admins for local testing
  private localAdmins: AdminUser[] = [
    { email: 'williamhsiao@aurotek.com', addedBy: 'System', addedAt: new Date().toISOString() }
  ];
  private useLocal: boolean = true;

  constructor() {
    // If API_URL is empty, we force local mode for the demo to work immediately
    this.useLocal = !API_URL;
  }

  setApiUrl(url: string) {
    if (url) {
      this.useLocal = false;
    }
  }

  private async fetchGas(action: string, payload?: any): Promise<ApiResponse> {
    if (this.useLocal) {
      return this.mockGasResponse(action, payload);
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("GAS API Error:", error);
      return { success: false, message: "Network error connecting to backend." };
    }
  }

  // Simulates the backend logic locally
  private mockGasResponse(action: string, payload?: any): Promise<ApiResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result: ApiResponse = { success: true };

        switch (action) {
          // Case CRUD
          case 'get':
            result.data = this.localData;
            break;
          case 'create':
            const newCase = { ...payload.data, id: Date.now().toString() };
            this.localData = [newCase, ...this.localData];
            result.data = [newCase];
            break;
          case 'update':
            this.localData = this.localData.map(item => 
              item.id === payload.data.id ? payload.data : item
            );
            result.data = this.localData;
            break;
          case 'delete':
            this.localData = this.localData.filter(item => item.id !== payload.id);
            result.data = this.localData;
            break;

          // Admin CRUD
          case 'getAdmins':
            result.data = this.localAdmins;
            break;
          case 'addAdmin':
            if (!this.localAdmins.some(a => a.email === payload.email)) {
              this.localAdmins.push({
                email: payload.email,
                addedBy: payload.addedBy || 'Demo',
                addedAt: new Date().toISOString()
              });
            }
            result.success = true;
            break;
          case 'deleteAdmin':
            this.localAdmins = this.localAdmins.filter(a => a.email !== payload.email);
            result.success = true;
            break;
        }
        resolve(result);
      }, 500); // Simulate network delay
    });
  }

  // --- Case Methods ---
  async getAll(): Promise<VideoCase[]> {
    const res = await this.fetchGas('get');
    return res.data || [];
  }

  async create(data: Omit<VideoCase, 'id'>): Promise<VideoCase | null> {
    const res = await this.fetchGas('create', { data });
    return res.data ? res.data[0] : null;
  }

  async update(data: VideoCase): Promise<boolean> {
    const res = await this.fetchGas('update', { data });
    return res.success;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.fetchGas('delete', { id });
    return res.success;
  }

  // --- Admin Methods ---
  async getAdmins(): Promise<AdminUser[]> {
    const res = await this.fetchGas('getAdmins');
    return res.data || [];
  }

  async addAdmin(email: string, addedBy: string): Promise<boolean> {
    const res = await this.fetchGas('addAdmin', { email, addedBy });
    return res.success;
  }

  async removeAdmin(email: string): Promise<boolean> {
    const res = await this.fetchGas('deleteAdmin', { email });
    return res.success;
  }
}

export const gasService = new GasService();