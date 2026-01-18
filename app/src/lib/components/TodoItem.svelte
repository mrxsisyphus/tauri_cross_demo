<script lang="ts">
  import type { Todo } from '$types';
  import { cn, formatRelativeDate, isOverdue, getPriorityColor, getPriorityLabel } from '$lib/utils';
  import { Checkbox, Badge, Button } from '$components/ui';
  import Trash2 from 'lucide-svelte/icons/trash-2';
  import Pencil from 'lucide-svelte/icons/pencil';
  import Calendar from 'lucide-svelte/icons/calendar';

  interface Props {
    todo: Todo;
    onToggle?: (id: string) => void;
    onEdit?: (todo: Todo) => void;
    onDelete?: (id: string) => void;
  }

  let { todo, onToggle, onEdit, onDelete }: Props = $props();
  
  let isHovered = $state(false);
</script>

<div
  class={cn(
    'group relative flex items-start gap-4 p-4 rounded-xl border bg-card transition-all duration-300',
    'hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5',
    todo.completed && 'opacity-60 bg-muted/50'
  )}
  role="listitem"
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
>
  <!-- Checkbox -->
  <div class="pt-0.5">
    <Checkbox
      checked={todo.completed}
      onchange={() => onToggle?.(todo.id)}
    />
  </div>

  <!-- Content -->
  <div class="flex-1 min-w-0">
    <div class="flex items-start justify-between gap-2">
      <h3
        class={cn(
          'font-medium text-foreground transition-all duration-200',
          todo.completed && 'line-through text-muted-foreground'
        )}
      >
        {todo.title}
      </h3>
      
      <!-- Priority Badge -->
      <Badge class={cn('shrink-0', getPriorityColor(todo.priority))}>
        {getPriorityLabel(todo.priority)}
      </Badge>
    </div>

    {#if todo.description}
      <p
        class={cn(
          'mt-1 text-sm text-muted-foreground line-clamp-2',
          todo.completed && 'line-through'
        )}
      >
        {todo.description}
      </p>
    {/if}

    <!-- Meta info -->
    <div class="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
      {#if todo.due_date}
        <span
          class={cn(
            'flex items-center gap-1',
            !todo.completed && isOverdue(todo.due_date) && 'text-destructive font-medium'
          )}
        >
          <Calendar class="w-3 h-3" />
          {formatRelativeDate(todo.due_date)}
          {#if !todo.completed && isOverdue(todo.due_date)}
            <span class="text-destructive">(Overdue)</span>
          {/if}
        </span>
      {/if}
    </div>
  </div>

  <!-- Actions -->
  <div
    class={cn(
      'flex items-center gap-1 transition-all duration-200',
      isHovered ? 'opacity-100' : 'opacity-0'
    )}
  >
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 text-muted-foreground hover:text-foreground"
      onclick={() => onEdit?.(todo)}
    >
      <Pencil class="w-4 h-4" />
      <span class="sr-only">Edit</span>
    </Button>
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 text-muted-foreground hover:text-destructive"
      onclick={() => onDelete?.(todo.id)}
    >
      <Trash2 class="w-4 h-4" />
      <span class="sr-only">Delete</span>
    </Button>
  </div>
</div>
