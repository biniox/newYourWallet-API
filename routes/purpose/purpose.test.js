const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../../app');
const {
  closeConnect,
  connect,
  clean
} = require('../../db/client');
const { userModel } = require('../../models/model');

let token, testUser, testPurpose;
let expense1700year, expense1800year, expense4500year;


beforeAll(async () => {

  await connect();

    
// creating tester user

  testUser = {
    email: "category.test.js@email.com",
    password: "StrongPassword",
  }

  const data = await request(app).put('/users').send(testUser);
  testUser._id = data.body._id;
  token = await await request(app).post('/users/authUser').send(testUser);
  token = token.body;

});

afterAll(async () => {
    await userModel.deleteOne({ _id: mongoose.Types.ObjectId(testUser._id)});
    await closeConnect();
})

describe('PUT purpose/ - add a new purpose', () => {
    test('[successful] - add a new purpose', async () => {
        bodyData = {
            name: "tested purpose",
            cost: 100
        }
        const response = await request(app).put('/purpose/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);
        const { body: {realized, _id, name, cost, moneySave}, status} = response;
        
        expect(status).toBe(200);
        expect(moneySave).toBe(0);
        expect(realized).toBeFalsy();
        expect(_id).toBeDefined();
        expect(name).toBe(bodyData.name);
        expect(cost).toBe(bodyData.cost);
        expect(typeof cost).toBe("number");
    });

    test('[invalid] - name is required', async () => {
        bodyData = {
            cost: 100
        }
        const response = await request(app).put('/purpose/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);
        const { body, body: {realized, _id, name, cost, moneySave, err, code }, status} = response;

        expect(status).toBe(400);
        expect(err).toBe("name is required");
        expect(code).toBe("name");
    });

    test('[invalid] - cost is required', async () => {
        bodyData = {
            name: "tested purpose"
        }
        const response = await request(app).put('/purpose/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);
        const { body, body: {realized, _id, name, cost, moneySave, err, code }, status} = response;

        expect(status).toBe(400);
        expect(err).toBe("cost is required");
        expect(code).toBe("cost");
    });

    test('[invalid] - cost must be a number', async () => {
        bodyData = {
            name: "tested purpose",
            cost: "whatever"
        }
        const response = await request(app).put('/purpose/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);
        const { body, body: {realized, _id, name, cost, moneySave, err, code }, status} = response;

        expect(status).toBe(400);
        expect(err).toBe("cost must be a number");
        expect(code).toBe("cost");
    });

    test('[invalid] - moneySave must be a number', async () => {
        bodyData = {
            name: "tested purpose",
            cost: 100,
            moneySave: "whatever"
        }
        const response = await request(app).put('/purpose/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);
        const { body, body: {realized, _id, name, cost, moneySave, err, code }, status} = response;

        expect(status).toBe(400);
        expect(err).toBe("moneySave must be a number");
        expect(code).toBe("moneySave");
    });

    test('[invalid] - realized must be a boolean', async () => {
        bodyData = {
            name: "tested purpose",
            cost: 100,
            moneySave: 10,
            realized: "whatever"
        }
        const response = await request(app).put('/purpose/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);
        const { body, body: {realized, _id, name, cost, moneySave, err, code }, status} = response;

        expect(status).toBe(400);
        expect(err).toBe("realized must be a boolean");
        expect(code).toBe("realized");
    });


});

describe('POST purpose/:id - update purpose', () => {
    beforeAll(async () => {
        bodyData = {
            name: "POST purpose/:id tester",
            cost: 100
        }
        testPurpose = await request(app).put('/purpose/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);
        testPurpose = testPurpose.body;
    });

    test('[succcessfull] - edit purpose name', async () => {
        bodyData = {
            name: "POST purpose/:id tester - edited",
        }
        
        const response = await request(app).post('/purpose/' + testPurpose._id).set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);

        const { _id, name, moneySave, cost, realized } = response.body;

        expect(_id).toBe(testPurpose._id);
        expect(realized).toBe(testPurpose.realized);
        expect(cost).toBe(testPurpose.cost);
        expect(name).toBe(bodyData.name);   
        expect(moneySave).toBe(testPurpose.moneySave);   
        testPurpose.name = bodyData.name;


    });

    test('[succcessfull] - edit purpose cost', async () => {
        bodyData = {
            cost: 123
        }
        
        const response = await request(app).post('/purpose/' + testPurpose._id).set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);

        const { _id, name, moneySave, cost, realized } = response.body;

        expect(_id).toBe(testPurpose._id);
        expect(realized).toBe(testPurpose.realized);
        expect(cost).toBe(bodyData.cost);
        expect(name).toBe(testPurpose.name);  
        expect(moneySave).toBe(testPurpose.moneySave);    
        testPurpose.cost = bodyData.cost;


    });

    test('[succcessfull] - edit purpose moneySave', async () => {
        bodyData = {
            moneySave: 123
        }
        
        const response = await request(app).post('/purpose/' + testPurpose._id).set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);

        const { _id, name, moneySave, cost, realized } = response.body;

        expect(_id).toBe(testPurpose._id);
        expect(realized).toBe(testPurpose.realized);
        expect(cost).toBe(testPurpose.cost);
        expect(name).toBe(testPurpose.name);   
        expect(moneySave).toBe(bodyData.moneySave);   
        testPurpose.moneySave = bodyData.moneySave;


    });

    test('[succcessfull] - edit purpose realized', async () => {
        bodyData = {
            realized: true
        }
        
        const response = await request(app).post('/purpose/' + testPurpose._id).set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);

        const { _id, name, moneySave, cost, realized } = response.body;

        expect(_id).toBe(testPurpose._id);
        expect(realized).toBe(bodyData.realized);
        expect(cost).toBe(testPurpose.cost);
        expect(name).toBe(testPurpose.name);   
        expect(moneySave).toBe(testPurpose.moneySave);   
        testPurpose.realized = bodyData.realized;


    });


    test('[invalid] - no body', async () => {        
        const response = await request(app).post('/purpose/' + testPurpose._id).set('authorization', `Bearer ${token.ACCESS_TOKEN}`);

        const { _id, name, moneySave, cost, realized, err, code } = response.body;

        expect(_id).toBeUndefined();
        expect(moneySave).toBeUndefined();
        expect(cost).toBeUndefined();
        expect(name).toBeUndefined();
        expect(realized).toBeUndefined();

        expect(err).toBe("no valid data in body");
        expect(code).toBe("noData");
        
    });

    test('[invalid] - no valid data in body', async () => {
        bodyData = {
            whatever: "whatever",
            whateverElse: "whatever"
        }
        const response = await request(app).post('/purpose/' + testPurpose._id).set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);

        const { _id, name, moneySave, cost, realized, err, code } = response.body;

        expect(_id).toBeUndefined();
        expect(moneySave).toBeUndefined();
        expect(cost).toBeUndefined();
        expect(name).toBeUndefined();
        expect(realized).toBeUndefined();

        expect(err).toBe("no valid data in body");
        expect(code).toBe("noData");
    });

    test('[invalid] - invalid ID', async () => {
        bodyData = {
            name: "Edited"
        }
        const response = await request(app).post('/purpose/whatever').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);

        const { _id, name, moneySave, cost, realized, err, code } = response.body;

        expect(_id).toBeUndefined();
        expect(moneySave).toBeUndefined();
        expect(cost).toBeUndefined();
        expect(name).toBeUndefined();
        expect(realized).toBeUndefined();

        expect(err).toBe("Purpose not found");
        expect(code).toBe("noId");
        
    });

    test('[invalid] - no ID', async () => {
        bodyData = {
            name: "Edited"
        }
        const response = await request(app).post('/purpose/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);

        const { _id, name, moneySave, cost, realized, err, code } = response.body;

        expect(_id).toBeUndefined();
        expect(moneySave).toBeUndefined();
        expect(cost).toBeUndefined();
        expect(name).toBeUndefined();
        expect(realized).toBeUndefined();

        expect(err).toBe("Purpose not found");
        expect(code).toBe("noId");
        
    });

    test('[invalid] - cost must be a number', async () => {
        bodyData = {
            cost: "whatever"
        }
        const response = await request(app).post('/purpose/' + testPurpose._id).set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);

        const { _id, name, moneySave, cost, realized, err, code } = response.body;

        expect(_id).toBeUndefined();
        expect(moneySave).toBeUndefined();
        expect(cost).toBeUndefined();
        expect(name).toBeUndefined();
        expect(realized).toBeUndefined();

        expect(err).toBe("cost must be a number");
        expect(code).toBe("cost");
        
    });

    test('[invalid] - moneySave must be a number', async () => {
        bodyData = {
            moneySave: "whatever"
        }
        const response = await request(app).post('/purpose/' + testPurpose._id).set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);

        const { _id, name, moneySave, cost, realized, err, code } = response.body;

        expect(_id).toBeUndefined();
        expect(moneySave).toBeUndefined();
        expect(cost).toBeUndefined();
        expect(name).toBeUndefined();
        expect(realized).toBeUndefined();

        expect(err).toBe("moneySave must be a number");
        expect(code).toBe("moneySave");
        
    });

    test('[invalid] - realized must be a boolean', async () => {
        bodyData = {
            realized: "whatever"
        }

        const response = await request(app).post('/purpose/' + testPurpose._id).set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);

        const { _id, name, moneySave, cost, realized, err, code } = response.body;

        expect(_id).toBeUndefined();
        expect(moneySave).toBeUndefined();
        expect(cost).toBeUndefined();
        expect(name).toBeUndefined();
        expect(realized).toBeUndefined();

        expect(err).toBe("realized must be a boolean");
        expect(code).toBe("realized");
        
    });
    
});

