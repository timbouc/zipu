/**
 * @timbouc/zipu
 *
 * @license MIT
 * @copyright Timbouc - Augustus Okoye<augustus@timbouc.com>
 */

import { expect } from "chai";
import { PulsarClientConfig, PulsarAdapter } from "../src";

const config: PulsarClientConfig = {
	name: "pulsar",
	url: "pulsar://localhost:6650",
	consumer: {
	  autoAck: true,
	  subscription: "svc1",
	  subscriptionType: "Shared"
	}
};

describe('Pulsar Adapter', () => {
	const adapter = new PulsarAdapter(config.url, config);
	it('test throttling', () => {
		//
	});
});
