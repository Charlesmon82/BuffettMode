// Storage interface - currently not needed for stock analysis
// This app primarily uses real-time API calls to Yahoo Finance

export interface IStorage {
  // Add any persistent storage needs here
}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();
