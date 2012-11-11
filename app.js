var mySymbol;

function stringCompare(a,b) {
	return a['name'].toLowerCase().localeCompare(b['name'].toLowerCase());
}

function populatePlayers() {
	var participants = gapi.hangout.getEnabledParticipants();
	var players = [];
	for(i in participants) {
		players[i] = {'name': participants[i].person.displayName, 'id': participants[i].id};
	}
	return players.sort(stringCompare);
}

function delta(data) {
	gapi.hangout.data.submitDelta(data);
}

function initPlayers() {
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
	players[0]['symbol'] = 'o';
	mySymbol = (players[0]['id'] == gapi.hangout.getLocalParticipantId()) ? 'x' : 'o';
	delta({'players': JSON.strigify(players), 'turn': 'x', 'matrix': matrix});
	return participants[0].person.displayName + ' plays X and ' + participants[1].person.displayName + ' plays O';
}

function printTurn() {
	document.getElementById('turn').innerHTML =  "It is now " + gapi.hangout.data.getValue('turn') + "\'s turn!";
}

function get(key) {
	return gapi.hangout.data.getValue(key);
}

function move(button) {
	button.innerHTML = mySymbol;
	var i = parseInt(button.id[1]), j = parseInt(button.id[2]);
	var matrix = get('matrix');
	matrix[i][j] = (mySymbol == 'x') ? 1 : 2;
	var turn = (mySymbol == 'x') ? 'o' : 'x';
	delta({'matrix': matrix, 'turn': turn});
}

function stateChange(evt) {
	printTurn();
	if(get('turn') == mySymbol) {
		document.getElementById('turn').innerHTML += " &nbsp; make your move!";
	}
}

function init() {
	// When API is ready
	gapi.hangout.onApiReady.add(
		function(eventObj) {
			if (eventObj.isApiReady) {
				document.getElementById('ui').style.visibility = 'visible';
				if(gapi.hangout.getEnabledParticipants().length >= 2) {
					gapi.hangout.data.onStateChanged.add(stateChange);
					document.getElementById('players').innerHTML = initPlayers();
				} else {
					document.getElementById('players').innerHTML = 'waiting for more players..';
				}
			}
		});
}

// Wait for gadget to load
gadgets.util.registerOnLoadHandler(init);