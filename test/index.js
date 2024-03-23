const WineDB = require("../index.js");

(async () => {
    const db = await WineDB.init("test");
    db.create({
        name: "test"
    });
    
    console.log(db.getAll());
})();
