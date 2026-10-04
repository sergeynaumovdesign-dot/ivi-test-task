import { createButton } from './button.js';
import { node } from './core.js';

export const buttonsBlockDefaults = {
  width: 375,
  label: 'Смотреть',
  caption: 'Сезон 1 серия 1',
  showSecondary: true,
  saved: false,
  rated: false,
};

export function createButtonsBlock(options = {}) {
  const p = { ...buttonsBlockDefaults, ...options };
  const root = node('div', 'ivi-buttons-block');
  root.style.width = `${p.width}px`;
  const primary = createButton({ type: 'Primary', size: 'Big', content: 'Text', width: p.width - 32, label: p.label, caption: Boolean(p.caption), captionText: p.caption, onPress: () => p.onWatch?.() });
  root.append(primary);
  if (!p.showSecondary) return root;
  const row = node('div', 'ivi-buttons-block__row');
  const iconWidth = (p.width - 32 - 24) / 4;
  const iconButton = (icon, onPress, active = false) => createButton({ type: 'Secondary', size: 'Big', content: 'Icon', icon, iconWidth, iconColor: active ? 'var(--ivi-action-primary-default)' : undefined, onPress });
  let saved = Boolean(p.saved);
  let rated = Boolean(p.rated);
  let bookmark;
  function toggleSave() {
    saved = !saved;
    const next = iconButton(saved ? 'bookmark-fill' : 'bookmark', toggleSave, saved);
    bookmark.replaceWith(next);
    bookmark = next;
    p.onSaveChange?.(saved);
  }
  bookmark = iconButton(saved ? 'bookmark-fill' : 'bookmark', toggleSave, saved);
  let star = iconButton(rated ? 'star-fill' : 'star', () => p.onRate?.(), rated);
  root.setSaved = value => {
    saved = Boolean(value);
    const next = iconButton(saved ? 'bookmark-fill' : 'bookmark', toggleSave, saved);
    bookmark.replaceWith(next);
    bookmark = next;
  };
  root.setRated = value => {
    rated = Boolean(value);
    const next = iconButton(rated ? 'star-fill' : 'star', () => p.onRate?.(), rated);
    star.replaceWith(next);
    star = next;
  };
  row.append(bookmark, iconButton('download', () => p.onDownload?.()), star, iconButton('share-arrow', () => p.onShare?.()));
  root.append(row);
  return root;
}
