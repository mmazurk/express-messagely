const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const ExpressError = require("../expressError");

class User {
  constructor(username, password, first_name, last_name, phone) {
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
  }

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({
    username,
    password,
    first_name,
    last_name,
    phone,
  }) {
    const now = new Date();
    console.log(
      username,
      password,
      first_name,
      last_name,
      phone,
      now,
      now
    );
    const results = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)     
       VALUES($1, $2, $3, $4, $5, $6, $7)
       RETURNING username, password, first_name, last_name, phone`,
      [username, password, first_name, last_name, phone, now, now]
    );
    console.log(results);
    return new User(username, password, first_name, last_name, phone);
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const results = await db.query(
      `SELECT username, password
      FROM users 
      WHERE username = $1`,
      [username]
    );
    const user = results.rows[0];
    if (user) {
      return await bcrypt.compare(password, user.password);
    }
  }

  /** Update last_login_at for user */
  static async updateLoginTimestamp(username) {
    const now = new Date();
    const results = await db.query(
      `UPDATE users 
      SET last_login_at = $1
      where username = $2
      returning last_login_at`,
      [now, username]
    );
    return results.rows[0].last_login_at;
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const results = await db.query(`select * from users`);
    return results.rows.map(
      (item) =>
        new User(item.username, item.first_name, item.last_name, item.phone)
    );
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const results = await db.query(
      `select first_name, last_name, phone, join_at, last_login_at 
      from users
      where username = $1`,
      [username]
    );
    if (!results.rows[0]) {
      return new ExpressError("User Not Found", 404);
    }
    return results.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(
      `select * from messages
      where from_username = $1`,
      [username]
    );
    if (!results.rows[0]) {
      return new ExpressError(`${username} Not Found`, 404);
    }
    return results.rows;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(
      `select * from messages
      where to_username = $1`,
      [username]
    );
    if (!results.rows[0]) {
      return new ExpressError(`${username} Not Found`, 404);
    }
    return results.rows;
  }


}

module.exports = User;
