/**
 * @timbouc/zipu
 *
 * @license MIT
 * @copyright Timbouc - Augustus Okoye<augustus@timbouc.com>
 */

import {
  TopicName,
  TopicDataType,
  ClientConfig,
  Config,
  Serialiser,
  AdapterEvents,
  ClientConfigName,
  AdapterClientConfig,
  SubscriptionOption
} from "./types";
import { AbstractAdapter, PulsarAdapter, KafkaAdapter } from "./adapters";
import serialiser from "./serialiser";
import { ClientNotSupported } from "./exceptions";

export class Client<E> {
  // @ts-ignore
  private adapter: AbstractAdapter;
  private serialiser: Serialiser;
  private $config: Config;

  /**
   * Alias of publish(...)
   */
  public send: <T extends TopicName<E>, D extends TopicDataType<T, E>>(
    topic: T,
    data: TopicDataType<T, E>
  ) => Promise<D>;

  constructor(config: Config, default_client?: ClientConfigName) {
    this.$config = config;
    let client_adapter = default_client?? config.default_client;
    if (!client_adapter) {
      // @ts-ignore
      client_adapter = Object.values(config.clients)[0].name;
    }

    this.initAdapter(client_adapter, (config.clients as ClientConfig["clients"])[client_adapter]);

    this.send = this.publish;
    this.serialiser = serialiser;
  }

  /**
   * Get a new instance from save config
   * @param {ClientConfigName} default_client
   * @returns {Client}
   */
  public make(default_client?: ClientConfigName){
    return new Client(this.$config, default_client);
  }

  /**
   * Publish data on a topic.
   *
   * @param topic
   * @param data
   */
  public async publish<T extends TopicName<E>, D extends TopicDataType<T, E>>(
    topic: T,
    data: TopicDataType<T, E>
  ): Promise<D> {
    await this.adapter.send(topic, this.serialiser.serialise(data));
    return data as D;
  }

  /**
   * Create a subscription to a topic. Optional callback adds a listener.
   * Further calls with the same topic does not creeate new subscriptions.
   * Further calls with the same topic with callback adds a new listener.
   *
   * @param topic
   * @param callback
   * @param options
   */
  public subscribe<T extends TopicName<E>, D extends TopicDataType<T, E>>(
    topic: T,
    callback: (data: D, ack: () => void) => unknown,
    options?: SubscriptionOption<ClientConfigName>
  ) {
    this.adapter.subscribe(topic, (data, ack) => {
      callback(this.serialiser.parse(data), ack);
    }, options);
  }

  /**
   * Add a listender to topic (event) subscription.
   *
   * @param event
   * @param callback
   */
  public on<T extends TopicName<E>, D extends TopicDataType<T, E>>(
    event: T,
    callback: (data: D, ack: () => void) => unknown
  ): void;
  public on(
    event: AdapterEvents,
    callback: (data: any) => void
  ): void;
  public on(event: string, callback: (...args: any[]) => void): void {
    this.adapter.on(event, (data, ack) => {
      callback(this.serialiser.parse(data), ack);
    });
  }

  /**
   * Close connections
   * @param {boolean} options.producer
   * @param {boolean} options.consumer
   */
  public async close({ producer = true, consumer = true }) {
    if (!(producer && consumer)) {
      return;
    }

    this.adapter.close();
  }

  /**
   * Initialise client adapter from name
   * @param {ClientConfigName} name
   * @param {ClientConfigs} config
   * @throws {Error}
   */
  private initAdapter<
    T extends ClientConfigName,
    C extends AdapterClientConfig<T>
  >(name: T | string, config: C) {
    if (name === "pulsar") {
      this.adapter = new PulsarAdapter(
        config.url,
        config as AdapterClientConfig<"pulsar">
      );
    } else if (name === "kafka") {
      this.adapter = new KafkaAdapter(
        config.url,
        config as AdapterClientConfig<"kafka">
      );
    } else {
      throw new ClientNotSupported(name);
    }
  }
}
