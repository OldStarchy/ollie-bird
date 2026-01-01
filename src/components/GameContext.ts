import { createContext, useContext } from 'react';
import type BaseGame from '../ollie-bird/core/BaseGame';

export const GameContext = createContext<BaseGame | null>(null);

export default function useGameContext() {
	return useContext(GameContext);
}
