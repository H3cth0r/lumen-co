<!-- UserConfiguration.svelte -->
<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import ConfigIcon from "@lucide/svelte/icons/cog";
  import ConfigNav from "./ConfigNav.svelte";
  import GeneralConfig from "./GeneralConfig.svelte";
  import AccountConfig from "./AccountConfig.svelte";
  
  const sidebarNavItems = [
    { title: "General" },
    { title: "Account" }
  ];
  
  let selectedTab = sidebarNavItems[0].title;
  
  $: console.log("UserConfiguration - Current selectedTab:", selectedTab);
</script>

<Dialog.Root>
  <Dialog.Trigger class={buttonVariants({ variant: "icon" })}>
    <ConfigIcon />
  </Dialog.Trigger>
  <Dialog.Content class="max-w-[50vw] h-[70vh]">
    <Dialog.Header>
      <Dialog.Title class="h-[5%]">Configuration</Dialog.Title>
      <Separator class="my-4" />
      <div class="flex flex-row h-[95%] w-[100%]">
        <ConfigNav 
          items={sidebarNavItems} 
          bind:selectedTab 
        />
        <div class="h-[100%] w-[90%] p-4">
          {#if selectedTab === 'General'}
            <GeneralConfig />
          {:else if selectedTab === 'Account'}
            <AccountConfig />
          {/if}
        </div>
      </div>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
