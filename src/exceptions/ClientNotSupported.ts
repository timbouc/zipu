/**
 * @timbouc/zipu
 *
 * @license MIT
 * @copyright Timbouc - Augustus Okoye<augustus@timbouc.com>
 */

export class ClientNotSupported extends Error{
	constructor(name: string) {
		super(`Client ${name} is not supported`);
	}
}
