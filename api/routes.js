import express from "express";
import RegisterController from "./register.controller.js";
import TasksController from "./tasks.controller.js";
import ProjectController from "./project.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();
// TASKS
router.route("/tasks").get(TasksController.apiGetTasks);
router.route("/tasks/user/:id").get(TasksController.apiGetTasksByUserId);
router.route("/task/:id").get(TasksController.apigetTaskById);
router
  .route("/task/update")
  .put(auth, TasksController.apiUpdateDateProgressTask);
router
  .route("/task")
  .post(auth, TasksController.apiPostTask)
  .put(auth, TasksController.apiUpdateTask)
  .delete(auth, TasksController.apiDeleteTask);

// USERS
router.route("/register").post(RegisterController.apiPostRegister);
router.route("/login").post(RegisterController.loginUser);
router.route("/user/:id").get(RegisterController.apiGetUserById);
router.route("/user/changepassword").post(RegisterController.apiChangePassword);
// router.route("/user/changeusername").post(RegisterController.apiChangeUsername);

// PROJECTS
router.route("/projects").get(auth, ProjectController.apiGetProjects);
router.route("/project/:id").get(TasksController.apiGetTasksByProjectId);
router
  .route("/project/members/:id")
  .get(auth, ProjectController.apiGroupTasksByMember);
router
  .route("/project")
  .post(ProjectController.apiPostProject)
  .put(auth, ProjectController.apiUpdateProject)
  .delete(auth, ProjectController.apiDeleteProject);

//.put(auth, ProjectController.apiUpdateProject);

export default router;
