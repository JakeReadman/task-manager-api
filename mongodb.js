const { ObjectId, MongoClient } = require("mongodb");

const connectionUrl = process.env.MONGODB_URL;
const databaseName = "task-manager";

const id = new ObjectId();

MongoClient.connect(connectionUrl, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log("unable to connect to db");
    }
    const db = client.db(databaseName);

    // db.collection("users")
    //   .updateOne(
    //     {
    //       name: "Chris",
    //     },
    //     {
    //       $set: {
    //         name: "Maggie",
    //         age: 5,
    //       },
    //     }
    //   )
    //   .then((result) => {
    //     console.log(result);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
});
