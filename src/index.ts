import 'reflect-metadata';
import { createConnection } from 'typeorm';

const init = async () => {
  await createConnection();
};

init().catch((e) => {
  console.error(e);
});
