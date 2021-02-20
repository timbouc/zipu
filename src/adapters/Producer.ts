/**
 * @timbouc/zipu
 *
 * @license MIT
 * @copyright Timbouc - Augustus Okoye<augustus@timbouc.com>
 */

import PQueue from 'p-queue'

export abstract class Producer {
  protected driver: any;
  private queue: PQueue;

  constructor(){
    this.queue = new PQueue({ concurrency: 1, autoStart: false })
  }

  start(){
    this.queue.start();
  }

  /**
   *
   * @param {string} topic
   */
  abstract senderTask(topic: string, data: string): Promise<void>;

  /**
   * Close producer connection
   */
  abstract close(): Promise<void>;

  /**
   * Send data
   * @param {string} data
   */
  async send(topic: string, data: string): Promise<string> {
    const sendTask = (): Promise<void> => {
      const sendPromise = this.senderTask(topic, data);
      return sendPromise.then(data => Promise.resolve(data));
    }
    this.queue.add(sendTask);
    return data;
  }

  /**
   * Empty all pending tasks
   */
  async flush() {
    //
  }
}
