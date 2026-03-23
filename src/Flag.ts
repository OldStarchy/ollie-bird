/**
 * Like the little flag on a mailbox.
 */
export default class Flag {
	#set = false;

	set() {
		this.#set = true;
	}

	/**
	 * Unsets the flag, and returns true if it was set.
	 */
	take() {
		const set = this.#set;
		this.#set = false;
		return set;
	}
}
