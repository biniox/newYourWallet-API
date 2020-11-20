const {categoryModel, userModel, purposeModel, expenseModel} = require('./model');

test('check valid user Shema', () => {
    const doc = new userModel({
        name: "Beamer", 
        surname: "Boy", 
        email: "Dreamer@boy.com",
        pass: "PassswordGoodAndStrong",

    });
    doc.validateSync();


    expect(doc.errors).toBeUndefined();
    expect(doc.budget).toBeFalsy();
    expect(doc.name).toBe("Beamer");
    expect(doc.surname).toBe("Boy");
});

test('check not valid user Shema', () => {
    const doc = new userModel({});   
    doc.validateSync();

    const {pass, email, name} = doc.errors;

    expect(pass.properties.type).toBe("required")
    expect(email.properties.type).toBe("required")
});