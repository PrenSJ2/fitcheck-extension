// FitCheck Content Script
// Runs on shopping product pages to show size recommendations

(async function() {
  'use strict';

  console.log('[FitCheck] Content script starting...');

  // Early exit if already initialized
  if (window.__fitcheckInitialized) {
    console.log('[FitCheck] Already initialized, skipping');
    return;
  }
  window.__fitcheckInitialized = true;

  // Get stored measurements
  const { measurements } = await chrome.storage.local.get('measurements');
  if (!measurements) {
    console.log('[FitCheck] No measurements saved, skipping');
    return;
  }
  console.log('[FitCheck] Measurements loaded:', measurements.bust, measurements.waist, measurements.hips);

  // Detect site for optimized selectors
  const site = detectKnownSite(window.location.hostname);

  // Show loading indicator immediately for known shopping sites
  let loadingCard = null;
  if (site) {
    loadingCard = showLoadingIndicator();
  }

  // Wait a moment for page to settle, then check for size elements
  // Shopify sites (like Princess Polly) need more time to render
  const initialWait = (site === 'princesspolly' || site === 'motel') ? 1000 : 500;
  await sleep(initialWait);

  // Check for size elements (with retries for SPAs)
  let hasSize = hasAnySizeElements();
  if (!hasSize && site) {
    // Retry a few times for known sites (more retries for Shopify)
    const maxRetries = (site === 'princesspolly' || site === 'motel') ? 5 : 3;
    for (let i = 0; i < maxRetries && !hasSize; i++) {
      await sleep(500);
      hasSize = hasAnySizeElements();
    }
  }

  if (!hasSize) {
    // For known sites, still try to show recommendation using fallback size chart
    if (site) {
      console.log('[FitCheck] No size elements found on known site, using fallback');
    } else {
      if (loadingCard) loadingCard.remove();
      console.log('[FitCheck] No size elements found, skipping');
      console.log('[FitCheck] Debug - Site detected:', site);
      console.log('[FitCheck] Debug - URL:', window.location.href);
      return;
    }
  }

  // Show loading if we haven't already
  if (!loadingCard) {
    loadingCard = showLoadingIndicator();
  }

  console.log('[FitCheck] Size elements detected, analyzing page...');

  // Detect product type (tops vs bottoms)
  const productType = detectProductType();
  console.log('[FitCheck] Product type:', productType);

  // Try to detect size selector and get recommendation
  let recommendation = null;
  const sizeSelector = detectSizeSelector();

  if (sizeSelector) {
    console.log('[FitCheck] Detected size selector:', sizeSelector.type);
    console.log('[FitCheck] Options found:', sizeSelector.options?.length || sizeSelector.waistOptions?.length || 0);

    // Only use waist/length recommendations for bottoms (pants, jeans, etc.)
    if (productType === 'bottoms') {
      if (sizeSelector.type === 'waist-length') {
        recommendation = getWaistLengthRecommendation(measurements, sizeSelector);
      } else if (sizeSelector.type === 'waist-length-combined') {
        recommendation = matchSizeFromSelector(measurements, sizeSelector);
      } else if (sizeSelector.type === 'waist-only') {
        recommendation = getWaistOnlyRecommendation(measurements, sizeSelector);
      }
    }
    // For tops or unknown, skip waist-based recommendations
  } else {
    console.log('[FitCheck] No size selector detected, falling back to size guide');
  }

  // Fall back to size guide table for all products
  if (!recommendation) {
    const sizeGuide = extractSizeGuide();
    if (sizeGuide) {
      recommendation = matchSize(measurements, sizeGuide);
    }
  }

  // Remove loading indicator
  if (loadingCard) loadingCard.remove();

  if (!recommendation) {
    console.log('[FitCheck] Could not determine size');
    return;
  }

  console.log('[FitCheck] Recommendation:', recommendation.size);
  injectRecommendation(recommendation, site);

})();

// ============ UTILITIES ============

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============ LOADING INDICATOR ============

