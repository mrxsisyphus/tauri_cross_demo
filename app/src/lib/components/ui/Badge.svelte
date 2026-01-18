<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    class?: string;
    children?: Snippet;
  }

  let { variant = 'default', class: className, children }: Props = $props();

  const variants: Record<string, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  };
</script>

<span
  class={cn(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
    variants[variant],
    className
  )}
>
  {@render children?.()}
</span>
