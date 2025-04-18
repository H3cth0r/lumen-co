import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportCanvasesToPDF() {
  const canvases = Array.from(document.querySelectorAll('.canvas-container > div'));
  let pdf: jsPDF | null = null;

  for (const [index, canvasRoot] of canvases.entries()) {
    const autoScaleContent = canvasRoot.querySelector('.absolute.top-0.left-0.w-fit.h-fit') as HTMLElement;
    const contentElement = autoScaleContent || canvasRoot;

    // Create visible off-screen container for accurate rendering
    const tempContainer = document.createElement('div');
    Object.assign(tempContainer.style, {
      position: 'fixed',
      left: '-9999px',
      top: '0',
      zIndex: '9999',
      overflow: 'visible'
    });
    
    // Clone with preserved styles
    const clone = contentElement.cloneNode(true) as HTMLElement;
    resetCloneStyles(clone);
    
    // Preserve original computed styles
    const originalStyles = window.getComputedStyle(contentElement);
    clone.style.width = originalStyles.width;
    clone.style.height = originalStyles.height;
    clone.style.backgroundColor = originalStyles.backgroundColor;

    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);

    // Wait for rendering to complete
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Get dimensions from the CLONED element after resetting transforms
    const { width: widthPx, height: heightPx } = clone.getBoundingClientRect();
    let widthPt = widthPx * 0.75;
    let heightPt = heightPx * 0.75;

    // Determine orientation and format
    const isLandscape = widthPt > heightPt;
    const orientation = isLandscape ? 'landscape' : 'portrait';
    const format = isLandscape ? [heightPt, widthPt] : [widthPt, heightPt];

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: true,
      backgroundColor: originalStyles.backgroundColor || '#FFFFFF',
      onclone: (clonedDoc) => {
        Array.from(document.styleSheets).forEach(sheet => {
          if (sheet.cssRules) {
            const newSheet = clonedDoc.createElement('style');
            Array.from(sheet.cssRules).forEach(rule => {
              newSheet.appendChild(clonedDoc.createTextNode(rule.cssText));
            });
            clonedDoc.head.appendChild(newSheet);
          }
        });
      }
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Initialize PDF with first canvas dimensions or add new page
    if (!pdf) {
      pdf = new jsPDF({
        orientation: orientation,
        unit: 'pt',
        format: format
      });
    } else {
      pdf.addPage(format, orientation);
    }
    
    // Add image using original dimensions (widthPt and heightPt) to fill the page
    pdf.addImage(imgData, 'PNG', 0, 0, widthPt, heightPt, undefined, 'FAST');
    document.body.removeChild(tempContainer);
  }

  pdf?.save(`canvases-export-${Date.now()}.pdf`);
}

function resetCloneStyles(element: HTMLElement) {
  // Only reset transform on non-img elements
  if (element.tagName.toLowerCase() !== 'img') {
    element.style.transform = 'none';
    element.style.transformOrigin = '';
  }
  element.style.position = 'absolute';
  element.style.visibility = 'visible';
  element.style.opacity = '1';
  
  Array.from(element.children).forEach(child => resetCloneStyles(child as HTMLElement));
}
