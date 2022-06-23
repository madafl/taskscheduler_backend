import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;
import bcrypt from "bcrypt";

//fill the variable with users
let users;

export default class RegisterDAO {
  // as soon as server starts we get a reference to register db
  // if it s not filled we fill with restaurants variable
  static async injectDB(conn) {
    //if task already exists
    if (users) {
      return;
    }
    try {
      //else access the tasks connection
      //if doesnt already exist, it will be craeted
      users = await conn.db(process.env.TASKS_DB).collection("users");
    } catch (e) {
      console.error("Unable to establish collection handles in userDAO" + e);
    }
  }
  static async addUser(username, email, password) {
    try {
      // check if user with the same email already exists in db
      // username used only for display purposes
      // if not, create account
      const user = await users.findOne({ email: email });
      if (user) {
        console.log("Exista deja un utilizator cu acest email.");
        return false;
      } else {
        const hashedPassword = await bcrypt.hash(
          password,
          Number(process.env.SALT)
        );
        const userDoc = {
          username: username,
          email: email,
          password: hashedPassword,
        };
        return await users.insertOne(userDoc);
      }
    } catch (e) {
      console.error("Unable to create account: " + e);
      return { error: e };
    }
  }
  static async login(email, password) {
    try {
      const user = await users.findOne({ email: email });
      // daca utilizatorul nu exista in bd returneaza 0
      if (user === null) {
        console.log("Utilizatorul nu exista!");
        return 0;
      } else {
        // daca exista, verifica parola introdusa cu cea din db
        const hashedPassword = user.password;
        const doesPasswordMatch = await bcrypt.compare(
          password,
          hashedPassword
        ); // boolean

        if (doesPasswordMatch === true && email === user.email) {
          // daca parola este corecta si emailul corespunde returneaza true si user
          return { doesPasswordMatch, user };
        } else {
          // altfel email sau parola gresita, returneaza false
          console.log("Email sau parola gresita!");
          return doesPasswordMatch;
        }
      }
    } catch (e) {
      console.error("Unable to login : " + e);
      return { error: e };
    }
  }
  static async getUserById(id) {
    try {
      let user = users.findOne({ _id: ObjectId(id) });
      return user;
    } catch (e) {
      console.error("Something went wrong in RegisterDAO: " + e);
      throw e;
    }
  }
  static async changePassword(user_id, passwords) {
    try {
      const user_db = await users.findOne({ _id: ObjectId(user_id) });
      if (user_db === null) {
        return { message: "Utilizatorul nu exista!" };
      } else {
        const hashedPassword = user_db.password; // parola din db
        const doesPasswordMatch = await bcrypt.compare(
          passwords.current_password, //parola curenta introdusa
          hashedPassword
        );
        const samePassword = await bcrypt.compare(
          passwords.new_password, //parola curenta = noua parola
          hashedPassword
        );
        if (doesPasswordMatch === false) {
          return {
            // return false => parolele nu corespund
            doesPasswordMatch,
            message: "Parola curenta nu este corecta.",
          };
        } else if (samePassword) {
          return {
            // return false => parolele nu corespund

            message: "Parola noua nu poate fi aceeasi cu parola curenta.",
          };
        } else if (passwords.new_password !== passwords.confirm_password) {
          return {
            //return true
            doesPasswordMatch,
            message: "Noua parola si parola confirmata nu se potrivesc.",
          };
        } else if (
          doesPasswordMatch === true &&
          ObjectId(user_id).equals(user_db._id) // id-ul utilizatorului conecatt = id-ul utilizatrorului din db
        ) {
          const newHashedPassword = await bcrypt.hash(
            passwords.new_password,
            Number(process.env.SALT)
          );
          try {
            const updatePassword = await users.updateOne(
              {
                _id: ObjectId(user_id),
              },
              { $set: { password: newHashedPassword } }
            );
            return {
              //return true
              doesPasswordMatch,
              message: "Parola a fost schimbata cu succes.",
            };
          } catch (e) {
            console.error("Something went wrong in RegisterDAO: " + e);
            throw e;
          }
        }
      }
    } catch (e) {
      console.error("Something went wrong in RegisterDAO: " + e);
      throw e;
    }
  }
}
