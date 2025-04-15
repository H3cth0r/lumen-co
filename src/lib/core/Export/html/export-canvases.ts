export function exportCanvases() {
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
    const tailwindArbitraryClasses = new Map<string, string>();
    
    // Collect classes and extract arbitrary Tailwind classes
    clones.forEach(clone => {
      collectClassesAndStyles(clone, classSet, tailwindArbitraryClasses);
      wrapper.appendChild(clone);
    });

    // Extract standard CSS rules
    const styleRules = new Set<string>();
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        extractRules(sheet.cssRules, styleRules, classSet);
      } catch (e) {
        console.warn('Could not access stylesheet:', e);
      }
    });

    // Generate CSS for arbitrary Tailwind classes
    const arbitraryStyles = generateArbitraryTailwindCSS(tailwindArbitraryClasses);
    
    const style = document.createElement('style');
    style.textContent = formatCSS([...styleRules, ...arbitraryStyles].join('\n'));
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

function collectClassesAndStyles(element: HTMLElement, classes: Set<string>, arbitraryClasses: Map<string, string>) {
  if (element.classList) {
    element.classList.forEach(className => {
      classes.add(className);
      
      // Detect and extract arbitrary Tailwind classes
      if (className.includes('[') && className.includes(']')) {
        const computedStyle = window.getComputedStyle(element);
        
        // Height classes
        if (className.startsWith('h-[')) {
          arbitraryClasses.set(className, `height: ${extractValueFromClass(className)};`);
        }
        // Width classes
        else if (className.startsWith('w-[')) {
          arbitraryClasses.set(className, `width: ${extractValueFromClass(className)};`);
        }
        // Margin classes
        else if (className.startsWith('m-[') || className.startsWith('mt-[') || 
                className.startsWith('mb-[') || className.startsWith('ml-[') || 
                className.startsWith('mr-[') || className.startsWith('mx-[') || 
                className.startsWith('my-[')) {
          const property = mapTailwindPrefixToCSS(className.split('-')[0]);
          arbitraryClasses.set(className, `${property}: ${extractValueFromClass(className)};`);
        }
        // Padding classes
        else if (className.startsWith('p-[') || className.startsWith('pt-[') || 
                className.startsWith('pb-[') || className.startsWith('pl-[') || 
                className.startsWith('pr-[') || className.startsWith('px-[') || 
                className.startsWith('py-[')) {
          const property = mapTailwindPrefixToCSS(className.split('-')[0]);
          arbitraryClasses.set(className, `${property}: ${extractValueFromClass(className)};`);
        }
        // Max/min width/height
        else if (className.startsWith('max-w-[') || className.startsWith('min-w-[') || 
                className.startsWith('max-h-[') || className.startsWith('min-h-[')) {
          const parts = className.split('-');
          const prefix = parts.slice(0, 2).join('-');
          const property = mapTailwindPrefixToCSS(prefix);
          arbitraryClasses.set(className, `${property}: ${extractValueFromClass(className)};`);
        }
        // Text size
        else if (className.startsWith('text-[')) {
          arbitraryClasses.set(className, `font-size: ${extractValueFromClass(className)};`);
        }
        // Gap
        else if (className.startsWith('gap-[')) {
          arbitraryClasses.set(className, `gap: ${extractValueFromClass(className)};`);
        }
      }
    });
  }
  
  Array.from(element.children).forEach(child => 
    collectClassesAndStyles(child as HTMLElement, classes, arbitraryClasses)
  );
}

function extractValueFromClass(className: string): string {
  const match = className.match(/\[(.*?)\]/);
  return match ? match[1] : '';
}

function mapTailwindPrefixToCSS(prefix: string): string {
  const mapping: Record<string, string> = {
    'm': 'margin',
    'mt': 'margin-top',
    'mb': 'margin-bottom',
    'ml': 'margin-left',
    'mr': 'margin-right',
    'mx': 'margin-left, margin-right',
    'my': 'margin-top, margin-bottom',
    'p': 'padding',
    'pt': 'padding-top',
    'pb': 'padding-bottom',
    'pl': 'padding-left',
    'pr': 'padding-right',
    'px': 'padding-left, padding-right',
    'py': 'padding-top, padding-bottom',
    'max-w': 'max-width',
    'min-w': 'min-width',
    'max-h': 'max-height',
    'min-h': 'min-height',
    'w': 'width',
    'h': 'height'
  };
  
  return mapping[prefix] || prefix;
}

function generateArbitraryTailwindCSS(arbitraryClasses: Map<string, string>): string[] {
  const styles: string[] = [];
  
  arbitraryClasses.forEach((cssValue, className) => {
    // Properly escape brackets and other special characters in CSS selector
    const escapedClassName = escapeCSSSelector(className);
    styles.push(`.${escapedClassName} { ${cssValue} }`);
  });
  
  return styles;
}

function escapeCSSSelector(selector: string): string {
  // Escape brackets, percentage signs, and other special characters in CSS selectors
  return selector
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/%/g, '\\%')
    .replace(/\./g, '\\.');
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
  return className.replace(/([!"$%&'()*+,.\/:;<=>?@[\]^`{|}~])/g, '\\$1');
}

function formatCSS(css: string): string {
  return css
    .replace(/(.+) {/g, '$1 {\n  ')
    .replace(/}\s*/g, '\n}\n\n')
    .replace(/;/g, ';\n  ')
    .replace(/\n\s*\n/g, '\n')
    .replace(/^\s+|\s+$/gm, '');
    // Removed the replace that was removing backslashes
}

function formatHTML(html: string): string {
  // We only want to handle class attributes in the HTML, not in the style tag
  const styleTagRegex = /<style>([\s\S]*?)<\/style>/g;
  const styleMatches = [];
  let match;
  
  // Extract style tag content
  while ((match = styleTagRegex.exec(html)) !== null) {
    styleMatches.push({
      fullMatch: match[0],
      content: match[1]
    });
  }
  
  // Replace style tags with placeholders
  let processedHtml = html;
  styleMatches.forEach((styleMatch, index) => {
    processedHtml = processedHtml.replace(styleMatch.fullMatch, `__STYLE_PLACEHOLDER_${index}__`);
  });
  
  // Now process class attributes in the HTML (outside style tags)
  processedHtml = processedHtml.replace(/class="([^"]*)"/g, (match, classStr) => {
    // Keep the original class names in HTML (do NOT add backslashes here)
    return `class="${classStr}"`;
  });
  
  // Restore style tags
  styleMatches.forEach((styleMatch, index) => {
    processedHtml = processedHtml.replace(`__STYLE_PLACEHOLDER_${index}__`, styleMatch.fullMatch);
  });
  
  const tags = processedHtml.split(/(<\/?[^>]+>)/g).filter(Boolean);
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
    .replace(/(<\/style>)/g, '\n$1');
}
