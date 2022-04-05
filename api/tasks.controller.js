
import TasksDAO from "../dao/tasksDAO.js";
// TODO: when click on a user, see all his reviews

export default class TasksController {

    static async apiGetTasks(req, res, next) {
        const tasks = await TasksDAO.getTasks();

        //map tasks to only send the fields we want
        const response = tasks.map(task => {
            return {
                id: task._id,
                title: task.name,
                start:task.start,
                end: task.end,
                progress: task.progress,
            }
            
        });
        const finalResponse = {
            tasks: tasks,
        }
        res.json(finalResponse);
        
      
    }
    static async apigetTaskById(req, res, next){
        try { 
            let id = req.params.id || {};
            let task = await TasksDAO.getTaskByID(id);
            if (!task){
                    res.status(404).json({error:"Not found"});
                    return
            }     
            res.json(task); 
        } catch (e) {
            console.log(e);
            res.status(500).json({error: e});
        }

    }

    //http://localhost:5000/api/route/task?title=test&body=testbody&name=mada
    static async apiPostTask(req, res, next) {
        //task_info: titlu, text, data, label, start_date, due_date,
        //userInfo:  user_id, team_id, board,
        try {
            const title = req.body.title;
            const description = req.body.description;
            const progress = req.body.progress;
            const start = req.body.start;
            const end = req.body.end;
            const type = req.body.type;
            const status = req.body.status;
            const dependencies = req.body.dependencies;
            const backgroundColor = req.body.backgroundColor;
            const progressColor = req.body.progressColor;
            const user_info = {
                name: req.body.name,
            } 

            const response = await TasksDAO.addTask(
                title, description, start, end, user_info, progress, type, status, dependencies, backgroundColor, progressColor
            )
            res.json({status:"succes"});

        } catch (e) {
            res.status(500).json("error: " + e.message)
        }

    }
    // http://localhost:5000/api/v1/restaurants/review?text=very good soup22&review_id=61d424f2afb6c9114a0a2073&user_id=1234&name=madafl
    static async apiUpdateTask(req, res, next) {
        // can update anything not only the body
        // check if the user that modifies is the same as the one that created
        try {
            const task_id = req.query.task_id;
            const title = req.query.title;
            const body =  req.query.body;
            const user_id = req.query.user_id;
            const date  = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
            
            const response = await TasksDAO.updateTask(
                    task_id, user_id, body, title, date
            );
            var {error} = response;
            if(error) {
                res.status(400).json({error})
            }
            if (response.modifiedCount == 0){
                throw new Error(
                    "unable to update task",
                )
            }
            res.json({status: "succes"})
            console.log(task_id, req.query.user_id, body, title, date) 
        } catch (e) {
            res.status(500).json({ error: e.message});
        }

    }
    static async apiDeleteTask(req, res, next) {
        try {
        
            const task_id = req.query.task_id;
            const user_name = req.query.name;
            
            const response = await TasksDAO.deleteTask(
                task_id,
                user_name
            )
            if (response.deletedCount1=== 1){
                res.json({ status: "Task deleted successfully."});
            } else {
                res.json({ status: "Failed to delete task."});
            }
            
        } catch (e) {
            res.status(500).json({error: e.message});
        }

    }

}

