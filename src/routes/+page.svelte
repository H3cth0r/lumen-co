<!-- +page.svelte -->
<script lang="ts">
  import { Workbench, Canvas, ToolBox, Cropper, Export } from "$lib/core";
</script>

<div class="h-screen w-screen">
  <Workbench withToolBox={true}>
    <!-- Canvas components -->
    <Canvas autoScale={true} style="width: 100%; height: 500px; background-color: transparent;"> 
      <div class="h-[3000px] w-[800px] bg-green-400 flex justify-end items-end">
        <div class="h-[30%] w-[10%] bg-orange-300">
        </div>
      </div>
    </Canvas>
    
    <Canvas autoScale={true} style="width: 100%; height: 400px; background-color: transparent;"> 
      <div class="h-[2000px] w-[600px] bg-blue-400 flex justify-center items-center">
        <div class="h-[20%] w-[20%] bg-yellow-300">
        </div>
      </div>
    </Canvas>

    <Canvas autoScale={true} style="width: 100%; height: 400px; background-color: transparent;"> 
      <div class="main-cont-test flex items-center justify-center">
        <Cropper width="50%" height="50%" centerX="50%" centerY="50%" fitMode="none">
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
    <ToolBox slot="toolbox">
      <Export.HTML />
      <button class="w-full p-2 bg-gray-200 hover:bg-gray-300 rounded mb-2">Tool 1</button>
      <button class="w-full p-2 bg-gray-200 hover:bg-gray-300 rounded mb-2">Tool 2</button>
      <button class="w-full p-2 bg-gray-200 hover:bg-gray-300 rounded mb-2">Tool 3</button>
      <div class="p-4 border border-gray-300 rounded">
        <h3 class="font-medium">Tool Properties</h3>
        <div class="mt-2">
          <label class="block text-sm">Size</label>
          <input type="range" min="1" max="100" value="50" class="w-full" />
        </div>
        <div class="mt-2">
          <label class="block text-sm">Color</label>
          <select class="w-full mt-1 p-1 border rounded">
            <option>Red</option>
            <option>Green</option>
            <option>Blue</option>
          </select>
        </div>
      </div>
    </ToolBox>
  </Workbench>
</div>


<style>
.main-cont-test {
  width: 400px;
  height: 400px;
  background-color: orange;
}
</style>
