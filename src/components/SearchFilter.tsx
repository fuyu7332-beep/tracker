import { useState } from 'react';
import type { Category } from '../types';

interface Props {
  categories: Category[];
  onFilter: (filters: { keyword: string; categoryId: number; dateFrom: string; dateTo: string }) => void;
}

export default function SearchFilter({ categories, onFilter }: Props) {
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState(0);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const apply = () => {
    onFilter({ keyword: keyword.trim(), categoryId, dateFrom, dateTo });
  };

  const reset = () => {
    setKeyword('');
    setCategoryId(0);
    setDateFrom('');
    setDateTo('');
    onFilter({ keyword: '', categoryId: 0, dateFrom: '', dateTo: '' });
  };

  return (
    <div className="bg-[var(--c-surface)] rounded-[var(--radius-lg)] p-4 space-y-3 shadow-sm border border-[var(--c-border)]">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="搜索备注或金额..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          className="flex-1 px-4 py-2.5 rounded-[var(--radius-sm)] bg-[var(--c-bg)] text-sm text-[var(--c-text)] outline-none border border-[var(--c-border)] focus:border-[var(--c-purple)] placeholder:text-[var(--c-text3)]"
        />
        <button
          onClick={apply}
          className="px-4 py-2.5 rounded-[var(--radius-sm)] bg-[var(--c-purple)] text-white text-sm font-bold"
        >
          搜索
        </button>
      </div>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs font-medium text-[var(--c-purple)]"
      >
        {showAdvanced ? '收起筛选' : '高级筛选'}
      </button>

      {showAdvanced && (
        <div className="space-y-3 animate-slide-up">
          <div>
            <div className="text-xs text-[var(--c-text2)] mb-1.5">分类</div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoryId(0)}
                className={'px-3 py-1 rounded-full text-xs font-bold transition-all ' +
                  (categoryId === 0
                    ? 'bg-[var(--c-purple)] text-white'
                    : 'bg-[var(--c-bg)] text-[var(--c-text2)]')}
              >
                全部
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(c.id!)}
                  className={'px-3 py-1 rounded-full text-xs font-bold transition-all ' +
                    (categoryId === c.id!
                      ? 'text-white'
                      : 'bg-[var(--c-bg)] text-[var(--c-text2)]')}
                  style={{ backgroundColor: categoryId === c.id ? c.color : undefined }}
                >
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <div className="text-xs text-[var(--c-text2)] mb-1">开始日期</div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--c-bg)] text-sm text-[var(--c-text)] outline-none border border-[var(--c-border)]"
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-[var(--c-text2)] mb-1">结束日期</div>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--c-bg)] text-sm text-[var(--c-text)] outline-none border border-[var(--c-border)]"
              />
            </div>
          </div>

          <button
            onClick={reset}
            className="text-xs text-[var(--c-text3)] font-medium"
          >
            清除筛选
          </button>
        </div>
      )}
    </div>
  );
}
