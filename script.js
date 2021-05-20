// Variables
var emptyCells = [];
var tigerCell = [];
var goatCells = [];
var goat_captured = 0;
var iList, jList, goatImages, tigerImages;

const board = document.getElementById("board");
const menu = document.getElementById("menu");
const characterTurn = document.getElementById("characterTurn");
const characterImage = document.getElementById("characterImage");
const winningMessage = document.getElementById("winningMessage");
const message = document.getElementById("message");
const restartButton = document.querySelectorAll(".restartButton");
var hide = document.querySelectorAll(".goat-choice, .button-container");

restartButton.forEach((button) =>
	button.addEventListener("click", () => {
		location.reload();
		return false;
	})
);

// Functions
function setCharacter(character) {
	goatImages = document.getElementsByClassName("goat-image");
	tigerImages = document.getElementsByClassName("tiger-image");

	switch (character) {
		case "tiger":
			Array.from(goatImages).forEach((img) => {
				img.removeAttribute("draggable");
				img.removeAttribute("ondragstart");
			});

			Array.from(tigerImages).forEach((img) => {
				img.setAttribute("draggable", "true");
				img.setAttribute("ondragstart", "dragtiger(event)");
			});

			characterTurn.innerHTML = "tiger's Turn";
			characterImage.src = "./img/tiger.png";
			break;

		case "goat":
			Array.from(tigerImages).forEach((img) => {
				img.removeAttribute("draggable");
				img.removeAttribute("ondragstart");
			});

			Array.from(goatImages).forEach((img) => {
				img.setAttribute("draggable", "true");
				img.setAttribute("ondragstart", "draggoat(event)");
			});

			characterTurn.innerHTML = "goat's Turn";
			characterImage.src = "./img/goat.png";
			break;

		default:
			Array.from(goatImages).forEach((img) => {
				img.setAttribute("draggable", "true");
				img.setAttribute("ondragstart", "draggoat(event)");
			});

			emptyCells.forEach((id) => {
				cell = document.getElementById(id.toString());
				cell.setAttribute("ondrop", "dropgoat(event)");
				cell.setAttribute("ondragover", "allowDrop(event)");
			});

			characterTurn.innerHTML = "goat's Turn";
			characterImage.src = "./img/goat.png";
			break;
	}
}

function twoDirectionCells([i, j]) {
	var returnList = [];

	if (i + 1 < 3) returnList.push((i + 2) * 10 + j);

	if (i < 3 && j + 1 < 4) returnList.push((i + 1) * 10 + j + 1);
	else if (j + 1 < 4) returnList.push((i - 1) * 10 + j + 1);

	if (i < 3 && i - 1 > 0) returnList.push((i - 1) * 10 + j);
	else if (i - 1 > 0) returnList.push((i - 2) * 10 + j);

	if (i < 3 && j - 1 > 0) returnList.push((i + 1) * 10 + j - 1);
	else if (j - 1 > 0) returnList.push((i - 1) * 10 + j - 1);

	return returnList;
}

function threeDirectionCells([i, j]) {
	var returnList = [];
	iList = [i - 1, i + 1];
	jList = [j - 1, j, j + 1];

	iList.forEach((ni) => {
		jList.forEach((nj) => {
			if ((i !== ni || j !== nj) & (nj < 5) & (nj > 0) & (ni < 4) & (ni > 0) & (ni + 1 !== (j + nj) / 2)) {
				returnList.push(ni * 10 + nj);
			}
			if ((i !== 3) & (j == nj)) {
				returnList.push((ni + 1) * 10 + nj);
			}
			if ((i == 3) & (j == nj)) {
				returnList.push((ni - 1) * 10 + nj);
			}
		});
	});

	const index = returnList.indexOf(i * 10 + j);

	if (index > -1) returnList.splice(index, 1);

	return returnList;
}

function fourDirectionCells([i, j]) {
	var returnList = [];
	iList = [i - 1, i + 1];
	jList = [j - 1, j + 1];

	iList.forEach((ni) => {
		jList.forEach((nj) => {
			if ((i !== ni || j !== nj) & (nj < 6) & (nj > 0) & (ni < 4) & (ni > 0)) {
				returnList.push(ni * 10 + nj);
			}
		});
	});

	const index = returnList.indexOf(i * 10 + j);

	if (index > -1) returnList.splice(index, 1);

	return returnList;
}

