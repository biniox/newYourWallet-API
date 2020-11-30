const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

const { URI_MONGO } = require("../config");
const { 
    generateTokens,
    verifyToken,
 } = require("./users");

const clean = () =>  mongoose.connection.dropDatabase();

beforeAll(async () => {
    await mongoose.connect(URI_MONGO, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})  
    
    const db = mongoose.connection;
});

afterAll(async () => {
    mongoose.connection.close();
})




 describe('GET user/:id - getting user info by id', () => {
    
    test('[Successfull] get user', async () => {
        bodyData = {
            email: "tested@email.com",
            password: "StrongPassword"  
        }

        const newUser  = await request(app).put('/users').send(bodyData);

        const {_id} = newUser.body;
        const response = await request(app).get('/users/' + _id);
        const { body } = response;
        const {status, headers} = response;

        expect(headers['content-type']).toBe("application/json; charset=utf-8");
        expect(body.err).toBeUndefined();
        expect(body.code).toBeUndefined();
        expect(status).toBe(200);
        
        expect(body.name).toBeNull();
        expect(body.name).toBeNull();
        expect(body.imgPath).toBeNull();
        expect(body.name).toBeNull();
        expect(body.email).toBe("tested@email.com");
        expect(body.password).toBeUndefined();

        
    });
     
    test('[Invalid] - ObjectID is Invalid', async () => {
        const response = await request(app).get('/users/whatever');
        const {err, code} = response.body;
        const {status, headers} = response;

        expect(headers['content-type']).toBe("application/json; charset=utf-8");
        expect(err).toBe('ObjectId is invalid');
        expect(code).toBe('ObjectId');
        expect(status).toBe(400);

    });

 });

 describe('PUT user/ - create a new User', () => {

    afterAll(clean);

     test('[succesfull] - create a new user', async () => {
        bodyData = {
            email: "tested1@email.com",
            password: "StrongPassword"  
        }

        const response  = await request(app).put('/users').send(bodyData);
        
        const { body } = response;
        const {status, headers} = response;

        expect(headers['content-type']).toBe("application/json; charset=utf-8");
        expect(body.err).toBeUndefined();
        expect(body.code).toBeUndefined();
        expect(status).toBe(200);
        expect(body.email).toBeUndefined();
        expect(body.password).toBeUndefined();
     });

     test('[Invalid] - email adress is used', async () => {
        bodyData = {
            email: "tested1@email.com",
            password: "StrongPassword"  
        }

        const nexUserWithTheSameEmail  = await request(app).put('/users').send(bodyData);

        const { body } = nexUserWithTheSameEmail;
        const {status, headers} = nexUserWithTheSameEmail;

        expect(headers['content-type']).toBe("application/json; charset=utf-8");
        expect(body.err).toBe("Email Address is used");
        expect(body.code).toBe("email");
        expect(status).toBe(400);
     });

     test('[Invalid] - email adress is required', async () => {
        bodyData = {
            password: "StrongPassword"  
        }

        const nexUserWithTheSameEmail  = await request(app).put('/users').send(bodyData);

        const { body } = nexUserWithTheSameEmail;
        const {status, headers} = nexUserWithTheSameEmail;

        expect(headers['content-type']).toBe("application/json; charset=utf-8");
        expect(body.err).toBe("Email is required");
        expect(body.code).toBe("email");
        expect(status).toBe(400);
     });
     
     test('[Invalid] - password is required', async () => {
        bodyData = {
            email: "tested@email.pl"
        }

        const nexUserWithTheSameEmail  = await request(app).put('/users').send(bodyData);

        const { body } = nexUserWithTheSameEmail;
        const {status, headers} = nexUserWithTheSameEmail;

        expect(headers['content-type']).toBe("application/json; charset=utf-8");
        expect(body.err).toBe("Password is required");
        expect(body.code).toBe("password");
        expect(status).toBe(400);
     });

     test('[Invalid] - not valid Email Adress', async () => {
        bodyData = {
            email: "whatever",
            password: "StrongPassword"
        }

        const nexUserWithTheSameEmail  = await request(app).put('/users').send(bodyData);

        const { body } = nexUserWithTheSameEmail;
        const {status, headers} = nexUserWithTheSameEmail;

        expect(headers['content-type']).toBe("application/json; charset=utf-8");
        expect(body.err).toBe("Invalid email format");
        expect(body.code).toBe("emailFormat");
        expect(status).toBe(400);
     });

     
});

