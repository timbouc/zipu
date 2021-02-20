/**
 * @timbouc/zipu
 *
 * @license MIT
 * @copyright Timbouc - Augustus Okoye<augustus@timbouc.com>
 */

import Pulsar, { SubscribeOpts, Producer as PulsarProducer, Consumer as PulsarConsumer } from "pulsar-client";
import { AbstractAdapter } from "./AbstractAdapter";
import { AdapterClientConfig, SubscriptionOption, ProducerOption } from "../types";
import { Producer as BaseProducer } from "./Producer";
import { get } from "lodash";
import { MethodNotSupported } from "src/exceptions";

type SubscriptionOptions = SubscriptionOption<"pulsar">;
type AdapterConfig = AdapterClientConfig<"pulsar">;

type ProducerOptions = ProducerOption<"pulsar">;
type PulsarSubscriberOptions = Omit<SubscribeOpts, "topic" | "listener">;

class Producer extends BaseProducer {
  private timer: NodeJS.Timeout;
  protected driver: PulsarProducer;

  constructor(driver: PulsarProducer, timeout: number, callback: () => void) {
    super();
    this.driver = driver;
    this.timer = setTimeout(callback, timeout);
    this.start()
  }

  /**
   * Send data
   * @param {D} data
   */
  async send<D>(topic: string, data: D): Promise<D> {
    clearTimeout(this.timer);
    return this.send(topic, data);
  }

  async senderTask(_topic: string, data: string): Promise<void> {
    await this.driver.send({ data: Buffer.from(data) });
  }

  async flush() {
    await this.driver.flush();
    super.flush();
  }

  async close() {
    await this.flush();
    await this.driver.close();
  }
}

export class PulsarAdapter extends AbstractAdapter {
  private producers: Map<string, Producer>;
  private consumers: Map<string, PulsarConsumer>;
  private options: AdapterConfig;
  private client: Pulsar.Client;
  private autoAck: boolean;

  constructor(url: string, options: AdapterConfig) {
    super();
    this.options = options;
    this.producers = new Map();
    this.consumers = new Map();
    this.autoAck = !!options.consumer?.autoAck ?? false;
    this.client = new Pulsar.Client({
      ...options.client,
      serviceUrl: url,
    });
  }

  /**
   * Subscribe to a topic.
   * @param {string} topic
   * @param callback
   * @param {SubscriptionOptions} options
   */
  subscribe(
    topic: string,
    callback?: (data: string, ack: () => void) => void,
    options?: SubscriptionOptions
  ) {
    if (!this.consumers.has(topic)) {
      this.client
        .subscribe({
          topic,
          ...this.subscriberOptions,
          ...(options? this.getSubscriberOptions(options) : {}),
          listener: (msg, msgConsumer) => {
            const ack = () => msgConsumer.acknowledge(msg);
            if (this.autoAck) ack();
            this.emit(topic, msg.getData().toString(), () =>
              this.autoAck ? undefined : ack()
            );
          }
        })
        .then((consumer) => {
          this.consumers.set(topic, consumer);
        });
    }

    // @ts-ignore
    if (callback) this.on(topic, callback);
  }

  /**
   * Send/publish topic data
   * @param {string} topic
   * @param {string} data
   */
  async send(topic: string, data: string): Promise<string> {
    return (await this.producer(topic)).send(topic, data);
  }

  /**
   * Instanciate a producer or get existing
   * Instances auto deletes after timeout
   * @param {string} topic
   */
  protected async producer(topic: string): Promise<Producer> {
    if (!this.producers.has(topic)) {
      let producer = new Producer(
        await this.client.createProducer({
          ...this.producerOptions,
          topic,
        }),
        this.instanceTimeout,
        async () => {
          await producer.close();
          // @ts-ignore
          producer = undefined; // delete
          this.producers.delete(topic);
        }
      );
      this.producers.set(topic, producer);
    }

    return this.producers.get(topic) as Producer;
  }

  private get producerOptions(): Omit<ProducerOptions, "topic"> {
    return {
      batchingEnabled: true,
      ...this.options.producer
    };
  }

  private get subscriberOptions(): PulsarSubscriberOptions {
    return this.getSubscriberOptions(this.options.consumer);
  }

  private get instanceTimeout(): number {
    return get(this.options.producer, "instanceTimeout", 1000);
  }

  private getSubscriberOptions(
    options: SubscriptionOptions
  ): PulsarSubscriberOptions {
    const { autoAck, ...opts } = options || {};
    let subscriptionType = "Shared"
    if(options && options.subscriptionType) subscriptionType = options.subscriptionType
    return {
      ...opts,
      // @ts-ignore
      subscriptionType,
    };
  }

  /**
   * Close connections
   * @param {boolean} options.producer
   * @param {boolean} options.consumer
   */
  public async close(options?: { producer?: boolean, consumer?: boolean }) {
    // const producer = get(options, 'producer', true)
    // const consumer = get(options, 'consumer', true)
    // if (producer === false && consumer === false) return;
    // if (producer) {
    //   //
    // }
    // if (consumer) {
    //   //
    // }
    throw new MethodNotSupported('PulsarAdapter::close');
  }
}
