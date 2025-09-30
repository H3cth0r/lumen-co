<script lang="ts">
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { buttonVariants } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import { onMount } from 'svelte';
import Copy from "@lucide/svelte/icons/copy";
import CircleCheck from "@lucide/svelte/icons/check-circle";

// State for crop parameters
let width = "50%";
let height = "50%";
let centerX = "50%";
let centerY = "50%";
let imageSrc = "";
let fitMode = "none";

// Copy button state
let isCopied = false;

// Fit mode options for the Select component
const fitModeOptions = [
  { value: "none", label: "None" },
  { value: "cover", label: "Cover" },
  { value: "fit", label: "Fit" }
];

// Derived content for Select trigger
$: triggerContent = fitModeOptions.find(option => option.value === fitMode)?.label ?? "Select fit mode";

// State for the interactive crop editing
let containerRef: HTMLDivElement;
let imageRef: HTMLImageElement;
let cropAreaRef: HTMLDivElement;
let isImageLoaded = false;
let isDragging = false;
let isResizing = false;
let resizeHandle = "";
let startPos = { x: 0, y: 0 };
let imageNaturalWidth = 0;
let imageNaturalHeight = 0;
let imageDisplayWidth = 0;
let imageDisplayHeight = 0;
let containerRect = { width: 0, height: 0, top: 0, left: 0 };

// Generate code string for copying
$: cropperCode = `<Cropper width="${width}" height="${height}" centerX="${centerX}" centerY="${centerY}" fitMode="${fitMode}">
  <img src="${imageSrc}" alt="Cropped Content" />
</Cropper>`;

// Parse percentage to pixel values
function percentageToPixels(percentage: string, dimension: number): number {
  const value = parseFloat(percentage);
  return isNaN(value) ? 0 : (value / 100) * dimension;
}

// Convert pixel to percentage values
function pixelsToPercentage(pixels: number, dimension: number): string {
  return `${Math.max(0, Math.min(100, (pixels / dimension) * 100)).toFixed(2)}%`;
}

// Update crop area display based on percentages
function updateCropAreaDisplay() {
  if (!cropAreaRef || !imageRef || !isImageLoaded || !containerRef) return;
  
  // Get the current display size of the image
  const imageRect = imageRef.getBoundingClientRect();
  imageDisplayWidth = imageRect.width;
  imageDisplayHeight = imageRect.height;
  
  // Convert percentages to pixels for the crop area
  const cropWidthPx = percentageToPixels(width, imageDisplayWidth);
  const cropHeightPx = percentageToPixels(height, imageDisplayHeight);
  const cropXPx = percentageToPixels(centerX, imageDisplayWidth) - cropWidthPx / 2;
  const cropYPx = percentageToPixels(centerY, imageDisplayHeight) - cropHeightPx / 2;
  
  // Apply to the crop area element
  cropAreaRef.style.width = `${cropWidthPx}px`;
  cropAreaRef.style.height = `${cropHeightPx}px`;
  cropAreaRef.style.left = `${cropXPx}px`;
  cropAreaRef.style.top = `${cropYPx}px`;
}

// Handle image load
function handleImageLoad() {
  if (!imageRef) return;
  isImageLoaded = true;
  imageNaturalWidth = imageRef.naturalWidth;
  imageNaturalHeight = imageRef.naturalHeight;
  
  // Force a redraw after image loads
  requestAnimationFrame(updateCropAreaDisplay);
}

// Start dragging the crop area
function startDrag(e: MouseEvent) {
  if (!isImageLoaded) return;
  e.preventDefault();
  isDragging = true;
  startPos = { x: e.clientX, y: e.clientY };
  containerRect = containerRef.getBoundingClientRect();
  
  // Add event listeners for dragging
  window.addEventListener('mousemove', handleDrag);
  window.addEventListener('mouseup', endDrag);
}

