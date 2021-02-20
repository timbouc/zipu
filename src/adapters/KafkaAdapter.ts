/**
 * @timbouc/zipu
 *
 * @license MIT
 * @copyright Timbouc - Augustus Okoye<augustus@timbouc.com>
 */

import { KafkaClient, Producer as KafkaProducer, Consumer as KafkaConsumer } from "kafka-node"
import { AbstractAdapter } from "./AbstractAdapter";
import { AdapterClientConfig, SubscriptionOption } from "../types";
import { Producer as BaseProducer } from "./Producer";
import { MethodNotSupported } from "src/exceptions";

type SubscriptionOptions = SubscriptionOption<"kafka">;
type AdapterConfig = AdapterClientConfig<"kafka">;

class Producer extends BaseProducer {
  protected driver: KafkaProducer;

  constructor(driver: KafkaProducer) {
    super();
    this.driver = driver;
    this.driver.on('ready', this.start)
  }

  async senderTask(topic: string, data: string): Promise<void> {
    const payloads = [{
      topic,
      messages: data,
    }];
    return new Promise((resolve, reject) => this.driver.send(payloads, (error, data) => {
      if(error) reject(error)
      resolve(data)
    }));
  }

  async close(): Promise<void> {
    await this.flush();
    return new Promise((resolve) => this.driver.close(resolve));
  }
}

export class KafkaAdapter extends AbstractAdapter {

  private client: KafkaClient;
  private producer: Producer | undefined;
  private consumer: KafkaConsumer | undefined;
  private options: AdapterConfig;
  private autoCommit: boolean;

  constructor(url: string, options: AdapterConfig) {
    super();
    this.options = options;
    this.client = new KafkaClient({
      ...options.client,
      kafkaHost: url,
    })
    this.autoCommit = !!options.consumer?.autoCommit ?? false;
  }

  /**
   * Send/publish topic data
   * @param {string} topic
   * @param {string} data
   */
  async send(topic: string, data: string): Promise<string> {
    if(!this.producer){
      this.producer = new Producer(
        new KafkaProducer(this.client, this.options.producer)
      )
    }
    return this.producer.send(topic, data);
  }

  /**
   * Subscribe to a topic.
   * @param {string} topic
   * @param callback
   * @param {SubscriptionOptions} options
   */
  subscribe(
    topic: string,
    callback?: (data: string, commit: () => void) => void,
    options?: SubscriptionOptions
  ) {
    const subsciption = [{
      topic,
      encoding: 'buffer',
      ...this.options.consumer,
      ...(options || {}),
    }];

    if(this.consumer){
      this.consumer.addTopics(subsciption, (error) => error? new Error(error) : null);
    }else{
      this.consumer = new KafkaConsumer(this.client, subsciption, {
        autoCommit: this.autoCommit,
      })
      this.consumer.on('message', (message) => {
        const commit = () => null;
        if (this.autoCommit) commit();
        this.emit(message.topic, message.value.toString(), () =>
          this.autoCommit ? undefined : commit()
        );
      });
      // this.consumer.on('offsetOutOfRange', error => this.emit('consumer:error', error));
      this.consumer.on('error', error => this.emit('consumer:error', error));
    }

    // @ts-ignore
    if (callback) this.on(topic, callback);

  }

  /**
   * Close connections
   * @param {boolean} options.producer
   * @param {boolean} options.consumer
   * @param {boolean} options.force
   */
  public async close(options?: { producer?: boolean, consumer?: boolean, force?: boolean }): Promise<void> {
    throw new MethodNotSupported('KafkaAdapter::close');
    // const producer = get(options, 'producer', true)
    // const consumer = get(options, 'consumer', true)
    // const force = get(options, 'force', false)
    // if (producer === false && consumer === false) return;

    // return new Promise((resolve, reject) => {
    //   if (producer) {
    //     //
    //   }
    //   if (consumer) {
    //     this.consumer?.close(force, (error) => error? reject(error) : resolve())
    //   }
    // });
  }
}
