<script lang="ts">
  import { cn } from '$lib/utils';
  import Check from 'lucide-svelte/icons/check';

  interface Props {
    checked?: boolean;
    onchange?: (checked: boolean) => void;
    class?: string;
    disabled?: boolean;
  }

  let { checked = $bindable(false), onchange, class: className, disabled = false }: Props = $props();

  function handleClick() {
    if (disabled) return;
    checked = !checked;
    onchange?.(checked);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }
</script>

<button
  type="button"
  role="checkbox"
  aria-checked={checked}
  {disabled}
  class={cn(
    'peer h-5 w-5 shrink-0 rounded-md border-2 border-primary shadow-sm transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'hover:border-primary/80 active:scale-95',
    checked && 'bg-primary text-primary-foreground',
    className
  )}
  onclick={handleClick}
  onkeydown={handleKeydown}
>
  {#if checked}
    <div class="flex items-center justify-center animate-bounce-in">
      <Check class="h-3.5 w-3.5" />
    </div>
  {/if}
</button>
