<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
  }

  let { class: className, children }: Props = $props();
</script>

<div
  class={cn(
    'rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200',
    'hover:shadow-md',
    className
  )}
>
  {@render children?.()}
</div>
