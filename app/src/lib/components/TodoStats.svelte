<script lang="ts">
  import { cn } from '$lib/utils';
  import CheckCircle from 'lucide-svelte/icons/check-circle';
  import Circle from 'lucide-svelte/icons/circle';
  import AlertCircle from 'lucide-svelte/icons/alert-circle';
  import ListTodo from 'lucide-svelte/icons/list-todo';

  interface Props {
    total?: number;
    completed?: number;
    active?: number;
    highPriority?: number;
    class?: string;
  }

  let { total = 0, completed = 0, active = 0, highPriority = 0, class: className }: Props = $props();

  const stats = $derived([
    { label: 'Total', value: total, icon: ListTodo, color: 'text-foreground bg-secondary' },
    { label: 'Active', value: active, icon: Circle, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-green-500 bg-green-500/10' },
    { label: 'High Priority', value: highPriority, icon: AlertCircle, color: 'text-priority-high bg-priority-high/10' }
  ]);
</script>

<div class={cn('grid grid-cols-2 sm:grid-cols-4 gap-4', className)}>
  {#each stats as stat}
    <div
      class={cn(
        'flex items-center gap-3 p-4 rounded-xl border bg-card transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5'
      )}
    >
      <div class={cn('p-2 rounded-lg', stat.color.split(' ')[1])}>
        <stat.icon class={cn('w-5 h-5', stat.color.split(' ')[0])} />
      </div>
      <div>
        <p class="text-2xl font-bold">{stat.value}</p>
        <p class="text-xs text-muted-foreground">{stat.label}</p>
      </div>
    </div>
  {/each}
</div>
