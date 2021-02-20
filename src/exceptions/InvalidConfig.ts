/**
 * @timbouc/zipu
 *
 * @license MIT
 * @copyright Timbouc - Augustus Okoye<augustus@timbouc.com>
 */


export class InvalidConfig extends Error {
	public static missingDefaultClient(): InvalidConfig {
		return new this('Make sure to define a default client inside config file');
	}
}
