import { Client, Config } from "../src";

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

const config: Config = {
  // default_client: "pulsar",
  clients: {
    pulsar: {
      name: "pulsar",
      url: "pulsar://localhost:6650",
      producer: {
        //
      },
      consumer: {
        autoAck: true,
        subscription: "svc1",
        subscriptionType: "Shared"
      }
    },
  },
};

const client = new Client<DataTypes>(config);
const data = {
  channel: "1",
  file: "file-1",
  from: 0
};

client.publish("persistent://public/default/stream-audio", data);

client.subscribe("persistent://public/default/stream-audio", (data, ack) => {
  // data.channel
  ack();
});

client.on("persistent://public/default/stream-audio", (data, ack) => {
  console.log(data.channel);
});
client.on("producer:error", (data) => {
  //
});
