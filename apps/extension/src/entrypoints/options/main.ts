import { mount } from 'svelte';
import App from '@/entrypoints/options/Options.svelte';
import '@/assets/app.css'

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
