import { node } from './core.js';

export const tabsBlockDefaults = {
  tabs: ['О сериале', 'Сезоны'],
  active: 0,
  width: 375,
};

function visibleLabel(label) {
  const letters = Array.from(label);
  return letters.length > 20 ? `${letters.slice(0, 17).join('')}...` : label;
}

export function createTab({ label = 'О сериале', active = false, standalone = true } = {}) {
  const tab = node('button', 'ivi-tab');
  tab.type = 'button';
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-label', label);
  tab.setAttribute('aria-selected', String(active));
  tab.dataset.active = String(active);
  tab.append(node('span', 'ivi-tab__label ivi-text-medium-text-small', visibleLabel(label)));
  if (standalone) tab.append(node('span', 'ivi-tab__indicator'));
  return tab;
}

export function createTabsBlock(options = {}) {
  const props = { ...tabsBlockDefaults, ...options };
  const labels = props.tabs.map(value => String(value || 'Новый таб'));
  if (!labels.length) labels.push('О сериале');
  const root = node('div', 'ivi-tabs-block');
  root.style.width = `${props.width}px`;
  const row = node('div', 'ivi-tabs-block__row');
  row.setAttribute('role', 'tablist');
  const track = node('div', 'ivi-tabs-block__track');
  const indicator = node('span', 'ivi-tabs-block__indicator');
  indicator.setAttribute('aria-hidden', 'true');
  row.append(track);
  const separator = node('div', 'ivi-tabs-block__separator');
  separator.setAttribute('aria-hidden', 'true');
  root.append(row, separator);
  let active = Math.max(0, Math.min(Number(props.active) || 0, labels.length - 1));
  let pressedX = null;
  let dragged = false;
  function moveIndicator() {
    const tab = track.children[active];
    if (!tab) return;
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
  }
  function ensureVisible(tab) {
    if (!tab) return;
    const left = tab.getBoundingClientRect().left - row.getBoundingClientRect().left + row.scrollLeft;
    const right = left + tab.offsetWidth;
    const visibleLeft = row.scrollLeft + 16;
    const visibleRight = row.scrollLeft + row.clientWidth - 16;
    if (left < visibleLeft) row.scrollTo({ left: Math.max(0, left - 16), behavior: 'smooth' });
    else if (right > visibleRight) row.scrollTo({ left: right - row.clientWidth + 16, behavior: 'smooth' });
  }
  function select(index, notify = true) {
    if (index === active) {
      if (notify) props.onReselect?.(index, labels[index]);
      return;
    }
    active = index;
    Array.from(track.querySelectorAll('.ivi-tab')).forEach((tab, i) => {
      tab.dataset.active = String(i === active);
      tab.setAttribute('aria-selected', String(i === active));
    });
    moveIndicator();
    ensureVisible(track.children[active]);
    if (notify) props.onChange?.(active, labels[active]);
  }
  labels.forEach((label, index) => {
    const tab = createTab({ label, active: index === active, standalone: false });
    tab.addEventListener('pointerdown', event => { pressedX = event.clientX; dragged = false; });
    tab.addEventListener('pointerup', event => { dragged = pressedX !== null && Math.abs(event.clientX - pressedX) > 8; pressedX = null; });
    tab.addEventListener('pointercancel', () => { pressedX = null; dragged = false; });
    tab.addEventListener('click', event => {
      if (dragged) { event.preventDefault(); dragged = false; return; }
      select(index);
    });
    track.append(tab);
  });
  track.append(indicator);
  root.setActive = index => select(Math.max(0, Math.min(index, labels.length - 1)), false);
  root.getActive = () => active;
  requestAnimationFrame(() => {
    moveIndicator();
    ensureVisible(track.children[active]);
    requestAnimationFrame(() => track.classList.add('is-ready'));
  });
  return root;
}
