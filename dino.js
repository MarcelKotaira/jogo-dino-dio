function criarElement(tipo, id, classe) {
	let ele = document.createElement(tipo);
	if (id) ele.id = id;
	if (classe) ele.className = classe;
	return ele;
}

function setPosicao(elemento, posicao) {
	if (posicao.x) elemento.style.left = posicao.x;
	if (posicao.y) elemento.style.top = posicao.y;
}

function colide(ele1, ele2) {
	if (ele1 == null || ele2 == null) return false;
	const posA1 = posicaoElemento(ele1);
	const posB1 = posicaoElemento(ele2);
	const pontoA1 = { x: posA1.x, y: posA1.y };
	const pontoA2 = { x: posA1.x + posA1.largura, y: posA1.y };
	const pontoA3 = { x: posA1.x, y: posA1.y + posA1.altura };
	const pontoA4 = { x: posA1.x + posA1.largura, y: posA1.y + posA1.altura };
	const pontoB1 = { x: posB1.x, y: posB1.y };
	const pontoB2 = { x: posB1.x + posB1.largura, y: posB1.y };
	const pontoB3 = { x: posB1.x, y: posB1.y + posB1.altura };
	const pontoB4 = { x: posB1.x + posB1.largura, y: posB1.y + posB1.altura };
	return pontoInterseccaoArea(pontoA1, posB1) ||
		pontoInterseccaoArea(pontoA2, posB1) ||
		pontoInterseccaoArea(pontoA3, posB1) ||
		pontoInterseccaoArea(pontoA4, posB1) ||
		pontoInterseccaoArea(pontoB1, posA1) ||
		pontoInterseccaoArea(pontoB2, posA1) ||
		pontoInterseccaoArea(pontoB3, posA1) ||
		pontoInterseccaoArea(pontoB4, posA1)
		? true
		: false;
}

function pontoInterseccaoArea(ponto, area) {
	return ponto.x >= area.x &&
		ponto.x <= area.x1 &&
		ponto.y >= area.y &&
		ponto.y <= area.y1
		? true
		: false;
}

function posicaoElemento(e) {
	const x = parseInt(e.style.left); // Coordenada de X no ponto Superior Esquerda
	const y = parseInt(e.style.top); // Coordenada de Y na ponto Superior Esquerda
	// const x = parseInt(e.getBoundingClientRect().left); // Coordenada de X no ponto Superior Esquerda
	// const y = parseInt(e.getBoundingClientRect().top); // Coordenada de Y na ponto Superior Esquerda
	const altura = e.offsetHeight;
	const largura = e.offsetWidth;
	const x1 = x + largura; // Coordenada de X no ponto Inferior Direita
	const y1 = y + altura; // Coordenada de Y no ponto Inferior Direita
	return { x, y, altura, largura, x1, y1 };
}

