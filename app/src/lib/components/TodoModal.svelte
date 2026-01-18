<script lang="ts">
  import type { CreateTodoRequest, Priority, Todo, UpdateTodoRequest } from '$types';
  import { Button, Input, Textarea, PrioritySelect } from '$components/ui';
  import { cn } from '$lib/utils';
  import X from 'lucide-svelte/icons/x';
  import Plus from 'lucide-svelte/icons/plus';
  import Save from 'lucide-svelte/icons/save';

  interface Props {
    isOpen?: boolean;
    editingTodo?: Todo | null;
    onClose?: () => void;
    onCreate?: (request: CreateTodoRequest) => void;
    onUpdate?: (id: string, request: UpdateTodoRequest) => void;
  }

  let { isOpen = $bindable(false), editingTodo = null, onClose, onCreate, onUpdate }: Props = $props();

  let title = $state('');
  let description = $state('');
  let priority = $state<Priority>('medium');
  let dueDate = $state('');

  // Reset or populate form when editingTodo changes
  $effect(() => {
    if (editingTodo) {
      title = editingTodo.title;
      description = editingTodo.description || '';
      priority = editingTodo.priority;
      dueDate = editingTodo.due_date ? editingTodo.due_date.split('T')[0] : '';
    } else {
      resetForm();
    }
  });

  function resetForm() {
    title = '';
    description = '';
    priority = 'medium';
    dueDate = '';
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    // Debugging: log form values to ensure the handler is called and values are present
    console.log('TodoModal handleSubmit', { title, description, priority, dueDate, editingTodo });

    if (!title.trim()) {
      console.log('Submission blocked: title is empty after trim');
      return;
    }

    if (editingTodo) {
      onUpdate?.(editingTodo.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined
      });
    } else {
      onCreate?.({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined
      });
    }

    handleClose();
  }

  function handleClose() {
    resetForm();
    isOpen = false;
    onClose?.();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <!-- Modal -->
    <div
      class={cn(
        'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
        'rounded-2xl border bg-background p-6 shadow-2xl animate-bounce-in'
      )}
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 id="modal-title" class="text-xl font-semibold">
          {editingTodo ? 'Edit Todo' : 'Create New Todo'}
        </h2>
        <Button variant="ghost" size="icon" onclick={handleClose}>
          <X class="w-5 h-5" />
        </Button>
      </div>

      <!-- Form -->
      <form onsubmit={handleSubmit} class="space-y-4">
        <!-- Title -->
        <div class="space-y-2">
          <label for="title" class="text-sm font-medium">Title</label>
          <Input
            id="title"
            bind:value={title}
            placeholder="What needs to be done?"
            required
            autofocus
          />
          {#if import.meta.env.DEV}
            <div class="text-xs text-muted mt-1">Debug: title="{title}" | submitEnabled={!title.trim()}</div>
          {/if}
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <label for="description" class="text-sm font-medium">Description (optional)</label>
          <Textarea
            id="description"
            bind:value={description}
            placeholder="Add more details..."
            rows={3}
          />
        </div>

        <!-- Priority -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Priority</label>
          <PrioritySelect bind:value={priority} />
        </div>

        <!-- Due Date -->
        <div class="space-y-2">
          <label for="due-date" class="text-sm font-medium">Due Date (optional)</label>
          <Input
            id="due-date"
            type="date"
            bind:value={dueDate}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onclick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim()}>
            {#if editingTodo}
              <Save class="w-4 h-4" />
              Save Changes
            {:else}
              <Plus class="w-4 h-4" />
              Create Todo
            {/if}
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}
