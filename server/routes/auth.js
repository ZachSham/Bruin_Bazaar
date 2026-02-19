import express from "express";
import User from "../models/users.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {

    const { username, email, password } = req.body;

    // check if all fields are filled
    if (!username || !email || !password) {
        return res.status(400).json({
          ok: false,
          error: "Username, email, and password are required"
        });
      }

    // username/email/password cannot contain leading or trailling whitespace
    if (username !== username.trim()) {
      return res.status(400).json({
        ok: false,
        error: "Username cannot contain spaces"
      });
    }

    if (email !== email.trim()) {
      return res.status(400).json({
        ok: false,
        error: "Email cannot contain spaces"
      });
    }
    if (password !== password.trim()) {
      return res.status(400).json({
        ok: false,
        error: "Password cannot contain spaces"
      });
    }

    // check if email is valid with two conditions:
    // 1. email must end with @ucla.edu
    if (!email.endsWith("@ucla.edu")) {
        return res.status(400).json({
          ok: false,
          error: "Must use a UCLA email address"
        });
    }
    // 2. email must be unique
    if (await User.exists({ email })) {
      return res.status(409).json({
        ok: false,
        error: "Email already in use"
      });
    }
    // also check if username is valid with one condition
    // 1. username must also be unique
    if (await User.exists({ username })) {
      return res.status(409).json({
        ok: false,
        error: "Username already in use"
      });
    }

    const user = await User.create({
      username,
      email,
      password
    });

    res.status(201).json({
      ok: true,
      userId: user._id
    });

    } catch (err) { 
    console.error(err);
    res.status(500).json({
      ok: false,
      error: "Server error"
    });
  }
});


router.post("/login", async (req, res) => {
    try {
        // identifier can be email or username
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                ok: false,
                error: "Username or Email and password are required"
            });
        }
        
      
        let user = null;
        // check if it has a @ucla.edu it is an email, if it doesn't it is a username 
        // set user = to the user object from the db if email/username exists
        if (identifier.endsWith("@ucla.edu")) {
            user = await User.findOne({ email: identifier }); // find one returns null if not found
          } else {
            user = await User.findOne({ username: identifier });
        }
        
        if (!user) {
            return res.status(400).json({
                ok: false,
                error: "Invalid username or email"
            });
        }

        if (user.password === password) {
            return res.status(200).json({
                ok: true,
                userId: user._id
            });
        } else {
            return res.status(400).json({
                ok: false,
                error: "Invalid password"
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            ok: false,
            error: "Server error"
        });
    }
});

export default router;
