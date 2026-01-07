// Extended user type with role and status
export interface ExtendedUser {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  role?: "user" | "admin" | "super_admin";
  status?: "active" | "suspended";
}

export interface ExtendedSession {
  user: ExtendedUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
  };
}
