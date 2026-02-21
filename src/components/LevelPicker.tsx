import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import LevelGameplayManager from '../ollie-bird/modules/LevelGameplayManager';
import Button from './Button';
import Card from './Card';
import useGameContext from './GameContext';
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

export default function LevelPicker({ onClose }: { onClose?: () => void }) {
	const game = useGameContext();
	const [levels, setLevels] = useState<string[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const [levelName, setLevelName] = useState<string>('');
	const [errors, setErrors] = useState<
		{ message: string; cause: string[] }[]
	>([]);

	const refreshLevels = useCallback(() => {
		setLevels(
			Object.keys(localStorage).filter((key) =>
				key.startsWith(localStorageKeyPrefix),
			),
		);
	}, []);

	useEffect(() => refreshLevels(), [refreshLevels]);

	const levelEditor = useMemo(() => {
		if (!game) return null;

		return (
			game
				.getObjects()
				.map((obj) => obj.getModule(LevelGameplayManager))
				.find((m) => m !== null) ?? null
		);
	}, [game]);

	const loadLevel = (levelName: string) => {
		const data = localStorage.getItem(localStorageKeyPrefix + levelName);
		if (data) {
			levelEditor?.loadLevelData(data).match(
				() => setErrors([]),
				(errors) => setErrors(errors),
			);
			setLevelName(levelName);
		}
	};

	const loadEmpty = () => {
		levelEditor?.loadLevelData('{}').match(
			() => setErrors([]),
			(errors) => setErrors(errors),
		);
	};

	const saveLevel = (levelName: string) => {
		const data = levelEditor?.getLevelData() ?? null;

		if (data === null) {
			setErrors([
				{ message: 'Failed to get level data for saving.', cause: [] },
			]);
			return;
		}

		localStorage.setItem(localStorageKeyPrefix + levelName, data);
		setErrors([]);

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
				{errors.length > 0 && (
					<div>
						{errors.map((error, index) => (
							<div key={index}>
								<p>⚠️ {error.message}</p>
								{error.cause.length > 0 && (
									<ul style={{ marginLeft: '1rem' }}>
										{error.cause.map((cause, i) => (
											<li key={i}>{cause}</li>
										))}
									</ul>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</Card>
	);
}
