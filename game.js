const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const startBtn = document.getElementById("startBtn");
const menu = document.getElementById("menu");
const hud = document.getElementById("hud");
const levelText = document.getElementById("level");
const deathsText = document.getElementById("deaths");
const hpText = document.getElementById("hp");
const winScreen = document.getElementById("winScreen");

let gravity = 0.8;
let deaths = 0;
let currentLevel = 0;
let hp = 3;
let jumps = 0;

const keys = {
  left:false,
  right:false
};

const player = {
  x:100,
  y:100,
  w:40,
  h:40,
  color:"cyan",
  dx:0,
  dy:0,
  speed:6,
  jump:-15,
  grounded:false
};

let checkpointX = 100;
let checkpointY = 100;

const levels = [
  {
    platforms:[
      {x:0,y:650,w:500,h:50},
      {x:650,y:550,w:250,h:50},
      {x:1000,y:450,w:250,h:50},
      {x:1400,y:350,w:250,h:50}
    ],

    spikes:[
      {x:520,y:620,w:100,h:30},
      {x:900,y:620,w:100,h:30}
    ],

    goal:{x:1500,y:280,w:50,h:70}
  },

  {
    platforms:[
      {x:0,y:650,w:300,h:50},
      {x:450,y:560,w:200,h:50},
      {x:750,y:470,w:200,h:50},
      {x:1100,y:380,w:200,h:50}
    ],

    spikes:[
      {x:320,y:620,w:100,h:30},
      {x:680,y:620,w:100,h:30},
      {x:1000,y:620,w:100,h:30}
    ],

    goal:{x:1300,y:300,w:50,h:70}
  }
];

const enemies = [
  {
    x:800,
    y:610,
    w:40,
    h:40,
    dir:1
  }
];

const movingTraps = [
  {
    x:1000,
    y:500,
    w:100,
    h:20,
    dir:1
  }
];

const checkpoints = [
  {
    x:900,
    y:570,
    active:false
  }
];

function startGame(){
  menu.style.display = "none";
  hud.style.display = "block";
  loadLevel(0);
  animate();
}

startBtn.onclick = startGame;

function loadLevel(index){

  currentLevel = index;

  player.x = 100;
  player.y = 100;
  player.dy = 0;

  checkpointX = 100;
  checkpointY = 100;

  levelText.innerText = index + 1;
}

function drawPlayer(){

  ctx.shadowBlur = 20;
  ctx.shadowColor = "cyan";

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x,player.y,player.w,player.h);

  ctx.shadowBlur = 0;
}

function updatePlayer(){

  player.dx = 0;

  if(keys.left) player.dx = -player.speed;
  if(keys.right) player.dx = player.speed;

  player.x += player.dx;

  player.dy += gravity;
  player.y += player.dy;

  player.grounded = false;

  const lvl = levels[currentLevel];

  lvl.platforms.forEach(p=>{

    ctx.fillStyle = "#333";
    ctx.fillRect(p.x,p.y,p.w,p.h);

    if(
      player.x < p.x + p.w &&
      player.x + player.w > p.x &&
      player.y < p.y + p.h &&
      player.y + player.h > p.y
    ){

      if(player.dy > 0){
        player.y = p.y - player.h;
        player.dy = 0;
        player.grounded = true;
        jumps = 0;
      }
    }
  });

  lvl.spikes.forEach(s=>{

    ctx.fillStyle = "red";

    for(let i=0;i<5;i++){

      ctx.beginPath();

      ctx.moveTo(s.x + i*20, s.y + s.h);
      ctx.lineTo(s.x + 10 + i*20, s.y);
      ctx.lineTo(s.x + 20 + i*20, s.y + s.h);

      ctx.fill();
    }

    if(
      player.x < s.x + s.w &&
      player.x + player.w > s.x &&
      player.y < s.y + s.h &&
      player.y + player.h > s.y
    ){
      damage();
    }
  });

  const g = lvl.goal;

  ctx.fillStyle = "lime";
  ctx.fillRect(g.x,g.y,g.w,g.h);

  if(
    player.x < g.x + g.w &&
    player.x + player.w > g.x &&
    player.y < g.y + g.h &&
    player.y + player.h > g.y
  ){
    nextLevel();
  }

  if(player.y > canvas.height){
    die();
  }
}

function drawEnemies(){

  enemies.forEach(e=>{

    e.x += 3 * e.dir;

    if(e.x > 1200 || e.x < 700){
      e.dir *= -1;
    }

    ctx.fillStyle = "purple";
    ctx.fillRect(e.x,e.y,e.w,e.h);

    if(
      player.x < e.x + e.w &&
      player.x + player.w > e.x &&
      player.y < e.y + e.h &&
      player.y + player.h > e.y
    ){
      damage();
    }
  });
}

function drawMovingTraps(){

  movingTraps.forEach(t=>{

    t.x += 5 * t.dir;

    if(t.x > 1300 || t.x < 800){
      t.dir *= -1;
    }

    ctx.fillStyle = "orange";
    ctx.fillRect(t.x,t.y,t.w,t.h);

    if(
      player.x < t.x + t.w &&
      player.x + player.w > t.x &&
      player.y < t.y + t.h &&
      player.y + player.h > t.y
    ){
      damage();
    }
  });
}

function drawCheckpoints(){

  checkpoints.forEach(c=>{

    ctx.fillStyle = c.active ? "lime" : "gray";

    ctx.fillRect(c.x,c.y,30,80);

    if(
      player.x < c.x + 30 &&
      player.x + player.w > c.x &&
      player.y < c.y + 80 &&
      player.y + player.h > c.y
    ){

      c.active = true;

      checkpointX = c.x;
      checkpointY = c.y;
    }
  });
}

function damage(){

  hp--;

  hpText.innerText = hp;

  canvas.style.filter = "brightness(2)";

  setTimeout(()=>{
    canvas.style.filter = "none";
  },100);

  if(hp <= 0){
    hp = 3;
    hpText.innerText = hp;
    die();
  }
}

function die(){

  deaths++;

  deathsText.innerText = deaths;

  player.x = checkpointX;
  player.y = checkpointY;

  player.dy = 0;
}

function bossFight(){

  ctx.fillStyle = "darkred";

  ctx.fillRect(1400,200,200,200);

  ctx.fillStyle = "red";

  for(let i=0;i<5;i++){

    ctx.beginPath();

    ctx.arc(
      1400 + Math.random()*200,
      400 + Math.random()*200,
      20,
      0,
      Math.PI*2
    );

    ctx.fill();
  }
}

function nextLevel(){

  currentLevel++;

  if(currentLevel >= levels.length){

    winScreen.style.display = "flex";

    return;
  }

  loadLevel(currentLevel);
}

function animate(){

  requestAnimationFrame(animate);

  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "rgba(255,0,0,0.03)";

  for(let i=0;i<100;i++){

    ctx.fillRect(
      Math.random()*canvas.width,
      Math.random()*canvas.height,
      2,
      2
    );
  }

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  updatePlayer();

  drawEnemies();

  drawMovingTraps();

  drawCheckpoints();

  drawPlayer();

  if(currentLevel === 1){
    bossFight();
  }
}

addEventListener("keydown", e=>{

  if(e.key === "a") keys.left = true;
  if(e.key === "d") keys.right = true;

  if((e.key === "w" || e.key === " ") && jumps < 2){

    player.dy = player.jump;

    jumps++;
  }

  if(e.key === "Shift"){
    player.x += 120;
  }
});

addEventListener("keyup", e=>{

  if(e.key === "a") keys.left = false;
  if(e.key === "d") keys.right = false;
});