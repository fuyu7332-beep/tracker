import { useState } from 'react';
import type { Category, Tag, Account } from '../types';
import QuickAmount from './QuickAmount';

interface Props {
  categories: Category[];
  tags: Tag[];
  accounts: Account[];
  onAdd: (data: {
    amount: number;
    type: 'expense' | 'income';
    categoryId: number;
    tagIds: number[];
    note: string;
    date: string;
  }) => void;
}

export default function AddTransaction({ categories, tags, accounts, onAdd }: Props) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [categoryId, setCategoryId] = useState(0);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [showNote, setShowNote] = useState(false);

  const handleSubmit = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    let cid = categoryId;
    if (cid === 0 && categories.length > 0) {
      const matched = categories.find((c) => c.keywords.some((kw) => note.includes(kw)));
      cid = matched?.id ?? categories[0]?.id ?? 0;
    }
    if (cid > 0) {
      onAdd({ amount: num, type, categoryId: cid, tagIds: selectedTags, note: note || date, date });
      reset();
    }
  };

  const reset = () => { setAmount(''); setNote(''); setSelectedTags([]); setShowNote(false); setCategoryId(0); };

  const toggleTag = (id: number) => {
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  const expenseColor = 'var(--c-danger)';
  const incomeColor = 'var(--c-success)';
  const accent = type === 'expense' ? expenseColor : incomeColor;

  return (
    <div className="animate-bounce-in" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* TYPE TOGGLE - compact pill */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', borderRadius: 100, background: 'var(--c-bg)', padding: 3 }}>
          <button
            onClick={() => setType('expense')}
            style={{
              padding: '10px 28px', borderRadius: 100, fontWeight: 800, fontSize: 14, border: 'none',
              background: type === 'expense' ? '#fff' : 'transparent',
              color: type === 'expense' ? expenseColor : 'var(--c-text3)',
              boxShadow: type === 'expense' ? '0 2px 8px var(--c-shadow)' : 'none',
            }}
          >💸 支出</button>
          <button
            onClick={() => setType('income')}
            style={{
              padding: '10px 28px', borderRadius: 100, fontWeight: 800, fontSize: 14, border: 'none',
              background: type === 'income' ? '#fff' : 'transparent',
              color: type === 'income' ? incomeColor : 'var(--c-text3)',
              boxShadow: type === 'income' ? '0 2px 8px var(--c-shadow)' : 'none',
            }}
          >💰 收入</button>
        </div>
      </div>

      {/* AMOUNT - hero */}
      <div style={{ textAlign: 'center', paddingTop: 20, paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: accent, paddingBottom: 14 }}>¥</span>
          <input
            type="number" inputMode="decimal" placeholder="0"
            value={amount} onChange={(e) => setAmount(e.target.value)}
            style={{
              width: amount ? 'auto' : 80,
              maxWidth: '70vw',
              fontSize: 64, fontWeight: 900, color: 'var(--c-text)',
              outline: 'none', border: 'none', background: 'transparent',
              textAlign: 'center', fontFamily: 'inherit', letterSpacing: '-0.02em',
            }}
          />
        </div>
        <QuickAmount onSelect={(n) => setAmount(String(n))} />
      </div>

      {/* CATEGORIES - grid 3 cols, big and spacious */}
      <div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
        }}>
          <button
            onClick={() => setCategoryId(0)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '16px 8px', borderRadius: 'var(--radius)',
              background: categoryId === 0 ? 'var(--c-purple)' : 'var(--c-surface)',
              border: categoryId === 0 ? 'none' : '1px solid var(--c-border)',
              color: categoryId === 0 ? '#fff' : 'var(--c-text2)',
              fontWeight: 700, fontSize: 12,
            }}
          >
            <span style={{ fontSize: 28 }}>✨</span>
            自动
          </button>
          {categories.map((c) => (
            <button
              key={c.id} onClick={() => setCategoryId(c.id!)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                padding: '16px 8px', borderRadius: 'var(--radius)',
                background: categoryId === c.id ? c.color : 'var(--c-surface)',
                border: categoryId === c.id ? 'none' : '1px solid var(--c-border)',
                color: categoryId === c.id ? '#fff' : 'var(--c-text2)',
                fontWeight: 700, fontSize: 12,
                boxShadow: categoryId === c.id ? '0 4px 16px ' + c.color + '50' : 'none',
              }}
            >
              <span style={{ fontSize: 28 }}>{c.emoji}</span>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* EXTRA FIELDS - date + note, only when needed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="date" value={date} onChange={(e) => setDate(e.target.value)}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 'var(--radius)',
              background: 'var(--c-surface)', border: '1px solid var(--c-border)',
              color: 'var(--c-text)', fontSize: 14, fontWeight: 600, outline: 'none',
            }}
          />
          <button
            onClick={() => setShowNote(!showNote)}
            style={{
              padding: '12px 16px', borderRadius: 'var(--radius)',
              background: showNote ? 'var(--c-purple)' : 'var(--c-surface)',
              border: showNote ? 'none' : '1px solid var(--c-border)',
              color: showNote ? '#fff' : 'var(--c-text2)',
              fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
            }}
          >💬</button>
        </div>
        {showNote && (
          <input
            type="text" placeholder="写个备注..."
            value={note} onChange={(e) => setNote(e.target.value)}
            className="animate-slide-up"
            style={{
              padding: '12px 16px', borderRadius: 'var(--radius)',
              background: 'var(--c-surface)', border: '1px solid var(--c-border)',
              color: 'var(--c-text)', fontSize: 14, fontWeight: 500, outline: 'none',
            }}
          />
        )}
      </div>

      {/* Tags - compact */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {tags.map((t) => (
            <button
              key={t.id} onClick={() => toggleTag(t.id!)}
              style={{
                padding: '8px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                background: selectedTags.includes(t.id!) ? t.color : 'var(--c-surface)',
                color: selectedTags.includes(t.id!) ? '#fff' : 'var(--c-text2)',
                border: selectedTags.includes(t.id!) ? 'none' : '1px solid var(--c-border)',
              }}
            >{t.emoji} {t.name}</button>
          ))}
        </div>
      )}

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={!amount || parseFloat(amount) <= 0}
        style={{
          width: '100%', padding: '16px', borderRadius: 'var(--radius)',
          border: 'none', color: '#fff', fontSize: 17, fontWeight: 900,
          background: !amount || parseFloat(amount) <= 0
            ? 'var(--c-border)'
            : type === 'expense'
              ? 'linear-gradient(135deg, var(--c-danger), var(--c-pink))'
              : 'linear-gradient(135deg, var(--c-green), var(--c-mint))',
          boxShadow: !amount || parseFloat(amount) <= 0
            ? 'none'
            : type === 'expense'
              ? '0 4px 24px rgba(255,107,107,0.4)'
              : '0 4px 24px rgba(67,185,127,0.4)',
          opacity: !amount || parseFloat(amount) <= 0 ? 0.5 : 1,
        }}
      >
        {!amount || parseFloat(amount) <= 0 ? '输入金额' : '✨ 记一笔'}
      </button>
    </div>
  );
}
