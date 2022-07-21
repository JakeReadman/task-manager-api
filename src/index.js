const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
const bcrypt = require("bcryptjs");

const app = express();
const port = process.env.PORT;

// app.use((req, res, next) => {
//   res
//     .status(503)
//     .send({ message: "Sorry, the site is currently down for maintencance" });
// });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
