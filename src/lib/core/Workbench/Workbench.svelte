<!-- Workbench.svelte -->
<script lang="ts">
  import * as Resizable from "$lib/components/ui/resizable/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { UserCard } from "$lib/components";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import SidePanel from "@lucide/svelte/icons/panel-right";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import { fade } from "svelte/transition";

  export let withToolBox = false;

  // State to track if toolbox is open
  let isToolboxOpen = true;

  // Tweened stores for smooth transition of width
  const toolboxWidth = tweened(20, { duration: 300, easing: cubicOut });

  // Toggle the toolbox
  async function toggleToolbox() {
    isToolboxOpen = !isToolboxOpen;
    await toolboxWidth.set(isToolboxOpen ? 20 : 2);
  }
</script>

<div class="h-full w-full bg-grey-500">
  <Resizable.PaneGroup direction="horizontal" class="my-pane-group">
    <Resizable.Pane class="bg-black">
      <ScrollArea class="h-full w-full">
        <div class="canvas-container">
          <slot />
        </div>
      </ScrollArea>
    </Resizable.Pane>

    {#if withToolBox}
      <Resizable.Pane
        style="max-width: {$toolboxWidth}%; min-width: 3%;"
        class="transition-all duration-300"
      >
        <div class="h-full w-full flex flex-col justify-between">
          <div class="flex items-center h-[5%] w-full">
            <Button variant="outline" size="icon" onclick={toggleToolbox}>
              <SidePanel />
            </Button>
          </div>

          {#if isToolboxOpen}
            <div
              class="h-[87%] w-full bg-red-500"
              transition:fade={{ duration: 200 }}
            >
              <slot name="toolbox" />
            </div>
          {/if}

          <div
            class="flex items-center justify-center h-[8%] w-full"
            transition:fade={{ duration: 200 }}
          >
            {#if $toolboxWidth === 20}
              <UserCard />
            {:else}
              <Avatar.Root class="h-10 w-10">
                <Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
                <Avatar.Fallback>CN</Avatar.Fallback>
              </Avatar.Root>
            {/if}
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
