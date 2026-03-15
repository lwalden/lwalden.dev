<script lang="ts">
  import { onMount } from 'svelte';
  import { uiState } from '@/lib/ui.svelte';

  interface Post {
    id: string;
    data: {
      title: string;
      description: string;
    };
  }

  let posts = $state<Post[]>([]);
  let query = $state('');
  let activeIndex = $state(-1);

  let filteredPosts = $derived(
    query.length > 0
      ? posts.filter(
          (post) =>
            post.data.title.toLowerCase().includes(query.toLowerCase()) ||
            post.data.description.toLowerCase().includes(query.toLowerCase())
        )
      : []
  );

  let resultCount = $derived(
    query.length === 0
      ? ''
      : filteredPosts.length === 0
        ? `No results found for "${query}"`
        : `${filteredPosts.length} result${filteredPosts.length === 1 ? '' : 's'} found`
  );

  let searchInput = $state<HTMLInputElement>();
  let dialogEl = $state<HTMLDivElement>();

  // Reset active index when results change
  $effect(() => {
    filteredPosts;
    activeIndex = -1;
  });

  $effect(() => {
    if (uiState.isSearchOpen && searchInput) {
      setTimeout(() => searchInput?.focus(), 10);
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      uiState.closeSearch();
      return;
    }

    // Focus trap: keep Tab within the dialog
    if (e.key === 'Tab' && dialogEl) {
      const focusable = dialogEl.querySelectorAll<HTMLElement>(
        'input, button, a[href], [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }

    // Arrow key navigation through results
    if (filteredPosts.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = activeIndex < filteredPosts.length - 1 ? activeIndex + 1 : 0;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = activeIndex > 0 ? activeIndex - 1 : filteredPosts.length - 1;
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        const post = filteredPosts[activeIndex];
        if (post) {
          uiState.closeSearch();
          window.location.href = `/posts/${post.id}`;
        }
      }
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);

    (async () => {
      try {
        const res = await fetch('/api/search.json');
        if (res.ok) {
          posts = await res.json();
        }
      } catch (err) {
        console.error('Failed to load search index:', err);
      }
    })();

    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<!-- Backdrop: Escape already handles keyboard close, so click-only is acceptable here -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="fixed inset-0 z-[100] flex items-start justify-center pt-8 sm:pt-24 px-4 bg-black/40 backdrop-blur-[4px] transition-all"
  onclick={() => uiState.closeSearch()}
>
  <div
    bind:this={dialogEl}
    role="dialog"
    aria-modal="true"
    aria-label="Search posts"
    class="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    onclick={(e) => e.stopPropagation()}
  >
    <div class="flex items-center gap-3 p-4 sm:p-6 border-b border-border bg-background/50">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
      <input
        bind:this={searchInput}
        bind:value={query}
        type="text"
        placeholder="Search post titles or descriptions..."
        aria-label="Search posts"
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
        class="flex-1 bg-transparent border-none outline-none text-base sm:text-lg text-foreground placeholder:text-muted-foreground/40 font-medium"
      />
      <button
        onclick={() => uiState.closeSearch()}
        class="sm:hidden text-xs font-bold uppercase tracking-widest text-muted-foreground"
      >
        Cancel
      </button>
    </div>

    <div class="max-h-[60vh] sm:max-h-[400px] 3xl:max-h-[600px] overflow-y-auto p-2 sm:p-4">
      {#if query.length === 0}
        <div class="p-12 text-center">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Start typing to search...
          </p>
        </div>
      {:else if filteredPosts.length === 0}
        <div class="p-12 text-center">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            No results found for "{query}"
          </p>
        </div>
      {:else}
        <div class="space-y-1" role="listbox" aria-label="Search results">
          {#each filteredPosts as post, i (post.id)}
            <a
              id={`search-result-${i}`}
              href={`/posts/${post.id}`}
              role="option"
              aria-selected={i === activeIndex}
              class="block p-4 sm:p-5 rounded-xl transition-all no-underline group {i === activeIndex ? 'bg-accent' : 'hover:bg-accent'}"
              onclick={() => uiState.closeSearch()}
            >
              <h3
                class="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors mb-1 {i === activeIndex ? 'text-primary' : ''}"
              >
                {post.data.title}
              </h3>
              <p class="text-xs sm:text-sm text-muted-foreground line-clamp-1 opacity-80">
                {post.data.description}
              </p>
            </a>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Live region for screen reader announcements -->
    <div class="sr-only" aria-live="polite" aria-atomic="true">
      {resultCount}
    </div>

    <div
      class="hidden sm:flex items-center justify-between px-6 py-3 border-t border-border bg-secondary/30"
    >
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <kbd
            class="px-1.5 py-0.5 text-xs font-bold bg-background border border-border rounded shadow-sm"
            >⏎</kbd
          >
          <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >to select</span
          >
        </div>
        <div class="flex items-center gap-2">
          <kbd
            class="px-1.5 py-0.5 text-xs font-bold bg-background border border-border rounded shadow-sm"
            >↑↓</kbd
          >
          <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >to navigate</span
          >
        </div>
      </div>
      <div class="flex items-center gap-2">
        <kbd
          class="px-1.5 py-0.5 text-xs font-bold bg-background border border-border rounded shadow-sm"
          >esc</kbd
        >
        <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >to close</span
        >
      </div>
    </div>
  </div>
</div>
