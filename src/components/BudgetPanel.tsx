import { useState, useMemo } from 'react';
import type { Transaction, Budget } from '../types';

interface Props {
  transactions: Transaction[];
  budget: Budget | null;
  onSetBudget: (limit: number) => void;
}

export default function BudgetPanel({ transactions, budget, onSetBudget }: Props) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');

  const monthKey = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  };

  const spent = useMemo(() => {
    const mk = monthKey();
    return transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(mk.slice(0, 7)))
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  const limit = budget?.limit || 0;
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const over = limit > 0 && spent > limit;
  const near = limit > 0 && spent >= limit * 0.85 && spent <= limit;

  const color = over ? 'var(--c-danger)' : near ? 'var(--c-orange)' : 'var(--c-green)';
  const bgColor = over ? '#FFF0F0' : near ? '#FFF8EE' : '#EEFFF6';

  const handleSave = () => {
    const n = parseFloat(input);
    if (n > 0) {
      onSetBudget(n);
      setEditing(false);
      setInput('');
    }
  };

  return (
    <div className="bg-[var(--c-surface)] rounded-[var(--radius-lg)] p-4 shadow-sm border border-[var(--c-border)]">
      {limit > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs text-[var(--c-text2)] font-bold">本月预算</div>
              <div className="text-lg font-black text-[var(--c-text)]">
                {'¥'}{spent.toFixed(0)} <span className="text-[var(--c-text3)] text-sm font-normal">/ ¥{limit}</span>
              </div>
            </div>
            <button
              onClick={() => { setEditing(true); setInput(String(limit)); }}
              className="text-xs font-bold text-[var(--c-purple)]"
            >
              修改
            </button>
          </div>
          <div
            className="h-4 rounded-full overflow-hidden"
            style={{ backgroundColor: bgColor }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: pct + '%', backgroundColor: color }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] font-bold" style={{ color }}>
              {over ? '⚠️ 已超预算！' : near ? '⚡ 即将超预算' : pct.toFixed(0) + '%'}
            </span>
            <span className="text-[10px] text-[var(--c-text3)]">
              {'剩余 ¥' + Math.max(limit - spent, 0).toFixed(0)}
            </span>
          </div>
        </div>
      ) : (
        <div>
          {editing ? (
            <div className="space-y-3">
              <div className="text-sm font-bold text-[var(--c-text)]">设置本月预算</div>
              <input
                type="number"
                inputMode="decimal"
                placeholder="输入预算金额"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--c-bg)] text-lg font-bold text-[var(--c-text)] outline-none border border-[var(--c-border)] focus:border-[var(--c-purple)]"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-[var(--radius-sm)] bg-[var(--c-purple)] text-white text-sm font-bold"
                >
                  保存
                </button>
                <button
                  onClick={() => { setEditing(false); setInput(''); }}
                  className="px-4 py-2.5 rounded-[var(--radius-sm)] text-sm text-[var(--c-text3)]"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full py-3 text-sm font-bold text-[var(--c-text2)]"
            >
              {'🎯 设置月度预算，控制花销'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
