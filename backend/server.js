import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import {
  createUser,
  getUser,
  updateUserPassword,
  deleteUser,
} from "./models/users.js";
import {
  createSession,
  getSessionByToken,
} from "./models/sessions.js";
import {
  createAccount,
  getAccountByUserId,
  depositToAccount,
} from "./models/accounts.js";

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

//HELPER FUNCTIONS
// Generate one-time password
function generateOTP() {
  // Generate a six-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

//ROUTES:
//Register User Route: create user - the registration
app.post("/users", async (req, res) => {
  try {
    const { username, password } = req.body;

    //1. Validate Input
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    //2. Check whether user exist
    const existingUser = await getUser(username);
    if (existingUser) {
      return res.status(409).json({
        message: "User already exist or username already taken.",
      });
    }

    //3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    //4. Create User
    const user = await createUser(username, hashedPassword);

    //5. Create Account
    const account = await createAccount(user.id);

    console.log("✨ User&Account created successfully");
    // console.log("User: ", user);
    // console.log("Account: ", account);

    //6. Return Result
    return res.status(201).json({
      ...user,
      ...account,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: `Error creating user` });
  }
});

//Login Session Route
app.post("/sessions", async (req, res) => {
  console.log("POST /sessions received");

  const { username, password } = req.body;
  try {
    //Validate: If they don't provide both username & password reject immediately, don't bother to run sql sef.
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    //1. Find the User
    const user = await getUser(username);

    //2. When user does not exist
    if (!user) {
      console.warn("Username or password incorrect");
      return res.status(401).json({
        message: "Username or password incorrect",
      });
    }

    //3. Check supplied password against stored bcrypt hash
    const passwordMatches = await bcrypt.compare(
      password,
      user.password,
    );

    // 4. Password doesn't match
    if (!passwordMatches) {
      console.warn("Username or password incorrect");

      return res.status(401).json({
        message: "Username or password incorrect.",
      });
    }

    //By now credentials match, so generate a token and create a session for them
    //5. Generate Token
    const token = generateOTP();
    const session = await createSession(user.id, token);

    console.log("🤝 Login successful, welcome on board!");
    // console.log("User:", user.username);
    // console.log("Token:", token);
    // console.log("Session:", session);

    //Send token back to frontend
    return res.status(200).json({ session });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send(`Error, unable to login`, error);
  }
});

//View Balance Route
app.post("/me/accounts", async (req, res) => {
  try {
    const { token } = req.body;

    // Validate input: maybe this is needless because the user does not know about the token, the frontend does though
    if (!token) {
      return res.status(400).json({
        message: "Token is required",
      });
    }

    // Find the session belonging to this token
    const session = await getSessionByToken(token);

    if (session) {
      // Find the account belonging to the logged-in user
      const account = await getAccountByUserId(session.user_id);

      //Account doesn't exist -  This is nearly impossible:
      if (!account) {
        return res.status(404).json({
          message: "Account not found",
        });
      }

      console.log("✅ Account requested");
      // console.log("USER ID:", account.user_id);
      // console.log("BALANCE:", account.balance);

      return res.status(200).json({
        amount: account.balance,
      });
    } else {
      //!session or invalid session
      return res.status(401).json({
        message: "Invalid token",
      });
    }
  } catch (error) {
    console.error("Error fetching account:", error);

    return res.status(500).json({
      message: "Unable to fetch account",
    });
  }
});

// Deposit money Route - top-up account
app.post("/me/accounts/transactions", async (req, res) => {
  try {
    const { token, amount } = req.body;

    //Validate
    //Input must be inputed
    if (amount === undefined || !token) {
      return res.status(400).json({
        message: "Token and amount are required",
      });
    }

    //We accept only positive number
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        message: "Amount must be a positive number",
      });
    }

    // Find the session belonging to this token
    const session = await getSessionByToken(token);

    // Invalid token
    if (!session) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    // Deposit money into the user's account
    const result = await depositToAccount(session.user_id, amount);

    // Account doesn't exist
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    // Get the updated account
    const account = await getAccountByUserId(session.user_id);

    console.log("💵 Account topped up successfully");
    // console.log("User ID:", session.user_id);
    // console.log("Deposited:", amount);
    // console.log("New balance:", account.balance);

    return res.status(200).json({
      amount: account.balance,
    });
  } catch (error) {
    console.error("Error depositing money:", error);
    res.status(500).send(`Error, unable to top up balance`);
  }
});

//Update Password - CRUD: UPDATE
app.put("/new-password", async (req, res) => {
  const { username, newPassword } = req.body;
  try {
    // Validate input
    if (!username || !newPassword) {
      return res.status(400).json({
        message: "Username and new-password are required.",
      });
    }

    // Find existing user
    const user = await getUser(username);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in MySQL
    await updateUserPassword(username, hashedPassword);

    console.log("🔐 Password updated successfully");
    // console.log("Username:", username);

    return res.status(200).json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Error updating password:", error);

    return res.status(500).json({
      message: "Unable to update password.",
    });
  }
});

//Delete User - CRUD: DELETE
app.delete("/users", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        message: "Username is required.",
      });
    }

    // Find the user
    const user = await getUser(username);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Delete the user
    const result = await deleteUser(user.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    console.log("🗑️ User deleted successfully");
    // console.log("Username:", username);

    return res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user:", error);

    return res.status(500).json({
      message: "Unable to delete user.",
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(
    `The bank's backend is running on http://localhost:${port}`,
  );
});