var possibleJumps, returnList, moveList;

function cellMoves([i, j]) {
	if ((i !== 2) & (j !== 3) & ((i + j) % 2 == 0)) {
		return (moveList = twoDirectionCells([i, j]));
	} else if ((i == 2) & (j % 2 == 0)) {
		return (moveList = fourDirectionCells([i, j]));
	} else {
		return (moveList = threeDirectionCells([i, j]));
	}
}

function possiblegoatMoves([i, j]) {
	possibleMoves = cellMoves([i, j]);
	returnList = [...possibleMoves];
	possibleMoves.forEach((cell) => {
		if (!emptyCells.includes(cell)) {
			returnList.splice(returnList.indexOf(cell), 1);
		}
	});
	return returnList;
}

function possibletigerMoves([i, j]) {
	possibleMoves = cellMoves([i, j]);
	possibleJumps = [];
	possibleMoves.forEach((cell) => {
		if (goatCells.includes(cell)) {
			var x2 = Math.floor(cell / 10);
			var y2 = cell % 10;
			var x3 = x2 + x2 - i;
			var y3 = y2 + y2 - j;

			if (emptyCells.includes(x3 * 10 + y3)) {
				possibleJumps.push(x3 * 10 + y3);
			}
		}
	});

	possibleMoves = possibleMoves.concat(possibleJumps);
	returnList = [...possibleMoves];
	possibleMoves.forEach((cell) => {
		if (!emptyCells.includes(cell)) {
			returnList.splice(returnList.indexOf(cell), 1);
		}
	});
	return returnList;
}

function prepPhase() {
	var goatPlace,
		bCells = [];
	board.classList.add("hide");
	menu.classList.remove("show");
	[].forEach.call(hide, function (hidden) {
		hidden.classList.remove("hide");
	});

	document.getElementById("playButton").addEventListener("click", () => {
		var selector = document.querySelector('input[name="goatPlacing"]:checked');
		if (selector) goatPlace = selector.value;

		if (goatPlace == "bLeft") {
			bCells = [11, 22, 31];
			startGame(bCells);
		} else if (goatPlace == "bRight") {
			bCells = [15, 24, 35];
			startGame(bCells);
		} else {
			alert("Please select a placing for goat!");
		}
	});
}

prepPhase();

function startGame(bCells) {
	board.classList.remove("hide");
	board.innerHTML = "";
	message.innerHTML = "";

	[].forEach.call(hide, function (hidden) {
		hidden.classList.add("hide");
	});

	setCharacter("tiger");
	emptyCells = [];

	iList = [1, 2, 3];
	jList = [1, 2, 3, 4, 5];
	iList.forEach((ni) => {
		jList.forEach((nj) => {
			if ((ni + nj) % 2 == 0) emptyCells.push(ni * 10 + nj);
			container = document.createElement("div");
			container.classList.add("cell");
			container.id = ni * 10 + nj;
			board.appendChild(container);
		});
	});

	emptyCells.forEach((id) => {
		cell = document.getElementById(id.toString());
		cell.setAttribute("onclick", "tigerPlacing(this.id)");
	});

	tigerCell = [];
	goatCells = [];
	goat_captured = 0;

	goatCells = bCells;
	goatCells.forEach((id) => {
		myImg = document.createElement("img");
		myImg.src = "./img/goat.png";
		myImg.id = "goat-" + id;
		myImg.classList.add("goat-image");

		container = document.getElementById(id);
		container.removeAttribute("onclick");
		container.appendChild(myImg);

		emptyCells.splice(emptyCells.indexOf(id), 1);
	});

	winningMessage.classList.remove("show");
	menu.classList.add("show");
}

function allowDrop(event) {
	event.preventDefault();
}

var possibleMoves, index, data, idtiger, idgoat, movedImage, cell;

function dragtiger(event) {
	event.dataTransfer.setData("tiger-id", event.target.id);
}

