import m from "mithril";
import { classNames, PlayerColor } from "common";

interface ColorCircleAttrs {
	color: PlayerColor;
	selected?: boolean;
	inline?: boolean;
}

type InlineColorCircleAttrs = Omit<ColorCircleAttrs, "inline">;

export const ColorCircle: m.Component<ColorCircleAttrs> = {
	view({ attrs }) {
		const { color, selected = false, inline = false } = attrs;
		const classes = classNames({
			["bg-color--" + color]: true,
			"color-circle--selected": selected,
		});

		return m(
			".color-circle__shell",
			{ class: classNames({ "color-circle__shell--inline": inline }) },
			m(".color-circle", { class: classes }, m(".color-circle__indicator")),
		);
	},
};

export const InlineColorCircle: m.Component<InlineColorCircleAttrs> = {
	view({ attrs }) {
		return m(ColorCircle, { ...attrs, inline: true });
	},
};
