// Default import - sprite mode
import Arrow from './icons/arrow.svg';

// Named sprite
import Circle from './icons/circle.svg?sprite=shapes';

// Inline mode
import Square from './icons/square.svg?unsafe-inline';

// File mode - raw URL
import starUrl from './icons/star.svg?file';

// Embedded refs - SVG with <use href> referencing another SVG
import UseRef from './icons/with-use-ref.svg';

// Embedded refs - SVG with <image href> referencing a PNG
import ImageRef from './icons/with-image-ref.svg';

// Source order - complex SVG with layered shapes, gradients, clip-paths, text
import SourceOrder from './icons/source-order.svg';

const app = document.getElementById('app')!;

// Sprite mode - call the factory to create a DOM node
app.appendChild(Arrow());

// Sprite mode with options - attributes, title, desc
app.appendChild(
  Arrow({
    class: 'icon',
    'aria-label': 'Navigate forward',
    title: 'Forward arrow',
    desc: 'An arrow pointing to the right',
  }),
);

// Named sprite
app.appendChild(Circle());

// Inline mode
app.appendChild(Square());

// Inline mode with options
app.appendChild(Square({ class: 'inline-icon', title: 'Blue square' }));

// File mode - create an img element with the URL
const img = document.createElement('img');
img.src = starUrl;
img.alt = 'Star';
app.appendChild(img);

// Embedded refs
app.appendChild(UseRef());
app.appendChild(ImageRef());

// Source order - render at larger size to see detail
const sourceOrderEl = SourceOrder();
sourceOrderEl.style.width = '100px';
sourceOrderEl.style.height = '100px';
app.appendChild(sourceOrderEl);
