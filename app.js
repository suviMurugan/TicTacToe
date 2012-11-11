var mySymbol;
var myIndex;

function stringCompare(a,b) {
	return a['id'].toLowerCase().localeCompare(b['id'].toLowerCase());
}

function populatePlayers() {
	var participants = gapi.hangout.getEnabledParticipants();
	var players = [];
	for(i in participants) {
		players[i] = {'name': participants[i].person.displayName, 'id': participants[i].id};
	}
	players.sort(stringCompare);
	console.log(players);
	myIndex = (players[0]['id'] == gapi.hangout.getLocalParticipantId()) ? 0 : 1;
	console.log("myindex is: " + myIndex);
	return players;
}

function delta(data) {
	gapi.hangout.data.submitDelta(data);
}

function initPlayers() {
	if(gapi.hangout.getEnabledParticipants().length < 2) {
		return;
	}
	// initialize the state matrix
	var matrix = [];
	for(var i = 0; i < 3; i++) {
		matrix[i] = [];
		for(var j = 0; j < 3; j++) {
			matrix[i][j] = 0;
		}
	}
	// initialize the players
	var players = populatePlayers();
	players[0]['symbol'] = 'x';
	players[1]['symbol'] = 'o';
	mySymbol = (myIndex == 0) ? 'x' : 'o';
	delta({'players': JSON.stringify(players), 'turn': 'x', 'matrix': JSON.stringify(matrix)});
	document.getElementById('players').innerHTML = players[0]['name'] + ' plays X and ' + players[1]['name'] + ' plays O';
}

function printTurn() {
	document.getElementById('turn').innerHTML =  "It is now " + gapi.hangout.data.getValue('turn') + "\'s turn!";
}

function get(key) {
	return gapi.hangout.data.getValue(key);
}

function updateUI(matrix) {
	for(var i = 0; i < 3; i++) {
		for(var j = 0; j < 3; j++) {
			var symbol = '';
			if(matrix[i][j] == 1) {
				symbol = 'X';
			} else if (matrix[i][j] == 2) {
				symbol = 'O';
			}
			document.getElementById('b' + i + j).innerHTML = symbol;
		}
	}
}

function changeUI(state) {
	for(var i = 0; i < 3; i++) {
		for(var j = 0; j < 3; j++) {
			document.getElementById('b' + i + j).disabled = state; 
		}
	}
}

function move(button) {
	var i = parseInt(button.id[1]), j = parseInt(button.id[2]);
	var matrix = JSON.parse(get('matrix'));
	matrix[i][j] = (mySymbol == 'x') ? 1 : 2;
	updateUI(matrix);
	changeUI(true);
	var turn = (mySymbol == 'x') ? 'o' : 'x';
	delta({'matrix': JSON.stringify(matrix), 'turn': turn});
}

function stateChange(evt) {
	updateUI(JSON.parse(get('matrix')));
	printTurn();
	if(get('turn') == mySymbol) {
		document.getElementById('turn').innerHTML += " &nbsp; make your move!";
		changeUI(false);
	}
}

function init() {
	// When API is ready
	gapi.hangout.onApiReady.add(
		function(eventObj) {
			if (eventObj.isApiReady) {
				document.getElementById('ui').style.visibility = 'visible';
				document.getElementById('players').innerHTML = 'waiting for more players..';
				gapi.hangout.onEnabledParticipantsChanged.add(initPlayers);
				initPlayers();
			}
		});
}

// Wait for gadget to load
gadgets.util.registerOnLoadHandler(init);