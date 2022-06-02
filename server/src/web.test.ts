import request from 'supertest';
import app from './web';

describe('web', () => {
  it('should allow static', (done) => {
    request(app).get('/').expect('Content-Type', 'text/html; charset=UTF-8').expect(200, done);
  });

  it('should return index.html on any path', (done) => {
    request(app).get('/test/path/456').expect('Content-Type', 'text/html; charset=UTF-8').expect(200, done);
  });
});