describe('Authorization', () => {
    let bodyData, token;
    let expiredToken = {
        ACCESS_TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYzNiYWQ2YTlmZWVjM2MyOTc4ODQwYyIsInR5cGUiOiJBQ0NFU1MiLCJpYXQiOjE2MDY2NjI4OTMsImV4cCI6MTYwNjY2NDA5M30.zqbuHeOp01fwDZZo2JRwaMfrNWSM1z5CZp3tCy28tbY",
        REFRESH_TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYzNiYWQ2YTlmZWVjM2MyOTc4ODQwYyIsInR5cGUiOiJSRUZSRVNIIiwiaWF0IjoxNjA2NjYyODkzLCJleHAiOjE2MDY2NjMzNzN9.GavcIOKHK3YxAP32b_okxTNNGhwAWOUe8YKXtY8est0"
    }

    beforeAll(async() => {
        bodyData = {
            email: "tested1@email.com",
            password: "StrongPassword"  
        }

        await request(app).put('/users').send(bodyData);
    });

    afterAll(clean);

    describe('POST /authUser - User Authorization', () => {

        test('[successfull] - Authorization', async () => {
                const response  = await request(app).post('/users/authUser').send(bodyData);
                const { body } = response;

                expect(body.ACCESS_TOKEN).not.toBeUndefined();
                expect(body.REFRESH_TOKEN).not.toBeUndefined();
                expect(response.status).toBe(200);

                token = body; // save token for next testing
            });

    });

    describe('verifyToken() - check validation of Token or REFRESH him', () => {
        test('[successfull] - [verifyToken()] - Authorization verify ACCESS Token ', () => {
            // for this test we need a token generated in "[successfull] - Authorization" test
            req = {
                headers: {
                    authorization: `Bearer ${token.ACCESS_TOKEN}`
                }
            }
            res = {}
            next = jest.fn();

            const result = verifyToken(req,res,next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(req.id).not.toBeUndefined();
        });

        test('[successfull] - [verifyToken()] - Authorization refresh ACCESS by REFRESH TOKEN ', () => {
            // for this test we need a token generated in "[successfull] - Authorization" test
            req = {
                headers: {
                    authorization: `Bearer ${token.REFRESH_TOKEN}`
                }
            }
            res = {
                json: jest.fn()
            }
            next = jest.fn();

            const result = verifyToken(req,res,next);
            expect(next).toHaveBeenCalledTimes(0);
            expect(res.json).toHaveBeenCalledTimes(1);
            expect(res.json.mock.calls[0][0].ACCESS_TOKEN).not.toBeUndefined()
            expect(res.json.mock.calls[0][0].REFRESH_TOKEN).not.toBeUndefined()
            expect(req.id).toBeUndefined();

        });

        test('[Invalid] - [verifyToken()] - Authorization data is missing ', () => {

            req = {}
            res = {
                    status: jest.fn().mockImplementation(() => res),
                    json: jest.fn().mockImplementation(() => res),
            };
            next = jest.fn();

            const result = verifyToken(req,res,next);
            expect(next).toHaveBeenCalledTimes(0);
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(req.id).toBeUndefined();
        });
        
        test('[Invalid] - [verifyToken()] - Authorization token is wrong or expired ', () => {
            req = {
                headers: {
                    authorization: `Bearer whatever`
                }
            }
            res = {
                    status: jest.fn().mockImplementation(() => res),
                    json: jest.fn().mockImplementation(() => res),
            };
            next = jest.fn();

            const result = verifyToken(req,res,next);
            expect(next).toHaveBeenCalledTimes(0);
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(req.id).toBeUndefined();
        });

        test('[Invalid] - [verifyToken()] - Authorization token is expired ', () => {
            req = {
                headers: {
                    authorization: `Bearer ${expiredToken.ACCESS_TOKEN}`
                }
            }
            res = {
                    status: jest.fn().mockImplementation(() => res),
                    json: jest.fn().mockImplementation(() => res),
            };
            next = jest.fn();

            const result = verifyToken(req,res,next);
            expect(next).toHaveBeenCalledTimes(0);
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(req.id).toBeUndefined();
        });
        
    });

    describe('generateToken()', () => {

        test('[successfull] - [generateTokens()] - Successfull generating token ', () => {
            user = {
                _id: "whateverValidId",
            }

            const result = generateTokens(user);

            expect(result.ACCESS_TOKEN).not.toBeUndefined();
            expect(result.REFRESH_TOKEN).not.toBeUndefined();
        });
 
    })
    
    describe('POST users/refreshToken - Refreshing ACCESS TOKEN', () => {
        test('[successfull] refresh old Token', async () => {
            const response = await request(app).post('/users/refreshToken').set('authorization', `Bearer ${token.REFRESH_TOKEN}`);

            expect(response.body.ACCESS_TOKEN).not.toBeUndefined();
            expect(response.body.REFRESH_TOKEN).not.toBeUndefined();
        });

        test('[Invalid] refresh old Token - token is wrong', async () => {
            const response = await request(app).post('/users/refreshToken').set('authorization', `Bearer whatever`);

            expect(response.body.ACCESS_TOKEN).toBeUndefined();
            expect(response.body.REFRESH_TOKEN).toBeUndefined();
            expect(response.body.err).toBe('Invalid access TOKEN or expired');
            expect(response.body.code).toBe('token');
        });

        test('[Invalid] refresh old Token - token is in wrong format', async () => {
            const response = await request(app).post('/users/refreshToken').set('authorization', `B e a r e r whatever`);

            expect(response.body.ACCESS_TOKEN).toBeUndefined();
            expect(response.body.REFRESH_TOKEN).toBeUndefined();
            expect(response.body.err).toBe('Invalid access TOKEN or expired');
            expect(response.body.code).toBe('token');
        });
        
        test('[Invalid] refresh old Token - token is ACCESS!', async () => {
            const response = await request(app).post('/users/refreshToken').set('authorization', `Bearer ${token.ACCESS_TOKEN}`);
            
            expect(response.body.ACCESS_TOKEN).toBeUndefined();
            expect(response.body.REFRESH_TOKEN).toBeUndefined();
            expect(response.body.err).toBe('To tefresh your token, use REFRESH TOKEN, not ACCESS TOKEN');
            expect(response.body.code).toBe("tokenNoRefresh");
        });

        test('[Invalid] refresh old Token - token is expired!', async () => {
            const response = await request(app).post('/users/refreshToken').set('authorization', `Bearer ${expiredToken.REFRESH_TOKEN}`);
            
            expect(response.body.ACCESS_TOKEN).toBeUndefined();
            expect(response.body.REFRESH_TOKEN).toBeUndefined();
            expect(response.body.err).toBe("Invalid access TOKEN or expired");
            expect(response.body.code).toBe("token");
        });

    });



});


 


