import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
import RegisterDAO from "./dao/registerDAO.js";
import TasksDAO from "./dao/tasksDAO.js";
import ProjectDAO from "./dao/projectDAO.js";

dotenv.config();
const MongoClient = mongodb.MongoClient;

const port = process.env.PORT || 8000;
MongoClient.connect(process.env.TASKSCHEDULER_DB_URI)
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async client => {
    // apelate la pornirea aplicatiei
    await RegisterDAO.injectDB(client);
    await TasksDAO.injectDB(client);
    await ProjectDAO.injectDB(client);
    app.listen(port, () => {
      console.log(
        "Listening on port " + port + ". Ready to get some queriesss"
      );
    });
  });