function showLoadingIndicator() {
  const existing = document.getElementById('fitcheck-recommendation');
  if (existing) existing.remove();

  const card = document.createElement('div');
  card.id = 'fitcheck-recommendation';
  card.innerHTML = `
    <div class="fitcheck-card fitcheck-loading">
      <div class="fitcheck-header">
        <span class="fitcheck-logo">👕 FitCheck</span>
        <span class="fitcheck-spinner"></span>
      </div>
      <div class="fitcheck-size">
        <span class="fitcheck-label">Finding your size...</span>
      </div>
    </div>`;

  card.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;';
  document.body.appendChild(card);
  return card;
}

// ============ PRODUCT TYPE DETECTION ============

function detectProductType() {
  const url = window.location.href.toLowerCase();
  const title = document.title.toLowerCase();
  const h1 = document.querySelector('h1')?.textContent.toLowerCase() || '';
  const pageText = document.body?.innerText?.substring(0, 3000).toLowerCase() || '';

  // Check for pants/jeans/trousers keywords
  const pantsKeywords = ['jeans', 'trouser', 'pant', 'chino', 'jogger', 'cargo', 'denim', 'shorts', 'skirt'];
  const topKeywords = ['top', 'shirt', 'blouse', 'tee', 't-shirt', 'sweater', 'jumper', 'hoodie', 'cardigan',
                       'jacket', 'coat', 'dress', 'bodysuit', 'crop', 'vest', 'tank', 'cami', 'bustier',
                       'corset', 'blazer', 'pullover', 'sweatshirt', 'romper', 'playsuit', 'jumpsuit', 'onesie'];

  const textToCheck = url + ' ' + title + ' ' + h1;

  for (const keyword of pantsKeywords) {
    if (textToCheck.includes(keyword)) {
      return 'bottoms';
    }
  }

  for (const keyword of topKeywords) {
    if (textToCheck.includes(keyword)) {
      return 'tops';
    }
  }

  // Default: check if page mentions waist prominently (likely bottoms)
  if (pageText.includes('waist size') || pageText.includes('inseam') || pageText.includes('leg length')) {
    return 'bottoms';
  }

  return 'unknown';
}

// ============ QUICK DETECTION ============

function hasAnySizeElements() {
  const quickSelectors = [
    // Generic
    'select[name*="size" i]',
    'select[id*="size" i]',
    '[class*="size-select"]',
    '[class*="sizeSelect"]',
    '[class*="size-picker"]',
    '[class*="sizePicker"]',
    '[data-testid*="size"]',
    'button[data-size]',
    '.size-guide',
    '.size-chart',
    // ASOS specific
    '[data-testid="sizeSelectorList"]',
    '[data-testid="size-selector"]',
    '#size-selector',
    '.size-selector',
    // Common patterns
    '[class*="product-size"]',
    '[class*="productSize"]',
    '[aria-label*="size" i]',
    // Shopify specific
    'select[name*="option" i]',
    '[data-single-option-selector]',
    '.single-option-selector',
    '[data-option-index]',
    '.product-form__input',
    '[class*="variant-input"]',
    '[class*="variant-wrapper"]',
    '[class*="option-selector"]',
    'fieldset[name*="size" i]',
    'input[type="radio"][name*="size" i]',
    '[class*="swatch"]',
    '.product-form select',
    '.product__form select',
    // Princess Polly / modern Shopify 2.0
    '[class*="ProductForm"]',
    '[class*="product-form"]',
    '[data-product-form]',
    '[data-variant-option]',
    'input[type="radio"][id*="size" i]',
    'input[type="radio"][value*="XS"]',
    'input[type="radio"][value*="Small"]',
    'label[for*="size" i]',
    '[class*="OptionSelector"]',
    '[class*="option-value"]',
    '[class*="variant-option"]',
    'button[class*="size"]',
    '[data-option="Size"]',
    '[data-option-name="Size"]',
    // Shopify 2.0 custom elements and patterns
    'variant-selects',
    'variant-radios',
    '[data-section-type="product"]',
    '[data-product-json]',
    'product-info',
    'product-form',
    // Radio buttons with option names (Shopify uses option1, option2, etc.)
    'input[type="radio"][name="option1"]',
    'input[type="radio"][name="option2"]',
    'input[type="radio"][name*="Option"]',
    // Add to cart button (indicates product page)
    'button[name="add"]',
    '[data-add-to-cart]',
    'form[action*="/cart/add"]'
  ];

  for (const selector of quickSelectors) {
    if (document.querySelector(selector)) return true;
  }

  // Check for size buttons/labels containing standard sizes
  const sizeLabels = document.querySelectorAll('label, button, span, div');
  for (const el of sizeLabels) {
    const text = el.textContent.trim();
    if (/^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL)$/i.test(text) ||
        /^(US\s*)?\d{1,2}$/.test(text) ||
        /^(UK\s*)?\d{1,2}$/.test(text)) {
      // Found a size-like element, verify it's in a product form area
      const form = el.closest('form, [class*="product"], [class*="Product"]');
      if (form) return true;
    }
  }

  // Check for size-related text
  const body = document.body;
  if (body) {
    const text = body.innerText.toLowerCase();
    if ((text.includes('select size') || text.includes('choose size') ||
         text.includes('size guide') || text.includes('select a size') ||
         text.includes('size:') || text.includes('pick a size')) &&
        (text.includes('add to bag') || text.includes('add to cart') || text.includes('add to basket'))) {
      return true;
    }
  }

  return false;
}

