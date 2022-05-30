import RegisterDAO from "../dao/registerDAO.js";
import jwt from "jsonwebtoken";

export default class RegisterController {
  // http://localhost:5000/api/v1/restaurants/register?username=test&password=test
  static async apiPostRegister(req, res, next) {
    try {
      const username = req.query.username;
      const email = req.query.email;
      const password = req.query.password;

      if (username === "" || password === "" || email === "") {
        res.json({ message: "Campuri necompletate." });
      } else {
        const userResponse = await RegisterDAO.addUser(
          username,
          email,
          password
        );
        if (userResponse === false) {
          return res.status(500).json({
            message: "Exista deja un utilizator cu acest email.",
            user: false,
          });
        } else {
          return res.status(200).json({
            message: "Cont creat cu succes! Acum te poti autentifica.",
          });
        }
      }
    } catch (e) {
      res.status(500).json("error: " + e.message);
    }
  }
  static async loginUser(req, res, next) {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const userResponse = await RegisterDAO.login(email, password);
      // true=> utilizatorul exista=>200, 0 => utilizatorul nu exista=>500, false=> parola gresita=>500
      if (userResponse.doesPasswordMatch === true) {
        const token = jwt.sign(
          { token: userResponse.user._id },
          process.env.JWT_SECRET
        );
        return res.status(200).json({
          token: token,
          user: {
            username: userResponse.user.username,
            email: userResponse.user.email,
          },
        });
      } else if (userResponse.doesPasswordMatch === 0) {
        return res
          .status(500)
          .json({ message: "Utilizatorul nu exista.", user: false });
      } else {
        return res
          .status(500)
          .json({ message: "Username sau parola gresita.", user: false });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: e });
    }
  }
  static async apiGetUserById(req, res, next) {
    try {
      let id = req.params.id || {};
      let user = await RegisterDAO.getUserById(id);
      if (!user) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(user.email);
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: e });
    }
  }
}
