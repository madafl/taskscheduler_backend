import express from "express";
import RegisterController from "./register.controller.js";
import TasksController from "./tasks.controller.js";
import ProjectController from "./project.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.route("/tasks").get(TasksController.apiGetTasks);
router.route("/id/:id").get(TasksController.apigetTaskById);

router
  .route("/task")
  .post(auth, TasksController.apiPostTask)
  .put(auth, TasksController.apiUpdateTask)
  .delete(auth, TasksController.apiDeleteTask);
router.route("/project/:id").get(TasksController.apiGetTasksByProjectId);

router.route("/register").post(RegisterController.apiPostRegister);

router.route("/login").post(RegisterController.loginUser);

router.route("/project").post(ProjectController.apiPostProject);
router.route("/projects").get(ProjectController.apiGetProjects);

export default router;
