<!-- Cropper.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  export let width: string = "50%";
  export let height: string = "50%";
  export let centerX: string = "50%";
  export let centerY: string = "50%";

  let container: HTMLDivElement;
  let imgElement: HTMLImageElement | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const percentageToDecimal = (percentage: string): number => {
    return parseFloat(percentage) / 100;
  };

  const calculateDimensions = () => {
    if (!imgElement || !container) return;

    const naturalWidth = imgElement.naturalWidth;
    const naturalHeight = imgElement.naturalHeight;
    
    if (naturalWidth === 0 || naturalHeight === 0) return;

    const renderedRect = imgElement.getBoundingClientRect();
    const renderedWidth = renderedRect.width;
    const renderedHeight = renderedRect.height;

    const widthVal = renderedWidth * percentageToDecimal(width);
    const heightVal = renderedHeight * percentageToDecimal(height);
    const centerXVal = renderedWidth * percentageToDecimal(centerX);
    const centerYVal = renderedHeight * percentageToDecimal(centerY);

    container.style.setProperty('--width-img-container', `${widthVal}px`);
    container.style.setProperty('--height-img-container', `${heightVal}px`);
    container.style.setProperty('--translate-x', `${centerXVal - widthVal/2}px`);
    container.style.setProperty('--translate-y', `${centerYVal - heightVal/2}px`);
  };

  const initCropper = () => {
    if (!container) return;

    imgElement = container.querySelector('img');
    if (!imgElement) return;

    const handleLoad = () => {
      calculateDimensions();
      resizeObserver = new ResizeObserver(() => calculateDimensions());
      resizeObserver.observe(imgElement!);
      resizeObserver.observe(container);
    };

    if (imgElement.complete) {
      handleLoad();
    } else {
      imgElement.addEventListener('load', handleLoad);
    }

    return () => {
      imgElement?.removeEventListener('load', handleLoad);
      resizeObserver?.disconnect();
    };
  };

  onMount(initCropper);
  onDestroy(() => resizeObserver?.disconnect());
</script>

<div class="img-container" bind:this={container}>
  <slot />
</div>

<style>
  .img-container {
    width: var(--width-img-container, 100%);
    height: var(--height-img-container, 100%);
    overflow: hidden;
    position: relative;
  }

  .img-container :global(img) {
    transform: translate(
      calc(-1 * var(--translate-x, 0px)),
      calc(-1 * var(--translate-y, 0px))
    );
    max-width: none;
    position: absolute;
  }
</style>
