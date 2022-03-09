import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;
import RegisterDAO from "./registerDAO.js";

let tasks;
let users; 

export default class TasksDAO {
    static async injectDB(conn) {
        //if tasks already exists 
        if (tasks) {
            return
        }
        try { 
            //else access the tasks connection 
            //if doesnt already exist, it will be created
            tasks = await conn.db(process.env.TASKS_DB).collection("tasks");
            users = await conn.db(process.env.TASKS_DB).collection("users");
        } catch (e) {
            console.error('Unable to establish collection handles in TasksDAO' + e);
        }
    }

    static async getTasks(){
        try {
            let list = tasks.find();
            let listArray = list.toArray();
            return listArray;
        } catch (e) {
            console.error('Unable to convert list to array or problem couting documents' + e);
            return  {tasks: []}
        }
    }
    static async getTaskByID(id){
        try {
            let task = tasks.findOne({_id: ObjectId(id)});
            return task;
            
        } catch (e) {
            console.error('Something went wrong in restaurantsDAO: ' + e);
            throw e;
        }
    }

    static async addTask(title, body, start, end, user_info, progress) {
        try { 
            const user_db = await users.findOne({username: user_info.name}); // get the user from db based on the username => get its _id
            const task_record = {
                name: title,
                body: body,
                start: new Date(Date.parse(start)),
                end: new Date(Date.parse(end)),
                progress: progress,
                user_info:{
                    user_id : user_db._id,
                },
                
            }
            return await tasks.insertOne(task_record);
        } catch (e) {
            console.error('Unable to post task: ' + e);
            return {error: e }
        }
    }
    static async updateTask(task_id, user_id, body, title, date) {
        try {
            //reviewul cu idul corect si userul corect ( cel care l a creat)
            const updateResponse = await tasks.updateOne(
                { _id: ObjectId(task_id)},
                {$set: {body: body, date:date, title: title}},
            )
            return updateResponse;
        } catch (e) {
            console.error('Unable to update review: ' + e);
        }
    }
    static async deleteTask(task_id, user_name){
        const user_db = await users.findOne({username:user_name});
        const user_id = user_db._id;
        if (user_id != null){
            try { 
                //const task_db = await tasks.findOne({"_id" : ObjectId(task_id)});
                const user_db = await users.findOne({"_id": ObjectId(user_id)});
                const deleteResponse = await tasks.deleteOne({
                    _id: ObjectId(task_id),
                    "user_id": user_db._id,
                })
                return deleteResponse;
            }
            catch (e) {
                console.error('Unable to delete task: ' + e);
                return {error: e}
            }
        } else {
            console.log('No user id.');
        }
    }


}