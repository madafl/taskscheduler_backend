import ProjectDAO from "../dao/projectDAO.js";
import TasksDAO from "../dao/tasksDAO.js";

export default class TasksController {
  static async apiGetTasks(req, res, next) {
    const tasks = await TasksDAO.getTasks();

    //map tasks to only send the fields we want
    const response = tasks.map(task => {
      return {
        id: task._id,
        title: task.name,
        start: task.start,
        end: task.end,
        progress: task.progress,
      };
    });
    const finalResponse = {
      tasks: tasks,
    };
    res.json(finalResponse);
  }
  static async apigetTaskById(req, res, next) {
    try {
      let id = req.params.id || {};
      let task = await TasksDAO.getTaskByID(id);
      if (!task) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(task);
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: e });
    }
  }
  static async apiGetTasksByProjectId(req, res, next) {
    try {
      const projectId = req.params.id;
      const result = await TasksDAO.getTasksByProjectId(projectId);

      res.status(200).json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  //http://localhost:5000/api/route/task?title=test&body=testbody&name=mada
  static async apiPostTask(req, res, next) {
    //task_info: titlu, text, data, label, start_date, due_date,
    //userInfo:  user_id, team_id, board,
    try {
      const body = req.body;
      const user_id = req.user_id;
      const project_id = req.body.project_id;
      const response = await TasksDAO.addTask(body, user_id);
      if (response.insertedId != null) {
        const update_project =
          await ProjectDAO.updateProjectProgressOnTaskUpdated(project_id);
        if (update_project) {
          res.status(200).json({ status: 200 });
        } else {
          res.status(500).json({ status: 500 });
        }
      } else {
        res.status(500).json({ error: "Taskul nu a putut fi adaugat." });
      }
    } catch (e) {
      res.status(500).json("error: " + e.message);
    }
  }
  // http://localhost:5000/api/v1/restaurants/review?text=very good soup22&review_id=61d424f2afb6c9114a0a2073&user_id=1234&name=madafl
  static async apiUpdateTask(req, res, next) {
    // can update anything not only the body
    // check if the user that modifies is the same as the one that created
    try {
      const task_id = req.query.task_id;
      const task = req.body;
      const user_id = req.user_id;
      const response = await TasksDAO.updateTask(task_id, user_id, task);
      var { error } = response;
      if (error) {
        res.status(400).json({ error });
      }
      if (response.modifiedCount == 0) {
        throw new Error("Unable to update task");
      } else {
        const update_project =
          await ProjectDAO.updateProjectProgressOnTaskUpdated(
            req.body.project_id
          );
        // console.log(update_project);
        if (update_project) {
          res.status(200).json({ status: 200 });
        } else {
          res.status(500).json({ status: 500 });
        }
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
  static async apiDeleteTask(req, res, next) {
    try {
      const task_id = req.query.task_id;
      const user_id = req.user_id;
      const project_id = req.query.project_id;
      const response = await TasksDAO.deleteTask(task_id, user_id);
      if (response.deletedCount === 1) {
        const update_project =
          await ProjectDAO.updateProjectProgressOnTaskUpdated(project_id);
        // console.log(update_project);
        if (update_project) {
          res.status(200).json({ status: 200 });
        } else {
          res.status(500).json({ status: 500 });
        }
      } else {
        res.status(401).json({ status: 401 });
      }
    } catch (e) {
      res.status(500).json({ error: e.message, status: 500 });
    }
  }
  static async apiUpdateDateProgressTask(req, res, next) {
    try {
      const task_id = req.query.task_id;
      const user_id = req.user_id;
      const updated_element = req.query.updated_element;
      const data = req.body;
      const response = await TasksDAO.updateDateProgressTask(
        task_id,
        data,
        updated_element,
        user_id
      );
      if (response.modifiedCount == 0) {
        throw new Error("unable to update task.");
      } else {
        if (updated_element === "progress") {
          const update_project =
            await ProjectDAO.updateProjectProgressOnTaskUpdated(
              data.project_id
            );
          if (update_project.status) {
            res
              .status(200)
              .json({ status: 200, project: update_project.project });
          } else {
            res.status(500).json({ status: 500 });
          }
        }
      }
    } catch (e) {
      res.status(500).json({ error: e.message, status: 500 });
    }
  }
}
