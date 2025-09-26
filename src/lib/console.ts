// Minimal Magneto polyfill
(function() {
  const original = console.log;
  console.log = (...args) => original.call(console, '🧲 [MAGNETO]', ...args);
})();