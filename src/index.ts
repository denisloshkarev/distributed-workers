import 'reflect-metadata';
import { createConnection } from 'typeorm';
import Worker from './domain/worker';

const init = async () => {
  await createConnection();
};

init().then(() => {
  console.log('DB connection established.');
  Array(20).fill(null).forEach(() => {
    Worker.run().catch((e) => console.error(e));
  });
}).catch((e) => {
  console.error(e);
});
