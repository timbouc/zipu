# @timbouc/zipu

**Zipu** is a Node pub/sub wrapper for sending publishing and subscribing event messages with strong *typing* of data types against topics. Currently abstracts Apache Pulsar and Kafka clients with a dynamic producer/consumer create/delete cycle.

:green_heart: **Features**

* Strong data typing against producer/consumer topics
* Integrated [Pulsar](https://www.npmjs.com/package/pulsar-client) and [Kafka](https://www.npmjs.com/package/kafka-node) clients
* Auto manage producers and consumers



## :stop_sign: Stop

Unfortunately, Pulsar client is not fully implemented due to the following known errors

* [Official requirements](https://github.com/apache/pulsar-client-node#requirements)
* [C++ Library Error](https://github.com/apache/pulsar-client-node/issues/122#issuecomment-694653352)
* 

## Usage

This package is available in the npm registry.
It can easily be installed with `npm` or `yarn`.

```bash
$ npm i @timbouc/zipu
# or
$ yarn add @timbouc/zipu
```

Get your configuration. See **[example](examples/config.ts)**.

```typescript
import { Client } from "zipu"
import config from '@/config/pubsub'
import { DataTypes } from '@/types'

const client = new Client<DataTypes>(config);

client.publish("persistent://public/default/stream-audio", data);

client.subscribe("persistent://public/default/stream-audio", (data, ack) => {
  // ack(); // manually acknowledge (or commit for kafka)
});

client.on("persistent://public/default/stream-audio", (data, ack) => {
  console.log(data.channel);
});

client.on("producer:error", (data) => {
  //
});
```



### Types

```typescript
export interface StreamFileInput {
  channel: string;
  file: string;
}
export interface StreamAudioInput extends StreamFileInput {
  from: number;
}

export type DataTypes =
  | {
      topic: "persistent://public/default/stream-audio";
      data: StreamAudioInput;
    }
  | {
      topic: "persistent://public/default/stream-file";
      data: StreamFileInput;
    };

// typescript and lint error:
client.publish("persistent://public/default/stream-audio", {});

client.subscribe("persistent://public/default/stream-audio", (data, ack) => {
  // data => typeof StreamAudioInput
  ack();
});
```



## Contribution Guidelines

Any pull requests or discussions are welcome.
Note that every pull request providing new feature or correcting a bug should be created with appropriate unit tests.
