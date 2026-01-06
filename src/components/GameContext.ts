import { createContext, useContext } from 'react';
import type BaseGame from '../ollie-bird/core/BaseGame';

export const GameContext = createContext<BaseGame | null>(null);

export default function useGameContext() {
	const game = useContext(GameContext);

	if (!game) {
		throw new Error(
			'useGameContext must be used within a GameContext.Provider',
		);
	}

	return game;
}
