# Компоненты для прототипа

Источник: текущая страница UI Kit `193:3060` в Figma. В библиотеке 32 раздела; вложенные элементы доступны также из `components/index.js`.

## Переиспользование

| Составной компонент | Из чего собран |
| --- | --- |
| Content Card Cover | Content Page Header, Title Block, Friend Rate, Title Description, Buttons Block |
| Content Page Header | Icon Button → Icon |
| Title Block · Тайтл | Title Rating, Tag |
| Title Block · Раздел | Margin, Subtitle Block → Title Rating |
| Buttons Block, Rating Block | Button |
| Friend Rate, Person Card | Общая плашка оценки → Tag → Icon |
| Feedback Block | Icon; реакция и текст имеют отдельные области нажатия |
| Season Tab Block | Season Tab |
| Tabs Block | Tab |
| Text Block, Feedback Summary Block | Reveal |
| Series | SeriesPreview, Button, Text Block |
| Moment Screen | MomentBottomSide, Button |
| Content Screen | Content Card Cover, Tabs Block, Moment Card, Person Card, Rating Block, Feedback Summary, Feedback Block, Video Card, Compilation Card, Poster, Text Block, Row |
| MomentBottomSide | Poster, Progress Bar, Button |
| Progress Bar | Blob |
| Compilation Card | Poster |
| Row | Tag при соответствующем типе значения |
| Navigation Bar | Icon Button → Icon |
| Status Bar | Icon |

Moment Card и Video Card — самостоятельные карточки с разными пропорциями и поведением медиа. Линия просмотренной части SeriesPreview не является интерактивным Progress Bar. Встроенная AI-иконка остаётся глифом общего шрифта, чтобы работать внутри текста.

## Добавленные элементы без отдельной подробной спецификации

| Компонент | Узел Figma | Модуль |
| --- | --- | --- |
| Season Tab | 183:56846 | season-tabs.js |
| Tag | 243:71230 | tag.js |
| Row | 183:58217 | layout.js |
| Poster | 183:56468 | poster.js |
| Compilation Card | 183:56926 | compilation-card.js |
| Content Page Header | 217:69811 | content-page-header.js |
| Title Block · Тайтл | 243:71150 | title-block.js |
| Title Block · Раздел | 297:9326 | layout.js |
| Subtitle Block | 297:9764 | layout.js |
| Navigation Bar | 183:57891 | navigation.js |
| Status Bar | 183:61217 | navigation.js |
| Margin | 297:9332 | layout.js |
| Blob | 366:35541 | blob.js |
| Icons | исходные иконки UI Kit | icon.js |

Старые варианты Friend Recomendation и Tag на первой странице представлены актуальными Friend Rate и Tag из UI Kit; отдельные дубли не создавались. Действия переходов передаются снаружи через callbacks: сам компонент не задаёт навигацию будущего прототипа.

## Проверка

`tests/component-audit.html` — 25 проверок вариантов, изображений, реакций, продолжения серии, предельных размеров, вкладок и вложенных компонентов. `tests/figma-comparison.html?component=tag#tag` — эталон и реализация в исходном размере. Оригинальные изображения сравнения не используются как готовые компоненты в интерфейсе.

Известные отличия: Status Bar использует общий IVI Sans AI SVG вместо SF Pro; размытие Figma воспроизведено средствами CSS, поэтому его растеризация может отличаться. У Season Tab расширенные области соседних кнопок частично перекрываются при сохранённых интервалах макета.
