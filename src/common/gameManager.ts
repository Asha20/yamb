import {
	Column,
	create as createYamb,
	Row,
	ROWS,
	Yamb,
	call as callColumn,
} from "./yamb";
import { Dice, DieSide } from "./dice";

export interface Player {
	id: string;
	name: string;
	owner: boolean;
}

export class GameManager {
	players: Player[];
	rows: readonly Row[];
	columns: readonly Column[];
	games: Map<string, Yamb>;
	currentPlayerId = 0;
	dice = new Dice(6);

	constructor(
		players: Player[],
		columns: readonly Column[],
		rows: readonly Row[] = ROWS,
	) {
		this.players = players;
		this.rows = rows;
		this.columns = columns;
		this.games = players.reduce((acc, player) => {
			acc.set(player.id, createYamb(rows, columns));
			return acc;
		}, new Map<Player["id"], Yamb>());
	}

	get currentPlayer(): Player {
		return { ...this.players[this.currentPlayerId] };
	}

	get diceValues(): DieSide[] {
		return [...this.dice.values];
	}

	get frozen(): boolean[] {
		return [...this.dice.frozen];
	}

	get roll(): number {
		return this.dice.roll;
	}

	rollDice(): void {
		this.dice.rollDice();
	}

	loadDice(dice: DieSide[]): void {
		this.dice.loadDice(dice);
	}

	resetDice(): void {
		this.dice.reset();
	}

	getGame(player: Player): Yamb {
		const game = this.games.get(player.id);
		if (!game) {
			throw new Error("Invalid player");
		}
		return game;
	}

	canPlay(player: Player, row: string, column: string): boolean {
		return this.getGame(player).canPlay(this.dice, row, column);
	}

	play(row: string, column: string): void {
		this.getGame(this.currentPlayer).play(this.dice, row, column);
		this.dice.reset();
	}

	field(player: Player, row: string, column: string): number | undefined {
		return this.getGame(player).field(row, column);
	}

	toggleFreeze(index: number): void {
		this.dice.toggleFreeze(index);
	}

	filled(player: Player, row: string, column: string): boolean {
		return this.getGame(player).filled(row, column);
	}

	getScore(player: Player, row: string, column: string): number | undefined {
		return this.getGame(player).getScore(this.dice, row, column);
	}

	findNextAvailablePlayer(onlinePlayers: Player[]): boolean {
		const playersSet = new Set(onlinePlayers.map(x => x.id));
		for (let i = 1; i < this.players.length; i++) {
			const nextAvailablePlayer =
				(this.currentPlayerId + i) % this.players.length;
			if (playersSet.has(this.players[nextAvailablePlayer].id)) {
				this.currentPlayerId = nextAvailablePlayer;
				return true;
			}
		}
		return false;
	}

	score(player: Player): number {
		return this.getGame(player).score();
	}

	active(onlinePlayers: Player[]): boolean {
		const playersSet = new Set(onlinePlayers.map(x => x.id));
		return [...this.games].some(([playerId, game]) => {
			return playersSet.has(playerId) && game.active();
		});
	}

	call(row: string): boolean {
		return this.getGame(this.currentPlayer).call(this.dice, row);
	}

	calling(): string | null {
		return this.getGame(this.currentPlayer).calling();
	}

	mustCall(): boolean {
		if (
			this.calling() ||
			this.dice.roll !== 1 ||
			!this.columns.includes(callColumn)
		) {
			return false;
		}

		const otherColumns = this.columns.filter(x => x !== callColumn);

		for (const row of this.rows) {
			for (const column of otherColumns) {
				if (!this.filled(this.currentPlayer, row.name, column.name)) {
					return false;
				}
			}
		}
		return true;
	}
}
