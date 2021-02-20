/**
 * @timbouc/zipu
 *
 * @license MIT
 * @copyright Timbouc - Augustus Okoye<augustus@timbouc.com>
 */

import {
  ClientOpts as PulsarKafkaClientOptions,
  // SubscriptionType as PulsarSubscriptionType,
  ProducerOpts as PulsarProducerOptions,
  SubscribeOpts as PulsarConsumerOptions,
} from "pulsar-client";
import {
  KafkaClientOptions,
  ConsumerOptions as KafkaConsumerOptions,
  ProducerOptions as KafkaProducerOptions,
} from "kafka-node"

export type PulsarClientConfig = {
  name: "pulsar";
  url: string;
  client?: Omit<PulsarKafkaClientOptions, "serviceUrl">
  producer?: Omit<PulsarProducerOptions, "topic">;
  consumer?: Omit<PulsarConsumerOptions, "topic"> & {
    autoAck?: boolean;
  };
}

export type KafkaClientConfig = {
  name: "kafka";
  url: string;
  client?: Omit<KafkaClientOptions, "kafkaHost">
  producer?: KafkaProducerOptions;
  consumer?: KafkaConsumerOptions;
};

export type ClientConfig = {
  default_client?: ClientConfigName;
  clients: {
    pulsar: PulsarClientConfig;
    kafka: KafkaClientConfig;
  };
};

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type Config = Omit<ClientConfig, "clients"> & {
  clients: Optional<ClientConfig["clients"], ClientConfigKeys>;
};


export type ClientConfigKeys = keyof ClientConfig["clients"];
export type ClientConfigName = ClientConfig["clients"][ClientConfigKeys]["name"];
// export type AdapterClientConfig<T extends ClientConfigKeys> = Omit<
//   ClientConfig["clients"][T],
//   "name"
// >;
export type AdapterClientConfig<T extends ClientConfigKeys> = ClientConfig["clients"][T];

export type ProducerOption<
  T extends ClientConfigName
> = ClientConfig["clients"][T]["producer"];
export type SubscriptionOption<
  T extends ClientConfigName
> = ClientConfig["clients"][T]["consumer"];

export type TopicName<E> = E extends { topic: string; data: unknown }
  ? E["topic"]
  : never;
export type TopicDataType<T, E> = E extends { topic: T; data: unknown }
  ? E["data"]
  : never;

export type Enumerable<T> = T | T[];

export type ProducerEvents =
  | "producer:ready"
  | "producer:error"
  | "producer:disconnected";
export type ConsumerEvents = "consumer:error";
export type AdapterEvents = ProducerEvents | ConsumerEvents;

export interface Serialiser {
  serialise(data: any): string;
  parse(data: string): any;
}
