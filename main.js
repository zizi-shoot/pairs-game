'use strict';

(() => {
	const startScreen = document.querySelector('.start');
	const table = document.querySelector('.table');
	const levels = document.querySelector('.start__levels');
	const beginBtn = document.querySelector('.begin-btn');
	const aside = document.querySelector('.aside');
	const restartBtn = document.querySelector('.aside__restart');
	const returnBtn = document.querySelector('.aside__return');
	const endScreen = document.querySelector('.end');
	const endReturnBtn = document.querySelector('.end__return');
	const endRestartBtn = document.querySelector('.end__restart');
	const timer = document.querySelector('.aside__timer');
	const timerMinutes = document.querySelector('.timer__min');
	const timerSeconds = document.querySelector('.timer__sec');
	const endDescr = document.querySelector('.end__descr');

	const GRID_GAP = 10;
	const TABLE_PADDING = 40;
	const CARD_PROPORTION = 1.5;
	const digitsArr = [];
	let rows = 4;
	let cardsDigits = [];
	let flipCounter = null;
	let intervalId = null;

	// Библиотека функций

	function shuffleCards(array) {
		const copy = [];
		let n = array.length;
		let i = null;

		while (n) {
			i = Math.floor(Math.random() * array.length);

			if (i in array) {
				copy.push(array[i]);
				delete array[i];
				n--;
			}
		}

		return copy;
	}

	function showTable() {
		startScreen.style.display = 'none';
		table.style.display = 'grid';
		table.style.opacity = '1';
	}

	function fillTable() {
		for (let i = 1; i <= rows ** 2 / 2; i++) {
			digitsArr.push(i);
		}

		cardsDigits = [...digitsArr, ...digitsArr];
		cardsDigits = shuffleCards(cardsDigits);
		cardsDigits.forEach((el) => {
			const cardTemplate = `
	<article class="card">
			<div class="card__back"></div>
			<div class="card__front">${el}</div>
	</article>
	`;
			table.insertAdjacentHTML('beforeend', cardTemplate);
		});
	}

	function setTableGrid() {
		const gapAmount = rows - 1;
		table.style.gridTemplateColumns = `repeat(${rows}, 1fr)`;
		table.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
		table.style.width = `calc((100vh - ${TABLE_PADDING}px - ${gapAmount * GRID_GAP}px) / ${CARD_PROPORTION} + ${gapAmount * GRID_GAP}px)`;
	}

	function setCardsFontSize(ev) {
		const cards = document.querySelectorAll('.card');
		cards.forEach((el) => {
			el.style.fontSize = `${ev.target.offsetHeight / 2}px`;
		});
		table.removeEventListener('click', setCardsFontSize);
	}

	function clearTable() {
		const cards = document.querySelectorAll('.card');

		digitsArr.length = 0;
		flipCounter = 0;
		cards.forEach((card) => card.remove());
	}

	function startGame() {
		endScreen.className = 'end';
		timer.className = 'aside__timer';
		startScreen.style.opacity = '0';
		setTimeout(() => {
			showTable();
			aside.style.display = 'flex';
		}, 1000);
		setTableGrid();
		fillTable();
		table.addEventListener('click', setCardsFontSize);
	}

	function restartGame() {
		endScreen.className = 'end';
		timer.className = 'aside__timer';
		clearTable();
		setTableGrid();
		fillTable();
		table.addEventListener('click', setCardsFontSize);
	}

	function returnGame() {
		clearTable();
		clearInterval(intervalId);
		startScreen.style.display = 'flex';
		startScreen.style.opacity = '1';
		table.style.display = 'none';
		table.style.opacity = '0';
		aside.style.display = 'none';
	}

	function setTimer(level) {
		let seconds = null;

		switch (level) {
		case 2:
			seconds = 15;
			break;
		case 4:
			seconds = 60;
			break;
		case 6:
			seconds = 180;
			break;
		case 8:
			seconds = 300;
			break;
		case 10:
			seconds = 600;
			break;

		default:
			break;
		}

		intervalId = setInterval(() => {
			timerMinutes.textContent = Math.trunc(seconds / 60);

			if (seconds % 60 < 10) {
				timerSeconds.textContent = `0${seconds % 60}`;
			} else {
				timerSeconds.textContent = seconds % 60;
			}

			if (seconds < 10) {
				timer.classList.add('aside__timer--blinked');
			}

			if (seconds < 1) {
				clearInterval(intervalId);
				timer.classList.remove('aside__timer--blinked');
				timer.classList.add('aside__timer--finish');
				showEndScreen('end--lose');
			}

			seconds--;
		}, 1000);
	}

	function showEndScreen(result) {
		switch (result) {
		case 'end--win':
			endDescr.innerText = 'Победа!';
			break;
		case 'end--lose':
			endDescr.innerText = 'Поражение!';
			break;

		default:
			break;
		}

		endScreen.classList.add(result);

		endScreen.style.display = 'flex';
		endRestartBtn.addEventListener('click', () => {
			endScreen.style.display = 'none';
			restartGame();
			clearInterval(intervalId);
			setTimer(rows);
		});
		endReturnBtn.addEventListener('click', () => {
			endScreen.style.display = 'none';
			returnGame();
			clearInterval(intervalId);
			setTimer(rows);
		});
	}

	function blockCard(arr) {
		const cards = arr || document.querySelectorAll('.card--flipped');
		cards.forEach((el) => el.classList.toggle('card--blocked'));
	}

	function checkResult() {
		const cards = Array.from(document.querySelectorAll('.card'));
		const result = cards.every((card) => card.classList.contains('card--winner'));

		if (result) {
			setTimeout(() => {
				showEndScreen('end--win');
			}, 1100);
			timer.classList.remove('aside__timer--blinked');
			timer.classList.add('aside__timer--finish');
			clearInterval(intervalId);
		}
	}

	function compareCards() {
		const cards = document.querySelectorAll('.card--flipped');
		blockCard(cards);

		if (cards[0].innerText !== cards[1].innerText) {
			cards.forEach((el) => el.classList.toggle('card--flipped'));
		} else {
			cards.forEach((el) => el.className = 'card card--winner card--blocked');
		}

		flipCounter = null;
		checkResult();
	}

	function flipCard(ev) {
		const card = ev.target !== table ? ev.target.closest('.card') : null;
		if (flipCounter === 2) compareCards();

		if (card !== null) {
			card.classList.toggle('card--flipped');

			if (card.classList.contains('card--flipped')) {
				flipCounter++;
			} else {
				flipCounter--;
			}
		}

		if (flipCounter === 2) blockCard();
		const cards = Array.from(document.querySelectorAll('.card'));
		if (cards.every((el) => el.className !== 'card')) compareCards();
	}

	function chooseLevel() {
		const levelBtns = Array.from(document.querySelectorAll('.level-btn'));
		console.log(levelBtns.every((el) => !el.classList.contains('btn--checked')));

		if (levelBtns.every((el) => !el.classList.contains('btn--checked'))) {
			beginBtn.classList.add('begin-btn--blocked');
		} else {
			beginBtn.classList.remove('begin-btn--blocked');
		}
	}

	// Тело программы

	levels.addEventListener('click', (ev) => {
		const levelBtns = document.querySelectorAll('.level-btn');
		levelBtns.forEach((el) => {
			if (!el.classList.contains('btn--checked')) {
				if (el === ev.target) {
					ev.target.classList.add('btn--checked');
				}
			} else {
				el.classList.remove('btn--checked');
			}
		});
		rows = +ev.target.getAttribute('data-rows');
	});
	levels.addEventListener('click', chooseLevel);

	beginBtn.addEventListener('click', startGame);
	beginBtn.addEventListener('click', () => {
		clearInterval(intervalId);
		setTimer(rows);
	});
	restartBtn.addEventListener('click', restartGame);
	restartBtn.addEventListener('click', () => {
		clearInterval(intervalId);
		setTimer(rows);
	});
	returnBtn.addEventListener('click', returnGame);
	returnBtn.addEventListener('click', () => {
		clearInterval(intervalId);
		setTimer(rows);
	});
	table.addEventListener('click', flipCard);
})();