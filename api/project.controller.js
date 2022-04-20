import ProjectDAO from "../dao/projectDAO.js";

export default class ProjectController {
  static async apiGetProjects(req, res, next) {
    const projects = await ProjectDAO.getProjects();

    const response = projects.map(project => {
      return {
        id: project._id,
        title: project.name,
        start: project.start,
        end: project.end,
        progress: project.progress,
      };
    });
    const finalResponse = {
      projects: projects,
    };
    res.json(finalResponse);
  }

  //http://localhost:5000/api/route/project?title=test&body=testbody&name=mada
  static async apiPostProject(req, res, next) {
    //project_info: titlu, start_date, end_date,
    try {
      const title = req.body.title;
      const progress = req.body.progress;
      const start = req.body.start;
      const end = req.body.end;
      const type = req.body.type;
      const user_info = {
        project_owner: req.body.members.username,
      };

      const response = await ProjectDAO.addProject(
        title,
        start,
        end,
        user_info,
        progress,
        type
      );
      res.json({ status: "succes" });
    } catch (e) {
      res.status(500).json("error: " + e.message);
    }
  }
}
