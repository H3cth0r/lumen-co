<!-- Workbench.svelte -->
<script lang="ts">
  import * as Resizable from "$lib/components/ui/resizable/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

  export let withToolBox=false;
</script>

<div class="h-full w-full bg-grey-500">
  <Resizable.PaneGroup 
    direction="horizontal"
    class="my-pane-group"
  >
    <Resizable.Pane class="bg-black">
      <ScrollArea class="h-full w-full">
        <div class="canvas-container">
          <slot />
        </div>
      </ScrollArea>
    </Resizable.Pane>
    {#if withToolBox}
    <Resizable.Handle withHandle />
    <Resizable.Pane class="max-w-[20%] min-w-[2%]">
      <div class="h-full w-full">
        <div class="h-[90%] w-full bg-red-500">
            <slot name="toolbox" />
        </div>
        <div class="h-[10%] w-full bg-blue-500">
        </div>
      </div>
    </Resizable.Pane>
    {/if}
  </Resizable.PaneGroup>
</div>

<style>
  .canvas-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
</style>
