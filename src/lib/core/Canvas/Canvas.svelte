<script lang="ts">
  import { onMount } from 'svelte';

  export let autoScale = true;
  export let style = '';

  let container: HTMLDivElement;
  let content: HTMLElement;
  let resizeObserver: ResizeObserver;

  function updateScale() {
    if (!autoScale || !container || !content) return;

    const containerRect = container.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    const scaleX = containerRect.width / contentRect.width;
    const scaleY = containerRect.height / contentRect.height;
    const scale = Math.min(scaleX, scaleY);

    content.style.transform = `scale(${scale})`;
    content.style.transformOrigin = 'top left';
  }

  onMount(() => {
    if (container) {
      // Only observe content if autoScale is enabled
      if (autoScale) {
        content = container.children[0] as HTMLElement;
        
        resizeObserver = new ResizeObserver(updateScale);
        resizeObserver.observe(container);
        if (content) resizeObserver.observe(content);
      }

      return () => {
        resizeObserver?.disconnect();
      };
    }
  });
</script>

<div
  bind:this={container}
  style={style}
  class="relative w-full h-full"
  class:overflow-hidden={autoScale}
  class:overflow-auto={!autoScale}
>
  {#if autoScale}
    <div class="absolute top-0 left-0 w-fit h-fit">
      <slot />
    </div>
  {:else}
    <!-- Render slot directly without wrapper for proper scroll behavior -->
    <slot />
  {/if}
</div>
