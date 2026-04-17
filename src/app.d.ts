declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        username: string;
        email: string;
        is_admin: boolean;
        created_at: string;
      };
    }
  }
}

export {};
