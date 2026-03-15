<script lang="ts">
  import { theme } from '@/lib/theme.svelte';
  import { slide } from 'svelte/transition';
  import { onMount } from 'svelte';

  let isOpen = $state(false);
  let dropdownRef: HTMLDivElement;
  let buttonId = 'theme-toggle-btn';

  const options = [
    { value: 'light' as const, label: 'Light' },
    { value: 'dark' as const, label: 'Dark' },
    { value: 'system' as const, label: 'System' },
  ];

  let focusedIndex = $state(-1);

  function toggleDropdown() {
    isOpen = !isOpen;
    if (isOpen) {
      focusedIndex = options.findIndex((o) => o.value === theme.current);
    }
  }

  function closeDropdown() {
    isOpen = false;
    focusedIndex = -1;
  }

  function setTheme(newTheme: 'light' | 'dark' | 'system') {
    if (theme.current === newTheme && newTheme !== 'system') {
      closeDropdown();
      return;
    }

    theme.set(newTheme);
    closeDropdown();
  }

  function handleDropdownKeydown(e: KeyboardEvent) {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusedIndex = focusedIndex < options.length - 1 ? focusedIndex + 1 : 0;
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusedIndex = focusedIndex > 0 ? focusedIndex - 1 : options.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          setTheme(options[focusedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;
      case 'Home':
        e.preventDefault();
        focusedIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        focusedIndex = options.length - 1;
        break;
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      closeDropdown();
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div class="relative" bind:this={dropdownRef} onkeydown={handleDropdownKeydown}>
  <button
    id={buttonId}
    onclick={toggleDropdown}
    class="p-2 rounded-md hover:bg-accent transition-all opacity-70 hover:opacity-100 text-muted-foreground hover:text-primary"
    aria-label="Theme Menu"
    aria-expanded={isOpen}
    aria-haspopup="listbox"
  >
    {#if theme.current === 'system'}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </svg>
    {:else if theme.current === 'light'}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="5" /><path
          d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        />
      </svg>
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    {/if}
  </button>

  {#if isOpen}
    <div
      transition:slide={{ duration: 200 }}
      role="listbox"
      aria-labelledby={buttonId}
      aria-activedescendant={focusedIndex >= 0 ? `theme-option-${options[focusedIndex].value}` : undefined}
      tabindex="-1"
      class="absolute right-0 mt-2 w-36 rounded-md border bg-popover text-popover-foreground shadow-lg focus:outline-none z-50 overflow-hidden"
    >
      <div class="p-1">
        {#each options as option, i}
          <button
            id={`theme-option-${option.value}`}
            role="option"
            aria-selected={theme.current === option.value}
            onclick={() => setTheme(option.value)}
            class="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground {theme.current === option.value ? 'bg-accent' : ''} {focusedIndex === i ? 'ring-2 ring-primary' : ''}"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="mr-2"
              aria-hidden="true"
            >
              {#if option.value === 'light'}
                <circle cx="12" cy="12" r="5" /><path
                  d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                />
              {:else if option.value === 'dark'}
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              {:else}
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
              {/if}
            </svg>
            {option.label}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
