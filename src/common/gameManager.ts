import { create as createYamb, Yamb } from "./yamb";
import { dice as createDice } from "./dice";

export interface Player {
	id: string;
	name: string;
	owner: boolean;
}

export function gameManager(players: Player[]) {
	let currentPlayer = 0;

	const { rowNames, columnNames }: Yamb = createYamb();

	const games = players.reduce((acc, player) => {
		acc.set(player.id, createYamb());
		return acc;
	}, new Map<Player["id"], Yamb>());

	const dice = createDice(6, players.length);

	function getGame(player: Player) {
		if (!games.has(player.id)) {
			console.log(games);
			console.log(player);
			throw new Error("Invalid player");
		}

		return games.get(player.id)!;
	}

	function canPlay(player: Player, row: string, column: string) {
		return getGame(player).canPlay(dice, row, column);
	}

	function play(row: string, column: string) {
		getGame(players[currentPlayer]).play(dice, row, column);
		dice.reset();
		currentPlayer = (currentPlayer + 1) % players.length;
	}

	function field(player: Player, row: string, column: string) {
		return getGame(player).field(row, column);
	}

	function toggleFreeze(index: number) {
		dice.toggleFreeze(index);
	}

	function filled(player: Player, row: string, column: string) {
		return getGame(player).filled(row, column);
	}

	function getScore(player: Player, row: string, column: string) {
		return getGame(player).getScore(dice, row, column);
	}

	return {
		get currentPlayer() {
			return { ...players[currentPlayer] };
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
		rowNames,
		columnNames,
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
