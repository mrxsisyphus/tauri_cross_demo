<script lang="ts">
  import type { FilterType, SortType } from '$types';
  import { Button, Input } from '$components/ui';
  import { cn } from '$lib/utils';
  import Search from 'lucide-svelte/icons/search';
  import ListFilter from 'lucide-svelte/icons/list-filter';
  import ArrowDownAZ from 'lucide-svelte/icons/arrow-down-a-z';

  interface Props {
    filter?: FilterType;
    sortBy?: SortType;
    searchQuery?: string;
    onFilterChange?: (filter: FilterType) => void;
    onSortChange?: (sort: SortType) => void;
    onSearchChange?: (query: string) => void;
  }

  let {
    filter = 'all',
    sortBy = 'created',
    searchQuery = '',
    onFilterChange,
    onSortChange,
    onSearchChange
  }: Props = $props();

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' }
  ];

  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'created', label: 'Date Created' },
    { value: 'priority', label: 'Priority' },
    { value: 'due_date', label: 'Due Date' },
    { value: 'title', label: 'Title' }
  ];

  let showSortDropdown = $state(false);
</script>

<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <!-- Search -->
  <div class="relative flex-1 max-w-sm">
    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <Input
      type="search"
      placeholder="Search todos..."
      value={searchQuery}
      oninput={(e) => onSearchChange?.(e.currentTarget.value)}
      class="pl-10"
    />
  </div>

  <div class="flex items-center gap-2">
    <!-- Filter Tabs -->
    <div class="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <ListFilter class="w-4 h-4 text-muted-foreground ml-2" />
      {#each filters as filterOption}
        <button
          type="button"
          class={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
            filter === filterOption.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onclick={() => onFilterChange?.(filterOption.value)}
        >
          {filterOption.label}
        </button>
      {/each}
    </div>

    <!-- Sort Dropdown -->
    <div class="relative">
      <Button
        variant="outline"
        size="sm"
        class="gap-2"
        onclick={() => (showSortDropdown = !showSortDropdown)}
      >
        <ArrowDownAZ class="w-4 h-4" />
        <span class="hidden sm:inline">Sort</span>
      </Button>

      {#if showSortDropdown}
        <div
          class="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-popover p-1 shadow-lg z-10 animate-fade-in"
        >
          {#each sortOptions as option}
            <button
              type="button"
              class={cn(
                'w-full px-3 py-2 text-left text-sm rounded-md transition-colors',
                sortBy === option.value
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted'
              )}
              onclick={() => {
                onSortChange?.(option.value);
                showSortDropdown = false;
              }}
            >
              {option.label}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Close dropdown when clicking outside -->
<svelte:window
  onclick={(e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.relative')) {
      showSortDropdown = false;
    }
  }}
/>