// Handle dragging the crop area
function handleDrag(e: MouseEvent) {
  if (!isDragging || !cropAreaRef) return;
  e.preventDefault();
  
  const dx = e.clientX - startPos.x;
  const dy = e.clientY - startPos.y;
  const cropRect = cropAreaRef.getBoundingClientRect();
  
  let newLeft = cropRect.left - containerRect.left + dx;
  let newTop = cropRect.top - containerRect.top + dy;
  
  // Constrain to image boundaries
  newLeft = Math.max(0, Math.min(imageDisplayWidth - cropRect.width, newLeft));
  newTop = Math.max(0, Math.min(imageDisplayHeight - cropRect.height, newTop));
  
  // Update crop area position
  cropAreaRef.style.left = `${newLeft}px`;
  cropAreaRef.style.top = `${newTop}px`;
  
  // Update centerX and centerY percentages
  centerX = pixelsToPercentage(newLeft + cropRect.width / 2, imageDisplayWidth);
  centerY = pixelsToPercentage(newTop + cropRect.height / 2, imageDisplayHeight);
  
  // Reset start position for next move
  startPos = { x: e.clientX, y: e.clientY };
}

// Start resize operation
function startResize(e: MouseEvent, handle: string) {
  if (!isImageLoaded) return;
  e.preventDefault();
  e.stopPropagation();
  isResizing = true;
  resizeHandle = handle;
  startPos = { x: e.clientX, y: e.clientY };
  containerRect = containerRef.getBoundingClientRect();
  
  // Add event listeners for resizing
  window.addEventListener('mousemove', handleResize);
  window.addEventListener('mouseup', endResize);
}

// Handle resizing the crop area
function handleResize(e: MouseEvent) {
  if (!isResizing || !cropAreaRef) return;
  e.preventDefault();
  
  const dx = e.clientX - startPos.x;
  const dy = e.clientY - startPos.y;
  const cropRect = cropAreaRef.getBoundingClientRect();
  
  let newLeft = cropRect.left - containerRect.left;
  let newTop = cropRect.top - containerRect.top;
  let newWidth = cropRect.width;
  let newHeight = cropRect.height;
  
  // Adjust dimensions based on which handle is being dragged
  switch (resizeHandle) {
    case 'top-left':
      newLeft += dx;
      newTop += dy;
      newWidth -= dx;
      newHeight -= dy;
      break;
    case 'top-right':
      newTop += dy;
      newWidth += dx;
      newHeight -= dy;
      break;
    case 'bottom-left':
      newLeft += dx;
      newWidth -= dx;
      newHeight += dy;
      break;
    case 'bottom-right':
      newWidth += dx;
      newHeight += dy;
      break;
    case 'top':
      newTop += dy;
      newHeight -= dy;
      break;
    case 'right':
      newWidth += dx;
      break;
    case 'bottom':
      newHeight += dy;
      break;
    case 'left':
      newLeft += dx;
      newWidth -= dx;
      break;
  }
  
  // Ensure minimum dimensions
  if (newWidth < 20) {
    if (['top-left', 'bottom-left', 'left'].includes(resizeHandle)) {
      newLeft -= (20 - newWidth);
    }
    newWidth = 20;
  }
  
  if (newHeight < 20) {
    if (['top-left', 'top-right', 'top'].includes(resizeHandle)) {
      newTop -= (20 - newHeight);
    }
    newHeight = 20;
  }
  
  // Constrain to image boundaries
  newLeft = Math.max(0, Math.min(imageDisplayWidth - newWidth, newLeft));
  newTop = Math.max(0, Math.min(imageDisplayHeight - newHeight, newTop));
  
  // Apply new dimensions and position
  cropAreaRef.style.width = `${newWidth}px`;
  cropAreaRef.style.height = `${newHeight}px`;
  cropAreaRef.style.left = `${newLeft}px`;
  cropAreaRef.style.top = `${newTop}px`;
  
  // Update percentage values
  width = pixelsToPercentage(newWidth, imageDisplayWidth);
  height = pixelsToPercentage(newHeight, imageDisplayHeight);
  centerX = pixelsToPercentage(newLeft + newWidth / 2, imageDisplayWidth);
  centerY = pixelsToPercentage(newTop + newHeight / 2, imageDisplayHeight);
  
  // Reset start position for next move
  startPos = { x: e.clientX, y: e.clientY };
}

