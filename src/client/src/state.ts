import { Dice, dice } from "common/dice";
import { Yamb, create as createGame } from "common/yamb";
import { array } from "common/util";
import { SocketMetadata } from "common/ws";

interface State {
	dice: Dice;
	games: Yamb<any, any>[];
	players: SocketMetadata[];
}

const initialState = (): State => ({
	dice: dice(0, 0),
	players: [],
	games: [],
});

export const actions = {
	toggleFreeze(index: number) {
		state.dice.toggleFreeze(index);
	},

	rollDice() {
		state.dice.rollDice();
	},

	play(player: number, row: string, column: string) {
		state.games[player].play(state.dice, row, column);
		state.dice.reset();
	},

	startGame(players: SocketMetadata[]) {
		state.games = array(players.length, createGame);
		state.dice = dice(6, players.length);
		state.players = [...players];
	},
};

export const state = initialState();
