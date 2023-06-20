/** Server startup for Message.ly. */


const app = require("./app");


app.listen(3000, "127.0.0.1", function () {
  console.log("Listening on 3000");
  console.log("Let's party!")
});