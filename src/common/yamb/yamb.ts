import { Row, Column, ScoreContext, call } from "./rowsAndColumns";
import { DiceContext, Dice } from "./dice";
import { array } from "common";

class Yamb<
	TRows extends readonly Row<string>[] = readonly Row<string>[],
	TColumns extends readonly Column<string>[] = readonly Column<string>[],
	// These last two arguments shouldn't be provided; they're just a hack
	// because TypeScript doesn't support writing type aliases inside a class body.
	_RowName extends TRows[number]["name"] = TRows[number]["name"],
	_ColName extends TColumns[number]["name"] = TColumns[number]["name"]
> {
	private turnsLeft: number;
	private callRow: null | _RowName;
	private cellFilled: boolean[][];
	private matrix: Array<Array<number | undefined>>;

	public readonly rows: TRows;
	public readonly columns: TColumns;

	constructor(rows: TRows, columns: TColumns) {
		this.turnsLeft = rows.length * columns.length;
		this.rows = rows;
		this.columns = columns;
		this.callRow = null;
		this.cellFilled = array(rows.length, () =>
			array(columns.length, () => false),
		);
		this.matrix = array(rows.length, () =>
			array(columns.length, () => undefined),
		);
	}

	calling(): null | _RowName {
		return this.callRow;
	}

	active(): boolean {
		return this.turnsLeft > 0;
	}

	score(): number {
		let score = 0;
		for (const row of this.matrix) {
			for (const val of row) {
				if (val !== undefined) {
					score += val;
				}
			}
		}

		return score;
	}

	getPos(row: _RowName, column: _ColName): [number, number] {
		const rowIndex = this.rows.findIndex(x => x.name === row);
		const columnIndex = this.columns.findIndex(x => x.name === column);

		if (rowIndex === -1 || columnIndex === -1) {
			throw new Error(`Field (${row}, ${column}) is invalid.`);
		}

		return [rowIndex, columnIndex];
	}

	scoreContext(
		row: Row,
		column: Column,
		diceContext: DiceContext,
	): ScoreContext {
		return {
			...diceContext,
			row,
			column,
			game: this,
		};
	}

	getScore(dice: Dice, row: _RowName, column: _ColName): undefined | number {
		const [rowIndex, columnIndex] = this.getPos(row, column);

		if (this.matrix[rowIndex][columnIndex] !== undefined) {
			return this.matrix[rowIndex][columnIndex];
		}

		if (this.callRow && (column !== call.name || row !== this.callRow)) {
			return undefined;
		}

		const rowScore = this.rows[rowIndex].score(
			this.scoreContext(
				this.rows[rowIndex],
				this.columns[columnIndex],
				dice.context(),
			),
		);
		const columnScore = this.columns[columnIndex].score(
			this.scoreContext(
				this.rows[rowIndex],
				this.columns[columnIndex],
				dice.context(),
			),
		);
		if (rowScore === undefined || columnScore === undefined) {
			return undefined;
		}
		return rowScore + columnScore;
	}

	call(dice: Dice, row: _RowName): boolean {
		if (
			dice.roll !== 1 ||
			this.callRow ||
			this.filled(row, call.name as _ColName)
		) {
			return false;
		}

		this.callRow = row;
		return true;
	}

	field(row: _RowName, column: _ColName): undefined | number {
		const [rowIndex, columnIndex] = this.getPos(row, column);
		return this.matrix[rowIndex][columnIndex];
	}

	filled(row: _RowName, column: _ColName): boolean {
		const [rowIndex, columnIndex] = this.getPos(row, column);
		return this.cellFilled[rowIndex][columnIndex];
	}

	canPlay(dice: Dice, row: _RowName, column: _ColName): boolean {
		if (this.callRow) {
			return row === this.callRow && column === call.name;
		}

		return (
			!this.filled(row, column) &&
			this.getScore(dice, row, column) !== undefined
		);
	}

	play(dice: Dice, row: _RowName, column: _ColName): void {
		if (!this.canPlay(dice, row, column)) {
			throw new Error("Invalid move");
		}

		const score = this.getScore(dice, row, column);
		if (score === undefined) {
			throw new Error("Score should be defined.");
		}
		const [rowIndex, columnIndex] = this.getPos(row, column);
		this.matrix[rowIndex][columnIndex] = score;
		this.cellFilled[rowIndex][columnIndex] = true;
		this.turnsLeft -= 1;

		if (this.callRow && this.callRow === row) {
			this.callRow = null;
		}
	}
}

export type { Yamb };

export function create(rows: readonly Row[], columns: readonly Column[]): Yamb {
	return new Yamb(rows, columns);
}