function detectKnownSite(hostname) {
  const sites = {
    'asos.com': 'asos', 'zara.com': 'zara', 'boohoo.com': 'boohoo',
    'prettylittlething.com': 'plt', 'hm.com': 'hm', 'nordstrom.com': 'nordstrom',
    'macys.com': 'macys', 'uniqlo.com': 'uniqlo', 'gap.com': 'gap',
    'amazon.com': 'amazon', 'amazon.co.uk': 'amazon', 'levis.com': 'levis',
    'motelrocks.com': 'motel', 'princesspolly.com': 'princesspolly'
  };

  for (const [domain, name] of Object.entries(sites)) {
    if (hostname.includes(domain)) return name;
  }
  return null;
}

// ============ SIZE SELECTOR DETECTION ============

function isWaistLengthFormat(text) {
  return /W\s*(\d+)\s*L\s*(\d+)/i.test(text) || /^\d+\s*[xX×\/]\s*\d+$/.test(text.trim());
}

function detectSizeSelector() {
  let waistOptions = [], lengthOptions = [], standardOptions = [];
  let hasWaist = false, hasLength = false;

  // Check all select elements (including Shopify-style)
  const selectSelectors = 'select, [data-single-option-selector], .single-option-selector';
  for (const select of document.querySelectorAll(selectSelectors)) {
    if (select.tagName !== 'SELECT') continue;

    const label = getSelectLabel(select).toLowerCase();
    const name = (select.name || select.id || '').toLowerCase();
    const options = extractSelectOptions(select);
    if (options.length === 0) continue;

    // Check if this looks like a size selector
    const isSizeRelated = label.includes('size') || name.includes('size') ||
                          name.includes('option') || label.includes('option') ||
                          options.some(o => /^(XXS|XS|S|M|L|XL|XXL|XXXL|\d{1,2})$/i.test(o.text.trim()));

    if (label.includes('waist') || name.includes('waist')) {
      hasWaist = true;
      waistOptions = options;
    } else if (label.includes('length') || label.includes('leg') ||
               label.includes('inseam') || name.includes('length')) {
      hasLength = true;
      lengthOptions = options;
    } else if (isSizeRelated) {
      if (options.some(o => isWaistLengthFormat(o.text))) {
        return { type: 'waist-length-combined', options };
      }
      if (options.some(o => { const n = parseInt(o.value); return n >= 24 && n <= 44; })) {
        hasWaist = true;
        waistOptions = options;
      } else {
        standardOptions = options;
      }
    }
  }

  // Check for radio button / label pairs (common in Shopify/Princess Polly)
  // Group radio buttons by name to find size-related groups
  const radioGroups = {};
  for (const radio of document.querySelectorAll('input[type="radio"]')) {
    const name = radio.name || 'unnamed';
    if (!radioGroups[name]) radioGroups[name] = [];
    radioGroups[name].push(radio);
  }

  let radioOptions = [];

  for (const [groupName, radios] of Object.entries(radioGroups)) {
    const groupOptions = [];
    let looksLikeSize = false;

    for (const radio of radios) {
      const value = radio.value || '';
      let labelText = value;

      // Try to find the label
      if (radio.id) {
        const label = document.querySelector(`label[for="${radio.id}"]`);
        if (label) {
          labelText = label.textContent.trim() || value;
        }
      }
      // Also check for parent label
      const parentLabel = radio.closest('label');
      if (parentLabel) {
        labelText = parentLabel.textContent.trim() || value;
      }

      // Clean up label text (remove extra whitespace)
      labelText = labelText.replace(/\s+/g, ' ').trim();

      if (labelText) {
        groupOptions.push({ text: labelText, value: value });

        // Check if this looks like a size value
        if (/^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL)$/i.test(labelText) ||
            /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL)$/i.test(value) ||
            /^\d{1,2}$/.test(value)) {
          looksLikeSize = true;
        }
      }
    }

    // Check if this group is likely the size selector
    const nameLower = groupName.toLowerCase();
    if (looksLikeSize || nameLower.includes('size') || nameLower === 'option1' || nameLower === 'option2') {
      // Verify it has size-like values
      const hasSizeValues = groupOptions.some(o =>
        /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL)$/i.test(o.text.trim()) ||
        /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL)$/i.test(o.value.trim()) ||
        /^\d{1,2}$/.test(o.value)
      );

      if (hasSizeValues && groupOptions.length > radioOptions.length) {
        radioOptions = groupOptions;
      }
    }
  }

  if (radioOptions.length > 0) {
    console.log('[FitCheck] Found radio size options:', radioOptions.map(o => o.text));
    // Check if these are waist/length format
    if (radioOptions.some(o => isWaistLengthFormat(o.text))) {
      return { type: 'waist-length-combined', options: radioOptions };
    }
    // Check if these are waist sizes
    if (radioOptions.some(o => { const n = parseInt(o.value); return n >= 24 && n <= 44; })) {
      if (!hasWaist) return { type: 'waist-only', waistOptions: radioOptions };
    }
    // Standard sizes
    if (radioOptions.some(o => /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL)$/i.test(o.text.trim()))) {
      standardOptions = radioOptions;
    }
  }

  // Check button-based selectors
  const buttonSelectors = [
    '[class*="size-option"]', '[class*="sizeOption"]',
    'button[data-size]', '[role="radio"][class*="size"]',
    '[class*="variant"] button', '[class*="option"] button',
    '.product-form button[type="button"]', '[data-option-value]',
    '[class*="swatch"] button', 'input[type="radio"] + label',
    // ASOS specific
    '[data-testid="sizeSelectorList"] button',
    '[data-testid="size-selector"] button',
    '.size-selector button',
    // Princess Polly / Shopify
    '[class*="OptionSelector"] label',
    '[class*="option-selector"] label',
    '[class*="variant-option"] label',
    '[data-option-name] label',
    'fieldset label'
  ];

  const buttons = document.querySelectorAll(buttonSelectors.join(', '));

  if (buttons.length > 0) {
    const btnOptions = Array.from(buttons)
      .map(b => {
        // Get text from various sources
        let text = b.textContent.trim();
        // For labels, also check aria-label and data attributes
        if (!text || text.length > 20) {
          text = b.getAttribute('aria-label') || b.dataset.value || '';
        }
        // For labels associated with inputs, get the input value
        if (b.tagName === 'LABEL' && b.htmlFor) {
          const input = document.getElementById(b.htmlFor);
          if (input) {
            text = text || input.value;
          }
        }
        return {
          text: text.trim(),
          value: b.dataset.size || b.dataset.optionValue || b.dataset.value || text.trim()
        };
      })
      .filter(o => o.text.length > 0 && o.text.length < 20);

    if (btnOptions.some(o => isWaistLengthFormat(o.text))) {
      return { type: 'waist-length-combined', options: btnOptions };
    }
    if (btnOptions.some(o => { const n = parseInt(o.value); return n >= 24 && n <= 44; })) {
      if (!hasWaist) return { type: 'waist-only', waistOptions: btnOptions };
    }
    if (standardOptions.length === 0 && btnOptions.length > 0) {
      standardOptions = btnOptions;
    }
  }

  if (hasWaist && hasLength) return { type: 'waist-length', waistOptions, lengthOptions };
  if (hasWaist) return { type: 'waist-only', waistOptions };
  if (standardOptions.length > 0) return { type: 'standard', options: standardOptions };

  return null;
}

