import { useRef } from 'react';

interface Props {
  isDark: boolean;
  onToggleTheme: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
}

export default function SettingsPanel({ isDark, onToggleTheme, onExportCSV, onExportJSON, onImportJSON }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (confirm('导入将覆盖当前数据，确定继续吗？')) {
        onImportJSON(file);
      }
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      {/* Theme */}
      <div className="bg-[var(--c-surface)] rounded-[var(--radius-lg)] p-4 shadow-sm border border-[var(--c-border)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-[var(--c-text)]">{isDark ? '🌙 夜间模式' : '☀️ 日间模式'}</div>
            <div className="text-xs text-[var(--c-text2)] mt-0.5">切换明暗主题</div>
          </div>
          <button
            onClick={onToggleTheme}
            className={'w-14 h-8 rounded-full transition-colors relative ' +
              (isDark ? 'bg-[var(--c-purple)]' : 'bg-[var(--c-border)]')}
          >
            <div
              className={'w-6 h-6 rounded-full bg-white shadow-sm absolute top-1 transition-transform ' +
                (isDark ? 'translate-x-7' : 'translate-x-1')}
            />
          </button>
        </div>
      </div>

      {/* Export */}
      <div className="bg-[var(--c-surface)] rounded-[var(--radius-lg)] p-4 shadow-sm border border-[var(--c-border)]">
        <div className="text-sm font-bold text-[var(--c-text)] mb-3">{'📤 导出数据'}</div>
        <div className="flex gap-2">
          <button
            onClick={onExportCSV}
            className="flex-1 py-3 rounded-[var(--radius-sm)] bg-[var(--c-green)] text-white text-sm font-bold active:scale-95 transition-transform"
          >
            {'📊 CSV 导出'}
          </button>
          <button
            onClick={onExportJSON}
            className="flex-1 py-3 rounded-[var(--radius-sm)] bg-[var(--c-purple)] text-white text-sm font-bold active:scale-95 transition-transform"
          >
            {'💾 JSON 备份'}
          </button>
        </div>
      </div>

      {/* Import */}
      <div className="bg-[var(--c-surface)] rounded-[var(--radius-lg)] p-4 shadow-sm border border-[var(--c-border)]">
        <div className="text-sm font-bold text-[var(--c-text)] mb-3">{'📥 恢复备份'}</div>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full py-3 rounded-[var(--radius-sm)] bg-[var(--c-bg)] border-2 border-dashed border-[var(--c-border)] text-sm font-bold text-[var(--c-text2)] hover:border-[var(--c-purple)] transition-colors"
        >
          {'选择 JSON 备份文件'}
        </button>
        <div className="text-[10px] text-[var(--c-text3)] mt-2 text-center">
          导入会覆盖当前所有数据，请确认备份已保存
        </div>
      </div>

      {/* About */}
      <div className="text-center py-6">
        <div className="text-3xl mb-2">🐷</div>
        <div className="text-xs text-[var(--c-text3)]">记账本 v2.0 · 每一笔都算数</div>
      </div>
    </div>
  );
}
