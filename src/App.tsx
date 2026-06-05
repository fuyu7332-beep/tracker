import { useState, useEffect, useCallback } from 'react';
import { db } from './db';
import { useTransactions, useCategories, useTags, useBudget, useAccounts, useExport } from './hooks/useData';
import AddTransaction from './components/AddTransaction';
import TransactionList from './components/TransactionList';
import Stats from './components/Stats';
import BudgetPanel from './components/BudgetPanel';
import SettingsPanel from './components/SettingsPanel';
import SearchFilter from './components/SearchFilter';
import ImportPanel from './components/ImportPanel';
import Confetti from './components/Confetti';

type Tab = 'record' | 'list' | 'stats' | 'budget' | 'import' | 'settings';

export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('record');
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('tracker-theme') === 'dark');

  const { transactions, add, remove } = useTransactions();
  const { categories } = useCategories();
  const { tags } = useTags();
  const { budget, setMonthlyBudget } = useBudget();
  const { accounts } = useAccounts();
  const { exportCSV, exportJSON, importJSON, importCSV } = useExport();

  const [searchFilters, setSearchFilters] = useState<{
    keyword: string; categoryId: number; dateFrom: string; dateTo: string;
  }>({ keyword: '', categoryId: 0, dateFrom: '', dateTo: '' });

  useEffect(() => { db.initDefaults().then(() => setReady(true)); }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('tracker-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // URL Quick-add handler for iOS Shortcuts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const addParam = params.get('add');
    if (addParam && ready) {
      const sms = decodeURIComponent(addParam);
      const parsed = parsePaymentSMS(sms);
      if (parsed && categories.length > 0) {
        const cat = categories.find(c => c.keywords.some(kw => parsed.note.includes(kw)));
        add({
          amount: parsed.amount,
          type: parsed.type,
          categoryId: cat?.id || categories[0]?.id || 1,
          tagIds: [],
          note: parsed.note,
          date: new Date().toISOString().slice(0, 10),
          accountId: accounts.find(a => a.type === parsed.accountType)?.id,
          source: 'shortcut',
          sourceId: '',
        });
        setConfettiTrigger(c => c + 1);
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [ready, categories, accounts, add]);

  const handleAdd = useCallback(async (data: Parameters<typeof add>[0]) => {
    await add(data);
    setConfettiTrigger((c) => c + 1);
    setTab('list');
  }, [add]);

  const handleImportJSON = useCallback(async (file: File) => {
    await importJSON(file);
    window.location.reload();
  }, [importJSON]);

  const handleImportCSV = useCallback(async (file: File) => {
    const count = await importCSV(file);
    window.location.reload();
    return count;
  }, [importCSV]);

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
    { key: 'import' as Tab, emoji: '📥', label: '导入' },
    { key: 'stats' as Tab, emoji: '📊', label: '统计' },
    { key: 'settings' as Tab, emoji: '⚙️', label: '设置' },
  ];

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--c-bg)', paddingBottom: 80 }}>
      <Confetti trigger={confettiTrigger} />
      <div style={{ padding: '12px 20px 8px', paddingTop: 'max(12px, env(safe-area-inset-top))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--c-bg)' }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--c-text)' }}>
          {tabs.find((t) => t.key === tab)?.emoji} {tabs.find((t) => t.key === tab)?.label}
        </span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-text3)' }}>今日支出</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--c-danger)' }}>¥{todayExpense.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ padding: '0 20px', maxWidth: 480, margin: '0 auto' }}>
        {tab === 'record' && <AddTransaction categories={categories} tags={tags} accounts={accounts} onAdd={handleAdd} />}
        {tab === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SearchFilter categories={categories} onFilter={setSearchFilters} />
            <TransactionList transactions={filteredTransactions} categories={categories} tags={tags} accounts={accounts} onDelete={remove} />
          </div>
        )}
        {tab === 'import' && <ImportPanel accounts={accounts} onImportCSV={handleImportCSV} />}
        {tab === 'stats' && <Stats transactions={transactions} categories={categories} />}
        {tab === 'budget' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <BudgetPanel transactions={transactions} budget={budget} onSetBudget={setMonthlyBudget} />
          </div>
        )}
        {tab === 'settings' && (
          <SettingsPanel isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} onExportCSV={exportCSV} onExportJSON={exportJSON} onImportJSON={handleImportJSON} />
        )}
      </div>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--c-surface)', borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-around', padding: '8px 0 max(8px, env(safe-area-inset-bottom))', zIndex: 10 }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 8px', border: 'none', background: 'transparent', color: tab === t.key ? 'var(--c-purple)' : 'var(--c-text3)', fontSize: 10, fontWeight: 700, minHeight: 48, minWidth: 48 }}>
            <span style={{ fontSize: 20 }}>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

// SMS Parser for iOS Shortcuts
function parsePaymentSMS(sms: string): { amount: number; type: 'expense' | 'income'; note: string; accountType: string } | null {
  // WeChat: "微信支付XX元" / "通过微信支付向XXX付款XX元"
  // Alipay: "支付宝-XX元"
  // Bank: "您尾号XXXX储蓄卡X月X日支出人民币XX元"
  // Bank income: "您尾号XXXX收到工资XX元"

  let amount = 0;
  let type: 'expense' | 'income' = 'expense';
  let note = '';
  let accountType = 'other';

  const amtMatch = sms.match(/(\d+\.?\d*)\s*元/);
  if (amtMatch) amount = parseFloat(amtMatch[1]);

  if (sms.includes('微信') || sms.includes('零钱')) accountType = 'wechat';
  else if (sms.includes('支付宝')) accountType = 'alipay';
  else if (sms.includes('银行') || sms.includes('储蓄卡') || sms.includes('信用卡') || sms.includes('尾号')) accountType = 'bank';

  if (sms.includes('收入') || sms.includes('入账') || sms.includes('收到') || sms.includes('工资') || sms.includes('退款')) {
    type = 'income';
  }

  // Extract merchant/note
  const merchantMatch = sms.match(/(?:向|给|在)([^\s，。,.]{2,20})(?:支出|付款|消费|支付)/);
  if (merchantMatch) note = merchantMatch[1];
  else if (sms.includes('微信支付')) note = '微信支付';
  else if (sms.includes('支付宝')) note = '支付宝';
  else note = sms.slice(0, 30);

  if (!amount || isNaN(amount)) return null;
  return { amount, type, note, accountType };
}
