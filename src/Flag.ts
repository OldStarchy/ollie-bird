/**
 * A boolean flag that can be set and reset.
 *
 * Once set, the next call to {@link reset} will return true, and then the flag will be unset again.
 */
export default class Flag {
	#set = false;

	/**
	 * Sets this flag so that the next call to {@link reset} returns true
	 */
	set() {
		this.#set = true;
	}

	/**
	 * Unsets the flag, and returns true if it was set.
	 */
	reset() {
		const set = this.#set;
		this.#set = false;
		return set;
	}
}
