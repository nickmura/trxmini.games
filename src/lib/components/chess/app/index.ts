import { Chessground as _Chessground } from 'chessground/chessground';
import cgStylesHelper from './_stylesHelper';
import type { Api } from 'chessground/api';
import type { Config } from 'chessground/config';

function Chessground(
	node: HTMLElement,
	{ config, initializer }: CgActionParams
): { update: (params: CgActionParams) => void; destroy: () => void } {
	let api: Api;
	function update(params: CgActionParams) {
		api = _Chessground(node, params.config);
		params.initializer?.(api);
	}
	update({ config, initializer });

	return {
		update,
		destroy() {
			api.destroy();
		}
	};
}

type initFn = (api: Api) => void;
interface CgActionParams {
	config?: Config;
	initializer?: initFn;
}

export { Chessground, cgStylesHelper };
export type { Config, Api, CgActionParams };
