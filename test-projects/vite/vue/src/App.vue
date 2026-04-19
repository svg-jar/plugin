<script setup lang="ts">
// Default import - sprite mode
import Arrow from './icons/arrow.svg';

// Named sprite
import Circle from './icons/circle.svg?sprite=shapes';

// Inline mode
import Square from './icons/square.svg?unsafe-inline';
</script>

<template>
  <div style="padding: 2rem; font-family: sans-serif">
    <h1>SVG Jar Vue Test</h1>

    <section>
      <h2>Sprite mode (default)</h2>
      <Arrow class="icon" aria-hidden="true" />
    </section>

    <section>
      <h2>Sprite mode with slot content (title for a11y)</h2>
      <Arrow aria-label="Navigate forward">
        <title>Forward arrow</title>
        <desc>An arrow pointing to the right</desc>
      </Arrow>
    </section>

    <section>
      <h2>Named sprite</h2>
      <Circle class="icon" :style="{ width: '48px', height: '48px' }" />
    </section>

    <section>
      <h2>Inline mode</h2>
      <Square class="icon" :style="{ width: '48px', height: '48px', color: 'green' }" />
    </section>
  </div>
</template>