function getSelectLabel(select) {
  if (select.id) {
    const label = document.querySelector(`label[for="${select.id}"]`);
    if (label) return label.textContent;
  }
  const parent = select.closest('.form-group, .field, [class*="size"]');
  if (parent) {
    const label = parent.querySelector('label, .label');
    if (label) return label.textContent;
  }
  return '';
}

function extractSelectOptions(select) {
  return Array.from(select.options)
    .filter(o => o.value && !o.disabled)
    .map(o => ({ text: o.textContent.trim(), value: o.value }));
}

// ============ WAIST/LENGTH RECOMMENDATIONS ============

function getWaistLengthRecommendation(measurements, selector) {
  const waistIn = measurements.waist / 2.54;
  const waist = findClosestSize(waistIn, selector.waistOptions);
  const length = calculateInseam(measurements, selector.lengthOptions);
  const inseamIn = measurements.inseam ? Math.round(measurements.inseam / 2.54) : null;

  if (!waist) return null;

  return {
    size: `${waist}${length ? ' x ' + length : ''}`,
    type: 'waist-length',
    confidence: 90,
    warnings: generateWaistWarnings(waistIn, waist),
    details: {
      yourWaist: `${measurements.waist} cm (${waistIn.toFixed(1)}")`,
      yourInseam: inseamIn ? `${measurements.inseam} cm (${inseamIn}")` : `estimated from height`
    }
  };
}

