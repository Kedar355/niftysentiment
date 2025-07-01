import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

if (!process.env.JWT_SECRET) {
  throw new Error('Please add your JWT Secret to .env.local as JWT_SECRET');
}

const JWT_SECRET = process.env.JWT_SECRET;

export interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  watchlist: string[];
  preferences: {
    emailNotifications?: boolean;
    dailySummary?: boolean;
    notifications?: boolean;
    emailAlerts?: boolean;
    darkMode?: boolean;
    realTimeUpdates?: boolean;
    marketOpenAlerts?: boolean;
    priceAlerts?: boolean;
    newsDigest?: boolean;
    weeklyReport?: boolean;
  };
  createdAt?: string;
  lastLogin?: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: Partial<User>): string => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};