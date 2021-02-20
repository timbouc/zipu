/**
 * @timbouc/zipu
 *
 * @license MIT
 * @copyright Timbouc - Augustus Okoye<augustus@timbouc.com>
 */

import { EventEmitter } from "events";
import { AdapterEvents } from "./../types";

export abstract class AbstractAdapter {
  private ee: EventEmitter

  constructor(){
    this.ee = new EventEmitter
  }

  /**
   * Send data
   * @param {string} topic
   * @param {string} data
   */
  abstract send(topic: string, data: string): Promise<string>;

  /**
   * Subscribe to topic
   * @param {string} topic
   * @param {Function} callback
   */
  abstract subscribe(
    topic: string,
    callback: (data: string, ack: () => void) => void,
    options?: unknown
  ): void;

  /**
   * Close connections
   * @param {boolean} options.producer
   * @param {boolean} options.consumer
   */
  abstract close(options?: {
    producer: boolean;
    consumer: boolean;
  }): Promise<void>;

  /**
   * Emit events
   * @param {EventType} event
   * @param args
   */
  emit(event: AdapterEvents, ...args: any[]): boolean;
  emit(event: string, ...args: any[]): boolean;
  emit(event: any, ...args: any[]): boolean{
    return this.ee.emit(event, ...args)
  }

  /**
   * Subscribe to events (inc. topic events)
   * @param {EventType} topic
   * @param {Function} callback
   */
  on(event: AdapterEvents, callback: (data: any, ack?: () => void) => void): void;
  on(event: string, callback: (data: any, ack?: () => void) => void): void;
  on(event: any, callback: (data: any, ack?: () => void) => void): void {
    this.ee.on(event, callback);
  }
}
