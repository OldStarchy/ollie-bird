import type EventSource from '../ollie-bird/EventSource';

export interface NotifyPropertyChanged {
	propertyChanged: EventSource<{
		change: { name: PropertyKey; newValue: any };
	}>;
}
