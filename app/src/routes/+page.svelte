<script lang="ts">
  import { onMount } from 'svelte';
  import type { Todo } from '$types';
  import { todoStore } from '$stores';
  import {
    Header,
    TodoList,
    TodoModal,
    TodoFilters,
    TodoStats,
    Button
  } from '$components';
  import Plus from 'lucide-svelte/icons/plus';
  import Trash2 from 'lucide-svelte/icons/trash-2';

  let isModalOpen = $state(false);
  let editingTodo = $state<Todo | null>(null);

  onMount(() => {
    todoStore.loadTodos();
  });

  function handleOpenCreate() {
    editingTodo = null;
    isModalOpen = true;
  }

  function handleEdit(todo: Todo) {
    editingTodo = todo;
    isModalOpen = true;
  }

  function handleCloseModal() {
    editingTodo = null;
    isModalOpen = false;
  }
</script>

<svelte:head>
  <title>Todo Cross - Cross-Platform Todo App</title>
  <meta name="description" content="A beautiful cross-platform todo application built with Tauri 2.0" />
</svelte:head>

<Header />

<main class="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
  <!-- Stats Section -->
  <section class="mb-8">
    <TodoStats
      total={todoStore.stats.total}
      completed={todoStore.stats.completed}
      active={todoStore.stats.active}
      highPriority={todoStore.stats.highPriority}
    />
  </section>

  <!-- Actions Bar -->
  <section class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
    <h1 class="text-2xl font-bold">My Todos</h1>
    <div class="flex gap-2">
      {#if todoStore.stats.completed > 0}
        <Button
          variant="outline"
          size="sm"
          class="gap-2"
          onclick={() => todoStore.clearCompleted()}
        >
          <Trash2 class="w-4 h-4" />
          Clear Completed
        </Button>
      {/if}
      <Button size="sm" class="gap-2" onclick={handleOpenCreate}>
        <Plus class="w-4 h-4" />
        Add Todo
      </Button>
    </div>
  </section>

  <!-- Filters -->
  <section class="mb-6">
    <TodoFilters
      filter={todoStore.filter}
      sortBy={todoStore.sortBy}
      searchQuery={todoStore.searchQuery}
      onFilterChange={(f) => todoStore.setFilter(f)}
      onSortChange={(s) => todoStore.setSortBy(s)}
      onSearchChange={(q) => todoStore.setSearchQuery(q)}
    />
  </section>

  <!-- Todo List -->
  <section>
    {#if todoStore.isLoading}
      <div class="flex items-center justify-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    {:else}
      <TodoList
        todos={todoStore.filteredTodos}
        onToggle={(id) => todoStore.toggleTodo(id)}
        onEdit={handleEdit}
        onDelete={(id) => todoStore.deleteTodo(id)}
      />
    {/if}
  </section>

  <!-- Floating Action Button (mobile) -->
  <div class="fixed bottom-6 right-6 sm:hidden">
    <Button
      size="lg"
      class="rounded-full h-14 w-14 shadow-lg"
      onclick={handleOpenCreate}
    >
      <Plus class="w-6 h-6" />
      <span class="sr-only">Add Todo</span>
    </Button>
  </div>
</main>

<!-- Modal -->
<TodoModal
  bind:isOpen={isModalOpen}
  {editingTodo}
  onClose={handleCloseModal}
  onCreate={(request) => todoStore.createTodo(request)}
  onUpdate={(id, request) => todoStore.updateTodo(id, request)}
/>

<!-- Environment indicator -->
{#if !todoStore.isTauri}
  <div class="fixed bottom-4 left-4 px-3 py-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs rounded-full border border-yellow-500/30">
    Web Mode (data stored locally)
  </div>
{/if}
