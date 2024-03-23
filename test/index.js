const WineDB = require("../index.js");

(async () => {
    const db = await WineDB.init("test", "password");
    db.create({
        name: "test"
    });
    
    console.log(db.getAll());
})();
