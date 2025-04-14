<!-- ToolBox.svelte -->
<script lang="ts">
  // You can add props or functionality specific to the ToolBox here
</script>

<div class="toolbox-container">
  <slot />
</div>

<style>
  .toolbox-container {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
