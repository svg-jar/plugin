// Default import - sprite mode
import Arrow from './icons/arrow.svg';

// Named sprite
import Circle from './icons/circle.svg?sprite=shapes';

// Inline mode
import Square from './icons/square.svg?unsafe-inline';

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>SVG Jar React Test</h1>

      <section>
        <h2>Sprite mode (default)</h2>
        <Arrow className="icon" aria-hidden="true" />
      </section>

      <section>
        <h2>Sprite mode with children (title for a11y)</h2>
        <Arrow aria-label="Navigate forward">
          <title>Forward arrow</title>
          <desc>An arrow pointing to the right</desc>
        </Arrow>
      </section>

      <section>
        <h2>Named sprite</h2>
        <Circle className="icon" style={{ width: 48, height: 48 }} />
      </section>

      <section>
        <h2>Inline mode</h2>
        <Square className="icon" style={{ width: 48, height: 48, color: 'green' }} />
      </section>
    </div>
  );
}

export default App;
