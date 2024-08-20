const fs = require("fs");

module.exports = filePath => fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;