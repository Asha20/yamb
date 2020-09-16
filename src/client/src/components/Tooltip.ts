import * as m from "mithril";

interface TooltipAttrs {
	tip: string;
}

export const Tooltip = {
	view(vnode: m.Vnode<TooltipAttrs>) {
		return m(`span.tooltip[data-text="${vnode.attrs.tip}"]`, vnode.children);
	},
};
