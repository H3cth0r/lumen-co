<script>
  import { page } from '$app/stores';
  import URLConfigurator from '$lib/core/URLConfiguration/URLConfiguration.svelte';

  const colorClasses = {
    red: 'bg-red-400',
    blue: 'bg-blue-400',
    green: 'bg-green-400'
  };

  const configurableParams = {
    color: Object.keys(colorClasses)
  };

  $: color = $page.url.searchParams.get('color') || 'green';
  $: bgColorClass = colorClasses[color] || colorClasses.green;
</script>

<URLConfigurator params={configurableParams}>
  <div class="h-[2000px] w-[800px] {bgColorClass} flex justify-end items-end">
    <div class="h-[30%] w-[10%] bg-orange-300">
    </div>
  </div>
</URLConfigurator>
