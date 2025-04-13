<script lang="ts">
  import { Workbench, Canvas } from "$lib/core";
  

</script>

<div class="h-screen w-screen">
  <Workbench>
    <Canvas slot="canvas" autoScale={true} style="width: 100%; height: 100%; background-color: transparent;" > 
      <div class="h-[3000px] w-[800px] bg-green-400 flex justify-end items-end ">
        <div class="h-[30%] w-[10%] bg-orange-300">
        </div>
      </div>
    </Canvas>
  </Workbench>
</div>

<style>
</style>
