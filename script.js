/* ==========================================================
   REGALO VIRTUAL: FLORES AMARILLAS 💌🌼
   Lógica interactiva, audio sincronizado y lluvia de pétalos
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const scene = document.getElementById('scene');
  const envelopeClosedWrap = document.getElementById('envelope-closed-wrap');
  const replayBtn = document.getElementById('replay-btn');
  const musicBtn = document.getElementById('music-btn');
  const audio = document.getElementById('romantic-audio');
  const canvas = document.getElementById('petals-canvas');
  const ctx = canvas.getContext('2d');

  let isOpened = false;
  let animationFrameId;

  // --------------------------------------------------------
  // 1. Configuración del Lienzo (Canvas de Pétalos)
  // --------------------------------------------------------
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Paleta de pétalos y flores amarillas
  const petalColors = [
    '#f6c90e',
    '#f9d342',
    '#ffe156',
    '#ffd152',
    '#fbc531',
    '#fff07c',
    '#fad02c'
  ];

  class Petal {
    constructor(isBurst = false, burstX = width / 2, burstY = height / 2) {
      this.reset(isBurst, burstX, burstY);
    }

    reset(isBurst = false, burstX = 0, burstY = 0) {
      this.size = Math.random() * 9 + 7; // Tamaño del pétalo
      this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
      this.opacity = Math.random() * 0.4 + 0.6;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.03;
      this.flip = Math.random() * Math.PI;
      this.flipSpeed = Math.random() * 0.03 + 0.01;

      if (isBurst) {
        this.x = burstX;
        this.y = burstY;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 2;
        this.gravity = 0.08;
        this.friction = 0.97;
        this.isBurst = true;
      } else {
        this.x = Math.random() * width;
        this.y = Math.random() * -height;
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = Math.random() * 1.4 + 1.1; // Caída suave
        this.gravity = 0;
        this.friction = 1;
        this.isBurst = false;
      }

      this.oscillationSpeed = Math.random() * 0.02 + 0.01;
      this.oscillationAmp = Math.random() * 1.5 + 0.5;
      this.oscillation = Math.random() * Math.PI * 2;
    }

    update() {
      if (this.isBurst) {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Si se desacelera lo suficiente, se convierte en un pétalo de caída normal
        if (Math.abs(this.vx) < 0.6 && this.vy > 0.5) {
          this.isBurst = false;
          this.vy = Math.random() * 1.4 + 1.1;
          this.vx = (Math.random() - 0.5) * 1.2;
        }
      } else {
        this.oscillation += this.oscillationSpeed;
        this.x += this.vx + Math.sin(this.oscillation) * this.oscillationAmp;
        this.y += this.vy;

        // Si sale de la pantalla, reiniciar arriba
        if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
          this.reset(false);
          this.y = -20;
        }
      }

      this.rotation += this.rotationSpeed;
      this.flip += this.flipSpeed;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(Math.cos(this.flip), 1);

      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;

      // Dibujar forma orgánica de pétalo de flor
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(
        this.size * 0.75,
        -this.size * 0.5,
        this.size * 0.75,
        this.size * 0.5,
        0,
        this.size
      );
      ctx.bezierCurveTo(
        -this.size * 0.75,
        this.size * 0.5,
        -this.size * 0.75,
        -this.size * 0.5,
        0,
        -this.size
      );
      ctx.fill();

      // Centro suave con sutil degradado
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }

  // Cantidad de pétalos según tamaño de pantalla
  const petalCount = window.innerWidth < 600 ? 25 : 45;
  const petals = [];
  for (let i = 0; i < petalCount; i++) {
    petals.push(new Petal());
  }

  // Bucle de animación de los pétalos
  function animatePetals() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < petals.length; i++) {
      petals[i].update();
      petals[i].draw();
    }
    animationFrameId = requestAnimationFrame(animatePetals);
  }
  animatePetals();

  // Ráfaga mágica de pétalos al abrir el sobre
  function triggerPetalBurst() {
    const rect = envelopeClosedWrap.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const burstAmount = window.innerWidth < 600 ? 25 : 40;
    for (let i = 0; i < burstAmount; i++) {
      petals.push(new Petal(true, centerX, centerY));
    }
  }

  // --------------------------------------------------------
  // --------------------------------------------------------
  // 2. Control de Apertura y Audio (Segundo 40 con Crescendo a 46)
  // --------------------------------------------------------
  let volumeFadeFrameId = null;

  function startMusicWithCrescendo() {
    if (volumeFadeFrameId) {
      cancelAnimationFrame(volumeFadeFrameId);
      volumeFadeFrameId = null;
    }

    audio.currentTime = 40.0;
    audio.volume = 0.15; // Inicia con volumen suave en el segundo 40

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          musicBtn.classList.add('playing');
        })
        .catch((error) => {
          console.warn('El navegador requirió interacción adicional:', error);
        });
    }

    const startVol = 0.15;
    const targetVol = 1.0;
    const startSec = 40.0;
    const targetSec = 46.0;

    function rampVolume() {
      if (!audio.paused && audio.currentTime < targetSec) {
        const progress = Math.max(0, Math.min(1, (audio.currentTime - startSec) / (targetSec - startSec)));
        // Curva suave progresiva hasta el momento cumbre
        audio.volume = startVol + (targetVol - startVol) * Math.pow(progress, 1.15);
        volumeFadeFrameId = requestAnimationFrame(rampVolume);
      } else if (audio.currentTime >= targetSec) {
        audio.volume = targetVol;
        volumeFadeFrameId = null;
      }
    }

    volumeFadeFrameId = requestAnimationFrame(rampVolume);
  }

  function openEnvelope() {
    if (isOpened) return;
    isOpened = true;

    // Fase 1: Iniciar apertura visual y ráfaga de pétalos
    scene.classList.add('opening');
    triggerPetalBurst();

    // Fase 2: Transición hacia sobre abierto, carta emergiendo y música en segundo 40
    setTimeout(() => {
      startMusicWithCrescendo();
      // Desplegar la carta y pasar al estado 'opened'
      scene.classList.add('opened');
    }, 420);
  }

  // Eventos para abrir el sobre
  envelopeClosedWrap.addEventListener('click', openEnvelope);
  envelopeClosedWrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEnvelope();
    }
  });

  // --------------------------------------------------------
  // 3. Botón de Replay (Volver a ver)
  // --------------------------------------------------------
  replayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpened = false;

    // Remover clases de animación
    scene.classList.remove('opened');
    scene.classList.remove('opening');

    // Pausar música temporalmente para reiniciar la experiencia completa al abrir de nuevo
    audio.pause();
    musicBtn.classList.remove('playing');

    // Reiniciar ráfaga de pétalos suave
    triggerPetalBurst();
  });

  // --------------------------------------------------------
  // 4. Control del Botón de Música Flotante
  // --------------------------------------------------------
  musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audio.paused) {
      if (audio.currentTime < 40) {
        startMusicWithCrescendo();
      } else {
        audio.play().then(() => {
          musicBtn.classList.add('playing');
        });
      }
    } else {
      audio.pause();
      musicBtn.classList.remove('playing');
    }
  });

  audio.addEventListener('play', () => {
    musicBtn.classList.add('playing');
  });

  audio.addEventListener('pause', () => {
    musicBtn.classList.remove('playing');
  });
});
