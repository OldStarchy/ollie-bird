import { useCallback, useEffect, useRef, useState } from 'react';
import OllieBirdGame from '../ollie-bird/OllieBirdGame';

declare global {
	interface GameEventMap {
		loadLevel: string;
		getLevelData: (data: string) => void;
	}
}

function OllieBirdGameComponent() {
	const rootRef = useRef<HTMLCanvasElement>(null);
	const [game, setGame] = useState<OllieBirdGame>();

	useEffect(() => {
		if (!rootRef.current) return;

		const game = new OllieBirdGame(rootRef.current);
		game.start();
		setGame(game);

		return () => {
			game.stop();
			setGame(undefined);
		};
	}, []);

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'block',
			}}
		>
			{game && (
				<div
					style={{
						position: 'absolute',
						top: 10,
						left: 10,
						zIndex: 1000,
					}}
				>
					<LevelPicker game={game} />
				</div>
			)}

			<canvas
				style={{
					width: '100%',
					height: '100%',
					display: 'block',
				}}
				ref={rootRef}
			/>
		</div>
	);
}

const localStorageKeyPrefix = 'ollie-bird-level-';

(() => {
	for (const key in localStorage) {
		const match = /^level_(?<numeral>\d+)$/.exec(key);
		if (match) {
			const numeral = match.groups?.numeral;
			if (numeral) {
				const newKey = localStorageKeyPrefix + 'Imported-' + numeral;
				localStorage.setItem(newKey, localStorage.getItem(key) || '');
				localStorage.removeItem(key);
			}
		}
	}
})();

function LevelPicker({ game }: { game: OllieBirdGame }) {
	const [levels, setLevels] = useState<string[]>([]);
	const [visible, setVisible] = useState<boolean>(false);

	const refreshLevels = useCallback(() => {
		setLevels(
			Object.keys(localStorage).filter((key) =>
				key.startsWith(localStorageKeyPrefix),
			),
		);
	}, []);

	useEffect(() => refreshLevels(), []);

	const loadLevel = (levelName: string) => {
		const data = localStorage.getItem(localStorageKeyPrefix + levelName);
		if (data) {
			game.event.emit('loadLevel', data);
		}
	};
	const loadEmpty = () => {
		game.event.emit('loadLevel', '{}');
	};

	const saveLevel = (levelName: string) => {
		let data: string | null = null;

		game.event.emit('getLevelData', (d: string) => {
			data = d;
		});

		if (data === null) {
			alert('Failed to get level data for saving.');
			return;
		}

		localStorage.setItem(localStorageKeyPrefix + levelName, data);

		refreshLevels();
	};

	const deleteLevel = (levelName: string) => {
		localStorage.removeItem(localStorageKeyPrefix + levelName);
		refreshLevels();
	};

	const duplicateLevel = (levelName: string) => {
		const data = localStorage.getItem(localStorageKeyPrefix + levelName);
		if (data) {
			const newLevelName = prompt(
				'Enter a name for the duplicated level:',
				levelName + '-copy',
			);
			if (newLevelName) {
				localStorage.setItem(
					localStorageKeyPrefix + newLevelName,
					data,
				);
				refreshLevels();
			}
		}
	};

	const exportLevel = (levelName: string) => {
		const data = localStorage.getItem(localStorageKeyPrefix + levelName);
		if (data) {
			navigator.clipboard.writeText(data).then(() => {
				alert('Level data copied to clipboard.');
			});
		}
	};

	const importLevel = () => {
		const data = prompt('Paste level data:');
		if (data) {
			const levelName = prompt('Enter a name for the imported level:');
			if (levelName) {
				localStorage.setItem(localStorageKeyPrefix + levelName, data);
				refreshLevels();
			}
		}
	};

	if (!visible) {
		return (
			<button
				style={{
					border: '1px outset black',
					backgroundColor: 'lightgray',
					color: 'black',
					padding: '0.25rem 0.5rem',
				}}
				className="showOnHover"
				onClick={() => setVisible(true)}
			>
				Levels
			</button>
		);
	}
	return (
		<div
			style={{
				backgroundColor: 'white',
				color: 'black',
				border: '1px solid black',
				padding: 10,
			}}
		>
			<button
				style={{
					position: 'absolute',
					right: '0.5rem',
					top: '0.5rem',
					width: '1.5rem',
					height: '1.5rem',
					textAlign: 'center',
					border: '1px outset black',
					backgroundColor: 'lightgray',
				}}
				onClick={() => setVisible(false)}
			>
				X
			</button>
			<h3>Levels</h3>
			<ul style={{ paddingLeft: '0.5rem' }}>
				{levels.map((levelKey) => {
					const levelName = levelKey.substring(
						localStorageKeyPrefix.length,
					);
					return (
						<li key={levelKey}>
							{levelName}
							<button
								style={{
									border: '1px outset black',
									backgroundColor: 'lightgray',
									padding: '0 0.25rem',
									marginLeft: '0.5rem',
								}}
								onClick={() => loadLevel(levelName)}
							>
								Load
							</button>
							<button
								style={{
									border: '1px outset black',
									backgroundColor: 'lightgray',
									padding: '0 0.25rem',
									marginLeft: '0.5rem',
								}}
								onClick={() => saveLevel(levelName)}
							>
								Overwrite
							</button>
							<button
								style={{
									border: '1px outset black',
									backgroundColor: 'lightgray',
									padding: '0 0.25rem',
									marginLeft: '0.5rem',
								}}
								onClick={() => exportLevel(levelName)}
							>
								Export
							</button>
							<button
								style={{
									border: '1px outset black',
									backgroundColor: 'lightgray',
									padding: '0 0.25rem',
									marginLeft: '0.5rem',
								}}
								onClick={() => duplicateLevel(levelName)}
							>
								Duplicate
							</button>
							<button
								style={{
									border: '1px outset black',
									backgroundColor: 'lightgray',
									padding: '0 0.25rem',
									marginLeft: '0.5rem',
								}}
								onClick={() => deleteLevel(levelName)}
							>
								Delete
							</button>
						</li>
					);
				})}
			</ul>
			<div>
				<input
					type="text"
					id="new-level-name"
					placeholder="Level name"
					style={{
						backgroundColor: '#eaeaea',
						borderBottom: '1px solid black',
					}}
				/>
				<button
					style={{
						border: '1px outset black',
						backgroundColor: 'lightgray',
						padding: '0 0.25rem',
					}}
					onClick={() => {
						const input = document.getElementById(
							'new-level-name',
						) as HTMLInputElement;
						if (input && input.value) {
							saveLevel(input.value);
							input.value = '';
						} else {
							alert('Please enter a level name.');
						}
					}}
				>
					Save Current Level
				</button>
			</div>
			<div>
				<button
					style={{
						border: '1px outset black',
						backgroundColor: 'lightgray',
						padding: '0 0.25rem',
						marginLeft: '0.5rem',
					}}
					onClick={() => importLevel()}
				>
					Import Level
				</button>

				<button
					style={{
						border: '1px outset black',
						backgroundColor: 'lightgray',
						padding: '0 0.25rem',
						marginLeft: '0.5rem',
					}}
					onClick={() => {
						loadEmpty();
					}}
				>
					Clear
				</button>
			</div>
		</div>
	);
}

export default OllieBirdGameComponent;
