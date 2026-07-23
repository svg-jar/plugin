// Default import - sprite mode
import Arrow from './icons/arrow.svg';

// Named sprite
import Circle from './icons/circle.svg?sprite=shapes';

// Inline mode
import Square from './icons/square.svg?unsafe-inline';

// File mode - raw URL
import starUrl from './icons/star.svg?file';

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

// File mode - create an img element with the URL
const img = document.createElement('img');
img.src = starUrl;
img.alt = 'Star';
app.appendChild(img);
