import * as m from "mithril";

interface TooltipAttrs {
	tip: string;
}

export const Tooltip: m.Component<TooltipAttrs> = {
	view(vnode) {
		return m(`span.tooltip[data-text="${vnode.attrs.tip}"]`, vnode.children);
	},
};
