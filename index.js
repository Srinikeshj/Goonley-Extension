document.addEventListener("DOMContentLoaded", () => {

  // Make colorMap globally accessible
  // Color for theme
  window.colorMap = {
    white: "#656565",
    mixed: "#23c483",
    red: "#e74c3c",
    blue: "#3498db",
    green: "#2ecc71",
    yellow: "#f1c40f",
    purple: "#9b59b6",
    orange: "#e67e22",
    pink: "#fd79a8"
  };

  const settingsBtn = document.getElementById("settingsBtn");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      window.location.href = "settings.html";
    });
  }
  
  // Set the button color to match the particle color
  chrome.storage.sync.get(["color"], (data) => {
    const color = window.colorMap[data.color] || "rgb(20, 20, 20)";
    document.documentElement.style.setProperty('--particle-color', color);
  });
});