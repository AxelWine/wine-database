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
    db.set({
        name: "test"
    });
    
    console.log(db.getAll());
})();
```

## Manipulating the database
```js
// Gets all elements
db.getAll();

// Gets all elements that match the value in a key
db.get("key", "value");

// Gets the first element that matches the value in a key
db.getFirst("key", "value");

// Saves a new item or replaces the item if it contains an ID
db.set(object);
// If no match is found, a new item is created and assigned an ID if it does not have one assigned.

// Delete an element that matches the value in a key
db.delete("key", "value");
```

## License
This project is licensed under the **MIT License**. See the [LICENSE](https://github.com/AxelWine/wine-database/blob/main/LICENSE.md).