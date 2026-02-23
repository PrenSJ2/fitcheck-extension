// FitCheck Popup Logic
// Handles measurement input and storage

document.addEventListener('DOMContentLoaded', async () => {
  const saveBtn = document.getElementById('saveBtn');
  const editBtn = document.getElementById('editBtn');
  const inputForm = document.getElementById('inputForm');
  const savedView = document.getElementById('savedView');
  const status = document.getElementById('status');

  // Check if measurements already exist
  const stored = await chrome.storage.local.get('measurements');
  
  if (stored.measurements) {
    showSavedView(stored.measurements);
  }

  // Save measurements
  saveBtn.addEventListener('click', async () => {
    const measurements = {
      gender: document.getElementById('gender').value,
      bust: parseFloat(document.getElementById('bust').value),
      waist: parseFloat(document.getElementById('waist').value),
      hips: parseFloat(document.getElementById('hips').value),
      height: parseFloat(document.getElementById('height').value),
      savedAt: new Date().toISOString()
    };

    // Validation
    if (!measurements.bust || !measurements.waist || !measurements.hips || !measurements.height) {
      showStatus('Please fill in all measurements', 'error');
      return;
    }

    if (measurements.bust < 50 || measurements.bust > 150 ||
        measurements.waist < 40 || measurements.waist > 150 ||
        measurements.hips < 50 || measurements.hips > 150 ||
        measurements.height < 140 || measurements.height > 220) {
      showStatus('Please check your measurements - they seem unusual', 'error');
      return;
    }

    // Save to Chrome storage
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
    
    // Pre-fill form
    chrome.storage.local.get('measurements').then(stored => {
      if (stored.measurements) {
        document.getElementById('gender').value = stored.measurements.gender;
        document.getElementById('bust').value = stored.measurements.bust;
        document.getElementById('waist').value = stored.measurements.waist;
        document.getElementById('hips').value = stored.measurements.hips;
        document.getElementById('height').value = stored.measurements.height;
      }
    });
  });

  function showSavedView(measurements) {
    inputForm.style.display = 'none';
    savedView.style.display = 'block';

    const display = document.getElementById('displayMeasurements');
    display.innerHTML = `
      <div><span>Gender:</span> <strong>${measurements.gender === 'female' ? "Women's" : "Men's"}</strong></div>
      <div><span>Bust/Chest:</span> <strong>${measurements.bust} cm</strong></div>
      <div><span>Waist:</span> <strong>${measurements.waist} cm</strong></div>
      <div><span>Hips:</span> <strong>${measurements.hips} cm</strong></div>
      <div><span>Height:</span> <strong>${measurements.height} cm</strong></div>
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
