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
  static async getProjects(filter, user_id) {
    let query;
    try {
      if (filter == "mine") {
        query = { project_owner_id: ObjectId(user_id) };
      } else if (filter == "shared") {
        query = { members: ObjectId(user_id) };
      } else if (filter == "all" || filter == null) {
        query = {
          $or: [
            { project_owner_id: ObjectId(user_id) },
            { members: ObjectId(user_id) },
          ],
        };
      }
      try {
        let my_projects = await projects.find(query);
        try {
          let my_projects_array = my_projects.toArray();
          return my_projects_array;
        } catch (e) {
          console.log("error here " + e);
          return [];
        }
      } catch (e) {
        console.log("smt here " + e);
        return [];
      }
    } catch (e) {
      console.error(
        "Unable to convert list to array or problem couting documents" + e
      );
      return [];
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

  static async addProject(
    name,
    start,
    end,
    progress,
    type,
    project_owner_email,
    members_emails,
    status
  ) {
    try {
      const user_db = await users.findOne({
        email: project_owner_email,
      });
      // get the user from db based on the username => get its _id
      // get id of memebers based on email
      // if no user in db => return error => ask if send an invite
      let members_db = [];
      for (let i = 0; i < members_emails.length; i++) {
        let member = await users.findOne({
          email: members_emails[i],
        });
        if (member != null) {
          members_db.push(member._id);
        } else {
          console.log("No member with email: " + members_emails[i]);
          return { no_email: members_emails[i] };
        }
      }
      const project_record = {
        name: name,
        start: start,
        end: end,
        progress: progress,
        type: type,
        project_owner_id: user_db._id,
        members: members_db,
        status: status,
      };
      return await projects.insertOne(project_record);
    } catch (e) {
      console.error("Unable to post task: " + e);
      return { error: e };
    }
  }
  static async updateProject(body, project_id, user_id) {
    const project_db = await projects.findOne({ _id: ObjectId(project_id) });
    try {
      // verifica user_id === project owner
      if (ObjectId(user_id).equals(project_db.project_owner_id)) {
        // Verificare emailuri introduse
        // daca membrul exista => returneaza members_db care contine id uri
        // daca nu exista => returneaza no_email: emailul
        let members_db = [];
        for (let i = 0; i < body.emails.length; i++) {
          let member = await users.findOne({
            email: body.emails[i],
          });
          if (member != null) {
            members_db.push(member._id);
          } else {
            console.log("No member with email: " + body.emails[i]);
            return { no_email: body.emails[i] };
          }
        }
        // campuri modificate
        let response;
        Object.entries(body).map(([k, v]) => {
          response = projects.updateOne(
            {
              _id: ObjectId(project_id),
            },
            {
              $set: {
                k: v,
              },
            },
            { upsert: true }
          );
        });
        return response;
      } else {
        console.log("Nu ai permisiunea sa editezi proiectul.");
        return { status: 401 };
      }
    } catch (e) {
      console.error("Unable to post task: " + e);
      return { error: e };
    }
  }
  static async deleteProject(project_id, user_id) {
    // Sterge proiectul in functie de id si user id
    const project_db = await projects.findOne({ _id: ObjectId(project_id) });
    //daca user_id este null sau daca userul proiectului este diferit de cel care doreste sa il stearga
    if (user_id != null) {
      if (ObjectId(user_id).equals(project_db.project_owner_id)) {
        try {
          const deleteResponse = await projects.deleteOne({
            _id: ObjectId(project_id),
            project_owner_id: ObjectId(user_id),
          });
          return deleteResponse;
        } catch (e) {
          console.error("Proiectul nu a putut fi sters: " + e);
          return { error: e };
        }
      } else {
        console.log("Nu ai permisiunea sa stergi proiectul.");
        return { status: 401 };
      }
    } else {
      console.log("No user id.");
    }
  }
}