function getWaistOnlyRecommendation(measurements, selector) {
  const waistIn = measurements.waist / 2.54;
  const waist = findClosestSize(waistIn, selector.waistOptions);

  if (!waist) return null;

  return {
    size: `${waist}`,
    type: 'waist-only',
    confidence: 90,
    warnings: generateWaistWarnings(waistIn, waist),
    details: { yourWaist: `${measurements.waist} cm (${waistIn.toFixed(1)}")` }
  };
}

function matchSizeFromSelector(measurements, selector) {
  const waistIn = measurements.waist / 2.54;
  const idealLength = calculateInseam(measurements);
  const inseamIn = measurements.inseam ? Math.round(measurements.inseam / 2.54) : null;
  let best = null, bestScore = Infinity;

  const patterns = [
    /W\s*(\d+)\s*L\s*(\d+)/i,
    /W\s*(\d+)\s*[\/\-]\s*L\s*(\d+)/i,
    /(\d+)\s*[xX×\/]\s*(\d+)/
  ];

  for (const opt of selector.options) {
    const text = opt.text || opt.value;
    let w = null, l = null;

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        w = parseInt(match[1]);
        l = parseInt(match[2]);
        break;
      }
    }

    if (w !== null && l !== null) {
      const score = Math.abs(w - waistIn) * 2 + Math.abs(l - idealLength);
      if (score < bestScore) {
        bestScore = score;
        best = {
          size: text,
          type: 'waist-length',
          confidence: Math.max(0, Math.min(100, 100 - score * 3)),
          warnings: generateWaistWarnings(waistIn, w),
          details: {
            yourWaist: `${measurements.waist} cm (${waistIn.toFixed(1)}")`,
            yourInseam: inseamIn ? `${measurements.inseam} cm (${inseamIn}")` : `estimated from height`,
            recommendedWaist: `W${w}`,
            recommendedLength: `L${l}`
          }
        };
      }
    }
  }
  return best;
}

function findClosestSize(target, options) {
  let closest = null, minDiff = Infinity;
  for (const opt of options) {
    const n = parseInt(opt.value || opt.text);
    if (n >= 24 && n <= 50) {
      const diff = Math.abs(n - target);
      if (diff < minDiff) { minDiff = diff; closest = n; }
    }
  }
  return closest;
}

