import { node } from './core.js';

export const textBlockDefaults = {
  width: 375,
  textStyle: 'Text Small',
  text: 'Уилл Грэм – настоящий уникум. Он обладает глубокими познаниями в психологии, невероятной проницательностью и очень богатым воображением, которые позволяют ему, используя улики, вплоть до мелочей восстанавливать картину преступления. Более того, Уилл способен думать как преступник, выстраивая стратегию, которой тот руководствовался, совершая убийство. Необычным талантом молодого человека интересуется ФБР и предлагает ему сотрудничество.',
};
export const textBlockStyles = {
  'Text Small': 'ivi-text-regular-text-small',
  Text: 'ivi-text-regular-text',
  'Text Large': 'ivi-text-regular-text-large',
  Caption: 'ivi-text-regular-caption',
  'Text Small Medium': 'ivi-text-medium-text-small',
  'Text Small Bold': 'ivi-text-bold-text-small',
};

export function createReveal(options = {}) {
  const p = { label: 'ещё', ...options };
  const button = node('button', 'ivi-reveal ivi-text-regular-text-small', p.label);
  button.type = 'button';
  button.setAttribute('aria-label', p.accessibleLabel || 'Показать текст полностью');
  if (p.tone === 'ai') button.dataset.tone = 'ai';
  if (p.onPress) button.addEventListener('click', p.onPress);
  return button;
}

export function createTextBlock(options = {}) {
  const p = { ...textBlockDefaults, ...options };
  const root = node('section', 'ivi-text-block');
  root.style.width = `${p.width}px`;
  const body = node('div', 'ivi-text-block__body');
  const style = textBlockStyles[p.textStyle] || textBlockStyles['Text Small'];
  const content = node('p', `ivi-text-block__content ${style}`, p.text);
  const measure = node('p', `ivi-text-block__measure ${style}`, p.text);
  measure.setAttribute('aria-hidden', 'true');
  const reveal = createReveal({ onPress: expand });
  body.append(content, measure, reveal);
  root.append(body);
  let expanded = false;
  let lastWidth = 0;
  let animationTimer;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function update() {
    root.hidden = !p.text.trim();
    if (root.hidden) return;
    const lineHeight = Number.parseFloat(getComputedStyle(content).lineHeight) || 20;
    reveal.hidden = expanded || measure.getBoundingClientRect().height <= lineHeight * 3 + .5;
  }
  function expand() {
    if (expanded) return;
    const start = body.getBoundingClientRect().height;
    expanded = true;
    root.dataset.state = 'Expanded';
    body.classList.add('is-expanded');
    update();
    if (!reduceMotion) {
      const end = measure.getBoundingClientRect().height;
      body.style.height = `${start}px`;
      body.style.overflow = 'hidden';
      void body.offsetHeight;
      body.classList.add('is-animating');
      requestAnimationFrame(() => { body.style.height = `${end}px`; });
      const settle = () => { body.classList.remove('is-animating'); body.style.height = ''; body.style.overflow = ''; };
      body.addEventListener('transitionend', settle, { once: true });
      animationTimer = setTimeout(settle, 350);
    }
    p.onExpand?.();
  }
  root.setText = text => { p.text = String(text ?? ''); content.textContent = measure.textContent = p.text; queueMicrotask(update); };
  root.expand = expand;
  root.destroy = () => { observer?.disconnect(); clearTimeout(animationTimer); };
  root.dataset.state = 'Collapsed';
  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
    const width = body.getBoundingClientRect().width;
    if (width !== lastWidth) { lastWidth = width; update(); }
  });
  observer?.observe(root);
  queueMicrotask(update);
  return root;
}
