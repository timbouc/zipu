/**
 * @timbouc/zipu
 *
 * @license MIT
 * @copyright Timbouc - Augustus Okoye<augustus@timbouc.com>
 */

export default {
  /**
   * --------------------------------------------------------------------------
   * Default client
   * --------------------------------------------------------------------------
   */
	default_client: "pulsar",

  /**
   * --------------------------------------------------------------------------
   * Optional delay for throttling data storage writes (ms)
   * Defaults to 1000
   * --------------------------------------------------------------------------
   */
	clients: {

    /**
     * Pulsar config
     */
    pulsar: {
      name: "pulsar",
      url: "pulsar://127.0.0.1:6650",

      /**
       * All  pulsar-client client options. Except `serviceUrl`
       */
      client: {
        //
      },

      /**
       * All pulsar-client producer options are acceptable
       */
      producer: {
        producerName: "svc1",
        sendTimeout: 40000,
      },

      /**
       * All pulsar-client consumer options are acceptable
       */
      consumer: {
        autoAck: true,
        subscription: "svc1",
        subscriptionType: "Exclusive", // defaults to "Shared"
      },
    },

    /**
     * Kafka config
     */
    kafka: {
      name: "kafka",
      url: "127.0.0.1:9092",

      /**
       * All kafka-node client options. Except `kafkaHost`
       */
      client: {
        requestTimeout: 60000,
        idleConnection: 3600000,
        maxAsyncRequests: 10,
        sslOptions: {
          rejectUnauthorized: true,
        },
        sasl: {
          mechanism: "PLAIN",
          username: "user",
          password: "password",
        }
      },

      /**
       * All kafka-node producer options are acceptable
       */
      producer: {
        requireAcks: 1,
        ackTimeoutMs: 200,
        partitionerType: 0,
      },

      /**
       * All pulsar-client consumer options are acceptable
       */
      consumer: {
        autoCommit: true,
        groupId: "svc1",
        fromOffset: 'latest',
        encoding: 'buffer',
      },
    },
  },
};
