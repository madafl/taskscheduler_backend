import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;
import ProjectDAO from "./projectDAO.js";

let tasks;
let users;
let projects;

export default class TasksDAO {
  static async injectDB(conn) {
    //if tasks already exists
    if (tasks) {
      return;
    }
    try {
      //else access the tasks connection
      //if doesnt already exist, it will be created
      tasks = await conn.db(process.env.TASKS_DB).collection("tasks");
      users = await conn.db(process.env.TASKS_DB).collection("users");
      projects = await conn.db(process.env.TASKS_DB).collection("projects");
    } catch (e) {
      console.error("Unable to establish collection handles in TasksDAO" + e);
    }
  }

  static async getTasks() {
    try {
      let list = tasks.find();
      let listArray = list.toArray();
      return listArray;
    } catch (e) {
      console.error(
        "Unable to convert list to array or problem couting documents" + e
      );
      return { tasks: [] };
    }
  }
  static async getTaskByID(id) {
    try {
      let task = tasks.findOne({ _id: ObjectId(id) });
      return task;
    } catch (e) {
      console.error("Something went wrong in tasksDAO: " + e);
      throw e;
    }
  }
  static async getTasksByProjectId(projectId) {
    try {
      let tasksByProjectId = tasks.find({ projectId: ObjectId(projectId) });
      let project = projects.find({ _id: ObjectId(projectId) });
      let projectArray = await project.toArray();
      let tasksArray = await tasksByProjectId.toArray();
      const result = [projectArray, tasksArray];
      return result;
    } catch (e) {
      console.error("Something went wrong in tasksDAO: " + e);
      throw e;
    }
  }

  static async addTask(body, user_id) {
    try {
      let task_record = "";
      if (body.assigned_user) {
        task_record = {
          name: body.name,
          description: body.description,
          start: body.start,
          end: body.end,
          progress: body.progress,
          type: body.type,
          dependencies: body.dependencies,
          backgroundColor: body.backgroundColor,
          progressColor: body.progressColor,
          projectId: ObjectId(body.project_id),
          user_info: {
            user_id: ObjectId(user_id),
            assigned_user: ObjectId(body.assigned_user),
          },
        };
      } else {
        task_record = {
          name: body.name,
          description: body.description,
          start: body.start,
          end: body.end,
          progress: body.progress,
          type: body.type,
          dependencies: body.dependencies,
          backgroundColor: body.backgroundColor,
          progressColor: body.progressColor,
          projectId: ObjectId(body.project_id),
          user_info: {
            user_id: ObjectId(user_id),
          },
        };
      }

      const result = await tasks.insertOne(task_record);
      return result;
    } catch (e) {
      console.error("Unable to post task: " + e);
      return { error: e };
    }
  }
  static async updateTask(task_id, user_id, task) {
    const task_db = await tasks.findOne({ _id: ObjectId(task_id) });
    const project_db = await projects.findOne({
      _id: ObjectId(task_db.projectId),
    });
    try {
      let has_permission = false;
      project_db.members.map(member => {
        if (member.equals(ObjectId(user_id))) {
          has_permission = true;
        }
      });
      // poti edita doar daca esti project_owner sau in members
      if (
        ObjectId(user_id).equals(project_db.project_owner_id) ||
        has_permission
      ) {
        let query = {};
        if (task.assigned_user != "") {
          query = {
            name: task.name,
            description: task.description,
            start: task.start,
            end: task.end,
            progress: task.progress,
            type: task.type,
            dependencies: task.dependencies,
            projectId: ObjectId(task.project_id),
            user_info: {
              user_id: ObjectId(user_id),
              assigned_user: ObjectId(task.assigned_user),
            },
          };
        } else {
          query = {
            name: task.name,
            description: task.description,
            start: task.start,
            end: task.end,
            progress: task.progress,
            type: task.type,
            dependencies: task.dependencies,
            projectId: ObjectId(task.project_id),
            user_info: {
              user_id: ObjectId(user_id),
            },
          };
        }

        let response = await tasks.updateOne(
          { _id: ObjectId(task_id) },
          {
            $set: query,
          }
        );
        return response;
      } else {
        console.log("Nu ai permisiunea sa editezi taskul.");
        return { status: 401 };
      }
    } catch (e) {
      console.error("Unable to update task: " + e);
    }
  }
  static async deleteTask(task_id, user_id) {
    // Delete from db based on the task_id and the user_id
    // user that reated the task or project owner cand elete/ edit task
    const task_db = await tasks.findOne({ _id: ObjectId(task_id) });

    //daca user_id este null sau daca userul taskului este diferit de cel care doreste sa il stearga
    if (user_id != null) {
      if (ObjectId(user_id).equals(task_db.user_info.user_id)) {
        try {
          const deleteResponse = await tasks.deleteOne({
            _id: ObjectId(task_id),
          });
          return deleteResponse;
        } catch (e) {
          console.error("Taskul nu a putut fi sters: " + e);
          return { error: e };
        }
      } else {
        console.log("Nu ai permisiunea sa stergi taskul.");
        return { status: 401 };
      }
    } else {
      console.log("No user id.");
    }
  }
  static async updateDateProgressTask(task_id, data, updated_element, user_id) {
    const task_db = await tasks.findOne({ _id: ObjectId(task_id) });
    const project_db = await projects.findOne({
      _id: ObjectId(task_db.projectId),
    });
    // poti edita doar daca esti project_owner sau in members
    // check if same user that created the task of project owner
    try {
      let has_permission = false;
      project_db.members.map(member => {
        if (member.equals(ObjectId(user_id))) {
          has_permission = true;
        }
      });

      if (
        ObjectId(user_id).equals(project_db.project_owner_id) ||
        has_permission
      ) {
        if (updated_element === "date") {
          const response = tasks.updateOne(
            {
              _id: ObjectId(task_id),
            },
            {
              $set: {
                start: data.start,
                end: data.end,
              },
            }
          );
          return response;
        } else if (updated_element === "progress") {
          const response = tasks.updateOne(
            {
              _id: ObjectId(task_id),
            },
            {
              $set: {
                progress: data.progress,
              },
            }
          );
          return response;
        }
      } else {
        console.log("Nu ai permisiunea sa editezi taskul.");
      }
    } catch (e) {
      console.error("Unable to update date: " + e);
    }
  }
  static async getTasksByUserId(user_id) {
    try {
      let tasksByUserId = tasks.find({
        user_info: { user_id: ObjectId(user_id) },
      });
      let tasksArray = await tasksByUserId.toArray();
      return tasksArray;
    } catch (e) {
      console.error("Something went wrong in tasksDAO: " + e);
      throw e;
    }
  }
}
