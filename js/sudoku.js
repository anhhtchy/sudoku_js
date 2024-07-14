
import { Generator } from "./SudokuGenerator/Generator.js";
(function() {
	let settings = {
		levels: [
			{ level: "Easy" },
			{ level: "Medium" },
			{ level: "Hard" },
			{ level: "Extreme" }
		],
		difficulties: {
			'Easy': [35, 0], 
			'Medium': [81, 5], 
			'Hard': [81, 10],
			'Extreme': [81, 15]
		}
	};

	let gameData = {
		solutionMatrix: [],
		userSolutionMatrix: [],
		puzzleMatrix: [],
		domMatrix: [],
		numOfRows: 9,
		numOfCols: 9,
		level: 'Medium',
		selectedRow: -1,
		selectedCol: -1,
		selectedSolution: null,
		numOfEmpty: 81,
    timerSeconds: 0
	}
  let timerInterval = null;
	let generator = new Generator();
	generator.randomize(100);
	gameData.solutionMatrix = generator.board.getMatrix();

  function startGame() {
    createTimer();
    createTable();
  }

  function createTimer() {
    let timeInfoContainer = $("<div class='sdk-time-info-container'></div>");
    let timerContainer = $("<div class='sdk-timer-container'></div>");
    timeInfoContainer.append(timerContainer);
    timerContainer.html(getDisplayTimeBySeconds(gameData.timerSeconds));
    timerInterval = setInterval(() => {
      gameData.timerSeconds++;
      timerContainer.html(getDisplayTimeBySeconds(gameData.timerSeconds));
    }, 1000);
    let recordContainer = $("<div class='sdk-record-container'></div>");
    recordContainer.html(getRecordStr());
    timeInfoContainer.append(recordContainer);
		$(".sdk-game").append(timeInfoContainer);
  }

  function getRecordStr() {
    let record = getRecord();
    let content = gameData.level + " - Record: ";
    if (record > 0) {
      return content + getDisplayTimeBySeconds(getRecord())
    }
    return content + 0;
  }

  function getRecord() {
    let key = gameData.level + "-record";
    return +localStorage.getItem(key);
  }

  function setRecord(seconds) {
    let key = gameData.level + "-record";
    localStorage.setItem(key, seconds);
  }

  function getDisplayTimeBySeconds (seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${getDisplayableTime(min)}:${getDisplayableTime(sec)}`;
  };
 
 
  function getDisplayableTime(timeValue) {
    return timeValue < 10 ? `0${timeValue}` : `${timeValue}`;
  }
 

	function createTable () {
		//array to hold the dom reference to the table matrix so that we dont have to travers dom all the time
		gameData.domMatrix = [];
		//create table 
		gameData.table = $("<div class='sdk-table sdk-no-show'></div>");
		//add rows and columns to table
		for (var row = 0; row < gameData.numOfRows; row++) {
			gameData.domMatrix[row] = [];
			var tempRow = $("<div class='sdk-row'></div>");
			//set solid border after 3rd and 6th row
			if (row == 2 || row == 5) tempRow.addClass("sdk-border");
			for (var col = 0; col < gameData.numOfCols; col++) {
				gameData.domMatrix[row][col] = $("<div class='sdk-col' data-row='" + row + "' data-col='" + col + "'></div>");
				//set solid border after 3rd and 6th column
				if (col == 2 || col == 5) gameData.domMatrix[row][col].addClass("sdk-border");
				//add columns to rows
				tempRow.append(gameData.domMatrix[row][col]);
			}
			//add rows to table
			gameData.table.append(tempRow);
		}
		//add extra div in here for background decoration
		gameData.table.append("<div class='sdk-table-bk'></div>");
		//add table to screen
		$(".sdk-game").append(gameData.table);

		//populate table with random number depending on the level difficulty 
		let difficulty = settings.difficulties[gameData.level];
		generator.reduceByLogical(difficulty[0]);
		if (difficulty[1] > 0) {
			generator.reduceRandom(difficulty[1]);
		}
		gameData.puzzleMatrix = generator.board.getMatrix();
		gameData.userSolutionMatrix = generator.board.getMatrix();
		for (let row = 0; row < 9; ++row) {
			for (let col = 0; col < 9; ++col) {
				if (gameData.puzzleMatrix[row][col] != 0) {
					gameData.domMatrix[row][col].append("<div class='sdk-solution'>" + gameData.solutionMatrix[row][col] + "</div>");	
          gameData.numOfEmpty--;
        }
			}
		}
		//click event when clicking on cells
		gameData.table.find(".sdk-col").click(function () {
			//remove any helper styling
			$(".sdk-game").find(".sdk-solution").removeClass("sdk-helper");
			$(".sdk-game").find(".sdk-col").removeClass("sdk-selected");
      let selectedRow = $(this).attr("data-row");
      let selectedCol = $(this).attr("data-col");
			if (gameData.puzzleMatrix[selectedRow][selectedCol] == 0) {
				gameData.domMatrix[selectedRow][selectedCol].addClass("sdk-selected");
				gameData.selectedRow = selectedRow;
				gameData.selectedCol = selectedCol;
				gameData.selectedSolution = gameData.solutionMatrix[selectedRow][selectedCol];
			} else {
        gameData.selectedRow = -1;
				gameData.selectedCol = -1;
				highlightHelp(parseInt($(this).text()));
			}
		});

		//add answers choices to screen
		answerPicker();

		//remove the no show class to do a small fadein animation with css
		setTimeout(function () {
			gameData.table.removeClass("sdk-no-show");
		}, 300);
	};

	function answerPicker () {
		let answerContainer = $("<div class='sdk-ans-container'></div>");
		let answerContainerRow1 = $("<div class='sdk-ans-container-row'></div>");
		let answerContainerRow2 = $("<div class='sdk-ans-container-row'></div>");
		for (let i = 1; i < 6; ++i) {
			answerContainerRow1.append("<div class='sdk-btn sdk-btn-ans'>" + i + "</div>");
		}
		for (let i = 6; i < 10; ++i) {
			answerContainerRow2.append("<div class='sdk-btn sdk-btn-ans'>" + i + "</div>");
		}
		answerContainerRow2.append("<div class='sdk-btn sdk-btn-del'>X</div>");
		answerContainer.append(answerContainerRow1);
		answerContainer.append(answerContainerRow2);
		answerContainer.find(".sdk-btn").click(function () {
			if (gameData.selectedRow > -1 && gameData.selectedCol > -1) {
        if (gameData.userSolutionMatrix[gameData.selectedRow][gameData.selectedCol] != 0) {
          gameData.domMatrix[gameData.selectedRow][gameData.selectedCol].html("");
          gameData.userSolutionMatrix[gameData.selectedRow][gameData.selectedCol] = 0;
          gameData.numOfEmpty++;
        }
				let userSelectedAnswer = $(this).text();
        if (userSelectedAnswer != "X") {
          gameData.userSolutionMatrix[gameData.selectedRow][gameData.selectedCol] = parseInt(userSelectedAnswer);
          gameData.domMatrix[gameData.selectedRow][gameData.selectedCol].append("<div class='sdk-solution sdk-user-solution'>" + userSelectedAnswer + "</div>");
          gameData.numOfEmpty--;
          if (gameData.numOfEmpty == 0) {
            checkSolution();
          }
        }
			}
		});
		$(".sdk-game").append(answerContainer);
	};

  function checkSolution() {
    if (isRightSolution()) {
      stopGame();
    }
  }

  function isRightSolution() {
    for (var row = 0; row < gameData.numOfRows; row++) {
			for (var col = 0; col < gameData.numOfCols; col++) {
				if (gameData.solutionMatrix[row][col] != gameData.userSolutionMatrix[row][col]) {
					return false;
				}
			}
		}
    return true;
  }

  function stopGame() {
    clearInterval(timerInterval);
    let timerStr = getDisplayTimeBySeconds(gameData.timerSeconds);
    let congratulationMessage = "";
    if (isNewRecord()) {
      setRecord(gameData.timerSeconds);
      let lighting = "&nbsp;<span>&#9889;</span>&nbsp;";
      congratulationMessage = lighting + "NEW RECORD: " + timerStr + lighting;
    } else {
      let star = "&nbsp;<span style='color:#ffc83d'>&#9733;</span>&nbsp;";
      congratulationMessage = star + "Finished in: " + timerStr + star;
    }
    showCongratulation(congratulationMessage);
    showNewGame();
  }

  function showNewGame() {
    let btnNewGame = $("<button type='button' class='sdk-new-game'>New Game</button>");
    btnNewGame.click(() => {
      location.reload();
    });
    $(".sdk-game").append(btnNewGame);
  }

  function showCongratulation(message) {
    $(".sdk-ans-container").remove();
    let congratulationContainer = $("<div class='sdk-congratulation-container'></div>");
    congratulationContainer.html(message);
    $(".sdk-game").append(congratulationContainer);
  }

  function isNewRecord() {
    let record = getRecord();
    return record == 0 || gameData.timerSeconds < record;
  }

	function highlightHelp(number) {
		//loop through dom matrix to find filled in number that match the number we clicked on
		for (var row = 0; row < gameData.numOfRows; row++) {
			for (var col = 0; col < gameData.numOfCols; col++) {
				if (parseInt(gameData.domMatrix[row][col].text()) == number) {
					gameData.domMatrix[row][col].find(".sdk-solution").addClass("sdk-helper");
				}
			}
		}
	};

	function createDiffPicker() {
		var picker = $("<div class='sdk-picker sdk-no-show'></div>");
		$(settings.levels).each(function (e) {
			picker.append("<div class='sdk-btn' data-level='" + this.level + "'>" + this.level + "</div>");
		});
		$(".sdk-game").append(picker);
		//click event for the level select buttons
		picker.find(".sdk-btn").click(function () {
			picker.addClass("sdk-no-show");
			gameData.level = $(this).attr("data-level");
			//wait for animation to complete to continue on
			setTimeout(function () {
				picker.remove();
				startGame();
			}, 2000);
		});
		//remove the no show class to do a small fadein animation with css
		setTimeout(function () {
			picker.removeClass("sdk-no-show");
		}, 500);
	};

	createDiffPicker();
})();