// End dragging operation
function endDrag() {
  isDragging = false;
  window.removeEventListener('mousemove', handleDrag);
  window.removeEventListener('mouseup', endDrag);
}

// End resizing operation
function endResize() {
  isResizing = false;
  window.removeEventListener('mousemove', handleResize);
  window.removeEventListener('mouseup', endResize);
}

// Copy generated code to clipboard with icon toggle
function copyCode() {
  navigator.clipboard.writeText(cropperCode);
  isCopied = true;
  
  // Reset copy icon after 2 seconds
  setTimeout(() => {
    isCopied = false;
  }, 2000);
}

// Watch for changes in crop parameters and update display
$: if (width && height && centerX && centerY && isImageLoaded) {
  updateCropAreaDisplay();
}

// Watch for changes in image source
$: if (imageSrc) {
  isImageLoaded = false;
}

onMount(() => {
  // Add a resize observer to update the crop area when container resizes
  if (containerRef) {
    const resizeObserver = new ResizeObserver(() => {
      updateCropAreaDisplay();
    });
    resizeObserver.observe(containerRef);
    return () => {
      resizeObserver.disconnect();
    };
  }
});
</script>

<Dialog.Root>
  <Dialog.Trigger class={buttonVariants({ variant: "outline" })}>
    Crop Image
  </Dialog.Trigger>

  <Dialog.Content class="max-w-3xl">
    <Dialog.Header>
      <Dialog.Title>Image Cropper</Dialog.Title>
      <Dialog.Description>
        Adjust the crop area by dragging or using the controls below.
      </Dialog.Description>
    </Dialog.Header>

    <div class="grid gap-4 py-4">
      <!-- Image URL input -->
      <div class="grid grid-cols-4 items-center gap-4">
        <label for="image-url" class="text-right font-medium">Image URL</label>
        <Input 
          id="image-url"
          type="url" 
          placeholder="Enter image URL" 
          class="col-span-3" 
          bind:value={imageSrc}
        />
      </div>
      
      <!-- Image preview and crop area -->
      <div 
        class="relative h-80 w-full overflow-hidden border border-gray-200 rounded-md bg-gray-50"
        bind:this={containerRef}
      >
        {#if imageSrc}
          <img 
            src={imageSrc} 
            alt="Content to be cropped" 
            class="max-w-full max-h-full object-contain relative"
            bind:this={imageRef}
            on:load={handleImageLoad}
          />
          
          <!-- Overlay to dim areas outside crop -->
          {#if isImageLoaded}
            <div class="absolute inset-0 bg-black/50 pointer-events-none">
              <!-- This is the actual crop area that is draggable -->
              <div 
                bind:this={cropAreaRef}
                class="absolute bg-transparent border-2 border-white cursor-move pointer-events-auto"
                style="box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);"
                on:mousedown={startDrag}
                role="button"
                tabindex="0"
                aria-label="Crop area"
              >
                <!-- Resize handles -->
                <div role="button" tabindex="0" aria-label="Resize top left" class="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full cursor-nw-resize pointer-events-auto" on:mousedown={(e) => startResize(e, 'top-left')}></div>
                <div role="button" tabindex="0" aria-label="Resize top right" class="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full cursor-ne-resize pointer-events-auto" on:mousedown={(e) => startResize(e, 'top-right')}></div>
                <div role="button" tabindex="0" aria-label="Resize bottom left" class="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full cursor-sw-resize pointer-events-auto" on:mousedown={(e) => startResize(e, 'bottom-left')}></div>
                <div role="button" tabindex="0" aria-label="Resize bottom right" class="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full cursor-se-resize pointer-events-auto" on:mousedown={(e) => startResize(e, 'bottom-right')}></div>
                
                <div role="button" tabindex="0" aria-label="Resize left" class="absolute top-1/2 -left-1 w-3 h-3 bg-white rounded-full cursor-w-resize transform -translate-y-1/2 pointer-events-auto" on:mousedown={(e) => startResize(e, 'left')}></div>
                <div role="button" tabindex="0" aria-label="Resize right" class="absolute top-1/2 -right-1 w-3 h-3 bg-white rounded-full cursor-e-resize transform -translate-y-1/2 pointer-events-auto" on:mousedown={(e) => startResize(e, 'right')}></div>
                <div role="button" tabindex="0" aria-label="Resize top" class="absolute -top-1 left-1/2 w-3 h-3 bg-white rounded-full cursor-n-resize transform -translate-x-1/2 pointer-events-auto" on:mousedown={(e) => startResize(e, 'top')}></div>
                <div role="button" tabindex="0" aria-label="Resize bottom" class="absolute -bottom-1 left-1/2 w-3 h-3 bg-white rounded-full cursor-s-resize transform -translate-x-1/2 pointer-events-auto" on:mousedown={(e) => startResize(e, 'bottom')}></div>
              </div>
            </div>
          {/if}
        {:else}
          <div class="flex items-center justify-center h-full text-gray-500">
            Enter an image URL above to get started
          </div>
        {/if}
      </div>
      
      <!-- Crop controls -->
      <div class="grid grid-cols-4 gap-4">
        <div class="grid grid-cols-2 items-center gap-2">
          <label for="width" class="text-right font-medium">Width</label>
          <Input 
            id="width"
            type="text" 
            bind:value={width}
            disabled={!isImageLoaded}
          />
        </div>
        
        <div class="grid grid-cols-2 items-center gap-2">
          <label for="height" class="text-right font-medium">Height</label>
          <Input 
            id="height"
            type="text" 
            bind:value={height}
            disabled={!isImageLoaded}
          />
        </div>
        
        <div class="grid grid-cols-2 items-center gap-2">
          <label for="centerX" class="text-right font-medium">X</label>
          <Input 
            id="centerX"
            type="text" 
            bind:value={centerX}
            disabled={!isImageLoaded}
          />
        </div>
        
        <div class="grid grid-cols-2 items-center gap-2">
          <label for="centerY" class="text-right font-medium">Y</label>
          <Input 
            id="centerY"
            type="text" 
            bind:value={centerY}
            disabled={!isImageLoaded}
          />
        </div>
      </div>
      
      <!-- Fit mode selector using shadcn Select component -->
      <div class="grid grid-cols-4 items-center gap-4">
        <label for="fit-mode" class="text-right font-medium">Fit Mode</label>
        <div class="col-span-3">
          <Select.Root type="single" disabled={!isImageLoaded} bind:value={fitMode}>
            <Select.Trigger id="fit-mode" class="w-full">
              {triggerContent}
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.GroupHeading>Fit Modes</Select.GroupHeading>
                {#each fitModeOptions as option (option.value)}
                  <Select.Item value={option.value} label={option.label}>
                    {option.label}
                  </Select.Item>
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </div>
      </div>
      
      <!-- Generated code output -->
      <div class="mt-2">
        <label for="generated-code" class="block mb-2 font-medium">Generated Cropper Code:</label>
        <div class="relative">
          <textarea 
            id="generated-code"
            class="w-full h-24 p-3 border border-gray-300 rounded-md font-mono text-sm"
            readonly
            value={cropperCode}
          ></textarea>
          <button 
            class={buttonVariants({ variant: "outline", size: "sm" })}
            style="position: absolute; top: 4px; right: 4px;"
            on:click={copyCode}
          >
            {#if isCopied}
              <CircleCheck size={16} />
            {:else}
              <Copy size={16} />
            {/if}
          </button>
        </div>
      </div>
    </div>

    <Dialog.Footer>
      <Dialog.Close class={buttonVariants({ variant: "outline" })}>
        Close
      </Dialog.Close>
    </Dialog.Footer>

  </Dialog.Content>
</Dialog.Root>
