import jwt from "jsonwebtoken";
import User from "../model/User.js";
import Setting from "../model/Setting.js";

const AdminAPI = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const site = await Setting.findOne();
    if ((await Setting.count()) == 0) {
      const setup = new Setting({
        title: "",
        description: "",
        keyword: "",
        hotline: "",
        vat: "",
      });
      await setup.save();
    }

    req.site = site;

    if (token) {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findOne({ _id: decoded.userID });
      if (user) {
        if (user.level == "admin") {
          req.user = user;
          next();
        } else {
          res.redirect("/");
        }
      } else {
        res.redirect("/auth/login");
      }
    } else {
      res.redirect("/auth/login");
    }
  } catch (error) {
    res.redirect("/auth/login");
  }
};

module.exports = AdminAPI;
