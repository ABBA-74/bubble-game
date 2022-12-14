const earthImg = document.getElementById('earth');
const scoreValueEl = document.getElementById('score-value');
const modalResult = document.getElementById('modal-result');
const resultValueEl = document.getElementById('result-value');
const resultLabelEl = document.getElementById('result-label');
const buttonRestart = document.getElementById('button-restart');
const scoreContentEl = document.querySelector('.score-content');
const canvas = document.querySelector('canvas');
let idIntervalEnemies = '';
let score = 0;
let idAnimation;
let x = 0; // position player
let y = 0; // position player

let projectiles = [];
let enemies = [];
let particles = [];
const ctx = canvas.getContext('2d');

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.image = earthImg;
  }

  draw() {
    // ctx.beginPath();
    // ctx.shadowColor = 'red';
    // ctx.shadowBlur = 3;
    // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    // ctx.fillStyle = this.color;
    // ctx.fill();

    ctx.drawImage(
      this.image,
      this.x - this.radius,
      this.y - this.radius,
      this.radius * 2,
      this.radius * 2
    );
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    const innerRadius = 5;
    const outerRadius = this.radius * 1.81;

    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      innerRadius,
      this.x,
      this.y,
      outerRadius
    );
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, '#ffffffa1');

    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);

    ctx.fillStyle = gradient;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}
const friction = 0.99;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.005;
  }
}

// set size canvas
const setSizeCanvas = () => {
  if (innerWidth < 550) {
    canvas.width = 0.9 * innerWidth;
    canvas.height = 0.8 * innerHeight;
  } else {
    canvas.width = 0.8 * innerWidth;
    canvas.height = 0.8 * innerHeight;
  }
  x = canvas.width / 2;
  y = canvas.height / 2;
};

const resetDisplayModal = () => {
  scoreContentEl.style.display = 'none';
  resultLabelEl.style.display = 'none';
  resultValueEl.innerHTML = 'Are you <br />In The Game ?';
};

const init = () => {
  scoreValueEl.innerText = '0';
  score = 0;
  player = new Player(x, y, 30, '#911072');
  projectiles = [];
  enemies = [];
  particles = [];
  clearInterval(idIntervalEnemies);
  animate();
  displayEnemies();
  modalResult.style.display = 'none';
};

const displayEnemies = () => {
  const colors = ['#f4d35e', '#ee964b', '#ff5964'];
  idIntervalEnemies = setInterval(() => {
    const radius = Math.random() * 35 + 5;
    let x;
    let y;
    if (Math.random() > 0.5) {
      x = Math.random() > 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() > 0.5 ? 0 - radius : canvas.height + radius;
    }
    // const y = Math.random() * canvas.height;
    const color = colors[Math.floor(Math.random() * 3)];

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1200);
};

////////////////////////////////////
// Animate
////////////////////////////////////

const animate = () => {
  scoreContentEl.style.display = 'block';
  resultLabelEl.style.display = 'block';
  idAnimation = requestAnimationFrame(animate);
  ctx.fillStyle = 'rgba(0,0,0,.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // remove particles if opacity 0 or update
  particles.forEach((particle, indexParticle) =>
    particle.alpha < 0 ? particles.slice(indexParticle, 1) : particle.update()
  );

  projectiles.forEach((projectile, indexProjectile) => {
    projectile.update();

    // remove projectile if it's outside canvas
    if (
      projectile.x > canvas.width + projectile.radius ||
      projectile.x + projectile.radius < 0 ||
      projectile.y + projectile.radius < 0 ||
      projectile.y > canvas.heigh + projectile.radius
    ) {
      setTimeout(() => {
        projectiles.splice(indexProjectile, 1);
      }, 0);
    }
  });

  player.draw();

  enemies.forEach((enemy, indexEnemy) => {
    enemy.update();

    // behavior player <> enemy
    const distPlayerEnemy = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    // player touch by enemy >> game over
    if (distPlayerEnemy - player.radius - enemy.radius < 1) {
      cancelAnimationFrame(idAnimation);
      resultValueEl.innerText = score;
      modalResult.style.display = 'block';
    }

    // behavior projectile <> enemy
    projectiles.forEach((projectile, indexProjectile) => {
      const distProjetctileEnemy = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );

      // enemy touched by projectile
      if (distProjetctileEnemy - enemy.radius - projectile.radius < 1) {
        for (let i = 0; i < Math.floor(enemy.radius * 2); i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 3,
              enemy.color,
              {
                x: (Math.random() - 0.5) * 3.3,
                y: (Math.random() - 0.5) * 3.3,
              }
            )
          );
        }
        if (enemy.radius - 10 > 10) {
          // handle score

          score += 150;
          scoreValueEl.innerText = score;

          // decrease radius whit smooth effect gsap
          gsap.to(enemy, { radius: enemy.radius - 10 });

          // Remove projectile
          setTimeout(() => {
            projectiles.splice(indexProjectile, 1);
          }, 0);
        } else {
          // handle score - extra bonus
          score += 300;
          scoreValueEl.innerText = score;

          // Remove enemy + projectile
          setTimeout(() => {
            enemies.splice(indexEnemy, 1);
            projectiles.splice(indexProjectile, 1);
          }, 0);
        }
      }
    });
  });
};

setSizeCanvas();
resetDisplayModal();
// const player = new Player(x, y, 30, '#0cdcfc');
let player = new Player(x, y, 30, '#911072');

////////////////////////////////////
// Event listener
////////////////////////////////////

addEventListener('click', ({ clientX, clientY }) => {
  let xCursor;
  // define xCursor according to the innerWidth
  const yCursor = clientY - 0.1 * innerHeight;
  if (innerWidth < 550) {
    xCursor = clientX - 0.05 * innerWidth;
  } else {
    xCursor = clientX - 0.1 * innerWidth;
  }

  const angle = Math.atan2(
    yCursor - canvas.height / 2,
    xCursor - canvas.width / 2
  );
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, '#0CDCFC', velocity)
  );
});

buttonRestart.addEventListener('click', () => init());

addEventListener('resize', () => {
  cancelAnimationFrame(idAnimation);
  resetDisplayModal();
  modalResult.style.display = 'block';
  setSizeCanvas();
});
