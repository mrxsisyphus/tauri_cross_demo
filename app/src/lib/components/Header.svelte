<script lang="ts">
  import { Button } from '$components/ui';
  import Sun from 'lucide-svelte/icons/sun';
  import Moon from 'lucide-svelte/icons/moon';
  import Settings from 'lucide-svelte/icons/settings';
  import CheckSquare from 'lucide-svelte/icons/check-square';

  let { onOpenSettings } = $props<{ onOpenSettings?: () => void }>();

  let isDark = $state(false);

  $effect(() => {
    // Initialize from system preference or localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) {
        isDark = stored === 'dark';
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      updateTheme();
    }
  });

  function toggleTheme() {
    isDark = !isDark;
    updateTheme();
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  function updateTheme() {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
</script>

<header class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="container flex h-16 items-center justify-between px-4 sm:px-6">
    <!-- Logo -->
    <div class="flex items-center gap-2">
      <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
        <CheckSquare class="w-5 h-5" />
      </div>
      <span class="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        Todo Cross
      </span>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <Button variant="ghost" size="icon" onclick={toggleTheme}>
        {#if isDark}
          <Sun class="w-5 h-5" />
        {:else}
          <Moon class="w-5 h-5" />
        {/if}
        <span class="sr-only">Toggle theme</span>
      </Button>

      {#if onOpenSettings}
        <Button variant="ghost" size="icon" onclick={onOpenSettings}>
          <Settings class="w-5 h-5" />
          <span class="sr-only">Settings</span>
        </Button>
      {/if}
    </div>
  </div>
</header>
