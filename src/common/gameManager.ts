import { create as createYamb, Yamb } from "./yamb";
import { dice as createDice } from "./dice";

export interface Player {
	id: string;
	name: string;
	owner: boolean;
}

export function gameManager(players: Player[]) {
	let currentPlayer = 0;

	const { rows, columns }: Yamb = createYamb();

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

	function play(row: string, column: string, onlinePlayers: Player[]) {
		getGame(players[currentPlayer]).play(dice, row, column);
		dice.reset();
		findNextAvailablePlayer(onlinePlayers);
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

	function findNextAvailablePlayer(onlinePlayers: Player[]) {
		const playersSet = new Set(onlinePlayers.map(x => x.id));
		for (let i = 1; i < players.length; i++) {
			const nextAvailablePlayer = (currentPlayer + i) % players.length;
			if (playersSet.has(players[nextAvailablePlayer].id)) {
				currentPlayer = nextAvailablePlayer;
				return true;
			}
		}
		return false;
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
		score(player: Player) {
			return getGame(player).score();
		},
		active(onlinePlayers: Player[]) {
			const playersSet = new Set(onlinePlayers.map(x => x.id));
			return [...games].some(([playerId, game]) => {
				return playersSet.has(playerId) && game.active();
			});
		},
		call(row: string) {
			return getGame(players[currentPlayer]).call(dice, row);
		},
		calling() {
			return getGame(players[currentPlayer]).calling();
		},
		players,
		rows,
		columns,
		canPlay,
		play,
		field,
		rollDice: dice.rollDice,
		loadDice: dice.loadDice,
		resetDice: dice.reset,
		findNextAvailablePlayer,
		toggleFreeze,
		filled,
		getScore,
	};
}

export type GameManager = ReturnType<typeof gameManager>;
