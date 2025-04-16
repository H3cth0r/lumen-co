<!-- Cropper.svelte -->
<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';

  // --- Props ---
  /** Percentage width of the source image to crop */
  export let width: string = "50%";
  /** Percentage height of the source image to crop */
  export let height: string = "50%";
  /** Horizontal center of the crop area (percentage) */
  export let centerX: string = "50%";
  /** Vertical center of the crop area (percentage) */
  export let centerY: string = "50%";
  /** Defines how the cropped image fits the container */
  export let fitMode: 'none' | 'cover' | 'fit' = 'none'; // New prop

  // --- Reactive variables ---
  let container: HTMLDivElement;
  let imgElement: HTMLImageElement | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let isImageLoaded = false;

  // --- Helper Functions ---
  const percentageToDecimal = (percentage: string): number => {
    const num = parseFloat(percentage);
    return isNaN(num) ? 0.5 : num / 100; // Default to 50% if invalid
  };

  // --- Core Calculation Logic ---
  const calculateStyles = () => {
    if (!imgElement || !container || !isImageLoaded || imgElement.naturalWidth === 0 || imgElement.naturalHeight === 0) {
      // Clear styles if image not ready
      container.style.removeProperty('--crop-container-width');
      container.style.removeProperty('--crop-container-height');
      container.style.setProperty('--img-scale', '1');
      container.style.setProperty('--img-translate-x', '0px');
      container.style.setProperty('--img-translate-y', '0px');
      return;
    }

    const naturalWidth = imgElement.naturalWidth;
    const naturalHeight = imgElement.naturalHeight;

    // 1. Calculate the Crop Area in natural image coordinates
    const cropWPercent = percentageToDecimal(width);
    const cropHPercent = percentageToDecimal(height);
    const cropXPercent = percentageToDecimal(centerX);
    const cropYPercent = percentageToDecimal(centerY);

    const cropWidthNatural = Math.max(1, naturalWidth * cropWPercent); // Ensure min 1px
    const cropHeightNatural = Math.max(1, naturalHeight * cropHPercent); // Ensure min 1px

    // Top-left corner of the crop area in natural coordinates
    let cropOffsetXNatural = naturalWidth * cropXPercent - cropWidthNatural / 2;
    let cropOffsetYNatural = naturalHeight * cropYPercent - cropHeightNatural / 2;

    // Clamp crop offset to stay within image bounds
    cropOffsetXNatural = Math.max(0, Math.min(cropOffsetXNatural, naturalWidth - cropWidthNatural));
    cropOffsetYNatural = Math.max(0, Math.min(cropOffsetYNatural, naturalHeight - cropHeightNatural));

    // --- Apply styles based on fitMode ---

    if (fitMode === 'none') {
      // Original behaviour: Size container based on rendered image size percentages
      // We need the *rendered* size of the image IF IT WASN'T constrained by our cropping container yet.
      // This is tricky because the :global(img) style affects getBoundingClientRect.
      // A common approach is to assume the image *would* render at its natural size scaled to fit its *parent* container,
      // but the *original* code used the image's *current* rendered size. Let's stick to that for 'none'.
      const renderedRect = imgElement.getBoundingClientRect();
      const renderedWidth = renderedRect.width;
      const renderedHeight = renderedRect.height;

      // Calculate the desired visual size of the cropped *window*
      const containerWidth = renderedWidth * cropWPercent;
      const containerHeight = renderedHeight * cropHPercent;

      // Calculate the image translation needed to center the crop point
      const targetXRendered = renderedWidth * cropXPercent;
      const targetYRendered = renderedHeight * cropYPercent;
      const translateX = targetXRendered - containerWidth / 2;
      const translateY = targetYRendered - containerHeight / 2;

      container.style.setProperty('--crop-container-width', `${containerWidth}px`);
      container.style.setProperty('--crop-container-height', `${containerHeight}px`);
      container.style.setProperty('--img-scale', '1'); // No scaling needed, image is displayed at its rendered size
      // Translation is relative to the image's top-left INSIDE the sized container
      container.style.setProperty('--img-translate-x', `-${translateX}px`);
      container.style.setProperty('--img-translate-y', `-${translateY}px`);

    } else {
       // 'cover' or 'fit': Container takes available space, image is scaled/translated
      container.style.removeProperty('--crop-container-width'); // Use CSS/parent size
      container.style.removeProperty('--crop-container-height'); // Use CSS/parent size

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      if (containerWidth === 0 || containerHeight === 0) return; // Container has no size yet

      // Calculate scale factor needed to fit/cover the container WITH the cropped portion
      const scaleX = containerWidth / cropWidthNatural;
      const scaleY = containerHeight / cropHeightNatural;

      let scale: number;
      if (fitMode === 'cover') {
        scale = Math.max(scaleX, scaleY);
      } else { // fitMode === 'fit'
        scale = Math.min(scaleX, scaleY);
      }

      // Calculate the final dimensions of the scaled crop area
      const scaledCropWidth = cropWidthNatural * scale;
      const scaledCropHeight = cropHeightNatural * scale;

      // Calculate translation needed to center the SCALED CROP AREA within the container
      // We need to move the top-left of the *original image* (scaled)
      // so that the top-left of the *crop area* (scaled) ends up positioned correctly.

      // Target top-left corner for the scaled crop area within the container
      const targetCropX = (containerWidth - scaledCropWidth) / 2;
      const targetCropY = (containerHeight - scaledCropHeight) / 2;

      // The position of the crop area's top-left corner *within the scaled original image*
      const cropOriginInScaledImageX = cropOffsetXNatural * scale;
      const cropOriginInScaledImageY = cropOffsetYNatural * scale;

      // Translate the image so the cropOriginInScaledImage ends up at targetCrop
      const translateX = targetCropX - cropOriginInScaledImageX;
      const translateY = targetCropY - cropOriginInScaledImageY;

      container.style.setProperty('--img-scale', `${scale}`);
      container.style.setProperty('--img-translate-x', `${translateX}px`);
      container.style.setProperty('--img-translate-y', `${translateY}px`);
    }
  };

  // --- Lifecycle & Reactivity ---
  const initCropper = () => {
    if (!container) return;

    imgElement = container.querySelector('img');
    if (!imgElement) {
      console.warn("Cropper: No <img> element found in the slot.");
      return;
    }

    const handleLoad = () => {
      isImageLoaded = true;
      // Defer calculation until after DOM update allows container to get size
      requestAnimationFrame(calculateStyles);
    };

    // Reset loaded state if src changes
    const observer = new MutationObserver((mutations) => {
      for(let mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          isImageLoaded = false;
          // No need to remove/add listener, browser handles it if src changes
          if (imgElement?.complete) {
             // If new image is already cached and complete
             handleLoad();
          }
        }
      }
    });
    observer.observe(imgElement, { attributes: true });


    if (imgElement.complete) {
      handleLoad();
    } else {
      imgElement.addEventListener('load', handleLoad);
    }

    resizeObserver = new ResizeObserver(() => {
      // Recalculate on resize of container or image (intrinsic size change unlikely but possible)
       requestAnimationFrame(calculateStyles);
    });
    resizeObserver.observe(container);
    if(imgElement) resizeObserver.observe(imgElement); // Observe image too, though less critical usually

    return () => {
      imgElement?.removeEventListener('load', handleLoad);
      resizeObserver?.disconnect();
      observer.disconnect();
      isImageLoaded = false; // Reset on destroy
    };
  };

  onMount(initCropper);

  onDestroy(() => {
    resizeObserver?.disconnect();
  });

  // Recalculate whenever props change or image/container potentially resizes after update
  // Note: afterUpdate runs *after* the DOM is updated, ensuring container dimensions are available
  afterUpdate(() => {
     if (container && imgElement && isImageLoaded) {
       requestAnimationFrame(calculateStyles);
     }
  });

  // Reactive statement to trigger recalculation when props change
  $: if (width || height || centerX || centerY || fitMode) {
    if (container && imgElement && isImageLoaded) {
       // Using requestAnimationFrame helps avoid layout thrashing if multiple props change at once
       requestAnimationFrame(calculateStyles);
    }
  }

