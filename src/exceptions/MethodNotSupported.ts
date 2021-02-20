/**
 * @timbouc/zipu
 *
 * @license MIT
 * @copyright Timbouc - Augustus Okoye<augustus@timbouc.com>
 */


export class MethodNotSupported extends Error {
	constructor(name: string) {
		super(`Method ${name} is not supported or implemented`);
	}
}
