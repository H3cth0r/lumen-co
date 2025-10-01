<script>
  import { onMount } from 'svelte';

  /**
   * @type {Object<string, string[]>}
   */
  export let params = {};

  onMount(() => {
    // This function uses `window` and `console`, which only exist in the browser.
    // By defining it *inside* onMount, we guarantee it never runs on the server.
    function generateHelp() {
      console.clear();
      console.log(
        '%c--- Svelte URL Configurator ---',
        'color: #ff3e00; font-size: 16px; font-weight: bold;'
      );
      const baseUrl = window.location.origin + window.location.pathname;
      console.log(`%cBase URL:`, 'font-weight: bold', baseUrl);

      if (Object.keys(params).length === 0) {
        console.log('No parameters have been registered.');
        return;
      }
      console.log('%cAvailable URL Parameters:', 'font-weight: bold');
      const exampleParams = new URLSearchParams();
      for (const paramName in params) {
        const options = params[paramName];
        if (options && options.length > 0) {
          console.log(`- ${paramName}: (options: ${options.join(' | ')})`);
          exampleParams.set(paramName, options[0]);
        }
      }
      const exampleUrl = `${baseUrl}?${exampleParams.toString()}`;
      console.log('%cExample URL:', 'font-weight: bold', exampleUrl);
      console.log('---------------------------------');
    }

    window.getAppUrl = generateHelp;
    console.log('URLConfigurator ready. Type `getAppUrl()` in the console for details.');

    return () => {
      if (window.getAppUrl === generateHelp) delete window.getAppUrl;
    };
  });
</script>

<slot />
