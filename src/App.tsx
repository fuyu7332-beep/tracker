import { useState, useEffect, useCallback } from 'react';
import { db } from './db';
import { useTransactions, useCategories, useTags, useBudget, useExport } from './hooks/useData';
import AddTransaction from './components/AddTransaction';
import TransactionList from './components/TransactionList';
import Stats from './components/Stats';
import BudgetPanel from './components/BudgetPanel';
import SettingsPanel from './components/SettingsPanel';
import SearchFilter from './components/SearchFilter';
import Confetti from './components/Confetti';

type Tab = 'record' | 'list' | 'stats' | 'budget' | 'settings';

export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('record');
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('tracker-theme') === 'dark');

  const { transactions, add, remove } = useTransactions();
  const { categories } = useCategories();
  const { tags } = useTags();
  const { budget, setMonthlyBudget } = useBudget();
  const { exportCSV, exportJSON, importJSON } = useExport();

  const [searchFilters, setSearchFilters] = useState<{
    keyword: string; categoryId: number; dateFrom: string; dateTo: string;
  }>({ keyword: '', categoryId: 0, dateFrom: '', dateTo: '' });

  useEffect(() => { db.initDefaults().then(() => setReady(true)); }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('tracker-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleAdd = useCallback(async (data: Parameters<typeof add>[0]) => {
    await add(data);
    setConfettiTrigger((c) => c + 1);
    setTab('list');
  }, [add]);

  const handleImportJSON = useCallback(async (file: File) => {
    await importJSON(file);
    window.location.reload();
  }, [importJSON]);

  const filteredTransactions = transactions.filter((t) => {
    const { keyword, categoryId, dateFrom, dateTo } = searchFilters;
    if (keyword) {
      const k = keyword.toLowerCase();
      if (!t.note.toLowerCase().includes(k) && !String(t.amount).includes(k)) return false;
    }
    if (categoryId > 0 && t.categoryId !== categoryId) return false;
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    return true;
  });

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--c-bg)' }}>
        <span style={{ fontSize: 32 }} className="animate-float">🐷</span>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayExpense = transactions
    .filter((t) => t.type === 'expense' && t.date === today)
    .reduce((s, t) => s + t.amount, 0);

  const tabs = [
    { key: 'record' as Tab, emoji: '✏️', label: '记账' },
    { key: 'list' as Tab, emoji: '📋', label: '明细' },
    { key: 'stats' as Tab, emoji: '📊', label: '统计' },
    { key: 'budget' as Tab, emoji: '🎯', label: '预算' },
    { key: 'settings' as Tab, emoji: '⚙️', label: '设置' },
  ];

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--c-bg)', paddingBottom: 80 }}>
      <Confetti trigger={confettiTrigger} />

      {/* Minimal top bar */}
      <div style={{
        padding: '12px 20px 8px',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--c-bg)',
      }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--c-text)' }}>
          {tabs.find((t) => t.key === tab)?.emoji} {tabs.find((t) => t.key === tab)?.label}
        </span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-text3)' }}>今日支出</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--c-danger)' }}>
            ¥{todayExpense.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 20px', maxWidth: 480, margin: '0 auto' }}>
        {tab === 'record' && <AddTransaction categories={categories} tags={tags} onAdd={handleAdd} />}
        {tab === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SearchFilter categories={categories} onFilter={setSearchFilters} />
            <TransactionList transactions={filteredTransactions} categories={categories} tags={tags} onDelete={remove} />
          </div>
        )}
        {tab === 'stats' && <Stats transactions={transactions} categories={categories} />}
        {tab === 'budget' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <BudgetPanel transactions={transactions} budget={budget} onSetBudget={setMonthlyBudget} />
          </div>
        )}
        {tab === 'settings' && (
          <SettingsPanel
            isDark={isDark} onToggleTheme={() => setIsDark(!isDark)}
            onExportCSV={exportCSV} onExportJSON={exportJSON} onImportJSON={handleImportJSON}
          />
        )}
      </div>

      {/* Bottom nav - iOS style */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--c-surface)',
        borderTop: '1px solid var(--c-border)',
        display: 'flex', justifyContent: 'space-around',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
        zIndex: 10,
      }}>
        {tabs.map((t) => (
          <button
            key={t.key} onClick={() => setTab(t.key)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '4px 12px', border: 'none', background: 'transparent',
              color: tab === t.key ? 'var(--c-purple)' : 'var(--c-text3)',
              fontSize: 10, fontWeight: 700,
              minHeight: 48, minWidth: 48,
            }}
          >
            <span style={{ fontSize: 22 }}>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
