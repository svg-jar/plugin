// Default import - sprite mode
import Arrow from '../icons/arrow.svg';

// Named sprite
import Circle from '../icons/circle.svg?sprite=shapes';

// Inline mode
import Square from '../icons/square.svg?unsafe-inline';

<template>
  <h1>SVG Jar Ember Test</h1>

  <section class="sprite">
    <Arrow class="exist" />
  </section>

  <section class="named-sprite">
    <Circle>
      <title>Has a title</title>
      <desc>Has a description</desc>
    </Circle>
  </section>

  <section class="inline">
    <Square />
  </section>

  {{outlet}}
</template>
