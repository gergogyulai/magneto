<script lang="ts">
	import { ModeWatcher } from "mode-watcher";
	let { children } = $props();
</script>

<ModeWatcher modeStorageKey="magneto-mode-watcher-mode" />
{@render children()}