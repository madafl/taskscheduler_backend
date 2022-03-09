import RegisterDAO from "../dao/registerDAO.js";
import jwt from "jsonwebtoken";

export default class RegisterController {

    // http://localhost:5000/api/v1/restaurants/register?username=test&password=test
    static async apiPostRegister(req, res, next) {
        try {
            // get from body of the request
           
            const username = req.query.username;
            const email = req.query.email;
            const password = req.query.password;
            
            if (username === "" || password === "" || email === "" ){
                res.json({message: "Campuri necompletate."})
            } else {
                const userResponse = await RegisterDAO.addUser(
                username,
                email,
                password,
            );
            const token = jwt.sign({ username: username }, process.env.JWT_SECRET)
            return res.status(200).json({ user:token});
            }
            
        }
        catch (e){
            res.status(500).json("error: " + e.message);
        }
    }
    static async loginUser(req, res, next) {    
        try {
           console.log(req.body);
           const username = req.body.username;
            const password = req.body.password;
            const userResponse = await RegisterDAO.login(username, password);
            if (userResponse === true) {
                const token = jwt.sign({ username: username }, process.env.JWT_SECRET)
                return res.status(200).json({ user:token});
            } else {
                return res.status(500).json({message:"Eroare la conectare", user:false});
            }
        } catch (e) {
            console.log(e);
            res.status(500).json({error: e});
        }
        
    }
}