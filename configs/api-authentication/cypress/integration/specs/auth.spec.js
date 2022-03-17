const Guid = require('guid');
const bcrypt = require('bcryptjs');

describe('user/register', () => {
  var url = 'http://localhost:3000/api/user/register';

  // TODO - instead of this we should create a test user and delete after test is done
  let DynamicEmail = Guid.raw() + '@test.com';

  let body = {
    name: 'testName',
    password: '123456',
    email: DynamicEmail
  }

  // positive testing
  it('return 200 with correct body', async() => {
    const encryptedPassword = await bcrypt.hash('123456', 10);

    cy.request('POST', url, body)
      .then(res => {
        console.log(res)
        expect(res.status).to.eq(200);
        expect(res.body.name).to.eq('testName');
        expect(res.body.password).to.not.eq('123456');
        expect(res.body.password).to.eq(encryptedPassword);
        expect(res.body.email).to.eq(DynamicEmail);
      })
  });

  // negative testing
  it('return 400 with empty body', () => {
    body = {}

    cy.request({
      method: 'POST', 
      url: url, 
      failOnStatusCode: false
    })
      .then(res => {
        expect(res.status).to.eq(400);
      })
  });

  it('return 400 with invalid body', () => {
    body = {
      name: 'testName',
      password: '1',
      email: 'test@test.com'
    }

    cy.request({
      method: 'POST', 
      url: url, 
      failOnStatusCode: false
    })
      .then(res => {
        expect(res.status).to.eq(400);
      })
  });

  it('return a message why it failed', () => {
    body = {
      name: 'testName',
      password: '123456',
      email: 'invalid'
    }

    cy.request({
      method: 'POST', 
      url: url, 
      failOnStatusCode: false,
      body
    })
      .then(res => {
        expect(res.status).to.eq(400);
        expect(res.body).to.eq('"email" must be a valid email');
      })
  });

  it('return a when registering duplicate user', () => {
    body = {
      name: 'testName',
      password: '123456',
      email: 'staticEmail@test.com'
    }

    cy.request({
      method: 'POST', 
      url: url, 
      failOnStatusCode: false,
      body
    })
      .then(res => {
        expect(res.status).to.eq(400);
        expect(res.body).to.eq('Email already registered!');
      })
  });
});
