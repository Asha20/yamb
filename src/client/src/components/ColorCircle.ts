import m from "mithril";
import { classNames, PlayerColor } from "common";

interface ColorCircleAttrs {
	color: PlayerColor;
	selected?: boolean;
}

export const ColorCircle: m.Component<ColorCircleAttrs> = {
	view({ attrs }) {
		const { color, selected = false } = attrs;
		const classes = classNames({
			["bg-color--" + color]: true,
			"color-circle--selected": selected,
		});

		return m(
			".color-circle__shell",
			m(".color-circle", { class: classes }, m(".color-circle__indicator")),
		);
	},
};
