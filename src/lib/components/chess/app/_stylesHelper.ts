interface Params {
	boardUrl?: string;
	piecesFolderUrl?: string;
	pieceFileExt?: string;
}

export default function (
	node: HTMLElement,
	params: Params
): { update: (newParams: Params) => void } {
	setURLVars(node, params);

	return {
		update(newParams: Params) {
			setURLVars(node, newParams);
		}
	};
}

function setURLVars(
	node: HTMLElement,
	{ boardUrl, piecesFolderUrl, pieceFileExt = 'svg' }: Params
) {
	const PIECE_NAMES = ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP', 'bK', 'bQ', 'bR', 'bB', 'bN', 'bP'];

	if (boardUrl) {
		node.style.setProperty('--cg-url-board', `url(${boardUrl})`);
	}

	if (piecesFolderUrl) {
		for (const pieceName of PIECE_NAMES) {
			node.style.setProperty(
				`--cg-url-${pieceName}`,
				`url(${piecesFolderUrl}/${pieceName}.${pieceFileExt})`
			);
		}
	}
}