function Game() {
	const GAME_WIDTH = 600;
	const GAME_HEIGHT = 150;
	const GAME_WIDTH_STR = "600px";
	const GAME_HEIGHT_STR = "150px";
	const BACKGROUND_WIDTH = 600;
	const BACKGROUND_HEIGHT = 26;
	const BACKGROUND_WIDTH_STR = "600px";
	const BACKGROUND_HEIGHT_STR = "26px";
	const DINO_WIDTH = 44;
	const DINO_HEIGHT = 47;
	const DINO_WIDTH_STR = "44px";
	const DINO_HEIGHT_STR = "47px";
	const CACTUR_SLIM_WIDTH = 17;
	const CACTUR_SLIM_WIDTH_STR = "17px";
	const CACTUR_SLIM_HEIGHT = 35;
	const CACTUR_SLIM_HEIGHT_STR = "35px";
	const TECLA = {
		// Teclas para o jogo
		UP: "ArrowUp",
		DOWN: "ArrowDown",
		JUMP: " ",
	};
	const velocidadeInicial = 6;
	const gravidade = 7;
	let velocidade = 0;
	const game = document.getElementById("Game");

	let jogo = {
		pressionou: [],
		timer: null,
	};
	let background = criarElement("div", "background");
	let nuvem1 = document.createElement("div");
	let nuvem2 = document.createElement("div");
	let cactur1 = criarElement("div", null, "cactur-slim");
	let cactur2 = null;
	let hiScore = 0;
	let score = 0;
	let score_box = criarElement("div", null, "score");
	let ground = 0;
	let ground_dino = 0;
	let personagem = criarElement("div", "dino");
	let descendo = false;
	let subindo = false;
	let btn_iniciar = criarElement("button", "start");
	let btn_restart = criarElement("button", "restart");

	function initialConfigs() {
		// Criar o Background
		game.appendChild(background);
		// Criar o Personagem (Dino)
		game.appendChild(personagem);
		// Botão para iniciar o Jogo
		btn_iniciar.innerHTML = "Iniciar";
		btn_iniciar.addEventListener("click", start);
		game.appendChild(btn_iniciar);
		// Criar o cacto
		game.appendChild(cactur1);
		game.appendChild(score_box);
		score_box.innerHTML = "HI 00000 00000";
		score_box.style.width = GAME_WIDTH_STR;
		cactur1.style.width = 2 * CACTUR_SLIM_WIDTH + "px";
		cactur1.style.height = CACTUR_SLIM_HEIGHT_STR;

		// Seta as posições
		ground = (GAME_HEIGHT - BACKGROUND_HEIGHT / 3).toFixed(3);
		ground_dino = ground - DINO_HEIGHT;
		setPosicao(background, {
			x: "0px",
			y: GAME_HEIGHT - BACKGROUND_HEIGHT + "px",
		});
		setPosicao(personagem, {
			x: "0px",
			y: ground_dino + "px",
		});
		setPosicao(cactur1, {
			x: BACKGROUND_WIDTH - 15 + "px",
			y: ground - CACTUR_SLIM_HEIGHT + "px",
		});
		setPosicao(score_box, {
			x: "0px",
			y: "0px",
		});

		// Verifica se o usuário pressionou alguma tecla
		document.addEventListener("keydown", (e) => {
			jogo.pressionou[e.key] = true;
		});
		document.addEventListener("keyup", (e) => {
			jogo.pressionou[e.key] = false;
		});
	}

	function update() {
		moveBackground();
		moveDino();
		updateScore();
		collision();
		if (velocidade < 50) {
			velocidade += 0.0005;
		}
	}

	function moveBackground() {
		esquerda = parseFloat(background.style.backgroundPositionX || 0);
		background.style.backgroundPositionX =
			esquerda - (velocidadeInicial + velocidade) + "px";
		moveCloud();
		moveCactur();
	}

	function moveCloud() {}

	function moveCactur() {
		let newPos =
			parseFloat(cactur1.style.left) - velocidadeInicial - velocidade;
		if (newPos < 0 - (parseInt(cactur1.style.width) || CACTUR_SLIM_WIDTH)) {
			newPos = BACKGROUND_WIDTH;
			randSize(cactur1, CACTUR_SLIM_WIDTH, 3);
		}
		cactur1.style.left = newPos + "px";
	}

	function moveDino() {
		// Moveu para cima
		let topo = parseFloat(parseFloat(personagem.style.top).toFixed(3));
		if (
			(jogo.pressionou[TECLA.UP] || jogo.pressionou[TECLA.JUMP]) &&
			!descendo
		) {
			subindo = true;
			personagem.className = null;
			let newPos = topo - gravidade;
			if (newPos > 0 && !descendo) {
				personagem.style.top = newPos + "px";
			} else {
				descendo = true;
			}
		} else {
			if (subindo) {
				descendo = true;
			}
			if (topo < ground_dino) {
				let newPos = topo + gravidade;
				personagem.style.top = newPos + "px";
			} else {
				descendo = false;
			}
			personagem.className = "run";
		}

		// Moveu para baixo
		if (jogo.pressionou[TECLA.S]) {
			let topo = parseInt(personagem.style.top);
			let newPos = topo + 10;
			if (newPos < 434) personagem.style.top = newPos + "px";
		}
	}

	function updateScore() {
		let vel = parseFloat(velocidade / 5);
		let add = vel < 10 ? vel : 10;
		score += add;
		let scoreAux = score.toFixed(0);
		setScore(scoreAux, hiScore.toFixed(0));
		if (scoreAux % 100 == 0 && scoreAux > 99) {
			console.log(scoreAux, " TU-TU-RU!!!"); // Tocar Som!!!
		}
	}

	function setScore(newScore, newHi) {
		let scoreTxt = "";
		if (newScore < 10) scoreTxt = "0000" + newScore;
		else if (newScore < 100) scoreTxt = "000" + newScore;
		else if (newScore < 1000) scoreTxt = "00" + newScore;
		else if (newScore < 10000) scoreTxt = "0" + newScore;
		else scoreTxt = newScore;
		let hiTxt = "";
		if (newHi < 10) hiTxt = "HI 0000" + newHi;
		else if (newHi < 100) hiTxt = "HI 000" + newHi;
		else if (newHi < 1000) hiTxt = "HI 00" + newHi;
		else if (newHi < 10000) hiTxt = "HI 0" + newHi;
		else hiTxt = "HI " + newHi;
		score_box.innerHTML = hiTxt + " " + scoreTxt;
	}

	function collision() {
		if (colide(personagem, cactur1)) {
			if (hiScore < score) {
				hiScore = score;
				setScore(score.toFixed(0), hiScore.toFixed(0));
			}
			game.appendChild(btn_restart);
			btn_restart.addEventListener("click", restart);
			window.clearInterval(jogo.timer);
			jogo.timer = null;
			personagem.className = "dead";
		}
	}

	function randSize(elemento, tamanho, maximo) {
		let tam = Math.round(Math.random() * (maximo - 1)) + 1;
		elemento.style.width = tam * tamanho + "px";
	}

	function start() {
		jogo.timer = window.setInterval(update, 30);
		btn_iniciar.remove();
	}

	function restart() {
		score = 0;
		velocidade = 0;
		background.style.backgroundPositionX = "0px";
		cactur1.style.left = BACKGROUND_WIDTH_STR;
		jogo.timer = window.setInterval(update, 30);
		btn_restart.remove();
	}

	initialConfigs();
}

Game();
