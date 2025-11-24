const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ------------------ MENU / PERSONAGENS ------------------
let playerImgSrc = "img/cr7-front.png";      // padrão
let obstacleImgSrc = "img/messi-back.png";   // padrão
let playerName = "cr7";                      // para sons

// Sons de pulo e colisão
let jumpSound = new Audio("audio/jump-cr7.mp3");
let hitSound = new Audio("audio/hit-cr7.mp3");

function chooseCharacter(choice) {
    if (choice === "cr7") {
        playerImgSrc = "img/cr7-front.png";      // player
        obstacleImgSrc = "img/messi-front.png";   // obstáculo
        playerName = "cr7";
        jumpSound.src = "audio/jump-cr7.mp3";
        hitSound.src = "audio/hit-cr7.mp3";
    } else if (choice === "messi") {
        playerImgSrc = "img/messi-back.png";    // player
        obstacleImgSrc = "img/cr7-back.png";     // obstáculo
        playerName = "messi";
        jumpSound.src = "audio/jump-messi.mp3";
        hitSound.src = "audio/hit-messi.mp3";
    }

    playerImg.src = playerImgSrc;
    obstacleImg.src = obstacleImgSrc;

    // Esconder menu
    document.getElementById("menu").style.display = "none";

    // Iniciar jogo
    loop();
    spawnObstacle(); // inicia spawn adaptativo
}

// ------------------ IMAGENS ------------------
const playerImg = new Image();
playerImg.src = playerImgSrc;

const obstacleImg = new Image();
obstacleImg.src = obstacleImgSrc;

// ------------------ PLAYER ------------------
const player = {
    x: 50,
    y: 200,
    width: 200,
    height: 300,
    dy: 0,
    gravity: 0.4,
    jump: -15,
    grounded: false
};

// ------------------ GAME STATE ------------------
let obstacles = [];
let score = 0;
let gameOver = false;

// ------------------ OBSTÁCULOS COM DIFICULDADE PROGRESSIVA ------------------
function spawnObstacle() {
    if (!gameOver && document.getElementById("menu").style.display === "none") {
        // Aumenta velocidade a cada 2 pontos
        const speedIncrease = 0.5 * Math.floor(score / 3);

        obstacles.push({
            x: canvas.width,
            y: canvas.height - 10 - 100,
            width: 100,
            height: 100,
            speed: 5 + speedIncrease
        });

        // Intervalo diminui conforme a pontuação, mínimo 700ms
        let interval = Math.max(700, 1700 - score * 20);
        setTimeout(spawnObstacle, interval);
    }
}

// ------------------ CONTROLE DE PULO ------------------
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && player.grounded && document.getElementById("menu").style.display === "none") {
        player.dy = player.jump;
        player.grounded = false;

        // tocar som de pulo
        jumpSound.currentTime = 0;
        jumpSound.play();
    }
});

// ------------------ COLISÃO ------------------
function collides(p, o) {
    const margin = 20;
    return (
        p.x + margin < o.x + o.width - margin &&
        p.x + p.width - margin > o.x + margin &&
        p.y + margin < o.y + o.height - margin &&
        p.y + p.height - margin > o.y + margin
    );
}

// ------------------ UPDATE ------------------
function update() {
    if (gameOver) return;

    // física do player
    player.dy += player.gravity;
    player.y += player.dy;

    // chão
    if (player.y + player.height >= canvas.height - 10) {
        player.y = canvas.height - 10 - player.height;
        player.dy = 0;
        player.grounded = true;
    }

    // obstáculos
    obstacles.forEach((obs, i) => {
        obs.x -= obs.speed;

        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            score++;
            document.getElementById("score").innerText = "Score: " + score;
        }

        // colisão
        if (collides(player, obs)) {
            hitSound.currentTime = 0;
            hitSound.play();

            gameOver = true;

            setTimeout(() => {
                alert("Game Over! Pontuação: " + score);
                document.location.reload();
            }, 300);
        }
    });
}

// ------------------ DRAW ------------------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // desenhar player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // desenhar obstáculos
    obstacles.forEach(obs => {
        ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);
    });
}

// ------------------ GAME LOOP ------------------
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// ** NÃO inicia automaticamente; só quando o jogador escolher **
