<!-- +page.svelte -->
<script lang="ts">
  import { Workbench, Canvas, ToolBox, Cropper, Export, CropEditor } from "$lib/core";
</script>

<div class="h-screen w-screen">
  <Workbench withToolBox={true}>
    <!-- Canvas components -->
    <Canvas autoScale={true} style="height: 500px; background-color: transparent;"> 
      <div class="h-[2000px] w-[800px] bg-green-400 flex justify-end items-end">
        <div class="h-[30%] w-[10%] bg-orange-300">
        </div>
      </div>
    </Canvas>

    <Canvas autoScale={true} style="height: 500px; background-color: transparent;"> 
      <div class="h-[100px] w-[300px] bg-green-400 flex justify-end items-end">
        <div class="h-[30%] w-[10%] bg-orange-300">
        </div>
      </div>
    </Canvas>
    
    <Canvas autoScale={true} style="height: 400px; background-color: transparent;"> 
      <div class="h-[2000px] w-[600px] bg-blue-400 flex justify-center items-center">
        <div class="h-[20%] w-[20%] bg-yellow-300">
        </div>
      </div>
    </Canvas>

    <Canvas autoScale={true} style="height: 400px; background-color: transparent;"> 
      <div class="h-[8in] w-[3in] bg-blue-400 flex justify-center items-center">
        <div class="h-[20%] w-[20%] bg-yellow-300">
        </div>
      </div>
    </Canvas>

    <Canvas autoScale={true} style="height: 400px; background-color: transparent;"> 
      <div class="main-cont-test flex items-center justify-center">
        <Cropper width="37.87%" height="50.00%" centerX="51.23%" centerY="75.00%" fitMode="none">
          <img 
            src="https://mir-s3-cdn-cf.behance.net/projects/404/a31ea9161476565.Y3JvcCwyNDgwLDE5MzksMCw3ODU.jpg" 
            alt="Croppable image"
            style="display: block;"
            class="the-image"
          />
        </Cropper>
      </div>
    </Canvas>
    
    <!-- ToolBox component in the toolbox slot -->
    <ToolBox.ToolBox slot="toolbox">
      <Export.HTML />
      <Export.PDF />
      <ToolBox.ToolSet
        title="Dev Tools"
        description="Tools for development"
      >
        <CropEditor />
      </ToolBox.ToolSet>
    </ToolBox.ToolBox>
  </Workbench>
</div>


<style>
.main-cont-test {
  width: 400px;
  height: 400px;
  background-color: orange;
}
</style>
