// FitCheck Popup Logic
// Handles measurement input and storage

document.addEventListener('DOMContentLoaded', async () => {
  const saveBtn = document.getElementById('saveBtn');
  const editBtn = document.getElementById('editBtn');
  const inputForm = document.getElementById('inputForm');
  const savedView = document.getElementById('savedView');
  const status = document.getElementById('status');
  const unitCmBtn = document.getElementById('unitCm');
  const unitInBtn = document.getElementById('unitIn');
  const heightMetric = document.getElementById('heightMetric');
  const heightImperial = document.getElementById('heightImperial');
  const inseamMetric = document.getElementById('inseamMetric');
  const inseamImperial = document.getElementById('inseamImperial');

  // Current unit state
  let currentUnit = 'cm';

  // Track if user manually entered inseam
  let inseamManuallyEntered = false;

  // Conversion constants
  const CM_TO_IN = 0.393701;
  const IN_TO_CM = 2.54;
  const FT_TO_CM = 30.48;

  // Input configurations for each unit
  const inputConfigs = {
    cm: {
      bust: { placeholder: 'e.g. 86', min: 50, max: 150, step: 0.5 },
      waist: { placeholder: 'e.g. 68', min: 40, max: 150, step: 0.5 },
      hips: { placeholder: 'e.g. 92', min: 50, max: 150, step: 0.5 }
    },
    in: {
      bust: { placeholder: 'e.g. 34', min: 20, max: 59, step: 0.25 },
      waist: { placeholder: 'e.g. 27', min: 16, max: 59, step: 0.25 },
      hips: { placeholder: 'e.g. 36', min: 20, max: 59, step: 0.25 }
    }
  };

  // Estimate inseam from height (in cm, returns cm)
  function estimateInseamFromHeight(heightCm) {
    if (heightCm < 155) return 71;
    if (heightCm < 160) return 74;
    if (heightCm < 165) return 76;
    if (heightCm < 170) return 79;
    if (heightCm < 175) return 81;
    if (heightCm < 180) return 84;
    if (heightCm < 185) return 86;
    if (heightCm < 190) return 89;
    return 91;
  }

  // Convert cm to feet and inches
  function cmToFeetInches(cm) {
    const totalInches = cm * CM_TO_IN;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches: inches === 12 ? 0 : inches, adjustedFeet: inches === 12 ? feet + 1 : feet };
  }

  // Convert feet and inches to cm
  function feetInchesToCm(feet, inches) {
    const totalInches = (feet * 12) + inches;
    return Math.round(totalInches * IN_TO_CM * 10) / 10;
  }

  // Convert cm to inches
  function cmToInches(cm) {
    return Math.round(cm * CM_TO_IN);
  }

  // Convert inches to cm
  function inchesToCm(inches) {
    return Math.round(inches * IN_TO_CM * 10) / 10;
  }

  // Update estimated inseam based on height
  function updateEstimatedInseam() {
    if (inseamManuallyEntered) return; // Don't overwrite manual entry

    let heightCm;
    if (currentUnit === 'in') {
      const feet = parseInt(document.getElementById('heightFeet').value) || 0;
      const inches = parseInt(document.getElementById('heightInches').value) || 0;
      if (feet > 0) {
        heightCm = feetInchesToCm(feet, inches);
      }
    } else {
      heightCm = parseFloat(document.getElementById('height').value);
    }

    if (heightCm && heightCm >= 140 && heightCm <= 220) {
      const estimatedCm = estimateInseamFromHeight(heightCm);
      if (currentUnit === 'in') {
        document.getElementById('inseamInches').value = cmToInches(estimatedCm);
        document.getElementById('inseamInches').classList.add('estimated');
      } else {
        document.getElementById('inseam').value = estimatedCm;
        document.getElementById('inseam').classList.add('estimated');
      }
    }
  }

  // Height input listeners to auto-calculate inseam
  document.getElementById('height').addEventListener('input', updateEstimatedInseam);
  document.getElementById('heightFeet').addEventListener('input', updateEstimatedInseam);
  document.getElementById('heightInches').addEventListener('input', updateEstimatedInseam);

  // Track manual inseam entry
  document.getElementById('inseam').addEventListener('input', function() {
    inseamManuallyEntered = true;
    this.classList.remove('estimated');
  });
  document.getElementById('inseamInches').addEventListener('input', function() {
    inseamManuallyEntered = true;
    this.classList.remove('estimated');
  });

  // Update input fields based on selected unit
  function updateInputsForUnit(unit, convertValues = false) {
    const fields = ['bust', 'waist', 'hips'];
    const config = inputConfigs[unit];

    fields.forEach(field => {
      const input = document.getElementById(field);
      const unitSpan = document.getElementById(`${field}Unit`);
      const fieldConfig = config[field];

      // Convert existing value if needed
      if (convertValues && input.value) {
        const currentValue = parseFloat(input.value);
        if (!isNaN(currentValue)) {
          if (unit === 'in') {
            input.value = Math.round(currentValue * CM_TO_IN * 4) / 4;
          } else {
            input.value = Math.round(currentValue * IN_TO_CM * 2) / 2;
          }
        }
      }

      // Update input attributes
      input.placeholder = fieldConfig.placeholder;
      input.min = fieldConfig.min;
      input.max = fieldConfig.max;
      input.step = fieldConfig.step;

      // Update unit label
      unitSpan.textContent = unit;
    });

    // Handle height and inseam inputs
    if (unit === 'in') {
      // Switch to imperial for height and inseam
      heightMetric.style.display = 'none';
      heightImperial.style.display = 'block';
      inseamMetric.style.display = 'none';
      inseamImperial.style.display = 'block';

      // Convert values if needed
      if (convertValues) {
        // Height
        const heightCm = parseFloat(document.getElementById('height').value);
        if (!isNaN(heightCm)) {
          const { adjustedFeet, inches } = cmToFeetInches(heightCm);
          document.getElementById('heightFeet').value = adjustedFeet;
          document.getElementById('heightInches').value = inches;
        }

        // Inseam
        const inseamCm = parseFloat(document.getElementById('inseam').value);
        if (!isNaN(inseamCm)) {
          document.getElementById('inseamInches').value = cmToInches(inseamCm);
          // Preserve estimated state
          if (document.getElementById('inseam').classList.contains('estimated')) {
            document.getElementById('inseamInches').classList.add('estimated');
          }
        }
      }
    } else {
      // Switch to metric for height and inseam
      heightMetric.style.display = 'block';
      heightImperial.style.display = 'none';
      inseamMetric.style.display = 'block';
      inseamImperial.style.display = 'none';

      // Convert values if needed
      if (convertValues) {
        // Height
        const feet = parseInt(document.getElementById('heightFeet').value) || 0;
        const inches = parseInt(document.getElementById('heightInches').value) || 0;
        if (feet > 0 || inches > 0) {
          document.getElementById('height').value = feetInchesToCm(feet, inches);
        }

        // Inseam
        const inseamIn = parseInt(document.getElementById('inseamInches').value);
        if (!isNaN(inseamIn) && inseamIn > 0) {
          document.getElementById('inseam').value = inchesToCm(inseamIn);
          // Preserve estimated state
          if (document.getElementById('inseamInches').classList.contains('estimated')) {
            document.getElementById('inseam').classList.add('estimated');
          }
        }
      }
    }
  }

  // Unit toggle handlers
  unitCmBtn.addEventListener('click', () => {
    if (currentUnit === 'cm') return;
    unitCmBtn.classList.add('active');
    unitInBtn.classList.remove('active');
    updateInputsForUnit('cm', true);
    currentUnit = 'cm';
  });

  unitInBtn.addEventListener('click', () => {
    if (currentUnit === 'in') return;
    unitInBtn.classList.add('active');
    unitCmBtn.classList.remove('active');
    updateInputsForUnit('in', true);
    currentUnit = 'in';
  });

  // Check if measurements already exist
  const stored = await chrome.storage.local.get('measurements');

  if (stored.measurements) {
    showSavedView(stored.measurements);
  }

  // Save measurements
  saveBtn.addEventListener('click', async () => {
    let bust = parseFloat(document.getElementById('bust').value);
    let waist = parseFloat(document.getElementById('waist').value);
    let hips = parseFloat(document.getElementById('hips').value);
    let height;
    let inseam = null;
    let inseamIsEstimated = false;

    // Get height and inseam based on current unit
    if (currentUnit === 'in') {
      // Height from feet/inches
      const feet = parseInt(document.getElementById('heightFeet').value);
      const inches = parseInt(document.getElementById('heightInches').value) || 0;

      if (!feet || feet < 4 || feet > 7) {
        showStatus('Please enter a valid height (feet)', 'error');
        return;
      }
      if (inches < 0 || inches > 11) {
        showStatus('Please enter valid inches (0-11)', 'error');
        return;
      }

      height = feetInchesToCm(feet, inches);

      // Inseam from inches
      const inseamIn = parseInt(document.getElementById('inseamInches').value);
      if (inseamIn) {
        if (inseamIn < 24 || inseamIn > 40) {
          showStatus('Please enter a valid inseam (24-40 inches)', 'error');
          return;
        }
        inseam = inchesToCm(inseamIn);
        inseamIsEstimated = document.getElementById('inseamInches').classList.contains('estimated');
      }
    } else {
      height = parseFloat(document.getElementById('height').value);

      // Inseam
      const inseamVal = parseFloat(document.getElementById('inseam').value);
      if (inseamVal) {
        if (inseamVal < 60 || inseamVal > 100) {
          showStatus('Please enter a valid inseam (60-100 cm)', 'error');
          return;
        }
        inseam = inseamVal;
        inseamIsEstimated = document.getElementById('inseam').classList.contains('estimated');
      }
    }

    // Validation - check if required fields are filled
    if (!bust || !waist || !hips || !height) {
      showStatus('Please fill in all required measurements', 'error');
      return;
    }

    // Validate body measurements against current unit's ranges
    const config = inputConfigs[currentUnit];
    if (bust < config.bust.min || bust > config.bust.max ||
        waist < config.waist.min || waist > config.waist.max ||
        hips < config.hips.min || hips > config.hips.max) {
      showStatus('Please check your measurements - they seem unusual', 'error');
      return;
    }

    // Validate height (always check in cm)
    if (height < 140 || height > 220) {
      showStatus('Please check your height - it seems unusual', 'error');
      return;
    }

    // Convert body measurements to cm if currently in inches
    if (currentUnit === 'in') {
      bust = Math.round(bust * IN_TO_CM * 10) / 10;
      waist = Math.round(waist * IN_TO_CM * 10) / 10;
      hips = Math.round(hips * IN_TO_CM * 10) / 10;
      // height and inseam are already converted
    }

    const measurements = {
      gender: document.getElementById('gender').value,
      bust,
      waist,
      hips,
      height,
      inseam, // null if not provided
      inseamIsEstimated, // true if auto-calculated from height
      savedAt: new Date().toISOString()
    };

    // Save to Chrome storage (always in cm)
    await chrome.storage.local.set({ measurements });

    showStatus('Measurements saved successfully! 🎉', 'success');

    setTimeout(() => {
      showSavedView(measurements);
    }, 1000);
  });

  // Edit measurements
  editBtn.addEventListener('click', () => {
    inputForm.style.display = 'block';
    savedView.style.display = 'none';

    // Reset to cm unit
    currentUnit = 'cm';
    inseamManuallyEntered = false;
    unitCmBtn.classList.add('active');
    unitInBtn.classList.remove('active');
    heightMetric.style.display = 'block';
    heightImperial.style.display = 'none';
    inseamMetric.style.display = 'block';
    inseamImperial.style.display = 'none';
    updateInputsForUnit('cm', false);

    // Pre-fill form with stored values (in cm)
    chrome.storage.local.get('measurements').then(stored => {
      if (stored.measurements) {
        document.getElementById('gender').value = stored.measurements.gender;
        document.getElementById('bust').value = stored.measurements.bust;
        document.getElementById('waist').value = stored.measurements.waist;
        document.getElementById('hips').value = stored.measurements.hips;
        document.getElementById('height').value = stored.measurements.height;

        if (stored.measurements.inseam) {
          document.getElementById('inseam').value = stored.measurements.inseam;
          if (stored.measurements.inseamIsEstimated) {
            document.getElementById('inseam').classList.add('estimated');
          } else {
            inseamManuallyEntered = true;
          }
        } else {
          // Auto-calculate inseam from height
          updateEstimatedInseam();
        }

        // Also pre-fill imperial values in case user switches
        const { adjustedFeet, inches } = cmToFeetInches(stored.measurements.height);
        document.getElementById('heightFeet').value = adjustedFeet;
        document.getElementById('heightInches').value = inches;

        if (stored.measurements.inseam) {
          document.getElementById('inseamInches').value = cmToInches(stored.measurements.inseam);
          if (stored.measurements.inseamIsEstimated) {
            document.getElementById('inseamInches').classList.add('estimated');
          }
        }
      }
    });
  });

  function showSavedView(measurements) {
    inputForm.style.display = 'none';
    savedView.style.display = 'block';

    // Convert height to feet/inches for display
    const { adjustedFeet, inches } = cmToFeetInches(measurements.height);
    const heightDisplay = `${measurements.height} cm (${adjustedFeet}'${inches}")`;

    // Get inseam display
    let inseamDisplay;
    let inseamCm, inseamIn;

    if (measurements.inseam) {
      inseamCm = measurements.inseam;
      inseamIn = cmToInches(inseamCm);
      if (measurements.inseamIsEstimated) {
        inseamDisplay = `${inseamCm} cm (${inseamIn}") <span class="estimate-badge">estimated</span>`;
      } else {
        inseamDisplay = `${inseamCm} cm (${inseamIn}")`;
      }
    } else {
      // Calculate estimate for display
      inseamCm = estimateInseamFromHeight(measurements.height);
      inseamIn = cmToInches(inseamCm);
      inseamDisplay = `${inseamCm} cm (${inseamIn}") <span class="estimate-badge">estimated</span>`;
    }

    const display = document.getElementById('displayMeasurements');
    display.innerHTML = `
      <div><span>Gender:</span> <strong>${measurements.gender === 'female' ? "Women's" : "Men's"}</strong></div>
      <div><span>Bust/Chest:</span> <strong>${measurements.bust} cm</strong></div>
      <div><span>Waist:</span> <strong>${measurements.waist} cm</strong></div>
      <div><span>Hips:</span> <strong>${measurements.hips} cm</strong></div>
      <div><span>Height:</span> <strong>${heightDisplay}</strong></div>
      <div><span>Inseam:</span> <strong>${inseamDisplay}</strong></div>
    `;
  }

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';

    if (type === 'error') {
      status.style.background = '#f8d7da';
      status.style.color = '#721c24';
    }

    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
  }
});
