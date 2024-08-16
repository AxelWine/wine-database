const WineDB = require("../index.cjs");

(async () => {
    const db = await WineDB.init("test");
    db.create({
        name: "test"
    });
    
    console.log(db.getAll());
})();
