// FitCheck Content Script
// Runs on product pages to show size recommendations

(async function() {
  'use strict';

  // Get stored measurements
  const { measurements } = await chrome.storage.local.get('measurements');
  
  if (!measurements) {
    console.log('[FitCheck] No measurements saved yet');
    return;
  }

  console.log('[FitCheck] Loaded measurements:', measurements);

  // Detect which site we're on
  const hostname = window.location.hostname;
  let site = null;

  if (hostname.includes('asos.com')) site = 'asos';
  else if (hostname.includes('zara.com')) site = 'zara';
  else if (hostname.includes('boohoo.com')) site = 'boohoo';
  else if (hostname.includes('prettylittlething.com')) site = 'plt';
  else if (hostname.includes('hm.com')) site = 'hm';

  if (!site) return;

  console.log('[FitCheck] Detected site:', site);

  // Wait for page to load
  await waitForElement(getSizeGuideSelector(site), 10000);

  // Extract size guide
  const sizeGuide = extractSizeGuide(site);
  
  if (!sizeGuide) {
    console.log('[FitCheck] Could not find size guide');
    return;
  }

  console.log('[FitCheck] Extracted size guide:', sizeGuide);

  // Match user measurements to size
  const recommendation = matchSize(measurements, sizeGuide);
  
  if (!recommendation) {
    console.log('[FitCheck] Could not determine size');
    return;
  }

  console.log('[FitCheck] Recommendation:', recommendation);

  // Inject UI
  injectRecommendation(recommendation, site);

})();

// ============ SIZE GUIDE EXTRACTION ============

function getSizeGuideSelector(site) {
  const selectors = {
    asos: '.size-guide, .product-size, [data-testid="size-guide"]',
    zara: '.size-guide, .product-detail-size-info',
    boohoo: '.size-guide, .product-size-guide',
    plt: '.size-guide, .size-selector',
    hm: '.size-guide, .product-size-info'
  };
  return selectors[site] || '.size-guide';
}

function extractSizeGuide(site) {
  // Try to find size guide table
  const tables = document.querySelectorAll('table');
  
  for (const table of tables) {
    const text = table.textContent.toLowerCase();
    
    // Check if it's a size guide table
    if ((text.includes('bust') || text.includes('chest')) && 
        (text.includes('waist')) && 
        (text.includes('uk') || text.includes('size'))) {
      
      return parseSizeTable(table);
    }
  }

  // Fallback: Use generic UK sizing
  return getGenericSizeGuide();
}

function parseSizeTable(table) {
  const rows = table.querySelectorAll('tr');
  const sizes = [];

  let headers = [];
  let bustIndex = -1;
  let waistIndex = -1;
  let hipsIndex = -1;
  let sizeIndex = -1;

  // Find header row and column indices
  const headerRow = rows[0];
  const headerCells = headerRow.querySelectorAll('th, td');
  
  headerCells.forEach((cell, index) => {
    const text = cell.textContent.toLowerCase().trim();
    headers.push(text);
    
    if (text.includes('size') || text.includes('uk')) sizeIndex = index;
    if (text.includes('bust') || text.includes('chest')) bustIndex = index;
    if (text.includes('waist')) waistIndex = index;
    if (text.includes('hip')) hipsIndex = index;
  });

  // Parse data rows
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td');
    
    if (cells.length > 0) {
      const size = {
        name: sizeIndex >= 0 ? cells[sizeIndex]?.textContent.trim() : null,
        bust: bustIndex >= 0 ? parseMeasurement(cells[bustIndex]?.textContent) : null,
        waist: waistIndex >= 0 ? parseMeasurement(cells[waistIndex]?.textContent) : null,
        hips: hipsIndex >= 0 ? parseMeasurement(cells[hipsIndex]?.textContent) : null
      };

      if (size.name && (size.bust || size.waist || size.hips)) {
        sizes.push(size);
      }
    }
  }

  return sizes.length > 0 ? sizes : null;
}

function parseMeasurement(text) {
  if (!text) return null;
  
  // Extract number (handle ranges like "86-88")
  const match = text.match(/(\d+\.?\d*)/);
  if (!match) return null;
  
  let value = parseFloat(match[1]);
  
  // Convert inches to cm if needed
  if (value < 50) {
    value = value * 2.54;
  }
  
  return value;
}

