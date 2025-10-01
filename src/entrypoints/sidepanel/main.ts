import { mount } from 'svelte';
import Sidepanel from '@/entrypoints/sidepanel/Sidepanel.svelte';
import '@/assets/app.css'

const app = mount(Sidepanel, {
  target: document.getElementById('app')!,
});

export default app;
