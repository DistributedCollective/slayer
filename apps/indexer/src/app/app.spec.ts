import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { beforeEach, describe, expect, it } from 'vitest';
import { app } from './app';

describe('GET /', () => {
  let server: FastifyInstance;

  beforeEach(() => {
    server = Fastify();
    server.register(app);
  });

  it('mocks a test', () => {
    expect(1 + 1).toBe(2);
  });

  // it('should respond with a message', async () => {
  //   const response = await server.inject({
  //     method: 'GET',
  //     url: '/',
  //   });

  //   expect(response.json()).toEqual(chains.list());
  // });
});
