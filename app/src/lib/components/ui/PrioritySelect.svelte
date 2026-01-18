<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    value: 'low' | 'medium' | 'high';
    onchange?: (value: 'low' | 'medium' | 'high') => void;
    class?: string;
  }

  let { value = $bindable('medium'), onchange, class: className }: Props = $props();

  const options: { value: 'low' | 'medium' | 'high'; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: 'bg-priority-low' },
    { value: 'medium', label: 'Medium', color: 'bg-priority-medium' },
    { value: 'high', label: 'High', color: 'bg-priority-high' }
  ];

  function selectOption(optionValue: 'low' | 'medium' | 'high') {
    value = optionValue;
    onchange?.(optionValue);
  }
</script>

<div class={cn('flex gap-2', className)}>
  {#each options as option}
    <button
      type="button"
      class={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
        'border-2',
        value === option.value
          ? 'border-foreground/50 bg-accent'
          : 'border-transparent hover:bg-accent/50'
      )}
      onclick={() => selectOption(option.value)}
    >
      <span class={cn('w-2 h-2 rounded-full', option.color)}></span>
      {option.label}
    </button>
  {/each}
</div>
