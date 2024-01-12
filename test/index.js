import WineDB from "../index.js";

(async () => {
    const db = await WineDB.init("test", "password");
    db.set({
        name: "test"
    });
    
    console.log(db.getAll());
})();
