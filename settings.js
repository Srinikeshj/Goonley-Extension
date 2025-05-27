document.addEventListener("DOMContentLoaded", () => {
  // Get all elements
  const colorRadios = document.querySelectorAll('input[name="color"]');
  const particleCount = document.getElementById("particleCount");
  const countDisplay = document.getElementById("countDisplay");
  const saveBtn = document.getElementById("saveBtn");
  const backBtn = document.getElementById("backBtn");
  const selectedDiv = document.querySelector('.selected');
  const range = document.getElementById('particleCount');

  // Helper functions
  function getSelectedColor() {
    const checked = document.querySelector('input[name="color"]:checked');
    return checked ? checked.id : "white";
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function updateParticleColor() {
    if (window.colorMap) {
      const color = window.colorMap[getSelectedColor()] || "#23c483";
      document.documentElement.style.setProperty('--particle-color', color);
      if (selectedDiv) {
        selectedDiv.setAttribute('data-selected', capitalize(getSelectedColor()));
      }
    }
  }

  // Chrome-only slider gradient update
  function updateRangeFill() {
    const min = +range.min;
    const max = +range.max;
    const val = +range.value;
    const percent = ((val - min) / (max - min)) * 100;
    const color = getComputedStyle(document.documentElement).getPropertyValue('--particle-color') || '#23c483';

    // Only show the gradient up to the thumb, rest is #2a2f3b
    range.style.background = `linear-gradient(90deg,
      color-mix(in srgb, ${color} 30%, #181a20) 0%,
      color-mix(in srgb, ${color} 80%, rgb(191,191,192)) ${percent}%,
      #2a2f3b ${percent}%,
      #2a2f3b 100%
    )`;
  }

  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(["color", "count"], (data) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving settings:", chrome.runtime.lastError);
        return;
      }
      
      // Set saved values or defaults
      const color = data.color || "white";
      const radio = document.getElementById(color);
      if (radio) radio.checked = true;
      
      particleCount.value = data.count || 100;
      countDisplay.textContent = particleCount.value;
      
      // Update UI with loaded values
      updateParticleColor();
      updateRangeFill(); // Initialize slider gradient
    });
  }

  // Event listeners
  particleCount.addEventListener("input", () => {
    countDisplay.textContent = particleCount.value;
    updateRangeFill(); // Update gradient on slider move
  });

  colorRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      updateParticleColor();
      updateRangeFill(); // Update gradient when color changes
    });
  });

  saveBtn.addEventListener("click", () => {
    chrome.storage.sync.set({
      color: getSelectedColor(),
      count: parseInt(particleCount.value)
    }, () => {
      window.location.href = "index.html";
    });
  });

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  // Initialize slider gradient immediately
  updateRangeFill();
});