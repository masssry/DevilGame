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

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const jumpBtn = document.getElementById("jumpBtn");
const dashBtn = document.getElementById("dashBtn");

const jumpSound = new Audio("sounds/jump.mp3");
const hitSound = new Audio("sounds/hit.mp3");
const music = new Audio("sounds/music.mp3");
const dashSound = new Audio("sounds/dash.mp3");

music.loop = true;

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
  w:50,
  h:70,
  dx:0,
  dy:0,
  speed:6,
  jump:-15,
  grounded:false
};

const level = {
  platforms:[
    {x:0,y:650,w:500,h:50},
    {x:700,y:550,w:250,h:50},
    {x:1100,y:450,w:250,h:50}
  ],

  spikes:[
    {x:550,y:620,w:100,h:30},
    {x:980,y:620,w:100,h:30}
  ],

  enemies:[
    {x:800,y:610,w:50,h:50,dir:1}
  ],

  goal:{x:1400,y:360,w:60,h:90}
};

function startGame(){

  menu.style.display = "none";
  hud.style.display = "block";

  music.play();

  animate();
}

startBtn.onclick = startGame;

function drawPlayer(){

  ctx.save();

  ctx.translate(player.x,player.y);

  ctx.fillStyle = "#00e5ff";

  // الرأس
  ctx.beginPath();
  ctx.arc(25,15,15,0,Math.PI*2);
  ctx.fill();

  // الجسم
  ctx.fillRect(18,30,15,25);

  // الرجل
  ctx.strokeStyle = "cyan";
  ctx.lineWidth = 5;

  ctx.beginPath();

  ctx.moveTo(22,55);
  ctx.lineTo(15,70);

  ctx.moveTo(28,55);
  ctx.lineTo(35,70);

  // اليد
  ctx.moveTo(10,40);
  ctx.lineTo(40,40);

  ctx.stroke();

  ctx.restore();
}

function updatePlayer(){

  player.dx = 0;

  if(keys.left) player.dx = -player.speed;
  if(keys.right) player.dx = player.speed;

  player.x += player.dx;

  player.dy += gravity;
  player.y += player.dy;

  player.grounded = false;

  level.platforms.forEach(p=>{

    drawPlatform(p);

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

  level.spikes.forEach(s=>{

    drawSpikes(s);

    if(
      player.x < s.x + s.w &&
      player.x + player.w > s.x &&
      player.y < s.y + s.h &&
      player.y + player.h > s.y
    ){
      damage();
    }
  });

  level.enemies.forEach(e=>{

    drawEnemy(e);

    e.x += 3 * e.dir;

    if(e.x > 1200 || e.x < 700){
      e.dir *= -1;
    }

    if(
      player.x < e.x + e.w &&
      player.x + player.w > e.x &&
      player.y < e.y + e.h &&
      player.y + player.h > e.y
    ){
      damage();
    }
  });

  drawGoal(level.goal);

  if(
    player.x < level.goal.x + level.goal.w &&
    player.x + player.w > level.goal.x &&
    player.y < level.goal.y + level.goal.h &&
    player.y + player.h > level.goal.y
  ){

    winScreen.style.display = "flex";
  }
}

function drawPlatform(p){

  ctx.fillStyle = "#222";
  ctx.fillRect(p.x,p.y,p.w,p.h);

  ctx.fillStyle = "#444";

  for(let i=0;i<p.w;i+=40){

    ctx.fillRect(p.x+i,p.y,20,10);
  }
}

function drawSpikes(s){

  ctx.fillStyle = "red";

  for(let i=0;i<5;i++){

    ctx.beginPath();

    ctx.moveTo(s.x + i*20, s.y+s.h);
    ctx.lineTo(s.x+10+i*20,s.y);
    ctx.lineTo(s.x+20+i*20,s.y+s.h);

    ctx.fill();
  }
}

function drawEnemy(e){

  ctx.fillStyle = "purple";

  ctx.beginPath();

  ctx.arc(e.x+25,e.y+25,25,0,Math.PI*2);

  ctx.fill();

  ctx.fillStyle = "white";

  ctx.beginPath();
  ctx.arc(e.x+18,e.y+20,5,0,Math.PI*2);

  ctx.arc(e.x+32,e.y+20,5,0,Math.PI*2);

  ctx.fill();
}

function drawGoal(g){

  ctx.fillStyle = "lime";
  ctx.fillRect(g.x,g.y,g.w,g.h);

  ctx.fillStyle = "black";
  ctx.fillRect(g.x+20,g.y,10,g.h);
}

function damage(){

  hitSound.currentTime = 0;
  hitSound.play();

  hp--;

  hpText.innerText = hp;

  canvas.style.filter = "brightness(2)";

  setTimeout(()=>{
    canvas.style.filter = "none";
  },100);

  if(hp <= 0){

    deaths++;

    deathsText.innerText = deaths;

    hp = 3;

    hpText.innerText = hp;

    player.x = 100;
    player.y = 100;
  }
}

function animate(){

  requestAnimationFrame(animate);

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // الخلفية
  for(let i=0;i<120;i++){

    ctx.fillStyle = "rgba(255,0,0,0.08)";

    ctx.fillRect(
      Math.random()*canvas.width,
      Math.random()*canvas.height,
      2,
      2
    );
  }

  updatePlayer();

  drawPlayer();
}

addEventListener("keydown",e=>{

  if(e.key==="a") keys.left=true;
  if(e.key==="d") keys.right=true;

  if((e.key==="w" || e.key===" ") && jumps < 2){

    player.dy = player.jump;

    jumps++;

    jumpSound.currentTime = 0;
    jumpSound.play();
  }

  if(e.key==="Shift"){

    player.x += 120;

    dashSound.currentTime = 0;
    dashSound.play();
  }
});

addEventListener("keyup",e=>{

  if(e.key==="a") keys.left=false;
  if(e.key==="d") keys.right=false;
});

leftBtn.addEventListener("touchstart",()=>{
  keys.left=true;
});

leftBtn.addEventListener("touchend",()=>{
  keys.left=false;
});

rightBtn.addEventListener("touchstart",()=>{
  keys.right=true;
});

rightBtn.addEventListener("touchend",()=>{
  keys.right=false;
});

jumpBtn.addEventListener("touchstart",()=>{

  if(jumps < 2){

    player.dy = player.jump;

    jumps++;

    jumpSound.currentTime = 0;
    jumpSound.play();
  }
});

dashBtn.addEventListener("touchstart",()=>{

  player.x += 120;

  dashSound.currentTime = 0;
  dashSound.play();
});
