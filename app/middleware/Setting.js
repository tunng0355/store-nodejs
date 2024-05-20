import Setting from "../model/Setting";
import Menu from "../model/Menu";

const Settings = async (req, res, next) => {
  try {
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
    req.menu = await Menu.find();
    next();
  } catch (error) {
    req.menu = [];
    next();
  }
};

module.exports = Settings;
