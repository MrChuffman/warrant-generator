interface StorageOptions {
	prefix?: string;
	storage?: Storage;
}

const defaultOptions: StorageOptions = {
	prefix: 'app_',
	storage: typeof window !== 'undefined' ? window.localStorage : undefined
};

export function createStorage(options: StorageOptions = {}) {
	const opts = { ...defaultOptions, ...options };
	const { prefix = '', storage } = opts;

	// Add proxy handler to make storage spreadable
	const handler = {
		get(target: any, prop: string) {
			if (prop in target) {
				return target[prop];
			}
			// Allow accessing storage values as properties
			return target.get(prop);
		},

		// Optional: Allow setting values through property access
		set(target: any, prop: string, value: any) {
			if (prop in target) {
				target[prop] = value;
				return true;
			}
			target.set(prop, value);
			return true;
		}
	};

	const storageAPI = {
		get<T>(key: string): T | null {
			try {
				const item = storage?.getItem(prefix + key);
				if (item === null) return null;
				return JSON.parse(item) as T;
			} catch (e) {
				console.error('Error getting item from storage:', e);
				return null;
			}
		},

		set<T>(key: string, value: T): void {
			try {
				storage?.setItem(prefix + key, JSON.stringify(value));
			} catch (e) {
				console.error('Error setting item in storage:', e);
			}
		},

		remove(key: string): void {
			try {
				storage?.removeItem(prefix + key);
			} catch (e) {
				console.error('Error removing item from storage:', e);
			}
		},

		clear(): void {
			try {
				if (!prefix) {
					storage?.clear();
					return;
				}
				const keys = Object.keys(storage || {});
				for (const key of keys) {
					if (key.startsWith(prefix)) {
						storage?.removeItem(key);
					}
				}
			} catch (e) {
				console.error('Error clearing storage:', e);
			}
		},

		// Add method to get all storage entries
		getAll() {
			const entries: Record<string, any> = {};
			try {
				const keys = Object.keys(storage || {})
					.filter((key) => key.startsWith(prefix))
					.map((key) => key.slice(prefix.length));

				for (const key of keys) {
					entries[key] = this.get(key);
				}
			} catch (e) {
				console.error('Error getting all storage entries:', e);
			}
			return entries;
		},

		reactive<T>(key: string, initialValue: T) {
			const stored = this.get<T>(key);
			let value = $state(stored !== null ? stored : initialValue);

			$effect(() => {
				this.set(key, value);
			});

			return {
				get value() {
					return value;
				},
				set value(newValue: T) {
					value = newValue;
				}
			};
		}
	};

	// Return proxied storage API
	return new Proxy(storageAPI, handler);
}
