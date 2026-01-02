import { Fragment, useCallback, useEffect, useState } from 'react';
import OllieBirdGame from '../ollie-bird/OllieBirdGame';
import Button from './Button';
import Card from './Card';
import Input from './Input';

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

export default function LevelPicker({
	game,
	onClose,
}: {
	game: OllieBirdGame;
	onClose?: () => void;
}) {
	const [levels, setLevels] = useState<string[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const [levelName, setLevelName] = useState<string>('');

	const refreshLevels = useCallback(() => {
		setLevels(
			Object.keys(localStorage).filter((key) =>
				key.startsWith(localStorageKeyPrefix),
			),
		);
	}, []);

	useEffect(() => refreshLevels(), [refreshLevels]);

	const loadLevel = (levelName: string) => {
		const data = localStorage.getItem(localStorageKeyPrefix + levelName);
		if (data) {
			game.event.emit('loadLevel', data);
			setLevelName(levelName);
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
			<Button
				css={{
					border: '1px outset black',
					padding: '0.25rem 0.5rem',
					opacity: 0.5,
					transition: 'opacity 200ms',
					'&:hover': {
						opacity: 1,
					},
				}}
				onClick={() => setVisible(true)}
			>
				Levels
			</Button>
		);
	}

	levels.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

	return (
		<Card>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '1rem',
				}}
			>
				<Button
					style={{
						position: 'absolute',
						right: '0.5rem',
						top: '0.5rem',
						width: '1.5rem',
						height: '1.5rem',
						textAlign: 'center',
						borderRadius: '50%',
					}}
					onClick={() => {
						setVisible(false);
						onClose?.();
					}}
				>
					X
				</Button>
				<h3>Levels</h3>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr repeat(5, auto)',
						gap: '0.5rem',
						marginLeft: '0.5rem',
					}}
				>
					{levels.map((levelKey) => {
						const levelName = levelKey.substring(
							localStorageKeyPrefix.length,
						);
						return (
							<Fragment key={levelKey}>
								<span>{levelName}</span>
								<Button onClick={() => loadLevel(levelName)}>
									Load
								</Button>
								<Button
									variant="destructive"
									onClick={() => saveLevel(levelName)}
								>
									Overwrite
								</Button>
								<Button onClick={() => exportLevel(levelName)}>
									Copy
								</Button>
								<Button
									onClick={() => duplicateLevel(levelName)}
								>
									Duplicate
								</Button>
								<Button
									variant="destructive"
									onClick={() => deleteLevel(levelName)}
								>
									Delete
								</Button>
							</Fragment>
						);
					})}
				</div>
				<form
					style={{
						display: 'flex',
						gap: '0.5rem',
					}}
					onSubmit={(e) => {
						e.preventDefault();

						if (levelName) {
							if (
								levels.includes(
									localStorageKeyPrefix + levelName,
								)
							) {
								if (
									!confirm(
										'A level with this name already exists. Overwrite?',
									)
								) {
									return;
								}
							}

							saveLevel(levelName);
						} else {
							alert('Please enter a level name.');
						}
					}}
				>
					<Input
						type="text"
						id="new-level-name"
						placeholder="Level name"
						value={levelName}
						onChange={(e) => setLevelName(e.target.value)}
					/>
					<Button>Save</Button>
				</form>
				<div
					style={{
						display: 'flex',
						gap: '0.5rem',
					}}
				>
					<Button onClick={() => importLevel()}>Import Level</Button>

					<Button
						variant="destructive"
						onClick={() => {
							loadEmpty();
						}}
					>
						Clear Level
					</Button>
				</div>
			</div>
		</Card>
	);
}
