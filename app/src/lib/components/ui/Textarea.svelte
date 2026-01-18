<script lang="ts">
  import { cn } from '$lib/utils';
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  interface Props extends HTMLTextareaAttributes {
    value?: string;
    class?: string;
  }

  // Make `value` bindable and forward input events
  let { value = $bindable(''), class: className, ...restProps }: Props = $props();
</script>

<textarea
  value={value}
  on:input={(e) => (value = (e.currentTarget as HTMLTextAreaElement).value)}
  class={cn(
    'flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'resize-none',
    className
  )}
  {...restProps}
></textarea>
