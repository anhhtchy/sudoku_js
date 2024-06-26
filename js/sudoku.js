
import { Generator } from "./SudokuGenerator/Generator.js";
(function() {
	let settings = {
		levels: [
			{ level: "Easy" },
			{ level: "Medium" },
			{ level: "Hard" }
		],
		difficulties: {
			'Easy': [35, 0], 
			'Medium': [81, 5], 
			'Hard': [81, 10]
		}
	};

	let defaults = {
		matrix: [],
		domMatrix: [],
		numOfRows: 9,
		numOfCols: 9,
		level: 'Medium',
		selected: null,
		selectedSolution: null,
		answerTracker: {
			"1": 9,
			"2": 9,
			"3": 9,
			"4": 9,
			"5": 9,
			"6": 9,
			"7": 9,
			"8": 9,
			"9": 9
		}
	}
	let generator = new Generator();
	generator.randomize(100);
	defaults.matrix = generator.board.getMatrix();

	function createTable () {
		//array to hold the dom reference to the table matrix so that we dont have to travers dom all the time
		defaults.domMatrix = [];
		//create table 
		defaults.table = $("<div class='sdk-table sdk-no-show'></div>");
		//add rows and columns to table
		for (var row = 0; row < defaults.numOfRows; row++) {
			defaults.domMatrix[row] = [];
			var tempRow = $("<div class='sdk-row'></div>");
			//set solid border after 3rd and 6th row
			if (row == 2 || row == 5) tempRow.addClass("sdk-border");
			for (var col = 0; col < defaults.numOfCols; col++) {
				defaults.domMatrix[row][col] = $("<div class='sdk-col' data-row='" + row + "' data-col='" + col + "'></div>");
				//set solid border after 3rd and 6th column
				if (col == 2 || col == 5) defaults.domMatrix[row][col].addClass("sdk-border");
				//add columns to rows
				tempRow.append(defaults.domMatrix[row][col]);
			}
			//add rows to table
			defaults.table.append(tempRow);
		}
		//add extra div in here for background decoration
		defaults.table.append("<div class='sdk-table-bk'></div>");
		//add table to screen
		$(".sdk-game").append(defaults.table);

		//populate table with random number depending on the level difficulty 
		let difficulty = settings.difficulties[defaults.level];
		generator.reduceByLogical(difficulty[0]);
		if (difficulty[1] > 0) {
			generator.reduceRandom(difficulty[1]);
		}
		let table = generator.board.getMatrix();
		for (let row = 0; row < 9; ++row) {
			for (let col = 0; col < 9; ++col) {
				if (table[row][col] != 0) {
					defaults.domMatrix[row][col].append("<div class='sdk-solution'>" + defaults.matrix[row][col] + "</div>");
					defaults.answerTracker[defaults.matrix[row][col].toString()]--;
				}
			}
		}
		//click event when clicking on cells
		defaults.table.find(".sdk-col").click(function () {
			//remove any helper styling
			$(".sdk-game").find(".sdk-solution").removeClass("sdk-helper");
			$(".sdk-game").find(".sdk-col").removeClass("sdk-selected");
			if ($(this).children().length == 0) {
				//select this 
				defaults.domMatrix[$(this).attr("data-row")][$(this).attr("data-col")].addClass("sdk-selected");
				defaults.selected = defaults.domMatrix[$(this).attr("data-row")][$(this).attr("data-col")];
				defaults.selectedSolution = defaults.matrix[$(this).attr("data-row")][$(this).attr("data-col")]
			} else {
				//add helper style
				highlightHelp(parseInt($(this).text()));
			}
		});

		//add answers choices to screen
		answerPicker();

		//remove the no show class to do a small fadein animation with css
		setTimeout(function () {
			defaults.table.removeClass("sdk-no-show");
		}, 300);
	};

	function answerPicker () {
		//make a answer container 
		var answerContainer = $("<div class='sdk-ans-container'></div>");
		//add answer buttons to container
		for (var a in defaults.answerTracker) {
			//check if need to show button else we add it for space reason but dont pick up clicks from it
			if (defaults.answerTracker[a] > 0) {
				answerContainer.append("<div class='sdk-btn'>" + a + "</div>");
			} else {
				answerContainer.append("<div class='sdk-btn sdk-no-show'>" + a + "</div>");
			}
		}
		answerContainer.find(".sdk-btn").click(function () {
			//only listen to clicks if it is shown
			if (!$(this).hasClass("sdk-no-show") && defaults.selected != null && defaults.selected.children().length == 0) {
				//check if it is the answer
				if (defaults.selectedSolution == parseInt($(this).text())) {
					//decrease answer tracker
					defaults.answerTracker[$(this).text()]--;
					//if answer tracker is 0 hide that button
					if (defaults.answerTracker[$(this).text()] == 0) {
						$(this).addClass("sdk-no-show");
					}
					//remove highlighter
					$(".sdk-game").find(".sdk-col").removeClass("sdk-selected");
					//add the answer to screen
					defaults.selected.append("<div class='sdk-solution'>" + defaults.selectedSolution + "</div>");
				}

			}
		});
		$(".sdk-game").append(answerContainer);

	};

	function highlightHelp(number) {
		//loop through dom matrix to find filled in number that match the number we clicked on
		for (var row = 0; row < defaults.numOfRows; row++) {
			for (var col = 0; col < defaults.numOfCols; col++) {
				if (parseInt(defaults.domMatrix[row][col].text()) == number) {
					defaults.domMatrix[row][col].find(".sdk-solution").addClass("sdk-helper");
				}
			}
		}
	};

	function createDiffPicker() {
		//level picker container
		var picker = $("<div class='sdk-picker sdk-no-show'></div>");
		//loop through all levels possible and add buttons to the picker container
		$(settings.levels).each(function (e) {
			picker.append("<div class='sdk-btn' data-level='" + this.level + "'>" + this.level + "</div>");
		});
		//add it to screen
		$(".sdk-game").append(picker);
		//click event for the level select buttons
		picker.find(".sdk-btn").click(function () {
			picker.addClass("sdk-no-show");
			defaults.level = $(this).attr("data-level");
			//wait for animation to complete to continue on
			setTimeout(function () {
				// remove the picker from the DOM
				picker.remove();
				// add the playable table to screen. 
				createTable();
			}, 2000);
		});
		//remove the no show class to do a small fadein animation with css
		setTimeout(function () {
			picker.removeClass("sdk-no-show");
		}, 500);
	};

	createDiffPicker();
})();
