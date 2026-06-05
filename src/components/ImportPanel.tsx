import { useRef, useState } from 'react';
import type { Account } from '../types';

interface Props {
  accounts: Account[];
  onImportCSV: (file: File) => Promise<number>;
}

export default function ImportPanel({ accounts, onImportCSV }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setResult('');
    const count = await onImportCSV(file);
    setImporting(false);
    setResult('成功导入 ' + count + ' 条记录');
    setTimeout(() => setResult(''), 3000);
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* CSV Import */}
      <div style={{ background: 'var(--c-surface)', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--c-border)' }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--c-text)', marginBottom: 4 }}>📥 CSV 账单导入</div>
        <div style={{ fontSize: 12, color: 'var(--c-text2)', marginBottom: 16 }}>
          支持微信、支付宝、银行导出的 CSV 账单，自动识别格式和分类
        </div>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          style={{
            width: '100%', padding: '14px', borderRadius: 'var(--radius)',
            background: importing ? 'var(--c-border)' : 'linear-gradient(135deg, var(--c-purple), var(--c-hotpink))',
            color: '#fff', fontSize: 15, fontWeight: 900, border: 'none',
          }}
        >{importing ? '解析中...' : '选择 CSV 文件'}</button>
        {result && (
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 14, fontWeight: 700, color: 'var(--c-success)' }}>
            {result}
          </div>
        )}
      </div>

      {/* Account List */}
      <div style={{ background: 'var(--c-surface)', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--c-border)' }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--c-text)', marginBottom: 12 }}>💳 我的账户</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {accounts.map((a) => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 'var(--radius-sm)',
              background: a.color + '18', border: '1px solid ' + a.color + '30',
            }}>
              <span style={{ fontSize: 24 }}>{a.emoji}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--c-text)' }}>{a.name}</span>
              <span style={{ fontSize: 12, color: 'var(--c-text2)' }}>余额 ¥{a.balance.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shortcut Guide */}
      <div style={{ background: 'var(--c-surface)', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--c-border)' }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--c-text)', marginBottom: 4 }}>⚡ 快捷自动记账</div>
        <div style={{ fontSize: 12, color: 'var(--c-text2)', marginBottom: 12, lineHeight: 1.6 }}>
          通过 iOS 快捷指令，收到支付短信后自动记录。设置方法：
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--c-text2)', lineHeight: 1.7 }}>
          <div><span style={{ fontWeight: 900, color: 'var(--c-purple)' }}>1.</span> 打开 iPhone「快捷指令」App</div>
          <div><span style={{ fontWeight: 900, color: 'var(--c-purple)' }}>2.</span> 底部「自动化」→ 右上角 + →「信息」</div>
          <div><span style={{ fontWeight: 900, color: 'var(--c-purple)' }}>3.</span> 发件人填银行号码（如 95566），点下一步</div>
          <div><span style={{ fontWeight: 900, color: 'var(--c-purple)' }}>4.</span> 添加操作「URL」→ 填入：<code style={{ fontSize: 11, wordBreak: 'break-all', color: 'var(--c-pink)' }}>https://fuyu7332-beep.github.io/tracker/?add=短信息</code></div>
          <div><span style={{ fontWeight: 900, color: 'var(--c-purple)' }}>5.</span> 添加「打开 URL」→ 关闭「运行前询问」→ 完成</div>
        </div>
      </div>
    </div>
  );
}
