const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

function bringWindowToFront() {
  if (chrome && chrome.windows) {
    chrome.windows.getCurrent((window) => {
      if (window) {
        chrome.windows.update(window.id, { focused: true });
      }
    });
  }
}

let particles = [];
const minMomentum = 1.0;
const influenceRadius = 150;

let mouse = {
  x: 0,
  y: 0,
  leftDown: false,
  rightDown: false
};

class Particle {
  constructor(colorMode) {
    this.colorMode = colorMode;
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.setRandomVelocity();
    this.radius = 3;

    // Color variant logic
    let baseColor = this.colorMode;
    let h = 0, s = 0, l = 0;

    // Map named colors to HSL for easy light/dark variants
    // Color for particles
    const colorMap = {
      white: [0, 0, 80],
      red: [0, 80, 55],
      blue: [210, 80, 55],
      green: [140, 70, 50],
      yellow: [50, 90, 60],
      purple: [270, 60, 60],
      orange: [30, 90, 60],
      pink: [330, 70, 70],
      mixed: [160, 60, 60]
    };

    if (baseColor in colorMap) {
      [h, s, l] = colorMap[baseColor];
    } else {
      // fallback to white
      h = 0; s = 0; l = 100;
    }

    // For "mixed", randomize hue as before
    if (baseColor === "mixed") {
      h = Math.floor(Math.random() * 360);
    }

    // Randomly vary lightness for each particle
    const lightnessVariance = (Math.random() - 0.5) * 30; // -15 to +15
    const particleLightness = Math.max(10, Math.min(90, l + lightnessVariance));
    this.color = `hsl(${h}, ${s}%, ${particleLightness}%)`;
  }

  setRandomVelocity() {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + minMomentum;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  update() {
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < influenceRadius) {
      const force = (influenceRadius - dist) / influenceRadius;

      if (mouse.leftDown) {
        this.vx += (dx / dist) * force * 0.5;
        this.vy += (dy / dist) * force * 0.5;
      }

      if (mouse.rightDown) {
        this.vx -= (dx / dist) * force * 0.5;
        this.vy -= (dy / dist) * force * 0.5;
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

    this.vx *= 0.98;
    this.vy *= 0.98;

    const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
    if (speed < minMomentum) {
      const angle = Math.atan2(this.vy, this.vx);
      this.vx = Math.cos(angle) * minMomentum;
      this.vy = Math.sin(angle) * minMomentum;
    }
  }

  draw() {
    const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = speed * 1.5;
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

let colorMode = "white";
let totalParticles = 200;

chrome.storage.sync.get(["immersive", "color", "count"], (settings) => {
  colorMode = settings.color || "white";
  totalParticles = settings.count || 200;

  for (let i = 0; i < totalParticles; i++) {
    particles.push(new Particle(colorMode));
  }

  animate();
});

function animate() {
  // Create a more subtle gradient that works better for trails
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(17, 17, 17, 0.2)');
  gradient.addColorStop(1, 'rgba(17, 17, 17, 0.05)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  bringWindowToFront();

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animate);
}

window.addEventListener('mousedown', (e) => {
  if (e.button === 0) mouse.leftDown = true;
  if (e.button === 2) mouse.rightDown = true;
});

window.addEventListener('mouseup', (e) => {
  if (e.button === 0) mouse.leftDown = false;
  if (e.button === 2) mouse.rightDown = false;
});

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('resize', resizeCanvas);
window.addEventListener('contextmenu', (e) => e.preventDefault());