describe('GET expense/', () => {
    let realizedPurpose;

    beforeAll(async () => {
        bodyData = {
            name: "GET purpose/:id tester",
            cost: 100
        }
        testPurpose = await request(app).put('/purpose/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send(bodyData);
        realizedPurpose = await request(app).put('/purpose/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`).send({
            name: "realized purpose",
            cost: 100,
            realized: true
        });
        realizedPurpose = realizedPurpose.body;
        testPurpose = testPurpose.body;
    });


    test('[successfull] - get all purposes', async () => {
        const response = await request(app).get('/purpose/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`);
        const { body } = response;

        expect(Array.isArray(body)).toBe(true);
        expect(body[0]).toBeDefined();
        expect(body.length).toBeGreaterThan(1);
    });

    test('[successfull] - get only one purpose by id', async () => {
        const response = await request(app).get('/purpose/' + testPurpose._id).set('authorization', `Bearer ${token.ACCESS_TOKEN}`);
        const { body  } = response;
        const { _id, name, cost, moneySave, realized } = body[0];

        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(1);
        expect(_id).toBe(testPurpose._id);
        expect(name).toBe(testPurpose.name);
        expect(cost).toBe(testPurpose.cost);
        expect(realized).toBe(testPurpose.realized);
        expect(moneySave).toBe(testPurpose.moneySave);
    });

    test('[successfull] - get all realized purpose', async () => {
        const response = await request(app).get('/purpose/?realized=true').set('authorization', `Bearer ${token.ACCESS_TOKEN}`);
        const { body } = response;

        expect(Array.isArray(body)).toBe(true);
        expect(body[0]).toBeDefined();
        expect(body.length).toBeGreaterThan(0);


        for(let i = 0; i < body.length; i++)
            expect(body[i].realized).toBe(true);
        




    });

    test('[successfull] - get all not realized purpose', async () => {
        const response = await request(app).get('/purpose/?realized=false').set('authorization', `Bearer ${token.ACCESS_TOKEN}`);
        const { body } = response;

        expect(Array.isArray(body)).toBe(true);
        expect(body[0]).toBeDefined();
        expect(body.length).toBeGreaterThan(0);


        for(let i = 0; i < body.length; i++)
            expect(body[i].realized).toBe(false);
        




    });

   
    
});

describe('DELETE expense/:id - delete expense by id', () => {
    test('[successful] - delete expense ', async () => {
        const response = await request(app).delete('/purpose/' + testPurpose._id).set('authorization', `Bearer ${token.ACCESS_TOKEN}`); 
        const { success } = response.body;

        expect(success).toBeDefined();
        expect(success).toBe(`purpose: ${testPurpose._id} was Removed`);
    });

    test('[invalid] - id is not valid  ', async () => {
        const response = await request(app).delete('/purpose/whatever').set('authorization', `Bearer ${token.ACCESS_TOKEN}`); 
        const {err, code } = response.body;

        expect(err).toBe("Purpose not found");
        expect(code).toBe("noId");
    });

    test('[invalid] - id is not defined  ', async () => {
        const response = await request(app).delete('/purpose/').set('authorization', `Bearer ${token.ACCESS_TOKEN}`); 
        const {err, code } = response.body;

        expect(err).toBe("Purpose not found");
        expect(code).toBe("noId");
    });

    test('[successfull] - delete all realized purpose ', async () => {
        const response = await request(app).delete('/purpose/?realized=true').set('authorization', `Bearer ${token.ACCESS_TOKEN}`); 
        const { success, removed } = response.body;

        expect(success).toBe(`All realized purpose was Removed`);
        
        for(i in removed) 
            expect(removed[i].realized).toBeTruthy();
    });
    
});
