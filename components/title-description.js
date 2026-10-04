/** Text stays in one block so line breaks flow naturally across the highlighted ending. */
export const descriptionDefaults = {
  type: 'Default',
  text: 'Аналитик ФБР с уникальным даром ищет неуловимого маньяка, который оказывается ближе, чем кажется',
  prefix: 'Аналитик ФБР всё ближе к разгадке серии убийств и всё дальше от мысли, что убийца может быть рядом. Здесь даже спокойный разговор оставляет ту вязкую тревогу, ',
  personalized: 'которую ты любишь',
  canPersonalize: true,
  width: 375,
};

export function createTitleDescription(options = {}) {
  const props = { ...descriptionDefaults, ...options };
  const personalized = props.type === 'AI' && props.canPersonalize && Boolean(props.personalized.trim());
  const block = document.createElement('div');
  block.className = 'ivi-title-description';
  block.dataset.type = personalized ? 'AI' : 'Default';
  block.style.width = `${props.width}px`;

  const paragraph = document.createElement('p');
  paragraph.className = 'ivi-title-description__text';
  if (personalized) {
    paragraph.append(document.createTextNode(props.prefix));
    const accent = document.createElement('span');
    accent.className = 'ivi-title-description__accent';
    accent.textContent = `${props.personalized} \uE000`;
    paragraph.append(accent);
  } else {
    paragraph.textContent = props.text;
  }
  block.append(paragraph);
  return block;
}
