const WineDB = require("../index.cjs");

(async () => {
    const db = WineDB.init("test");
    db.create({
        name: "test"
    });
    
    console.log(db.getAll());
})();
