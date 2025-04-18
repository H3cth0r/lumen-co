<!-- ExportHtml.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { exportCanvases } from "./export-canvases.ts";
</script>

<Button 
  onclick={exportCanvases}
  class="w-[90%]"
>
  Export Canvases
</Button>