function calculateInseam(measurements, options = null) {
  let inseamCm;
  if (measurements.inseam) {
    inseamCm = measurements.inseam;
  } else {
    const heightCm = measurements.height || 170;
    inseamCm = heightCm < 155 ? 71 : heightCm < 160 ? 74 : heightCm < 165 ? 76 :
               heightCm < 170 ? 79 : heightCm < 175 ? 81 : heightCm < 180 ? 84 :
               heightCm < 185 ? 86 : heightCm < 190 ? 89 : 91;
  }

  const inseamInches = Math.round(inseamCm / 2.54);

  if (options?.length > 0) {
    let closest = null, minDiff = Infinity;
    for (const opt of options) {
      const n = parseInt(opt.value || opt.text);
      if (n >= 26 && n <= 40) {
        const diff = Math.abs(n - inseamInches);
        if (diff < minDiff) { minDiff = diff; closest = n; }
      }
    }
    return closest || inseamInches;
  }
  return inseamInches;
}

function generateWaistWarnings(actual, recommended) {
  const diff = actual - recommended;
  const absDiff = Math.abs(diff);

  if (absDiff > 3) {
    const icon = diff > 0 ? '🔴' : '🟡';
    const type = diff > 0 ? 'tight' : 'loose';
    const severity = absDiff > 4 ? 'very' : 'slightly';
    return [`${icon} Waist: May be ${severity} ${type} (${absDiff.toFixed(1)}" diff)`];
  } else if (absDiff > 1.5) {
    const icon = diff > 0 ? '🟠' : '🟡';
    const type = diff > 0 ? 'snug' : 'loose';
    return [`${icon} Waist: Might be slightly ${type}`];
  }
  return [];
}

// ============ SIZE GUIDE EXTRACTION ============

function extractSizeGuide() {
  for (const table of document.querySelectorAll('table')) {
    const text = table.textContent.toLowerCase();
    if ((text.includes('size') || text.includes('uk') || text.includes('us')) &&
        (text.includes('bust') || text.includes('chest') || text.includes('waist'))) {
      const parsed = parseSizeTable(table);
      if (parsed?.length > 0) {
        console.log('[FitCheck] Parsed size guide from page:', parsed.map(s => s.name));
        return parsed;
      }
    }
  }

  console.log('[FitCheck] Using fallback size chart');
  return [
    { name: 'XS / UK 6', bust: 79, waist: 61, hips: 86 },
    { name: 'S / UK 8', bust: 84, waist: 66, hips: 91 },
    { name: 'S / UK 10', bust: 89, waist: 71, hips: 96 },
    { name: 'M / UK 12', bust: 94, waist: 76, hips: 101 },
    { name: 'L / UK 14', bust: 99, waist: 81, hips: 106 },
    { name: 'L / UK 16', bust: 104, waist: 86, hips: 111 },
    { name: 'XL / UK 18', bust: 109, waist: 91, hips: 116 },
    { name: 'XXL / UK 20', bust: 114, waist: 96, hips: 121 }
  ];
}

