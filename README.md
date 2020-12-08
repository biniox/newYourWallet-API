# List of EndPoint


## user 

PUT /users/ - create a new user (required email and pass in body)
POST /users/authUser - user Authorization and Refresh token
GET /users/:id - getting user Data

## category - Authorization Bearer token is required

PUT /category/createCategory - creating a new category (name in body)
POST /category/ - get all categories
POST /category/:id - update category by id
DELETE /category/:id - Delete category by id


## expenses - Authorization Bearer token is required

PUT /expense/ - create expense (name, cost, categoryId?, date?)
POST /expense/ - edit expense  

GET /expense/:id - get expense by id
GET /expense/ - get all expense
GET /expense/?from=date&to=date - get by date, from, to or both

DELETE /expense/:id - delete one expense


## purpose - Authorization Bearer token is required
PUT /purpose/ - create a new Purpose (name, cost, moneySave?, realized?);

POST /purpose/:id - edit purpose by id

GET /purpose/ - get all purpose
GET /purpose/:id - get one purpose

DELETE /purpose/?realized=true - DELETE all realized purpose
GET /purpose/:id - delete one purpose

