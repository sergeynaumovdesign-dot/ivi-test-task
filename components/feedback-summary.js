import { createReveal } from './text-block.js';

export const feedbackSummaryDefaults = {
  personalized: true,
  personalizedText: 'Тебе нравятся сложные герои: зрители хвалят отношения Уилла и Лектера. Насилие показано подробно. Отдельно отмечают игру Мадса Миккельсена; некоторым третий сезон кажется затянутым.',
  generalText: 'Зрители хвалят отношения Уилла и Лектера и игру Мадса Миккельсена. Насилие показано подробно; некоторым третий сезон кажется затянутым.',
  stream: false,
  width: 343,
};

export function createFeedbackSummary(options = {}) {
  const props = { ...feedbackSummaryDefaults, ...options };
  const block = document.createElement('section');
  block.className = 'ivi-feedback-summary';
  block.style.width = `${props.width}px`;
  const panel = document.createElement('div');
  panel.className = 'ivi-feedback-summary__panel';
  const title = document.createElement('h3');
  title.className = 'ivi-feedback-summary__title ivi-text-medium-text-small';
  title.textContent = 'Главное из отзывов \uE000';
  const body = document.createElement('div');
  body.className = 'ivi-feedback-summary__body';
  const content = document.createElement('p');
  content.className = 'ivi-feedback-summary__text ivi-text-regular-text-small';
  const measure = document.createElement('p');
  measure.className = 'ivi-feedback-summary__measure ivi-text-regular-text-small';
  measure.setAttribute('aria-hidden', 'true');
  const reveal = createReveal({ tone: 'ai', accessibleLabel: 'Показать саммари полностью' });
  reveal.classList.add('ivi-feedback-summary__reveal');
  reveal.hidden = true;
  body.append(content, measure, reveal);
  panel.append(title, body);
  block.append(panel);

  let expanded = false;
  let streaming = Boolean(props.stream);
  let current = streaming ? '' : (props.personalized ? props.personalizedText : props.generalText);
  const pending = [];
  let typingTimer;
  let finishRequested = false;
  let expanding = false;
  let expansionTimer;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function settleExpansion() {
    expanding = false;
    body.style.height = '';
    body.style.overflow = '';
    body.classList.remove('is-animating');
  }
  function followTextHeight() {
    if (!expanding) return;
    body.style.height = `${Math.max(60, content.getBoundingClientRect().height)}px`;
    clearTimeout(expansionTimer);
    if (!streaming) expansionTimer = setTimeout(settleExpansion, 340);
  }
  function update() {
    content.textContent = current;
    measure.textContent = current;
    block.dataset.state = streaming ? 'Loading' : expanded ? 'Expanded' : 'Ready';
    body.classList.toggle('is-loading', streaming);
    body.classList.toggle('is-expanded', expanded);
    const overflows = measure.getBoundingClientRect().height > 60.5;
    reveal.hidden = expanded || !overflows;
    followTextHeight();
  }
  reveal.addEventListener('click', () => {
    const startHeight = body.getBoundingClientRect().height;
    expanded = true;
    if (!reduceMotion) {
      expanding = true;
      body.style.height = `${startHeight}px`;
      body.style.overflow = 'hidden';
      body.classList.add('is-animating');
      void body.offsetHeight;
    }
    update();
    props.onExpand?.();
  });
  function typeNext() {
    if (pending.length) { current += pending.shift(); update(); }
    if (!pending.length) {
      clearInterval(typingTimer);
      typingTimer = undefined;
      if (finishRequested) { streaming = false; update(); }
    }
  }
  block.appendText = chunk => {
    pending.push(...Array.from(String(chunk)));
    if (!typingTimer && pending.length) typingTimer = setInterval(typeNext, props.letterDelay ?? 24);
  };
  block.finish = () => {
    finishRequested = true;
    if (!typingTimer) { streaming = false; update(); }
  };
  block.expand = () => { if (!expanded) reveal.click(); };
  block.getText = () => current;
  block.destroy = () => { clearInterval(typingTimer); clearTimeout(expansionTimer); };
  update();
  queueMicrotask(update);
  return block;
}
