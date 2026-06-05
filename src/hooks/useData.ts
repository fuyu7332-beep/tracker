import { useState, useEffect, useCallback } from 'react';
import { db } from '../db';
import type { Transaction, Category, Tag, Budget, Account } from '../types';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const load = useCallback(async () => {
    const data = await db.transactions.orderBy('date').reverse().toArray();
    setTransactions(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (t: Omit<Transaction, 'id'>) => {
    await db.transactions.add(t as Transaction);
    await load();
  }, [load]);

  const remove = useCallback(async (id: number) => {
    await db.transactions.delete(id);
    await load();
  }, [load]);

  const update = useCallback(async (id: number, changes: Partial<Transaction>) => {
    await db.transactions.update(id, changes);
    await load();
  }, [load]);

  return { transactions, add, remove, update, reload: load };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  const load = useCallback(async () => {
    const data = await db.categories.toArray();
    setCategories(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (c: Omit<Category, 'id'>) => {
    await db.categories.add(c as Category);
    await load();
  }, [load]);

  const remove = useCallback(async (id: number) => {
    await db.categories.delete(id);
    await load();
  }, [load]);

  const update = useCallback(async (id: number, changes: Partial<Category>) => {
    await db.categories.update(id, changes);
    await load();
  }, [load]);

  return { categories, add, remove, update, reload: load };
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);

  const load = useCallback(async () => {
    const data = await db.tags.toArray();
    setTags(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (t: Omit<Tag, 'id'>) => {
    await db.tags.add(t as Tag);
    await load();
  }, [load]);

  const remove = useCallback(async (id: number) => {
    await db.tags.delete(id);
    await load();
  }, [load]);

  const update = useCallback(async (id: number, changes: Partial<Tag>) => {
    await db.tags.update(id, changes);
    await load();
  }, [load]);

  return { tags, add, remove, update, reload: load };
}

export function useBudget() {
  const [budget, setBudget] = useState<Budget | null>(null);

  const monthKey = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  };

  const load = useCallback(async () => {
    const data = await db.budgets.where('month').equals(monthKey()).first();
    setBudget(data || null);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setMonthlyBudget = useCallback(async (limit: number) => {
    const existing = await db.budgets.where('month').equals(monthKey()).first();
    if (existing) {
      await db.budgets.update(existing.id!, { limit });
    } else {
      await db.budgets.add({ month: monthKey(), limit });
    }
    await load();
  }, [load]);

  return { budget, setMonthlyBudget, reload: load };
}

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const all = await db.settings.toArray();
    const map: Record<string, string> = {};
    all.forEach((s) => { map[s.key] = s.value; });
    setSettings(map);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = useCallback(async (key: string, value: string) => {
    const existing = await db.settings.where('key').equals(key).first();
    if (existing) {
      await db.settings.update(existing.id!, { value });
    } else {
      await db.settings.add({ key, value });
    }
    await load();
  }, [load]);

  const get = useCallback((key: string, fallback?: string): string => {
    return settings[key] ?? fallback ?? '';
  }, [settings]);

  return { settings, set, get, reload: load };
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const load = useCallback(async () => {
    const data = await db.accounts.toArray();
    setAccounts(data);
  }, []);
  useEffect(() => { load(); }, [load]);
  const add = useCallback(async (a: Omit<Account, 'id'>) => {
    await db.accounts.add(a as Account);
    await load();
  }, [load]);
  const remove = useCallback(async (id: number) => {
    await db.accounts.delete(id);
    await load();
  }, [load]);
  const update = useCallback(async (id: number, changes: Partial<Account>) => {
    await db.accounts.update(id, changes);
    await load();
  }, [load]);
  return { accounts, add, remove, update, reload: load };
}

export function useExport() {
  const exportCSV = useCallback(async () => {
    const transactions = await db.transactions.orderBy('date').reverse().toArray();
    const categories = await db.categories.toArray();
    const getCat = (id: number) => categories.find((c) => c.id === id);

    const headers = ['日期', '类型', '分类', '金额', '备注'];
    const rows = transactions.map((t) => [
      t.date,
      t.type === 'expense' ? '支出' : '收入',
      getCat(t.categoryId)?.name || '未知',
      t.amount.toFixed(2),
      t.note,
    ]);

    const BOM = '\uFEFF';
    const csv = BOM + [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '记账数据_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportJSON = useCallback(async () => {
    const json = await db.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '记账备份_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importJSON = useCallback(async (file: File) => {
    const text = await file.text();
    await db.importAll(text);
  }, []);

  const importCSV = useCallback(async (file: File) => {
    const Papa = (await import('papaparse')).default;
    const text = await file.text();
    const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
    if (!data || data.length === 0) return 0;

    const cats = await db.categories.toArray();
    const accounts = await db.accounts.toArray();
    const existing = await db.transactions.toArray();

    let added = 0;
    for (const row of data as Record<string, string>[]) {
      const dateRaw = row['����ʱ��'] || row['��������'] || row['����'] || row['����ʱ��'] || '';
      const date = dateRaw ? dateRaw.slice(0, 10) : '';
      if (!date) continue;

      const amountStr = (row['���'] || row['���׽��'] || row['������'] || row['֧�����'] || '0').replace(/[��\s,+]/g, '');
      const amount = parseFloat(amountStr);
      if (!amount || isNaN(amount)) continue;

      const typeStr = row['��/֧'] || row['��������'] || '';
      const type: 'expense' | 'income' = typeStr.includes('����') || typeStr.includes('����') ? 'income' : 'expense';

      const note = row['��Ʒ˵��'] || row['���׶Է�'] || row['��Ʒ'] || row['ժҪ'] || row['��ע'] || '';
      const payMethod = row['֧����ʽ'] || row['���׷�ʽ'] || '';

      // Auto-detect category
      let catId = cats[0]?.id || 1;
      for (const c of cats) {
        if (c.keywords.some(kw => note.includes(kw) || payMethod.includes(kw))) {
          catId = c.id!;
          break;
        }
      }

      // Auto-detect account
      let acctId: number | undefined;
      if (payMethod.includes('΢��')) acctId = accounts.find(a => a.type === 'wechat')?.id;
      else if (payMethod.includes('֧����')) acctId = accounts.find(a => a.type === 'alipay')?.id;
      else if (payMethod.includes('����') || payMethod.includes('����') || payMethod.includes('���ÿ�'))
        acctId = accounts.find(a => a.type === 'bank')?.id;
      else acctId = accounts[0]?.id;

      // Dedup
      const dup = existing.some(e => e.date === date && Math.abs(e.amount - amount) < 0.01 && e.note === note);
      if (dup) continue;

      await db.transactions.add({
        amount, type, categoryId: catId, tagIds: [],
        note: note || date, date, accountId: acctId, source: 'csv', sourceId: ''
      } as Transaction);
      added++;
    }
    return added;
  }, []);

  return { exportCSV, exportJSON, importJSON, importCSV };
}
