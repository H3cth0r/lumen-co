<script lang="ts">
  import * as Resizable from "$lib/components/ui/resizable/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

</script>

<div class="h-full w-full bg-grey-500">
  <Resizable.PaneGroup 
    direction="horizontal"
    class="my-pane-group"
  >
    <Resizable.Pane class="bg-black">
      <slot name="canvas" />
    </Resizable.Pane>
    <Resizable.Handle withHandle />
    <Resizable.Pane class="max-w-[20%] min-w-[2%]">
      <div class="h-full w-full">
        <ScrollArea class="h-[90%] w-full bg-red-500">
        </ScrollArea>
        <div class="h-[10%] w-full bg-blue-500">
        </div>
      </div>
    </Resizable.Pane>

  </Resizable.PaneGroup>
</div>

<style>
</style>
