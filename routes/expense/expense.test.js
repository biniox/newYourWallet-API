const request = require('supertest');
const mongoose = require('mongoose');

const app = require('./../../app');
const {
  closeConnect,
  connect,
  clean
} = require('./../../db/client');
const { userModel } = require('../../models/model');

let token, testExpenseBody, testExpenseId, idTestUser;
let expense1700year, expense1800year, expense4500year;


beforeAll(async () => {

  await connect();

    
// creating user and one expense

  testExpenseBody = {
    email: "category.test.js@email.com",
    password: "StrongPassword",
    date: new Date('01.01.1600')
  }

  const data = await request(app).put('/users').send(testExpenseBody);
  idTestUser = data.body._id;

  token = await await request(app).post('/users/authUser').send(testExpenseBody);
  token = token.body;
  const expense = await request(app).put('/expense/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send({ name: "tested", cost: 100});
  testExpenseBody = expense.body;
  testExpenseId = expense.body._id;

});

afterAll(async () => {
    await userModel.deleteOne({ _id: mongoose.Types.ObjectId(idTestUser)});
    await closeConnect();
})

describe('PUT expense/ - add a new expense', () => {
    test('[successful] - add a new expense', async () => {
        bodyData = {
            "name": "tested expense",
            "cost": Math.round(70)
        }
        const response = await request(app).put('/expense/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);
        const { body: {categoryId, date, _id, name, cost}, status} = response;

        expect(status).toBe(200);
        expect(categoryId).toBeNull();
        expect(date).toBeDefined();
        expect(_id).toBeDefined();
        expect(name).toBeDefined();
        expect(cost).toBeDefined();
        expect(typeof cost).toBe("number");
    });

    test('[invalid] - name is required', async () => {
        bodyData = {
            "cost": Math.round(70)
        }
        const response = await request(app).put('/expense/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);
        const { body, body: {categoryId, date, _id, name, cost, err, code}, status} = response;

        expect(status).toBe(400);
        expect(categoryId).toBeUndefined();
        expect(date).toBeUndefined();
        expect(_id).toBeUndefined();
        expect(name).toBeUndefined();
        expect(cost).toBeUndefined();
        expect(err).toBe("name is required");
        expect(code).toBe("name");
    });

    test('[invalid] - cost is required', async () => {
        bodyData = {
            "name": "tested expense",
        }
        const response = await request(app).put('/expense/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);
        const { body, body: {categoryId, date, _id, name, cost, err, code}, status} = response;

        expect(status).toBe(400);
        expect(categoryId).toBeUndefined();
        expect(date).toBeUndefined();
        expect(_id).toBeUndefined();
        expect(name).toBeUndefined();
        expect(cost).toBeUndefined();
        expect(err).toBe("cost is required");
        expect(code).toBe("cost");
    });

    test('[invalid] - cost must be a number', async () => {
        bodyData = {
            "name": "tested expense",
            "cost": "String String"
        }
        const response = await request(app).put('/expense/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);
        const { body, body: {categoryId, date, _id, name, cost, err, code}, status} = response;
        expect(status).toBe(400);
        expect(categoryId).toBeUndefined();
        expect(date).toBeUndefined();
        expect(_id).toBeUndefined();
        expect(name).toBeUndefined();
        expect(cost).toBeUndefined();
        expect(err).toBe("cost must be a number");
        expect(code).toBe("cost");
    });

    test('[invalid] - date must be a date', async () => {
        bodyData = {
            "name": "tested expense",
            "cost": 50,
            "date": "whatever"
        }
        const response = await request(app).put('/expense/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);
        const { body, body: {categoryId, date, _id, name, cost, err, code}, status} = response;
        expect(status).toBe(400);
        expect(categoryId).toBeUndefined();
        expect(date).toBeUndefined();
        expect(_id).toBeUndefined();
        expect(name).toBeUndefined();
        expect(cost).toBeUndefined();
        expect(err).toBe("date must be a date type");
        expect(code).toBe("date");
    });
});

describe('POST expense/:id - update expense', () => {
    test('[succcessfull] - edit expense name', async () => {
        bodyData = {
            name: "edited expense",
        }
        
        const response = await request(app).post('/expense/' + testExpenseId).set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);

        const { _id, categoryId, date, cost, name } = response.body;

        expect(_id).toBe(testExpenseId);
        expect(categoryId).toBe(testExpenseBody.categoryId);
        expect(cost).toBe(testExpenseBody.cost);
        expect(name).toBe(bodyData.name);
        expect(date).toStrictEqual(testExpenseBody.date);       
        testExpenseBody.name = bodyData.name;


    });
    
    test('[succcessfull] - edit expense date', async () => {
        bodyData = {
            date: new Date('01.01.1500'),
        }
        
        const response = await request(app).post('/expense/' + testExpenseId).set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData); 

        const { _id, categoryId, date, cost, name } = response.body;

        expect(_id).toBe(testExpenseId);
        expect(categoryId).toBe(testExpenseBody.categoryId);
        expect(cost).toBe(testExpenseBody.cost);
        expect(name).toBe(testExpenseBody.name);
        expect(new Date(date)).toStrictEqual(bodyData.date);
        
        testExpenseBody.date = new Date(bodyData.date);
    });
    
    test('[succcessfull] - edit expense cost', async () => {
        bodyData = {
            cost: 1000
        }
        
        const response = await request(app).post('/expense/' + testExpenseId).set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData); 

        const { _id, categoryId, date, cost, name } = response.body;

        expect(_id).toBe(testExpenseId);
        expect(categoryId).toBe(testExpenseBody.categoryId);
        expect(cost).toBe(bodyData.cost);
        expect(name).toBe(testExpenseBody.name);
        expect(new Date(date)).toStrictEqual(testExpenseBody.date);
        
        testExpenseBody.cost = bodyData.cost;
    });
    
    test('[succcessfull] - edit expense categoryID', async () => {
        bodyData = {
            categoryId: "whatever"
        }
        
        const response = await request(app).post('/expense/' + testExpenseId).set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData); 

        const { _id, categoryId, date, cost, name } = response.body;

        expect(_id).toBe(testExpenseId);
        expect(categoryId).toBe(bodyData.categoryId);
        expect(cost).toBe(testExpenseBody.cost);
        expect(name).toBe(testExpenseBody.name);
        expect(new Date(date)).toStrictEqual(testExpenseBody.date);
        
        testExpenseBody.categoryId = bodyData.categoryId;
    });

    test('[invalid] - no body', async () => {
        
        const response = await request(app).post('/expense/' + testExpenseId).set('authorization', `Bearer ${token.ACCESS_TOKEN}`);

        const { _id, categoryId, date, cost, name, err, code } = response.body;

        expect(_id).toBeUndefined();
        expect(categoryId).toBeUndefined();
        expect(cost).toBeUndefined();
        expect(name).toBeUndefined();
        expect(date).toBeUndefined();

        expect(err).toBe("no valid data in body");
        expect(code).toBe("noData");
        
        testExpenseBody.categoryId = bodyData.categoryId;
    });

    test('[invalid] - no valid data in body', async () => {
        bodyData = {
            whatever: "whatever",
            whateverElse: "whatever"
        }
        const response = await request(app).post('/expense/' + testExpenseId).set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);

        const { _id, categoryId, date, cost, name, err, code } = response.body;

        expect(_id).toBeUndefined();
        expect(categoryId).toBeUndefined();
        expect(cost).toBeUndefined();
        expect(name).toBeUndefined();
        expect(date).toBeUndefined();

        expect(err).toBe("no valid data in body");
        expect(code).toBe("noData");
        
        testExpenseBody.categoryId = bodyData.categoryId;
    });

    test('[invalid] - invalid ID', async () => {
        bodyData = {
            name: "Edited"
        }
        const response = await request(app).post('/expense/whatever').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);

        const { _id, categoryId, date, cost, name, err, code } = response.body;

        expect(_id).toBeUndefined();
        expect(categoryId).toBeUndefined();
        expect(cost).toBeUndefined();
        expect(name).toBeUndefined();
        expect(date).toBeUndefined();

        expect(err).toBe("Expense not found");
        expect(code).toBe("noId");
        
        testExpenseBody.categoryId = bodyData.categoryId;
    });

    test('[invalid] - cost must be a number', async () => {
        bodyData = {
            cost: "whatever"
        }
        const response = await request(app).post('/expense/whatever').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);

        const { _id, categoryId, date, cost, name, err, code } = response.body;

        expect(_id).toBeUndefined();
        expect(categoryId).toBeUndefined();
        expect(cost).toBeUndefined();
        expect(name).toBeUndefined();
        expect(date).toBeUndefined();

        expect(err).toBe("cost must be a number");
        expect(code).toBe("cost");
        
        testExpenseBody.categoryId = bodyData.categoryId;
    });

    test('[invalid] - date must be a date type', async () => {
        bodyData = {
            date: "whatever"
        }
        const response = await request(app).post('/expense/whatever').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);

        const { _id, categoryId, date, cost, name, err, code } = response.body;

        expect(_id).toBeUndefined();
        expect(categoryId).toBeUndefined();
        expect(cost).toBeUndefined();
        expect(name).toBeUndefined();
        expect(date).toBeUndefined();

        expect(err).toBe("date must be a date type");
        expect(code).toBe("date");
        
        testExpenseBody.categoryId = bodyData.categoryId;
    });



    
});

