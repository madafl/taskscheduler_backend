import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;
import bcrypt  from "bcrypt";


//fill the variable with reviews
let users;

export default class RegisterDAO {
    // as soon as server starts we get a reference to register db
    // if it s not filled we fill with restaurants variable
    static async injectDB(conn) {
        //if task already exists 
        if (users) {
            return
        }
        try { 
            //else access the tasks connection 
            //if doesnt already exist, it will be craeted
            users = await conn.db(process.env.TASKS_DB).collection("users");
        } catch (e) {
            console.error('Unable to establish collection handles in userDAO' + e);
        }
    }
    static async addUser(username,email, password){
        try { 
            // check if user with the same username already exists in db
            // if not, create account
            const user = await users.findOne({email: email});
            if (user) {
                console.log("Exista deja un utilizator cu acest username.")
            } else {
               // console.log(username,email, password)
                const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT));
                const userDoc = {
                username:username, 
                email:email,
                password:hashedPassword
                }
                return await users.insertOne(userDoc);
            }
        } catch (e) {
            console.error('Unable to create account: ' + e);
            return {error: e }
        }
    }
    static async login(username, password) {
        try {
            const user = await users.findOne({username: username});
            // daca utilizatorul nu exista in bd
            if (user === null) {
                console.log("Utilizatorul nu exista!")
            } else {
                const hashedPassword = user.password;
                const doesPasswordMatch = await bcrypt.compare(password, hashedPassword) // boolean
                if (doesPasswordMatch === true && username === user.username) {
                    return doesPasswordMatch;
                } else {
                    console.log("Username sau parola gresita!")
                    return doesPasswordMatch;
                }
            }
        } catch (e) {
            console.error('Unable to login : ' + e);
            return {error: e }
        }
        
    }
}