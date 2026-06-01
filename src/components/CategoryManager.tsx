import { useState } from 'react';
import type { Category, Tag } from '../types';
import { CAT_COLORS } from '../types';

const EMOJIS = ['🍜','🚗','🛍️','🏠','🎮','💊','📱','📌','🎵','📚','🐱','💻','🎁','✈️','🏥','🎓','💄','☕','🍰','⚽'];

interface Props {
  categories: Category[];
  tags: Tag[];
  onAddCategory: (c: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: number) => void;
  onUpdateCategory: (id: number, c: Partial<Category>) => void;
  onAddTag: (t: Omit<Tag, 'id'>) => void;
  onDeleteTag: (id: number) => void;
}

export default function CategoryManager({
  categories, tags,
  onAddCategory, onDeleteCategory, onUpdateCategory,
  onAddTag, onDeleteTag,
}: Props) {
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(CAT_COLORS[0]);
  const [newCatEmoji, setNewCatEmoji] = useState('📌');
  const [newCatKeywords, setNewCatKeywords] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(CAT_COLORS[4]);
  const [newTagEmoji, setNewTagEmoji] = useState('🏷️');
  const [editingCat, setEditingCat] = useState<number | null>(null);

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    onAddCategory({
      name: newCatName.trim(),
      color: newCatColor,
      emoji: newCatEmoji,
      isDefault: false,
      keywords: newCatKeywords.split(/[,，\s]+/).filter(Boolean),
    });
    setNewCatName('');
    setNewCatKeywords('');
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    onAddTag({ name: newTagName.trim(), color: newTagColor, emoji: newTagEmoji });
    setNewTagName('');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Categories */}
      <div className="bg-[var(--c-surface)] rounded-[var(--radius-lg)] p-4 shadow-sm border border-[var(--c-border)]">
        <div className="text-sm font-black text-[var(--c-text)] mb-4">{'📂 分类管理'}</div>
        <div className="space-y-1.5 max-h-64 overflow-y-auto mb-4">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3 py-1.5 group">
              <span className="text-lg">{c.emoji}</span>
              <span className="flex-1 text-sm font-bold text-[var(--c-text)]">{c.name}</span>
              {c.isDefault && (
                <span className="text-[10px] font-bold text-[var(--c-text3)] bg-[var(--c-bg)] px-2 py-0.5 rounded-full">默认</span>
              )}
              {!c.isDefault && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingCat === c.id ? (
                    <div className="flex gap-1">
                      {CAT_COLORS.slice(0, 6).map((color) => (
                        <button
                          key={color}
                          onClick={() => { onUpdateCategory(c.id!, { color }); setEditingCat(null); }}
                          className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <button onClick={() => setEditingCat(null)} className="text-[10px] font-bold text-[var(--c-text3)] px-1">取消</button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setEditingCat(c.id!)} className="text-[10px] font-bold text-[var(--c-purple)]">颜色</button>
                      <button onClick={() => c.id !== undefined && onDeleteCategory(c.id)} className="text-[10px] font-bold text-[var(--c-danger)]">删除</button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Category */}
        <div className="space-y-2 pt-3 border-t border-[var(--c-border)]">
          <input
            type="text"
            placeholder="分类名称"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] bg-[var(--c-bg)] text-sm font-bold text-[var(--c-text)] outline-none border border-[var(--c-border)] focus:border-[var(--c-purple)] placeholder:text-[var(--c-text3)]"
          />
          <input
            type="text"
            placeholder="关键词：午餐,外卖,奶茶"
            value={newCatKeywords}
            onChange={(e) => setNewCatKeywords(e.target.value)}
            className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] bg-[var(--c-bg)] text-xs text-[var(--c-text)] outline-none border border-[var(--c-border)] focus:border-[var(--c-purple)] placeholder:text-[var(--c-text3)]"
          />
          <div className="flex gap-1.5 flex-wrap">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setNewCatEmoji(e)}
                className={'w-8 h-8 rounded-lg flex items-center justify-center text-base ' +
                  (newCatEmoji === e ? 'bg-[var(--c-purple)] scale-110' : 'bg-[var(--c-bg)]')}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CAT_COLORS.slice(0, 8).map((color) => (
              <button
                key={color}
                onClick={() => setNewCatColor(color)}
                className={'w-7 h-7 rounded-full border-2 transition-all ' +
                  (newCatColor === color ? 'border-[var(--c-text)] scale-110' : 'border-transparent')}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <button
            onClick={handleAddCategory}
            className="w-full py-2.5 rounded-[var(--radius-sm)] text-white text-sm font-black active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, var(--c-purple), var(--c-hotpink))' }}
          >
            添加分类
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-[var(--c-surface)] rounded-[var(--radius-lg)] p-4 shadow-sm border border-[var(--c-border)]">
        <div className="text-sm font-black text-[var(--c-text)] mb-3">{'🏷️ 标签管理'}</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: t.color }}
            >
              {t.emoji} {t.name}
              <button onClick={() => t.id !== undefined && onDeleteTag(t.id)} className="ml-0.5 opacity-70 hover:opacity-100">{' ×'}</button>
            </span>
          ))}
          {tags.length === 0 && (
            <span className="text-xs text-[var(--c-text3)] font-medium">还没有标签哦</span>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="标签名"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-[var(--radius-sm)] bg-[var(--c-bg)] text-sm font-bold text-[var(--c-text)] outline-none border border-[var(--c-border)] focus:border-[var(--c-purple)] placeholder:text-[var(--c-text3)]"
            />
            <input
              type="text"
              placeholder="表情"
              value={newTagEmoji}
              onChange={(e) => setNewTagEmoji(e.target.value || '🏷️')}
              className="w-14 text-center px-0 py-2.5 rounded-[var(--radius-sm)] bg-[var(--c-bg)] text-lg outline-none border border-[var(--c-border)]"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CAT_COLORS.slice(0, 5).map((color) => (
              <button
                key={color}
                onClick={() => setNewTagColor(color)}
                className={'w-6 h-6 rounded-full border-2 transition-all ' +
                  (newTagColor === color ? 'border-[var(--c-text)] scale-110' : 'border-transparent')}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <button
            onClick={handleAddTag}
            className="w-full py-2.5 rounded-[var(--radius-sm)] bg-[var(--c-purple)] text-white text-sm font-black active:scale-95 transition-transform"
          >
            添加标签
          </button>
        </div>
      </div>
    </div>
  );
}
