export default function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="text-6xl mb-4 animate-float">{emoji}</div>
      <div className="text-lg font-bold text-[var(--c-text)] mb-1">{title}</div>
      <div className="text-sm text-[var(--c-text2)]">{subtitle}</div>
    </div>
  );
}
