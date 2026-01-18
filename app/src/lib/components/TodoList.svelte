<script lang="ts">
  import type { Todo } from '$types';
  import TodoItem from './TodoItem.svelte';
  import { cn } from '$lib/utils';
  import ListX from 'lucide-svelte/icons/list-x';

  interface Props {
    todos: Todo[];
    onToggle?: (id: string) => void;
    onEdit?: (todo: Todo) => void;
    onDelete?: (id: string) => void;
    class?: string;
  }

  let { todos, onToggle, onEdit, onDelete, class: className }: Props = $props();
</script>

<div class={cn('space-y-3', className)} role="list" aria-label="Todo list">
  {#if todos.length === 0}
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="rounded-full bg-muted p-4 mb-4">
        <ListX class="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-medium text-foreground mb-1">No todos found</h3>
      <p class="text-sm text-muted-foreground max-w-[250px]">
        Create a new todo to get started, or try changing your filters.
      </p>
    </div>
  {:else}
    {#each todos as todo (todo.id)}
      <div class="animate-fade-in">
        <TodoItem {todo} {onToggle} {onEdit} {onDelete} />
      </div>
    {/each}
  {/if}
</div>
