import { useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { Transaction, Category } from '../types';
import EmptyState from './EmptyState';

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

const COLORS = ['#FF8BA7', '#84D8D0', '#A78BFA', '#F9C74F', '#F9844A', '#F984E5', '#43B97F', '#577590'];

export default function Stats({ transactions, categories }: Props) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [viewType, setViewType] = useState<'expense' | 'income'>('expense');

  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);

  const monthExpense = useMemo(() =>
    transactions.filter((t) => t.type === 'expense' && t.date.startsWith(thisMonth)).reduce((s, t) => s + t.amount, 0),
    [transactions, thisMonth]
  );

  const monthIncome = useMemo(() =>
    transactions.filter((t) => t.type === 'income' && t.date.startsWith(thisMonth)).reduce((s, t) => s + t.amount, 0),
    [transactions, thisMonth]
  );

  const passedDays = now.getDate();
  const avgDaily = monthExpense / Math.max(passedDays, 1);

  const filteredData = useMemo(() => {
    let start = new Date();
    if (period === 'week') start.setDate(now.getDate() - 7);
    else if (period === 'month') start.setMonth(now.getMonth() - 1);
    else start.setFullYear(now.getFullYear() - 1);
    return transactions.filter((t) => new Date(t.date) >= start && t.type === viewType);
  }, [transactions, period, viewType, now]);

  const total = useMemo(() => filteredData.reduce((s, t) => s + t.amount, 0), [filteredData]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      const name = cat?.name || '未分类';
      map[name] = (map[name] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 })).sort((a, b) => b.value - a.value);
  }, [filteredData, categories]);

  const dailyData = useMemo(() => {
    const map: Record<string, { expense: number; income: number }> = {};
    const days = period === 'week' ? 7 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      map[(d.getMonth() + 1) + '/' + d.getDate()] = { expense: 0, income: 0 };
    }
    let startDate = new Date();
    if (period === 'week') startDate.setDate(now.getDate() - 7);
    else startDate.setMonth(now.getMonth() - 1);
    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (d >= startDate) {
        const key = (d.getMonth() + 1) + '/' + d.getDate();
        if (map[key]) {
          if (t.type === 'expense') map[key].expense += t.amount;
          else map[key].income += t.amount;
        }
      }
    });
    return Object.entries(map).map(([date, val]) => ({ date, ...val }));
  }, [transactions, period, now]);

  if (transactions.length === 0) {
    return <EmptyState emoji="📊" title="暂无统计数据" subtitle="记账后这里会出现统计图表哦～" />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--c-surface)] rounded-[var(--radius-lg)] p-4 shadow-sm border border-[var(--c-border)]">
          <div className="text-[11px] font-bold text-[var(--c-text2)]">本月支出</div>
          <div className="text-xl font-black text-[var(--c-danger)] mt-1">{'¥' + monthExpense.toFixed(0)}</div>
          <div className="text-[10px] text-[var(--c-text3)] mt-0.5">{'日均 ¥' + avgDaily.toFixed(0)}</div>
        </div>
        <div className="bg-[var(--c-surface)] rounded-[var(--radius-lg)] p-4 shadow-sm border border-[var(--c-border)]">
          <div className="text-[11px] font-bold text-[var(--c-text2)]">本月收入</div>
          <div className="text-xl font-black text-[var(--c-success)] mt-1">{'¥' + monthIncome.toFixed(0)}</div>
          <div className="text-[10px] text-[var(--c-text3)] mt-0.5">{monthIncome >= monthExpense ? '✅ 收支平衡' : '📉 超支 ¥' + (monthExpense - monthIncome).toFixed(0)}</div>
        </div>
      </div>
      <div className="bg-[var(--c-surface)] rounded-[var(--radius-lg)] p-4 shadow-sm border border-[var(--c-border)]">
        <div className="flex gap-2 mb-4">
          <button onClick={() => setViewType('expense')} className={'px-4 py-2 rounded-full text-xs font-bold transition-all ' + (viewType === 'expense' ? 'bg-[var(--c-danger)] text-white' : 'bg-[var(--c-bg)] text-[var(--c-text2)]')}>支出</button>
          <button onClick={() => setViewType('income')} className={'px-4 py-2 rounded-full text-xs font-bold transition-all ' + (viewType === 'income' ? 'bg-[var(--c-success)] text-white' : 'bg-[var(--c-bg)] text-[var(--c-text2)]')}>收入</button>
          <div className="flex-1" />
          {(['week', 'month', 'year'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={'px-3 py-2 rounded-full text-xs font-bold transition-all ' + (period === p ? 'bg-[var(--c-purple)] text-white' : 'text-[var(--c-text3)]')}>{p === 'week' ? '周' : p === 'month' ? '月' : '年'}</button>
          ))}
        </div>
        <div className="text-center mb-3">
          <div className="text-xl font-black" style={{ color: viewType === 'expense' ? 'var(--c-danger)' : 'var(--c-success)' }}>{'¥' + total.toFixed(2)}</div>
          <div className="text-[10px] text-[var(--c-text3)]">总计{viewType === 'expense' ? '支出' : '收入'}</div>
        </div>
        {categoryData.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-bold text-[var(--c-text2)] mb-2">分类占比</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={4} dataKey="value">
                  {categoryData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />))}
                </Pie>
                <Tooltip formatter={(value) => ['¥' + Number(value).toFixed(2), '金额']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {dailyData.length > 0 && (
          <div>
            <div className="text-xs font-bold text-[var(--c-text2)] mb-2">每日趋势</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--c-text3)' }} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--c-text3)' }} />
                <Tooltip formatter={(value) => ['¥' + Number(value).toFixed(2), '金额']} />
                <Bar dataKey="expense" fill="var(--c-pink)" radius={[6, 6, 0, 0]} name="支出" />
                <Bar dataKey="income" fill="var(--c-mint)" radius={[6, 6, 0, 0]} name="收入" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
