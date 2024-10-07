// src/app/models/sub-admin.model.ts
export interface SubAdmin {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string; // Optional, if the avatar might not be present
  }
  