function getGenericSizeGuide() {
  // Generic UK women's sizing (cm)
  return [
    { name: 'UK 6', bust: 79, waist: 61, hips: 86 },
    { name: 'UK 8', bust: 84, waist: 66, hips: 91 },
    { name: 'UK 10', bust: 89, waist: 71, hips: 96 },
    { name: 'UK 12', bust: 94, waist: 76, hips: 101 },
    { name: 'UK 14', bust: 99, waist: 81, hips: 106 },
    { name: 'UK 16', bust: 104, waist: 86, hips: 111 },
    { name: 'UK 18', bust: 109, waist: 91, hips: 116 },
    { name: 'UK 20', bust: 114, waist: 96, hips: 121 }
  ];
}

// ============ SIZE MATCHING ============

function matchSize(measurements, sizeGuide) {
  let bestMatch = null;
  let bestScore = Infinity;
  let warnings = [];

  for (const size of sizeGuide) {
    let score = 0;
    let matchCount = 0;

    // Calculate difference for each measurement
    if (size.bust && measurements.bust) {
      const diff = Math.abs(size.bust - measurements.bust);
      score += diff;
      matchCount++;
      
      if (diff > 5) {
        if (measurements.bust > size.bust) {
          warnings.push(`Bust might be tight (your ${measurements.bust}cm vs ${size.bust}cm)`);
        } else {
          warnings.push(`Bust might be loose (your ${measurements.bust}cm vs ${size.bust}cm)`);
        }
      }
    }

    if (size.waist && measurements.waist) {
      const diff = Math.abs(size.waist - measurements.waist);
      score += diff * 1.2; // Waist is more important
      matchCount++;
      
      if (diff > 5) {
        if (measurements.waist > size.waist) {
          warnings.push(`Waist might be tight (your ${measurements.waist}cm vs ${size.waist}cm)`);
        }
      }
    }

    if (size.hips && measurements.hips) {
      const diff = Math.abs(size.hips - measurements.hips);
      score += diff;
      matchCount++;
      
      if (diff > 5) {
        if (measurements.hips > size.hips) {
          warnings.push(`Hips might be tight (your ${measurements.hips}cm vs ${size.hips}cm)`);
        }
      }
    }

    if (matchCount > 0) {
      score = score / matchCount; // Average score
      
      if (score < bestScore) {
        bestScore = score;
        bestMatch = {
          size: size.name,
          confidence: Math.max(0, Math.min(100, 100 - (bestScore * 2))),
          warnings: [...warnings],
          measurements: size
        };
      }
    }

    warnings = []; // Reset for next iteration
  }

  return bestMatch;
}

// ============ UI INJECTION ============

function injectRecommendation(recommendation, site) {
  // Remove existing FitCheck UI if present
  const existing = document.getElementById('fitcheck-recommendation');
  if (existing) existing.remove();

  // Create recommendation card
  const card = document.createElement('div');
  card.id = 'fitcheck-recommendation';
  card.innerHTML = `
    <div class="fitcheck-card">
      <div class="fitcheck-header">
        <span class="fitcheck-logo">👕 FitCheck</span>
        <span class="fitcheck-confidence">${Math.round(recommendation.confidence)}% match</span>
      </div>
      <div class="fitcheck-size">
        <span class="fitcheck-label">Recommended:</span>
        <span class="fitcheck-size-value">${recommendation.size}</span>
      </div>
      ${recommendation.warnings.length > 0 ? `
        <div class="fitcheck-warnings">
          ${recommendation.warnings.map(w => `<div class="fitcheck-warning">⚠️ ${w}</div>`).join('')}
        </div>
      ` : ''}
      <div class="fitcheck-footer">
        <span>🔒 Privacy-first • Open source</span>
      </div>
    </div>
  `;

  // Find insertion point (site-specific)
  const insertionPoint = getInsertionPoint(site);
  
  if (insertionPoint) {
    insertionPoint.insertAdjacentElement('afterbegin', card);
  } else {
    // Fallback: Add to body
    document.body.insertAdjacentElement('afterbegin', card);
  }
}

function getInsertionPoint(site) {
  const selectors = {
    asos: '.product-size, .product-details, [data-testid="product-size"]',
    zara: '.product-detail-info, .product-size-info',
    boohoo: '.product-size, .product-info',
    plt: '.product-details, .size-selector',
    hm: '.product-description, .product-size-info'
  };

  const selector = selectors[site];
  return selector ? document.querySelector(selector) : null;
}

// ============ UTILITIES ============

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null); // Don't reject, just resolve with null
    }, timeout);
  });
}
