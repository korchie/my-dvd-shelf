import { users, dvds, type User, type InsertUser, type Dvd, type InsertDvd } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // DVD operations
  getAllDvds(): Promise<Dvd[]>;
  getDvd(id: number): Promise<Dvd | undefined>;
  createDvd(dvd: InsertDvd): Promise<Dvd>;
  updateDvd(id: number, updates: Partial<InsertDvd>): Promise<Dvd | undefined>;
  deleteDvd(id: number): Promise<boolean>;
  searchDvds(query: string): Promise<Dvd[]>;
  filterDvds(filters: { status?: string; genre?: string; year?: number }): Promise<Dvd[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private dvds: Map<number, Dvd>;
  private currentUserId: number;
  private currentDvdId: number;

  constructor() {
    this.users = new Map();
    this.dvds = new Map();
    this.currentUserId = 1;
    this.currentDvdId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllDvds(): Promise<Dvd[]> {
    return Array.from(this.dvds.values());
  }

  async getDvd(id: number): Promise<Dvd | undefined> {
    return this.dvds.get(id);
  }

  async createDvd(insertDvd: InsertDvd): Promise<Dvd> {
    const id = this.currentDvdId++;
    const dvd: Dvd = { ...insertDvd, id };
    this.dvds.set(id, dvd);
    return dvd;
  }

  async updateDvd(id: number, updates: Partial<InsertDvd>): Promise<Dvd | undefined> {
    const existingDvd = this.dvds.get(id);
    if (!existingDvd) return undefined;
    
    const updatedDvd: Dvd = { ...existingDvd, ...updates };
    this.dvds.set(id, updatedDvd);
    return updatedDvd;
  }

  async deleteDvd(id: number): Promise<boolean> {
    return this.dvds.delete(id);
  }

  async searchDvds(query: string): Promise<Dvd[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.dvds.values()).filter(dvd =>
      dvd.title.toLowerCase().includes(lowerQuery) ||
      dvd.director?.toLowerCase().includes(lowerQuery) ||
      dvd.genre?.toLowerCase().includes(lowerQuery)
    );
  }

  async filterDvds(filters: { status?: string; genre?: string; year?: number }): Promise<Dvd[]> {
    return Array.from(this.dvds.values()).filter(dvd => {
      if (filters.status && dvd.status !== filters.status) return false;
      if (filters.genre && dvd.genre !== filters.genre) return false;
      if (filters.year && dvd.year !== filters.year) return false;
      return true;
    });
  }
}

export const storage = new MemStorage();
