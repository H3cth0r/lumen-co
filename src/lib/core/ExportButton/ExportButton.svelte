<!-- ExportButton.svelte -->
<script lang="ts">
  function exportCanvases() {
    const canvases = Array.from(document.querySelectorAll('.canvas-container > div'));
    const exports: string[] = [];
    
    canvases.forEach((canvasRoot, index) => {
      const autoScaleContent = canvasRoot.querySelector('.absolute.top-0.left-0.w-fit.h-fit');
      const contentElements = autoScaleContent 
        ? Array.from(autoScaleContent.children) 
        : Array.from(canvasRoot.children);

      const wrapper = document.createElement('div');
      wrapper.id = `canvas-${index + 1}`;
      
      const clones = contentElements.map(element => element.cloneNode(true) as HTMLElement);
      const classSet = new Set<string>();
      clones.forEach(clone => {
        collectClasses(clone, classSet);
        wrapper.appendChild(clone);
      });

      const styleRules = new Set<string>();
      Array.from(document.styleSheets).forEach(sheet => {
        try {
          extractRules(sheet.cssRules, styleRules, classSet);
        } catch (e) {
          console.warn('Could not access stylesheet:', e);
        }
      });

      const style = document.createElement('style');
      style.textContent = formatCSS(Array.from(styleRules).join('\n'));
      wrapper.prepend(style);
      
      exports.push(`<!-- Canvas ${index + 1} -->\n${formatHTML(wrapper.outerHTML)}\n`);
    });

    const blob = new Blob([exports.join('\n\n')], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canvases-export-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function collectClasses(element: HTMLElement, classes: Set<string>) {
    if (element.classList) {
      element.classList.forEach(className => classes.add(className));
    }
    Array.from(element.children).forEach(child => 
      collectClasses(child as HTMLElement, classes)
    );
  }

  function extractRules(rules: CSSRuleList, styleRules: Set<string>, classes: Set<string>) {
    Array.from(rules).forEach(rule => {
      if (rule instanceof CSSStyleRule) {
        const classArray = Array.from(classes);
        if (classArray.some(className => {
          const escapedClass = cssEscape(className);
          const selectorRegex = new RegExp(`\\.${escapedClass}(?![a-zA-Z0-9_-])`);
          return selectorRegex.test(rule.selectorText);
        })) {
          styleRules.add(rule.cssText);
        }
      } else if (rule instanceof CSSMediaRule) {
        extractRules(rule.cssRules, styleRules, classes);
      }
    });
  }

  function cssEscape(className: string): string {
    return className.replace(/([!"#$%&'()*+,.\/:;<=>?@[\\$$^`{|}~])/g, '\\$1');
  }

  function formatCSS(css: string): string {
    return css
      .replace(/(\\$$)/g, '[')
      .replace(/(\\$$)/g, ']')
      .replace(/(\\%)/g, '%')
      .replace(/(.+) {/g, '$1 {\n  ')
      .replace(/}\s*/g, '\n}\n\n')
      .replace(/;/g, ';\n  ')
      .replace(/\n\s*\n/g, '\n')
      .replace(/^\s+|\s+$/gm, '');
  }

  function formatHTML(html: string): string {
    const tags = html.split(/(<\/?[^>]+>)/g).filter(Boolean);
    let indent = '';
    let output = '';
    
    tags.forEach((tag) => {
      if (tag.startsWith('</')) {
        indent = indent.slice(2);
        output = output.trimEnd() + '\n' + indent;
      }
      
      output += tag;
      
      if (tag.startsWith('<') && !tag.startsWith('</') && !tag.endsWith('/>')) {
        output += '\n' + indent + '  ';
        indent += '  ';
      }
    });

    return output
      .replace(/\n\s+\n/g, '\n')
      .replace(/(<style>)/g, '$1\n')
      .replace(/(<\/style>)/g, '\n$1')
      .replace(/\\$$/g, '[')
      .replace(/\\$$/g, ']')
      .replace(/\\\//g, '/');
  }
</script>

<button 
  on:click={exportCanvases}
  class="w-full p-2 bg-gray-200 hover:bg-gray-300 rounded mb-2"
>
  Export Canvases
</button>
