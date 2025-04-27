<!-- ExportPdf.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { exportCanvasesToPDF } from "./export-pdf.ts";
  // tailwind.config = {
  //   important: true
  // }
</script>

<Button 
  onclick={exportCanvasesToPDF}
  class="w-[90%]"
>
  Export PDFs
</Button>