function parseSizeTable(table) {
  const rows = table.querySelectorAll('tr');
  if (rows.length < 2) return null;

  const headers = Array.from(rows[0].querySelectorAll('th, td')).map(c => c.textContent.toLowerCase().trim());
  let sizeIdx = -1, bustIdx = -1, waistIdx = -1, hipsIdx = -1;

  headers.forEach((h, i) => {
    // Size column - but NOT if it's a measurement column
    if ((h.includes('size') || h.includes('uk') || h.includes('us') || h.includes('au')) &&
        !h.includes('bust') && !h.includes('waist') && !h.includes('hip') && !h.includes('chest')) {
      if (sizeIdx === -1) sizeIdx = i;
    }
    if (h.includes('bust') || h.includes('chest')) bustIdx = i;
    if (h.includes('waist')) waistIdx = i;
    if (h.includes('hip')) hipsIdx = i;
  });

  // If no size column found, use first column that's not a measurement
  if (sizeIdx === -1) {
    for (let i = 0; i < headers.length; i++) {
      if (i !== bustIdx && i !== waistIdx && i !== hipsIdx) {
        sizeIdx = i;
        break;
      }
    }
  }

  const sizes = [];
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td, th');
    if (cells.length > 0) {
      let sizeName = sizeIdx >= 0 ? cells[sizeIdx]?.textContent.trim() : null;

      // Validate size name - should not be a pure number > 50 (that's a measurement)
      if (sizeName && /^\d+$/.test(sizeName) && parseInt(sizeName) > 50) {
        // This is probably a measurement, not a size name - try first column instead
        sizeName = cells[0]?.textContent.trim();
        if (sizeName && /^\d+$/.test(sizeName) && parseInt(sizeName) > 50) {
          sizeName = null; // Give up, use fallback
        }
      }

      const size = {
        name: sizeName,
        bust: bustIdx >= 0 ? parseMeasurement(cells[bustIdx]?.textContent) : null,
        waist: waistIdx >= 0 ? parseMeasurement(cells[waistIdx]?.textContent) : null,
        hips: hipsIdx >= 0 ? parseMeasurement(cells[hipsIdx]?.textContent) : null
      };

      // Only add if we have a valid size name (not just a number)
      if (size.name && !(/^\d+$/.test(size.name) && parseInt(size.name) > 20) &&
          (size.bust || size.waist || size.hips)) {
        sizes.push(size);
      }
    }
  }
  return sizes.length > 0 ? sizes : null;
}

function parseMeasurement(text) {
  if (!text) return null;
  text = text.trim().toLowerCase();

  const range = text.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
  if (range) {
    let val = (parseFloat(range[1]) + parseFloat(range[2])) / 2;
    return val < 50 ? val * 2.54 : val;
  }

  const num = text.match(/(\d+\.?\d*)/);
  if (!num) return null;
  let val = parseFloat(num[1]);
  if (text.includes('in') || text.includes('"') || val < 50) val *= 2.54;
  return val;
}

// ============ SIZE MATCHING ============

function matchSize(measurements, sizeGuide) {
  let best = null, bestScore = Infinity;
  let bestWarnings = [];

  for (const size of sizeGuide) {
    let score = 0, count = 0, warnings = [];

    if (size.bust && measurements.bust) {
      const diff = measurements.bust - size.bust;
      score += Math.abs(diff); count++;

      if (diff > 8) {
        warnings.push({ area: 'Bust', type: 'tight', severity: 'very', diff: Math.abs(diff).toFixed(0) });
      } else if (diff > 4) {
        warnings.push({ area: 'Bust', type: 'tight', severity: 'slightly', diff: Math.abs(diff).toFixed(0) });
      } else if (diff < -8) {
        warnings.push({ area: 'Bust', type: 'loose', severity: 'very', diff: Math.abs(diff).toFixed(0) });
      } else if (diff < -4) {
        warnings.push({ area: 'Bust', type: 'loose', severity: 'slightly', diff: Math.abs(diff).toFixed(0) });
      }
    }

    if (size.waist && measurements.waist) {
      const diff = measurements.waist - size.waist;
      score += Math.abs(diff) * 1.2; count++;

      if (diff > 6) {
        warnings.push({ area: 'Waist', type: 'tight', severity: 'very', diff: Math.abs(diff).toFixed(0) });
      } else if (diff > 3) {
        warnings.push({ area: 'Waist', type: 'tight', severity: 'slightly', diff: Math.abs(diff).toFixed(0) });
      } else if (diff < -6) {
        warnings.push({ area: 'Waist', type: 'loose', severity: 'very', diff: Math.abs(diff).toFixed(0) });
      } else if (diff < -3) {
        warnings.push({ area: 'Waist', type: 'loose', severity: 'slightly', diff: Math.abs(diff).toFixed(0) });
      }
    }

    if (size.hips && measurements.hips) {
      const diff = measurements.hips - size.hips;
      score += Math.abs(diff); count++;

      if (diff > 8) {
        warnings.push({ area: 'Hips', type: 'tight', severity: 'very', diff: Math.abs(diff).toFixed(0) });
      } else if (diff > 4) {
        warnings.push({ area: 'Hips', type: 'tight', severity: 'slightly', diff: Math.abs(diff).toFixed(0) });
      } else if (diff < -8) {
        warnings.push({ area: 'Hips', type: 'loose', severity: 'very', diff: Math.abs(diff).toFixed(0) });
      } else if (diff < -4) {
        warnings.push({ area: 'Hips', type: 'loose', severity: 'slightly', diff: Math.abs(diff).toFixed(0) });
      }
    }

    if (count > 0) {
      score /= count;
      if (score < bestScore) {
        bestScore = score;
        bestWarnings = warnings;
        best = {
          size: size.name,
          confidence: Math.max(0, Math.min(100, 100 - bestScore * 2)),
          warnings: []
        };
      }
    }
  }

  // Format warnings for display
  if (best && bestWarnings.length > 0) {
    best.warnings = bestWarnings.map(w => {
      const icon = w.type === 'tight' ? '🔴' : '🟡';
      const verb = w.severity === 'very' ? 'May be' : 'Might be';
      return `${icon} ${w.area}: ${verb} ${w.severity} ${w.type} (${w.diff}cm diff)`;
    });
  }

  return best;
}