describe('GET expense/', () => {

    beforeAll(async () => {
        expense1700year = {
            name: "expense from 1700",
            cost: 1700,
            date: new Date('01.01.1700 00:01')
          }
          expense1800year = {
            name: "expense from 1800",
            cost: 1800,
            date: new Date('01.01.1800 00:01')
          }
          expense4500year = {
            name: "expense from 4500",
            cost: 4500,
            date: new Date('01.01.4500 00:01')
          }
    
          expense1700year = await request(app).put('/expense/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(expense1700year);
          expense1800year = await request(app).put('/expense/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(expense1800year);
          expense4500year = await request(app).put('/expense/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(expense4500year);

          expense1700year = expense1700year.body;
          expense1800year = expense1800year.body;
          expense4500year = expense4500year.body

    });

    test('[successfull] - get all expenses', async () => {
        const response = await request(app).get('/expense/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`);
        const { body } = response;

        expect(Array.isArray(body)).toBe(true);
        expect(body[0]).toBeDefined();
        expect(body.length).toBeGreaterThan(0);
    });

    test('[successfull] - get only one expense by id', async () => {
        const response = await request(app).get('/expense/' + testExpenseBody._id).set('authorization', `Bearer ${token.ACCESS_TOKEN}`);
        const { body  } = response;
        const { _id, name, cost } = body[0];

        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(1);
        expect(_id).toBe(testExpenseBody._id);
        expect(name).toBe(testExpenseBody.name);
        expect(cost).toBe(testExpenseBody.cost);
    });

    test('[successfull] - filter expense by date', async () => {
        const response = await request(app).get('/expense/?from=01.01.1501&to=01.01.1802').set('authorization', `Bearer ${token.ACCESS_TOKEN}`);
        const { body  } = response;

        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(2);
        expect(body[0]._id).toBe(expense1700year._id);
        expect(body[1]._id).toBe(expense1800year._id);
    });

    test('[successfull] - filter expense by date only "to"', async () => {
        const response = await request(app).get('/expense/?to=01.01.1900').set('authorization', `Bearer ${token.ACCESS_TOKEN}`);
        const { body  } = response;

        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(3);
        expect(body[0]._id).toBe(testExpenseBody._id);
        expect(body[1]._id).toBe(expense1700year._id);
        expect(body[2]._id).toBe(expense1800year._id);
    });

    test('[successfull] - filter expense by date only "to"', async () => {
        const response = await request(app).get('/expense/?from=01.01.4000').set('authorization', `Bearer ${token.ACCESS_TOKEN}`);
        const { body  } = response;

        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(1);
        expect(body[0]._id).toBe(expense4500year._id);

    });

    test('[invalid] - "to" is not valid type', async () => {
        const response = await request(app).get('/expense/?to=whatever').set('authorization', `Bearer ${token.ACCESS_TOKEN}`);
        const { body  } = response;

        expect(body.err).toBe("date must be a date type");
        expect(body.code).toBe("date");

    });

    test('[invalid] - "from" is not valid type', async () => {
        const response = await request(app).get('/expense/?from=whatever').set('authorization', `Bearer ${token.ACCESS_TOKEN}`);
        const { body  } = response;

        expect(body.err).toBe("date must be a date type");
        expect(body.code).toBe("date");

    });

    test('[invalid] - "to" and "from" is not valid type', async () => {
        const response = await request(app).get('/expense/?from=whatever&to=whatever').set('authorization', `Bearer ${token.ACCESS_TOKEN}`);
        const { body  } = response;

        expect(body.err).toBe("date must be a date type");
        expect(body.code).toBe("date");

    });

   
    
});

describe('DELETE expense/:id - delete expense by id', () => {
    test('[successful] - delete expense ', async () => {
        const response = await request(app).delete('/expense/' + expense4500year._id).set('authorization', `Bearer ${token.ACCESS_TOKEN}`); 

        expect(response.body.success).toBeDefined();
        expect(response.body.success).toBe(`expense: ${expense4500year._id} was Removed`);
    });

    test('[invalid] - id is not valid  ', async () => {
        const response = await request(app).delete('/expense/whatever').set('authorization', `Bearer ${token.ACCESS_TOKEN}`); 

        expect(response.body.err).toBe("Expense not found");
        expect(response.body.code).toBe("noId");
    });

    test('[invalid] - id is not defined  ', async () => {
        const response = await request(app).delete('/expense').set('authorization', `Bearer ${token.ACCESS_TOKEN}`); 

        expect(response.body.err).toBe("Expense not found");
        expect(response.body.code).toBe("noId");
    });
    
});