</script>

<!-- The container's size is set by CSS var for 'none' mode, otherwise it uses CSS/parent size -->
<div
  class="img-container"
  bind:this={container}
  style:width={fitMode === 'none' ? 'var(--crop-container-width, auto)' : '100%'}
  style:height={fitMode === 'none' ? 'var(--crop-container-height, auto)' : '100%'}
>
  <slot />
</div>

<style>
  .img-container {
    /* Default to 100% size for cover/fit, overridden by style attribute for none */
    /* width: 100%; */ /* Managed by inline style now */
    /* height: 100%; */ /* Managed by inline style now */
    overflow: hidden;
    position: relative;
    /* Optional: Add a background for debugging */
    /* background-color: rgba(255, 0, 0, 0.1); */
  }

  /* Apply transformations to the slotted image */
  .img-container :global(img) {
    display: block; /* Ensure no extra space below image */
    position: absolute;
    top: 0;
    left: 0;
    max-width: none; /* Critical: Allow image to be larger than container */
    max-height: none;/* Critical: Allow image to be larger than container */
    width: auto; /* Let naturalWidth/Height dictate base size */
    height: auto;/* Let naturalWidth/Height dictate base size */
    transform-origin: 0 0; /* Scale from the top-left corner */
    will-change: transform; /* Performance hint */
    /* Apply calculated scale and translation */
    transform: translate(
        var(--img-translate-x, 0px),
        var(--img-translate-y, 0px)
      )
      scale(var(--img-scale, 1));
  }
</style>
