const PRESETS = [10, 15, 20, 30, 50, 100, 200];

export default function QuickAmount({ onSelect }: { onSelect: (n: number) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 16 }}>
      {PRESETS.map((n) => (
        <button
          key={n} type="button" onClick={() => onSelect(n)}
          style={{
            padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 700,
            color: 'var(--c-text2)', background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
          }}
        >¥{n}</button>
      ))}
    </div>
  );
}
