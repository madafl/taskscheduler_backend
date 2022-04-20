import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

let tasks;
let users;
let projects;

export default class ProjectDAO {
  static async injectDB(conn) {
    if (projects) {
      return;
    }
    try {
      //if doesnt already exist, it will be created
      tasks = await conn.db(process.env.TASKS_DB).collection("tasks");
      users = await conn.db(process.env.TASKS_DB).collection("users");
      projects = await conn.db(process.env.TASKS_DB).collection("projects");
    } catch (e) {
      console.error("Unable to establish collection handles in ProjectDAO" + e);
    }
  }

  static async getProjects() {
    try {
      let list = projects.find();
      let listArray = list.toArray();
      return listArray;
    } catch (e) {
      console.error(
        "Unable to convert list to array or problem couting documents" + e
      );
      return { projects: [] };
    }
  }
  static async getProjectByID(id) {
    try {
      let project = projects.findOne({ _id: ObjectId(id) });
      return project;
    } catch (e) {
      console.error("Something went wrong in restaurantsDAO: " + e);
      throw e;
    }
  }

  static async addProject(title, start, end, user_info, progress, type) {
    try {
      const user_db = await users.findOne({
        username: user_info.project_owner,
      }); // get the user from db based on the username => get its _id

      const project_record = {
        name: title,
        start: start,
        end: end,
        progress: progress,
        type: type,
        user_info: {
          user_id: user_db._id,
        },
      };
      return await projects.insertOne(project_record);
    } catch (e) {
      console.error("Unable to post task: " + e);
      return { error: e };
    }
  }
}
