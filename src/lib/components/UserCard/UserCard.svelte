<!-- UserCard.svelte -->
<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { UserConfiguration } from "$lib/components";
</script>

<Card.Root class="h-[90%] w-[95%]">
  <Card.Content class="flex items-center justify-center w-full h-full bbg-red-400 p-[0]">
    <div class="flex flex-row justify-between w-[96%] h-[80%] bbg-green-300">
      <div class="flex items-center justify-center h-full w-[16%] bbg-blue-300">
        <Avatar.Root>
          <Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
          <Avatar.Fallback>CN</Avatar.Fallback>
        </Avatar.Root>
      </div>
      <div class="flex flex-col justify-center h-full w-[64%] bbg-red-300">
        <p class="text-sm font-medium leading-none">Sofia Davis</p>
        <p class="text-muted-foreground text-sm">m@example.com</p>
      </div>
      <div class="flex items-center justify-center h-full w-[16%] bbg-blue-300">
        <UserConfiguration />
      </div>
    </div>
  </Card.Content>
</Card.Root>
