const request = require('supertest');
const mongoose = require('mongoose');

const app = require('./../app');
const { URI_MONGO } = require("../config");

let token, categoryId;

const clean = async () =>  await mongoose.connection.dropDatabase();

beforeAll(async () => {

  await mongoose.connect(URI_MONGO, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})  
    
  const db = await mongoose.connection;

  bodyData = {
    email: "tested1@email.com",
    password: "StrongPassword"  
}
  const data = await request(app).put('/users').send(bodyData);
  token = await await request(app).post('/users/authUser').send(bodyData);
  token = token.body;


});

afterAll(async () => {
  await clean();
  await mongoose.connection.close();
})

describe('PUT category/ - Add a new catwgory', () => {



  test('[successfull] - correct add a new category to your account ', async () => {
    newCategory = {
      name: "Correct Add category"
    }
    const response = await request(app).put('/category/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(newCategory);
    const { body: {_id, name} } = response;
    categoryId = _id;

    expect(_id).not.toBeUndefined();
    expect(name).not.toBeUndefined();
  });

  test('[Invalid] - ACCESS TOKEN expired or wrong ', async () => {
    newCategory = {
      name: "Correct Add category"
    }

    const response = await request(app).put('/category/').set('authorization', `Bearer whatever`).send(newCategory);
    const { body: {_id, name, err, code} } = response;

    expect(_id).toBeUndefined();
    expect(name).toBeUndefined();

    expect(err).toBe("Invalid access TOKEN or expired");
    expect(code).toBe("token");
  });

  test('[Invalid] - No name data  ', async () => {

    const response = await request(app).put('/category/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`);
    const { body: {_id, name, err, code} } = response;

    expect(_id).toBeUndefined();
    expect(name).toBeUndefined();
    expect(err).toBe("category name is required");
    expect(code).toBe("categoryName");
  });
  
});

describe('POST category/ - get a category list', () => {
  test('[successfull] get a category list when list is not empty ', async () => {
    const response = await request(app).post('/category/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`);
    const { body, status } = response;
    
    expect(status).toBe(200);
    expect(body).toBeDefined();
    expect(body[0]._id).toBeDefined();

    expect(body[0].name).toBeDefined();
    expect(Array.isArray(body)).toBeTruthy();
    // expect(body.length).toBe(1);

  });

  test('[successfull] get a category list when list is not empty ', async () => {
    const response = await request(app).post('/category/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`);
    const { body, status } = response;
    
   // TODO make a test for empty category list but valid
  });

  test('[Invalid] authorization token is not valid ', async () => {
    const response = await request(app).post('/category/').set('authorization', `Bearer whatever`);
    const { body, status } = response;

    expect(status).toBe(400);
    expect(body.err).toBe("Invalid access TOKEN or expired");
    expect(body.code).toBe("token");

  });
});

describe('UPDATE category/ - update selected category', () => {
  test('[successfull] - update category by ID', async () => {
    const response = await request(app)
      .post('/category/' + categoryId)
      .set('authorization', `Bearer ${token.ACCESS_TOKEN}`)
      .send({ name: "updated by jest"});

      const { status, body : { _id, name }} = response;

      expect(status).toBe(200);
      expect(_id).toBe(categoryId);
      expect(name).toBe("updated by jest");

  });

  test('[invalid] - update category by ID - no name to update', async () => {
    const response = await request(app)
      .post('/category/' + categoryId)
      .set('authorization', `Bearer ${token.ACCESS_TOKEN}`)
      .send({ });

      const { status, body : { _id, name, err, code }} = response;

      expect(status).toBe(400);
      expect(_id).toBeUndefined();
      expect(name).toBeUndefined();
      expect(err).toBe("no data to update in body");
      expect(code).toBe("noData");

  });

  test('[invalid] - Object ID is not found', async () => {
    const response = await request(app)
      .post('/category/whatever')
      .set('authorization', `Bearer ${token.ACCESS_TOKEN}`)
      .send({ name: "UP" });

      const { status, body : { _id, name, err, code }} = response;

      expect(status).toBe(400);
      expect(_id).toBeUndefined();
      expect(name).toBeUndefined();
      expect(err).toBe("Object Id of category not found");
      expect(code).toBe("noRecord");

  });
});

describe('DELETE category/ - Delete selected category by ID', () => {
  test('[successfull] - delete category by ID', async () => {
    const response = await request(app)
      .delete('/category/' + categoryId)
      .set('authorization', `Bearer ${token.ACCESS_TOKEN}`);

      const { status, body : { success }} = response;

      // expect(status).toBe(200);
      expect(success).toBe(`${categoryId} was Removed`);

  });


  test('[invalid] - Object ID is not found', async () => {
    const response = await request(app)
      .delete('/category/whatever')
      .set('authorization', `Bearer ${token.ACCESS_TOKEN}`)

      const { status, body : { _id, name, err, code }} = response;

      expect(status).toBe(400);
      expect(_id).toBeUndefined();
      expect(name).toBeUndefined();
      expect(err).toBe("Object Id of category not found");
      expect(code).toBe("noRecord");

  });
});
