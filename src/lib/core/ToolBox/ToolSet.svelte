<!-- ToolSet.svelte -->
<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  export let title: string = "Tools";
  export let description: string = "Description";
</script>

<Card.Root class="w-full">
  <Card.Header>
    <Card.Title>{title}</Card.Title>
    <Card.Description>{description}</Card.Description>
  </Card.Header>
  <Card.Content>
    <slot />
  </Card.Content>
</Card.Root>
