# Wine DataBase

## Installation
```bash
npm install wine-database
```

## Usage
```js
const WineDB = require("wine-database");

const db = WineDB.init("name", "password");
db.create({
    name: "test"
});

console.log(db.getAll());
```
Password is optional, if you do not enter a password, the database will be saved to an unencrypted JSON file.

## API Reference
### `db.getAll()`
Returns all elements stored in the database.

### `db.get(id)`
Retrieves an element by its ID.

### `db.filter(callback)`
Filters all elements in the database and returns those that match the requirements specified in the callback function.

```js
db.filter(x => x.age > 18);// Returns users whose age is greater than 18 years
```

### db.find(callback)
Finds and returns the first element that matches the requirements specified in the callback function.

```js
db.find(x => x.age > 18);//Returns the first user whose age is greater than 18 years
```

### `db.create(object)`
Creates a new object in the database. This method automatically assigns a unique ID to the object, even if the object passed already has an ID (the existing ID will be replaced). The method returns the created object.

### `db.setOrCreate(object)`
Attempts to update an existing object in the database. If the object is not found, it creates a new object. The method returns the created or updated object.

### `db.set(object)`
Updates an existing element in the database and returns the updated element. If no matching element is found, it returns `undefined`.

### `db.delete(id)`
Deletes an element by its ID.

## Advanced Usage
### Defining a Class for Database Entries
The `defineClass` method allows you to define a class to be used for all objects created in the database. This can be useful when you want to enforce a specific structure or behavior for your database entries.

```js
db.defineClass(ClassObject);
```

**Example:**
```js
class Wine {
    constructor(props) {
        this.name = props.name;
        this.year = props.year;
    }

    getAge() {
        return new Date().getFullYear() - this.year;
    }
}

db.defineClass(Wine);

const newWine = db.create({ name: "Chardonnay", year: 2018 });
console.log(newWine.getAge()); // Outputs the age of the wine
```

## License
This project is licensed under the **MIT License**. See the [LICENSE](https://github.com/AxelWine/wine-database/blob/main/LICENSE.md).