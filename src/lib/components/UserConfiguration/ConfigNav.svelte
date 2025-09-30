<!-- ConfigNav.svelte -->
<script lang="ts">
  import { cubicInOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { cn } from "$lib/utils.js";
  import { Button } from "$lib/components/ui/button/index.js";
  
  export let items: { title: string }[];
  export let selectedTab: string;
  let className: string | undefined | null = undefined;
  export { className as class };
  
  const [send, receive] = crossfade({
    duration: 250,
    easing: cubicInOut,
  });
  
  function handleSelect(title: string) {
    console.log("ConfigNav - Selected tab:", title);
    selectedTab = title;
  }
</script>

<nav class={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 w-[20%]", className)}>
  {#each items as item}
    {@const isActive = selectedTab === item.title}
    <Button
      variant="ghost"
      onclick={() => handleSelect(item.title)}
      class={cn(
        !isActive && "hover:underline",
        "relative justify-start hover:bg-transparent w-full"
      )}
    >
      {#if isActive}
        <div
          class="bg-muted absolute inset-0 rounded-md"
          in:send={{ key: "active-sidebar-tab" }}
          out:receive={{ key: "active-sidebar-tab" }}
        ></div>
      {/if}
      <div class="relative">
        {item.title}
      </div>
    </Button>
  {/each}
</nav>
