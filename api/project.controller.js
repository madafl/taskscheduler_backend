import ProjectDAO from "../dao/projectDAO.js";

export default class ProjectController {
  static async apiGetProjects(req, res, next) {
    let filter = req.query.filter ? req.query.filter : "all";
    const projects = await ProjectDAO.getProjects(filter, req.user_id);
    const finalResponse = { projects };
    res.json(finalResponse);
  }

  //http://localhost:5000/api/route/project?title=test&body=testbody&name=mada
  static async apiPostProject(req, res, next) {
    try {
      const name = req.body.name;
      const start = req.body.start;
      const end = req.body.end;
      const progress = req.body.progress;
      const type = req.body.type;
      const project_owner_email = req.body.project_owner;
      const members_emails = req.body.emails;
      const status = req.body.status;

      const response = await ProjectDAO.addProject(
        name,
        start,
        end,
        progress,
        type,
        project_owner_email,
        members_emails,
        status
      );
      if (response.no_email != [] && response.no_email != null) {
        res.status(418).json({ error: response.no_email });
      } else if (response.insertedId != null) {
        res.status(200).json({ status: 200 });
      }
    } catch (e) {
      res.status(500).json({ error: e.message, status: 500 });
    }
  }
  static async apiUpdateProject(req, res, next) {
    try {
      const body = req.body;
      const user_id = req.user_id;
      const project_id = req.query.project_id;
      const response = await ProjectDAO.updateProject(
        body,
        project_id,
        user_id
      );

      if (response.no_email != [] && response.no_email != null) {
        res.status(418).json({ error: response.no_email });
      } else {
        res.status(200).json({ response });
        console.log("Raspuns " + response);
        // console.log("HERE");
      }
    } catch (e) {
      console.log(e);
    }
  }
  static async apiDeleteProject(req, res, next) {
    try {
      const user_id = req.user_id; //id-ul utilizatorului autentificat
      const project_id = req.query.project_id;

      const response = await ProjectDAO.deleteProject(project_id, user_id);
      if (response.deletedCount === 1) {
        res.status(200).json({ status: 200 });
      } else {
        res.status(401).json({ status: 401 });
      }
    } catch (e) {
      res.status(500).json({ error: e.message, status: 500 });
    }
  }
}
