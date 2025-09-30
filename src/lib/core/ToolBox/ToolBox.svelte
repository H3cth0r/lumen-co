<!-- ToolBox.svelte -->
<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
</script>

<ScrollArea class="h-full w-full ">
  <div class="flex flex-col justify-center items-center m-3 gap-3 ">
    <slot />
  </div>
</ScrollArea>

<style>
  /* .toolbox-container { */
  /*   padding: 0.75rem; */
  /*   display: flex; */
  /*   flex-direction: column; */
  /*   gap: 0.5rem; */
  /* } */
</style>
