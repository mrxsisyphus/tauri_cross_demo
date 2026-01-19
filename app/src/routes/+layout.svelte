<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';
  import { Toaster } from 'svelte-sonner';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="min-h-screen bg-background">
  {@render children()}
</div>
<Toaster position="bottom-right" />
