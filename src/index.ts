import 'reflect-metadata';
import { createConnection } from 'typeorm';
import Worker from './domain/worker';

const init = async () => {
  await createConnection();
};

init().then(async () => {
  console.log('DB connection established.');
  const worker = new Worker();
  await worker.run();
}).catch((e) => {
  console.error(e);
});
