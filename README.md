# Wine DataBase

## Installation
```bash
npm install wine-database
```

## Usage
```js
const WineDB = require("wine-database");

(async () => {
    const db = await WineDB.init("name", "password");
    db.create({
        name: "test"
    });
    
    console.log(db.getAll());
})();
```

## Manipulating the database
```js
// Gets all elements
db.getAll();

// Gets an element by its ID
db.get("id");

// Filters all elements and returns objects that match the requirements
db.filter(x => x.age > 18);// Returns users whose age is greater than 18 years

// Gets the first element that matches the requirements
db.find(x => x.age > 18);//Returns the first user whose age is greater than 18 years

// Create a new object in the database. In all cases it will assign a unique ID even if the passed object already has an ID, it will replace it
db.create(object);
// This function will always return the object created in the database

// Try to save an existing object, if it cannot find it it will create a new object
db.setOrCreate(object);
// This function will always return the object created or changed in the database

// Save an existing element and return that element
db.set(object);
// If no match is found, returns undefined

// Delete an element by its ID
db.delete("id");
```

## License
This project is licensed under the **MIT License**. See the [LICENSE](https://github.com/AxelWine/wine-database/blob/main/LICENSE.md).