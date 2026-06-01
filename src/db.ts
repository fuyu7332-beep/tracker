import Dexie, { type Table } from 'dexie';
import type { Category, Transaction, Tag, Budget, AppSettings } from './types';
import { DEFAULT_CATEGORIES } from './types';

export class TrackerDB extends Dexie {
  transactions!: Table<Transaction, number>;
  categories!: Table<Category, number>;
  tags!: Table<Tag, number>;
  budgets!: Table<Budget, number>;
  settings!: Table<AppSettings, number>;

  constructor() {
    super('trackerDB');
    this.version(2).stores({
      transactions: '++id, type, categoryId, date',
      categories: '++id, isDefault',
      tags: '++id',
      budgets: '++id, month',
      settings: '++id, key',
    });
  }

  async initDefaults() {
    const count = await this.categories.count();
    if (count === 0) {
      await this.categories.bulkAdd(
        DEFAULT_CATEGORIES.map((c) => ({ ...c } as Category))
      );
    }
  }

  async exportAll(): Promise<string> {
    const [transactions, categories, tags, budgets] = await Promise.all([
      this.transactions.toArray(),
      this.categories.toArray(),
      this.tags.toArray(),
      this.budgets.toArray(),
    ]);
    return JSON.stringify({ transactions, categories, tags, budgets }, null, 2);
  }

  async importAll(json: string) {
    const data = JSON.parse(json);
    await this.transaction('rw',
      this.transactions, this.categories, this.tags, this.budgets,
      async () => {
        await this.transactions.clear();
        await this.categories.clear();
        await this.tags.clear();
        await this.budgets.clear();
        if (data.transactions) await this.transactions.bulkAdd(data.transactions);
        if (data.categories) await this.categories.bulkAdd(data.categories);
        if (data.tags) await this.tags.bulkAdd(data.tags);
        if (data.budgets) await this.budgets.bulkAdd(data.budgets);
      }
    );
  }
}

export const db = new TrackerDB();
