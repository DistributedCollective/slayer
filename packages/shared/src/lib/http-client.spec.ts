import { HttpClient } from './http-client.js';

describe('HttpClient', () => {
  it('should work', () => {
    const client = new HttpClient({ baseUrl: 'https://api.example.com' });
    expect(client).toBeInstanceOf(HttpClient);
  });
});
