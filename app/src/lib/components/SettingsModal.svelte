<script lang="ts">
  import { settingsStore, todoStore } from '$stores';
  import { Button } from '$components';
  import X from 'lucide-svelte/icons/x';
  import Settings from 'lucide-svelte/icons/settings';
  import RefreshCw from 'lucide-svelte/icons/refresh-cw';
  import { toast } from 'svelte-sonner';

  let { isOpen, onClose } = $props<{ isOpen: boolean; onClose: () => void }>();

  let backendUrl = $state(settingsStore.backendUrl);
  let userId = $state(settingsStore.userId);
  let isTesting = $state(false);

  async function handleTestConnection() {
    isTesting = true;
    settingsStore.update({
      backendUrl: backendUrl.trim(),
      userId: userId.trim() || 'default-user'
    });
    
    try {
      const success = await settingsStore.checkConnection();
      if (success) {
        toast.promise(todoStore.syncWithBackend(), {
          loading: 'Syncing with backend...',
          success: 'Connected and synchronized!',
          error: (err: any) => `Sync failed: ${err?.message || 'Unknown error'}`
        });
      } else {
        toast.error('Could not reach the server. Please check the URL.');
      }
    } catch (e) {
      toast.error('Connection test failed.');
    } finally {
      isTesting = false;
    }
  }

  function handleSave() {
    settingsStore.update({
      backendUrl: backendUrl.trim(),
      userId: userId.trim() || 'default-user'
    });
    settingsStore.checkConnection().then(connected => {
      if (connected) {
        toast.success('Settings saved and connected!');
        todoStore.syncWithBackend();
      } else {
        toast.warning('Settings saved but server is unreachable.');
      }
    });
    onClose();
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          <Settings class="w-5 h-5" />
          App Settings
        </h2>
        <button onclick={onClose} class="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 space-y-4">
        <div class="space-y-2">
          <label for="backendUrl" class="text-sm font-medium">Backend URL</label>
          <input
            id="backendUrl"
            type="url"
            bind:value={backendUrl}
            placeholder="http://127.0.0.1:3001"
            class="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <p class="text-xs text-zinc-500">Use http://127.0.0.1:3001 for local server (recommended over localhost)</p>
        </div>

        <div class="space-y-2">
          <label for="userId" class="text-sm font-medium">User ID</label>
          <input
            id="userId"
            type="text"
            bind:value={userId}
            placeholder="default-user"
            class="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div class="px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
        <Button variant="ghost" onclick={handleTestConnection} disabled={isTesting}>
          <RefreshCw class="w-4 h-4 mr-2 {isTesting ? 'animate-spin' : ''}" />
          Test & Sync
        </Button>
        <Button variant="ghost" onclick={onClose}>Cancel</Button>
        <Button onclick={handleSave}>Save Settings</Button>
      </div>
    </div>
  </div>
{/if}
