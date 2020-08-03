import { array } from "./util";
import { create as createYamb, Yamb } from "./yamb";
import { dice as createDice } from "./dice";

export function gameManager(players: number) {
	let currentPlayer = 0;

	const games = array(players, (): Yamb => createYamb());
	const dice = createDice(6, players);

	function canPlay(player: number, row: string, column: string) {
		return games[player].canPlay(dice, row, column);
	}

	function play(player: number, row: string, column: string) {
		games[player].play(dice, row, column);
		dice.reset();
		currentPlayer = (currentPlayer + 1) % players;
	}

	function field(player: number, row: string, column: string) {
		return games[player].field(row, column);
	}

	function toggleFreeze(index: number) {
		dice.toggleFreeze(index);
	}

	function filled(player: number, row: string, column: string) {
		return games[player].filled(row, column);
	}

	function getScore(player: number, row: string, column: string) {
		return games[player].getScore(dice, row, column);
	}

	return {
		get currentPlayer() {
			return currentPlayer;
		},
		get diceValues() {
			return [...dice.values];
		},
		get frozen() {
			return [...dice.frozen];
		},
		get roll() {
			return dice.roll;
		},
		players,
		rowNames: games[0]?.rowNames ?? "",
		columnNames: games[0]?.columnNames ?? "",
		canPlay,
		play,
		field,
		rollDice: dice.rollDice,
		loadDice: dice.loadDice,
		toggleFreeze,
		filled,
		getScore,
	};
}

export type GameManager = ReturnType<typeof gameManager>;
