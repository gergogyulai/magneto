import { mount } from 'svelte';
import App from '@/entrypoints/popup/Popup.svelte';
import '@/assets/app.css'

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
