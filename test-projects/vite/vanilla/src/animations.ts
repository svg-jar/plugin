// CSS animation - pulsing circle
import Pulse from './icons/animated/pulse.svg?sprite=animated';

// CSS animation - spinning arc (spinner)
import Spinner from './icons/animated/spinner.svg?sprite=animated';

// SMIL <animate> - cycling fill color + size
import ColorShift from './icons/animated/color-shift.svg?sprite=animated';

// SMIL <animateMotion> - orbiting dot
import Orbit from './icons/animated/orbit.svg?sprite=animated';

// CSS animation - stroke-dashoffset draw-on effect
import Dash from './icons/animated/dash.svg?sprite=animated';

const app = document.getElementById('app')!;

const animations = [
  { label: 'CSS pulse', icon: Pulse },
  { label: 'CSS spinner', icon: Spinner },
  { label: 'SMIL color shift', icon: ColorShift },
  { label: 'SMIL orbit', icon: Orbit },
  { label: 'CSS dash draw', icon: Dash },
];

for (const { label, icon } of animations) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display:inline-flex;flex-direction:column;align-items:center;gap:8px;margin:24px;';

  const svg = icon();
  svg.style.cssText = 'width:100px;height:100px;';
  wrapper.appendChild(svg);

  const caption = document.createElement('span');
  caption.textContent = label;
  caption.style.cssText = 'font:14px/1 sans-serif;color:#555;';
  wrapper.appendChild(caption);

  app.appendChild(wrapper);
}