function droptiger(event) {
	data = event.dataTransfer.getData("tiger-id");
	idtiger = parseInt(data.slice(-2));

	possibleMoves = possibletigerMoves([Math.floor(idtiger / 10), idtiger % 10]);
	index = possibleMoves.indexOf(parseInt(event.target.id));
	if (index > -1) {
		event.preventDefault();

		movedImage = document.getElementById(data);
		movedImage.id = "tiger-" + event.target.id;
		event.target.appendChild(movedImage);

		emptyCells.push(idtiger);
		emptyCells.splice(emptyCells.indexOf(parseInt(event.target.id)), 1);

		tigerCell.splice(tigerCell.indexOf(parseInt(idtiger)), 1);
		tigerCell.push(parseInt(event.target.id));

		//has tiger jumped?
		if (possibleJumps.includes(parseInt(event.target.id))) {
			x1 = Math.floor(idtiger / 10);
			y1 = idtiger % 10;

			x3 = Math.floor(parseInt(event.target.id) / 10);
			y3 = parseInt(event.target.id) % 10;

			x2 = parseInt((x3 + x1) / 2);
			y2 = parseInt((y1 + y3) / 2);

			idB = parseInt(x2 * 10 + y2).toString();
			containerB = document.getElementById(idB);
			containerB.innerHTML = "";

			goatCells.splice(goatCells.indexOf(parseInt(x2 * 10 + y2)), 1);
			emptyCells.push(parseInt(x2 * 10 + y2));

			goat_captured += 1;
		}

		if (hastigerWon()) {
			winningMessage.classList.add("show");
			message.innerHTML = "tiger has won!";
		}

		emptyCells.forEach((id) => {
			cell = document.getElementById(id.toString());
			cell.removeAttribute("ondrop");
			cell.removeAttribute("ondragover");
			cell.setAttribute("ondrop", "dropgoat(event)");
			cell.setAttribute("ondragover", "allowDrop(event)");
		});

		setCharacter("goat");
	}
}

function draggoat(event) {
	event.dataTransfer.setData("goat-id", event.target.id);
}

function dropgoat(event) {
	data = event.dataTransfer.getData("goat-id");
	idgoat = parseInt(data.slice(-2));

	possibleMoves = possiblegoatMoves([Math.floor(idgoat / 10), idgoat % 10]);
	index = possibleMoves.indexOf(parseInt(event.target.id));

	if (index > -1) {
		event.preventDefault();

		movedImage = document.getElementById(data);
		movedImage.id = "goat-" + event.target.id;
		event.target.appendChild(movedImage);

		emptyCells.push(idgoat);
		emptyCells.splice(emptyCells.indexOf(parseInt(event.target.id)), 1);

		goatCells.splice(goatCells.indexOf(parseInt(idgoat)), 1);
		goatCells.push(parseInt(event.target.id));

		if (hasgoatWon()) {
			winningMessage.classList.add("show");
			message.innerHTML = "goat has won!";
		}

		emptyCells.forEach((id) => {
			cell = document.getElementById(id.toString());
			cell.removeAttribute("ondrop");
			cell.removeAttribute("ondragover");
			cell.setAttribute("ondrop", "droptiger(event)");
			cell.setAttribute("ondragover", "allowDrop(event)");
		});

		setCharacter("tiger");
	}
	bestMove();
	aitigerMovement();
}

function tigerPlacing(containerId) {
	myImg = document.createElement("img");
	myImg.src = "./img/tiger.png";
	myImg.id = "tiger-" + containerId;
	myImg.classList.add("tiger-image");

	container = document.getElementById(containerId);
	container.appendChild(myImg);
	container.removeAttribute("onclick");

	tigerCell.push(parseInt(containerId));
	emptyCells.splice(emptyCells.indexOf(parseInt(containerId)), 1);

	Array.from(document.getElementsByClassName("cell")).forEach((cell) => {
		cell.removeAttribute("onclick");
	});

	setCharacter("default");
}

function hastigerWon() {
	return goat_captured == 1 ? true : false;
}

function hasgoatWon() {
	var possibletigerMovesList = [];
	tigerCell.forEach((cell) => {
		possibletigerMovesList = possibletigerMovesList.concat(possibletigerMoves([Math.floor(cell / 10), cell % 10]));
	});
	return possibletigerMovesList.length == 0 ? true : false;
}

function distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function bestMove() {
	var i1, i2, j1, j2, bi, bj, minIndex, nearestgoat, nearestgoatMove, moveLocation, bestCell;
	var distanceList = [],
		arrList = [],
		arrList2 = [],
		cellDistances = [],
		tempList = [];

	if (possibleJumps.length !== 0) bestCell = possibleJumps;
	else {
		tigerCell.forEach((cell) => {
			i1 = Math.floor(cell / 10);
			j1 = cell % 10;
		});
		goatCells.forEach((cell) => {
			i2 = Math.floor(cell / 10);
			j2 = cell % 10;
			if (possiblegoatMoves([i2, j2]).length > 0) {
				tempList.push(cell);
				distanceList.push(distance(i1, j1, i2, j2));
			}
		});
		minIndex = distanceList.indexOf(Math.min(...distanceList));
		nearestgoat = tempList.slice(minIndex, minIndex + 1);

		nearestgoat.forEach((cell) => {
			bi = Math.floor(cell / 10);
			bj = cell % 10;
		});
		nearestgoatMove = possiblegoatMoves([bi, bj]);

		possibletigerMoves([i1, j1]).forEach((cell) => {
			bi = Math.floor(cell / 10);
			bj = cell % 10;
			arrList.push([bi, bj]);
		});

		nearestgoatMove.forEach((cell) => {
			bi = Math.floor(cell / 10);
			bj = cell % 10;
			arrList2.push([bi, bj]);
		});

		tempList = [];
		arrList.forEach((element1) => {
			arrList2.forEach((element2) => {
				tempList.push(element1);
				cellDistances.push(distance(element1[0], element1[1], element2[0], element2[1]));
			});
		});
		minIndex = cellDistances.indexOf(Math.min(...cellDistances));
		moveLocation = tempList.slice(minIndex, minIndex + 1);
		var ml = [].concat(...moveLocation);
		bestCell = [ml[0] * 10 + ml[1]];
	}
	return bestCell;
}

var aiMove;

function aitigerMovement() {
	var prevtigerId = parseInt(tigerCell);
	aiMove = parseInt(bestMove());

	index = bestMove().indexOf(aiMove);
	if (index > -1) {
		container2 = document.getElementById(prevtigerId);
		container2.innerHTML = "";

		myImg = document.createElement("img");
		myImg.src = "./img/tiger.png";
		myImg.id = "tiger-" + aiMove;
		myImg.classList.add("tiger-image");

		container = document.getElementById(aiMove);
		container.appendChild(myImg);

		emptyCells.push(prevtigerId);
		emptyCells.splice(emptyCells.indexOf(parseInt(aiMove)), 1);

		tigerCell.splice(tigerCell.indexOf(parseInt(aiMove)), 1);
		tigerCell.push(parseInt(aiMove));

		//has tiger jumped?
		if (possibleJumps.includes(parseInt(aiMove))) {
			console.log("tiger has jumped!");
			x1 = Math.floor(aiMove / 10);
			y1 = aiMove % 10;

			x3 = Math.floor(parseInt(aiMove) / 10);
			y3 = parseInt(aiMove) % 10;

			x2 = parseInt((x3 + x1) / 2);
			y2 = parseInt((y1 + y3) / 2);

			idB = parseInt(x2 * 10 + y2).toString();
			containerB = document.getElementById(idB);
			containerB.innerHTML = "";

			goatCells.splice(goatCells.indexOf(parseInt(x2 * 10 + y2)), 1);
			emptyCells.push(parseInt(x2 * 10 + y2));

			goat_captured += 1;
		}

		if (hastigerWon()) {
			winningMessage.classList.add("show");
			message.innerHTML = "tiger has won!";
		}

		emptyCells.forEach((id) => {
			cell = document.getElementById(id.toString());
			cell.removeAttribute("ondrop");
			cell.removeAttribute("ondragover");
			cell.setAttribute("ondrop", "dropgoat(event)");
			cell.setAttribute("ondragover", "allowDrop(event)");
		});

		setCharacter("goat");
	}
}
