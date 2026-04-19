// Default import - sprite mode
import SvgArrow from './icons/arrow.svg';

// Named sprite
import SvgCircle from './icons/circle.svg?sprite=shapes';

// Inline mode
import SvgSquare from './icons/square.svg?unsafe-inline';

// Register custom elements
customElements.define('svg-arrow', SvgArrow);
customElements.define('svg-circle', SvgCircle);
customElements.define('svg-square', SvgSquare);

// Use them in the page
const app = document.getElementById('app')!;
app.innerHTML = `
  <h1>SVG Jar Web Component Test</h1>

  <section>
    <h2>Sprite mode (default)</h2>
    <svg-arrow></svg-arrow>
  </section>

  <section>
    <h2>Sprite mode with children (title for a11y)</h2>
    <svg-arrow>
      <title>Forward arrow</title>
      <desc>An arrow pointing to the right</desc>
    </svg-arrow>
  </section>

  <section>
    <h2>Named sprite</h2>
    <svg-circle></svg-circle>
  </section>

  <section>
    <h2>Inline mode</h2>
    <svg-square></svg-square>
  </section>
`;
