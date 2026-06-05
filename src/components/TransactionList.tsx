import type { Transaction, Category, Tag, Account } from '../types';
import EmptyState from './EmptyState';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  tags: Tag[];
  accounts: Account[];
  onDelete: (id: number) => void;
}

export default function TransactionList({ transactions, categories, tags, accounts, onDelete }: Props) {
  if (transactions.length === 0) {
    return <EmptyState emoji="📝" title="还没有记录哦" subtitle="去记账页开始你的第一笔吧～" />;
  }

  const grouped: Record<string, Transaction[]> = {};
  transactions.forEach((t) => {
    if (!grouped[t.date]) grouped[t.date] = [];
    grouped[t.date].push(t);
  });

  const dates = Object.keys(grouped).sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const dateLabel = (d: string) => {
    if (d === today) return '今天';
    if (d === yesterday) return '昨天';
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return d + ' 周' + days[new Date(d).getDay()];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {dates.map((date, di) => (
        <div key={date} className={di === 0 ? 'animate-slide-up' : 'animate-fade-in'}>
          <div className="flex items-center gap-2 mb-3 ml-1">
            <span className="text-sm font-black" style={{ color: 'var(--c-text)' }}>{dateLabel(date)}</span>
            {date === today && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--c-pink), var(--c-purple))' }}>NEW</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {grouped[date].map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 animate-fade-in"
                  style={{
                    background: 'var(--c-surface)',
                    borderRadius: 'var(--radius)',
                    padding: '14px',
                    border: '1px solid var(--c-border)',
                  }}
                >
                  <div
                    className="shrink-0 flex items-center justify-center text-xl"
                    style={{
                      width: 48, height: 48,
                      borderRadius: 'var(--radius-sm)',
                      background: 'linear-gradient(135deg, ' + (cat?.color || '#ccc') + '30, ' + (cat?.color || '#ccc') + '15)',
                    }}
                  >{cat?.emoji || '❓'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[var(--c-text)] truncate">{t.note || cat?.name || '未分类'}</div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {t.tagIds?.map((tid) => {
                        const tag = tags.find((tg) => tg.id === tid);
                        return tag ? (
                          <span key={tid} className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold" style={{ background: tag.color }}>
                            {tag.emoji} {tag.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-black" style={{ color: t.type === 'expense' ? 'var(--c-danger)' : 'var(--c-success)' }}>
                      {t.type === 'expense' ? '-' : '+'}¥{t.amount.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => t.id !== undefined && onDelete(t.id)}
                    className="shrink-0 flex items-center justify-center rounded-full text-lg font-bold transition-colors"
                    style={{ width: 32, height: 32, color: 'var(--c-text3)' }}
                  >×</button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
