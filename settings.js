document.addEventListener("DOMContentLoaded", () => {
  const colorSelect = document.getElementById("colorSelect");
  const particleCount = document.getElementById("particleCount");
  const countDisplay = document.getElementById("countDisplay");
  const saveBtn = document.getElementById("saveBtn");
  const backBtn = document.getElementById("backBtn");

  // Load saved settings
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get([
      "color", "count"
    ], (data) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving settings:", chrome.runtime.lastError);
        alert("Failed to load settings. Please try again.");
        return;
      }
      colorSelect.value = data.color || "white";
      particleCount.value = data.count || 100;
      countDisplay.textContent = particleCount.value;
    });
  }

  particleCount.addEventListener("input", () => {
    countDisplay.textContent = particleCount.value;
  });

  saveBtn.addEventListener("click", () => {
    chrome.storage.sync.set({
      color: colorSelect.value,
      count: parseInt(particleCount.value)
    }, () => {
      alert("Settings saved!");
    });
  });

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  function getColorValue(colorName) {
    // Map color names to CSS values
    const colorMap = {
      white: "#fff",
      mixed: "#23c483",
      red: "#e74c3c",
      blue: "#3498db",
      green: "#2ecc71",
      yellow: "#f1c40f",
      purple: "#9b59b6",
      orange: "#e67e22",
      pink: "#fd79a8"
    };
    return colorMap[colorName] || "#23c483";
  }

  function updateButtonHoverColor() {
    const color = getColorValue(colorSelect.value);
    const styleId = "dynamic-button-hover";
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `
      button:hover {
        background-color: ${color} !important;
      }
    `;
  }

  // Update on load and when color changes
  colorSelect.addEventListener("change", updateButtonHoverColor);
  updateButtonHoverColor();
});