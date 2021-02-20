/**
 * @timbouc/zipu
 *
 * @license MIT
 * @copyright Timbouc - Augustus Okoye<augustus@timbouc.com>
 */

export default {
  serialise: (data: any): string => JSON.stringify(data),
  parse: (data: string): any => JSON.parse(data)
};
