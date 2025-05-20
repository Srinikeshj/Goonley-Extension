const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

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

    if (this.colorMode === "white") {
      this.color = "white";
    } else if (this.colorMode === "mixed" || this.colorMode === "rainbow") {
      this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    } else {
      this.color = this.colorMode;
    }
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
  ctx.fillStyle = 'rgba(17, 17, 17, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
