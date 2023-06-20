
const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function (req, res, next) {

// I think I'm supposed to move this logic to the class
// I think I'm supposed to move this logic to the class
// I think I'm supposed to move this logic to the class

    try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ExpressError("Username and password required", 400);
    }
    const results = await db.query(
      `SELECT username, password
      FROM users 
      WHERE username = $1`,
      [username]
    );
    const user = results.rows[0]; // returns an object with username, password
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ message: "logged in!", token });
      }
    }
    throw new ExpressError("Invalid username or password", 400);
  } catch (e) {
    return next(e);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async function (req, res, next) {
  try {
    const { username, password, first_name, last_name, phone } = req.body;
    if (!username || !password) {
      throw new ExpressError("Username and password required", 400);
    }
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const user = await User.register({
      username,
      hashedPassword,
      first_name,
      last_name,
      phone
  });
    const token = jwt.sign(user.username, SECRET_KEY);
    return res.json({ message: "registered!", token });

  } catch (e) {
    return next(e);
  }
});



module.exports = router;