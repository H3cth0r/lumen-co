<script>
  import { onMount } from 'svelte';

  /**
   * @type {Object<string, string[]>}
   */
  export let params = {};

  onMount(() => {
    function generateHelp() {
      console.clear();
      console.log(
        '%c--- Configurable Page Arguments ---',
        'color: #ff3e00; font-size: 16px; font-weight: bold;'
      );

      if (Object.keys(params).length === 0) {
        console.log('No configurable arguments have been registered.');
        return;
      }

      console.log('%cAvailable Arguments and Options:', 'font-weight: bold');
      for (const paramName in params) {
        const options = params[paramName];
        if (options && options.length > 0) {
          console.log(`- ${paramName}: (options: ${options.join(' | ')})`);
        }
      }
      console.log('---------------------------------');
    }

    window.getAppUrl = generateHelp;
    console.log('URLConfigurator ready. Type `getAppUrl()` in the console for details.');

    return () => {
      if (window.getAppUrl === generateHelp) {
        delete window.getAppUrl;
      }
    };
  });
</script>

<slot />
