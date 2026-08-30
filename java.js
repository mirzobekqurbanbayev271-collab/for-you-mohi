window.addEventListener('load', () => {
  const canvas = document.getElementById('flowerCanvas');
  const ctx = canvas.getContext('2d');

  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Osmondagi Oy (Moon)
  function drawMoon() {
    const moonX = width * 0.82;
    const moonY = height * 0.15;
    const moonRadius = width < 600 ? 32 : 45;

    ctx.save();
    const glow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 3);
    glow.addColorStop(0, 'rgba(255, 248, 220, 0.5)');
    glow.addColorStop(1, 'rgba(255, 248, 220, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#fffef0';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(moonX - 10, moonY - 4, moonRadius - 2, 0, Math.PI * 2);
    ctx.fillStyle = '#080a0f';
    ctx.fill();

    ctx.restore();
  }

  // Nur zarrachalari
  const particles = Array.from({ length: 50 }, () => ({
    x: random(0, window.innerWidth),
    y: random(0, window.innerHeight),
    radius: random(1, 2.5),
    alpha: random(0.3, 0.9),
    speedY: random(-0.3, -0.6),
    speedX: random(-0.2, 0.2)
  }));

  // Sehrli kapalaklar
  class Butterfly {
    constructor() {
      this.x = random(0, width);
      this.y = random(height * 0.2, height * 0.6);
      this.size = random(7, 12);
      this.speedX = random(-0.8, 0.8);
      this.speedY = random(-0.4, 0.4);
      this.wingAngle = 0;
      this.wingSpeed = random(0.15, 0.3);
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.wingAngle += this.wingSpeed;

      if (this.x < 0 || this.x > width) this.speedX *= -1;
      if (this.y < height * 0.1 || this.y > height * 0.7) this.speedY *= -1;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.fillStyle = '#ffb703';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ffb703';

      const wingWidth = Math.sin(this.wingAngle) * this.size;

      ctx.beginPath();
      ctx.ellipse(-wingWidth / 2, 0, Math.abs(wingWidth), this.size * 0.8, Math.PI / 4, 0, Math.PI * 2);
      ctx.ellipse(wingWidth / 2, 0, Math.abs(wingWidth), this.size * 0.8, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // Baland o'sadigan gul klassi
  class RealisticFlower {
    constructor(x) {
      this.x = x;
      // Gullar ekranning 75% - 92% qismigacha tikka baland o'sadi
      this.targetHeight = random(height * 0.74, height * 0.92);
      this.currentHeight = 0;
      this.growSpeed = random(3.5, 5.5);
      this.size = width < 600 ? random(24, 34) : random(32, 46);
      this.swayAngle = random(0, Math.PI * 2);
      this.swaySpeed = random(0.015, 0.03);
      this.curve = random(-20, 20);

      const types = ['blue_rose', 'pink_rose', 'sunflower', 'lily'];
      this.type = types[Math.floor(Math.random() * types.length)];
    }

    update() {
      if (this.currentHeight < this.targetHeight) {
        this.currentHeight += this.growSpeed;
      } else {
        this.swayAngle += this.swaySpeed;
      }
    }

    drawStem(flowerX, flowerY, sway) {
      const startY = height;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(this.x, startY);
      ctx.quadraticCurveTo(
        this.x + this.curve + sway * 0.5,
        startY - this.currentHeight / 2,
        flowerX,
        flowerY
      );
      
      const stemGrad = ctx.createLinearGradient(this.x, startY, flowerX, flowerY);
      stemGrad.addColorStop(0, '#0f2a1d');
      stemGrad.addColorStop(1, '#2d6a4f');
      
      ctx.strokeStyle = stemGrad;
      ctx.lineWidth = width < 600 ? 3 : 4;
      ctx.stroke();

      if (this.currentHeight > 50) {
        const leafY = startY - this.currentHeight * 0.4;
        ctx.fillStyle = '#40916c';
        
        ctx.beginPath();
        ctx.ellipse(this.x + sway * 0.3 + 12, leafY, 15, 5, Math.PI / 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(this.x + sway * 0.3 - 12, leafY - 15, 15, 5, -Math.PI / 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    drawPetal(ctx, radius, angle, color1, color2) {
      ctx.save();
      ctx.rotate(angle);
      
      const grad = ctx.createRadialGradient(0, 0, 2, 0, radius * 0.5, radius);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(radius * 0.5, -radius * 0.4, radius, -radius * 0.2, radius, 0);
      ctx.bezierCurveTo(radius, radius * 0.2, radius * 0.5, radius * 0.4, 0, 0);
      ctx.fill();
      
      ctx.restore();
    }

    drawFlowerHead(flowerX, flowerY) {
      const progress = this.currentHeight / this.targetHeight;
      const r = this.size * progress;

      ctx.save();
      ctx.translate(flowerX, flowerY);

      if (this.type === 'blue_rose' || this.type === 'pink_rose') {
        const c1 = this.type === 'blue_rose' ? '#90e0ef' : '#ffb703';
        const c2 = this.type === 'blue_rose' ? '#03045e' : '#c1121f';
        const cCenter = this.type === 'blue_rose' ? '#000814' : '#590d22';

        ctx.shadowBlur = 12;
        ctx.shadowColor = this.type === 'blue_rose' ? 'rgba(0, 180, 216, 0.7)' : 'rgba(240, 43, 100, 0.7)';

        for (let layer = 4; layer >= 1; layer--) {
          const count = layer * 3 + 2;
          const layerRadius = r * (layer / 4);
          for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + layer;
            this.drawPetal(ctx, layerRadius, angle, c1, c2);
          }
        }

        ctx.beginPath();
        ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = cCenter;
        ctx.fill();

      } else if (this.type === 'sunflower') {
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ffb703';
        const petals = 16;
        for (let i = 0; i < petals; i++) {
          const angle = (Math.PI * 2 / petals) * i;
          ctx.save();
          ctx.rotate(angle);
          
          const grad = ctx.createLinearGradient(0, 0, r, 0);
          grad.addColorStop(0, '#ffb703');
          grad.addColorStop(1, '#f77f00');
          ctx.fillStyle = grad;

          ctx.beginPath();
          ctx.ellipse(r * 0.65, 0, r * 0.48, r * 0.15, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#211510';
        ctx.fill();

      } else if (this.type === 'lily') {
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#e0aaff';
        const petals = 6;
        for (let i = 0; i < petals; i++) {
          const angle = (Math.PI * 2 / petals) * i;
          ctx.save();
          ctx.rotate(angle);
          
          const grad = ctx.createLinearGradient(0, 0, r, 0);
          grad.addColorStop(0, '#9d4edd');
          grad.addColorStop(0.7, '#e0aaff');
          grad.addColorStop(1, '#ffffff');
          ctx.fillStyle = grad;

          ctx.beginPath();
          ctx.ellipse(r * 0.6, 0, r * 0.55, r * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = '#ffb703';
        ctx.fill();
      }

      ctx.restore();
    }

    draw() {
      const sway = Math.sin(this.swayAngle) * 7;
      const flowerX = this.x + sway;
      const flowerY = height - this.currentHeight;

      this.drawStem(flowerX, flowerY, sway);

      if (this.currentHeight >= 20) {
        this.drawFlowerHead(flowerX, flowerY);
      }
    }
  }

  const flowerCount = Math.floor(window.innerWidth / (width < 600 ? 25 : 30));
  const flowers = Array.from({ length: flowerCount }, () => 
    new RealisticFlower(random(15, window.innerWidth - 15))
  );

  const butterflies = Array.from({ length: 4 }, () => new Butterfly());

  function animate() {
    ctx.clearRect(0, 0, width, height);

    drawMoon();

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      if (p.y < 0) p.y = height;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${p.alpha})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#ffd700';
      ctx.fill();
    });

    flowers.forEach(f => {
      f.update();
      f.draw();
    });

    butterflies.forEach(b => {
      b.update();
      b.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
});