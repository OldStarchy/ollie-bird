import { describe, expect, test, vi } from 'vitest';
import type IGame from '../IGame';
import Obstacle from './Obstacle';
import Goal from './Goal';
import SpawnPoint from './SpawnPoint';
import BaddieSpawner from './BaddieSpawner';
import SequentialGate from './SequentialGate';

describe('GameObject Serialization', () => {
	// Create a mock game object for testing
	const mockGame = {
		keyboard: {},
		mouse: {},
		physics: { g: 9.8 },
		canvas: document.createElement('canvas'),
		event: {
			on: vi.fn(),
			emit: vi.fn(),
		},
		spawn: vi.fn(),
		destroy: vi.fn(),
		findObjectsByTag: vi.fn(),
		findObjectsByType: vi.fn(),
		getObjects: vi.fn(),
		restart: vi.fn(),
		updatesPerSecond: 60,
		secondsPerFrame: 1 / 60,
	} as unknown as IGame;

	describe('Obstacle', () => {
		test('should serialize correctly', () => {
			const obstacle = new Obstacle(mockGame);
			obstacle.transform.position.set(100, 200);
			obstacle.setSize(50, 75);

			const serialized = obstacle.serialize();

			expect(serialized).toEqual({
				$type: 'Obstacle',
				x: 100,
				y: 200,
				width: 50,
				height: 75,
			});
		});

		test('should deserialize correctly', () => {
			const data = {
				$type: 'Obstacle',
				x: 100,
				y: 200,
				width: 50,
				height: 75,
			};

			(mockGame.spawn as any) = vi.fn(() => new Obstacle(mockGame));
			const obstacle = Obstacle.spawnDeserialize(mockGame, data);

			expect(obstacle).not.toBeNull();
			expect(obstacle!.transform.position.x).toBe(100);
			expect(obstacle!.transform.position.y).toBe(200);
			expect(obstacle!.width).toBe(50);
			expect(obstacle!.height).toBe(75);
		});

		test('should return null for invalid data', () => {
			const invalidData = { $type: 'Obstacle', x: 'invalid' };
			const obstacle = Obstacle.spawnDeserialize(mockGame, invalidData);
			expect(obstacle).toBeNull();
		});
	});

	describe('Goal', () => {
		test('should serialize correctly', () => {
			const goal = new Goal(mockGame);
			goal.transform.position.set(300, 400);
			goal.setSize(60, 80);

			const serialized = goal.serialize();

			expect(serialized).toEqual({
				$type: 'Goal',
				x: 300,
				y: 400,
				width: 60,
				height: 80,
			});
		});

		test('should deserialize correctly', () => {
			const data = {
				$type: 'Goal',
				x: 300,
				y: 400,
				width: 60,
				height: 80,
			};

			(mockGame.spawn as any) = vi.fn(() => new Goal(mockGame));
			const goal = Goal.spawnDeserialize(mockGame, data);

			expect(goal).not.toBeNull();
			expect(goal!.transform.position.x).toBe(300);
			expect(goal!.transform.position.y).toBe(400);
			expect(goal!.width).toBe(60);
			expect(goal!.height).toBe(80);
		});
	});

	describe('SequentialGate', () => {
		test('should serialize correctly with sequence number', () => {
			const gate = new SequentialGate(mockGame);
			gate.transform.position.set(150, 250);
			gate.setSize(40, 60);
			gate.sequenceNumber = 3;

			const serialized = gate.serialize();

			expect(serialized).toEqual({
				$type: 'SequentialGate',
				x: 150,
				y: 250,
				width: 40,
				height: 60,
				sequenceNumber: 3,
			});
		});

		test('should deserialize correctly with sequence number', () => {
			const data = {
				$type: 'SequentialGate',
				x: 150,
				y: 250,
				width: 40,
				height: 60,
				sequenceNumber: 3,
			};

			(mockGame.spawn as any) = vi.fn(() => new SequentialGate(mockGame));
			const gate = SequentialGate.spawnDeserialize(mockGame, data);

			expect(gate).not.toBeNull();
			expect(gate!.transform.position.x).toBe(150);
			expect(gate!.transform.position.y).toBe(250);
			expect(gate!.width).toBe(40);
			expect(gate!.height).toBe(60);
			expect(gate!.sequenceNumber).toBe(3);
		});
	});

	describe('SpawnPoint', () => {
		test('should serialize correctly', () => {
			const spawn = new SpawnPoint(mockGame);
			spawn.transform.position.set(50, 100);

			const serialized = spawn.serialize();

			expect(serialized).toEqual({
				$type: 'SpawnPoint',
				x: 50,
				y: 100,
			});
		});

		test('should deserialize correctly', () => {
			const data = {
				$type: 'SpawnPoint',
				x: 50,
				y: 100,
			};

			(mockGame.spawn as any) = vi.fn(() => new SpawnPoint(mockGame));
			const spawn = SpawnPoint.spawnDeserialize(mockGame, data);

			expect(spawn).not.toBeNull();
			expect(spawn!.transform.position.x).toBe(50);
			expect(spawn!.transform.position.y).toBe(100);
		});

		test('should return null for invalid data', () => {
			const invalidData = { $type: 'SpawnPoint' }; // missing x and y
			const spawn = SpawnPoint.spawnDeserialize(mockGame, invalidData);
			expect(spawn).toBeNull();
		});
	});

	describe('BaddieSpawner', () => {
		test('should serialize correctly', () => {
			const spawner = new BaddieSpawner(mockGame);
			spawner.transform.position.set(250, 350);

			const serialized = spawner.serialize();

			expect(serialized).toEqual({
				$type: 'BaddieSpawner',
				x: 250,
				y: 350,
			});
		});

		test('should deserialize correctly', () => {
			const data = {
				$type: 'BaddieSpawner',
				x: 250,
				y: 350,
			};

			(mockGame.spawn as any) = vi.fn(() => new BaddieSpawner(mockGame));
			const spawner = BaddieSpawner.spawnDeserialize(mockGame, data);

			expect(spawner).not.toBeNull();
			expect(spawner!.transform.position.x).toBe(250);
			expect(spawner!.transform.position.y).toBe(350);
		});
	});
});