// ============ UI INJECTION ============

function injectRecommendation(recommendation, site) {
  const existing = document.getElementById('fitcheck-recommendation');
  if (existing) existing.remove();

  const card = document.createElement('div');
  card.id = 'fitcheck-recommendation';

  const details = recommendation.details ? `
    <div class="fitcheck-details">
      ${recommendation.details.yourWaist ? `<div><span>Your waist:</span> ${recommendation.details.yourWaist}</div>` : ''}
      ${recommendation.details.yourInseam ? `<div><span>Your inseam:</span> ${recommendation.details.yourInseam}</div>` : ''}
      ${recommendation.details.recommendedWaist ? `<div><span>Best waist:</span> ${recommendation.details.recommendedWaist}</div>` : ''}
      ${recommendation.details.recommendedLength ? `<div><span>Best length:</span> ${recommendation.details.recommendedLength}</div>` : ''}
    </div>` : '';

  const label = recommendation.type === 'waist-length' ? 'Recommended (W x L):' :
                recommendation.type === 'waist-only' ? 'Recommended Waist:' : 'Recommended:';

  card.innerHTML = `
    <div class="fitcheck-card">
      <div class="fitcheck-header">
        <span class="fitcheck-logo">👕 FitCheck</span>
        <span class="fitcheck-confidence">${Math.round(recommendation.confidence)}% match</span>
      </div>
      <div class="fitcheck-size">
        <span class="fitcheck-label">${label}</span>
        <span class="fitcheck-size-value">${recommendation.size}</span>
      </div>
      ${details}
      ${recommendation.warnings?.length > 0 ? `
        <div class="fitcheck-warnings">
          ${recommendation.warnings.map(w => `<div class="fitcheck-warning">⚠️ ${w}</div>`).join('')}
        </div>` : ''}
      <div class="fitcheck-footer">🔒 Privacy-first • Open source</div>
    </div>`;

  const insertPoint = findInsertionPoint(site);
  if (insertPoint) {
    insertPoint.insertAdjacentElement('afterbegin', card);
  } else {
    card.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;';
    document.body.appendChild(card);
  }
}

function findInsertionPoint(site) {
  const siteSelectors = {
    asos: '[data-testid="product-price"], .product-price, [class*="product-hero"]',
    zara: '.product-detail-info',
    boohoo: '.product-size, .product-info',
    amazon: '#centerCol, #ppd',
    motel: '.product-form, .product__info',
    princesspolly: '[class*="ProductForm"], [class*="product-form"], .product__info, [class*="product-single"], [data-product-form], form[action*="/cart"]'
  };

  if (site && siteSelectors[site]) {
    const el = document.querySelector(siteSelectors[site]);
    if (el) return el;
  }

  const selectors = [
    '.product-size', '[class*="product-size"]', '[class*="size-select"]',
    '[data-testid*="size"]', '.product-details', '.product-form',
    '.product-info', '[class*="product-hero"]'
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}
