import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../model/User';
import Setting from '../model/Setting';
import Menu from '../model/Menu';
import Voucher from '../model/Voucher';
import Products from '../model/Products';
import moment from 'moment';
import Orders from '../model/Order';
import Address from '../model/Address';
import Mark from '../model/Mark';

class APIController {
  static async list_Product(req, res) {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const totalProducts = await Products.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);
    const list = await Products.find()
      .skip(skip)
      .limit(limit)
      .sort({ views: -1 });

    const processedList = await Promise.all(
      list.map(async (data) => {
        const menu = await Menu.findOne({ _id: data.menu });
        const mark = await Mark.findOne({ _id: data.mark });
        var prices = data.price;
        if (data.TypeDiscount == '%') {
          prices = data.price - (data.price * data.discount) / 100;
        } else if (data.TypeDiscount == '-') {
          prices = data.price - data.discount;
        }

        return {
          _id: data._id,
          menu: menu ? menu : 'MENU KHÔNG TỒN TẠI',
          mark: mark ? mark : 'THƯƠNG HIỆU KHÔNG TỒN TẠI',
          path: data.path,
          name: data.name,
          price: {
            main: {
              num: data.price,
              text: new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(data.price),
            },
            total: {
              num: prices,
              text: new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(prices),
            },
          },
          content: data.content,
          show: data.show,
          description: data.description,
          ListType: data.ListType,
          thumbnail: data.thumbnail,
          sell: data.sell,
          discount: {
            type: data.TypeDiscount,
            value: data.discount,
          },
          TypeDiscount: data.TypeDiscount,
          createdAt: moment(data.createdAt).format('DD/MM/YYYY - HH:mm:ss'),
          outID: data._id,
        };
      }),
    );

    return res.status(200).json({
      list: processedList,
      totalPages,
      currentPage: page,
    });
  }

  static async isEmailValid(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static removeSpecialCharacters(str) {
    const withoutDiacritics = str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const withoutSpecialChars = withoutDiacritics.replace(/[^\w\s-]/g, '');
    return withoutSpecialChars.replace(/\s/g, '-');
  }

  static async TypeDiscount(data) {
    if (data == 'off') {
      return true;
    }

    if (data == '%') {
      return true;
    }

    if (data == '-') {
      return true;
    }

    return false;
  }

  static async isLevelValid(level) {
    if (level == 'user') {
      return true;
    }

    if (level == 'admin') {
      return true;
    }

    return false;
  }

  static async GetLogin(req, res) {
    try {
      const { email, password } = req.body;

      // Kiểm tra xem người dùng có tồn tại trong cơ sở dữ liệu không
      const user = await User.findOne({ email });

      if (email.length == 0) {
        return res.status(400).json({
          message: 'Email không được bỏ trống',
        });
      }

      if (!(await APIController.isEmailValid(email))) {
        return res.status(400).json({ message: 'Email không chính xác' });
      }

      if (!user) {
        return res.status(400).json({
          message: 'Người dùng không tồn tại',
        });
      }

      if (password.length == 0) {
        return res.status(400).json({
          message: 'Mật khẩu không được bỏ trống',
        });
      }

      // So sánh mật khẩu được nhập với mật khẩu đã được băm trong cơ sở dữ liệu
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return res.status(400).json({
          message: 'Mật khẩu không chính xác',
        });
      }

      // Tạo mã token cho người dùng đã đăng nhập thành công
      const token = jwt.sign(
        { userID: user._id },
        process.env.ACCESS_TOKEN_SECRET,
      );

      // Lưu token vào cookie
      res.cookie('token', token, { httpOnly: true });

      res.status(200).json({
        message: 'Đăng nhập thành công',
        redirect: '/',
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: 'Lỗi server' });
    }
  }

  static async GetRegister(req, res) {
    try {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);

      const { fullname, email, phone, password, confirm_password } = req.body;

      const hashedPassword = await bcrypt.hash(password, salt);

      // Check if the user exists in the database
      const user = await User.findOne({ email });
      const user2 = await User.findOne({ phone });

      if (fullname.length == 0) {
        return res.status(400).json({
          message: 'Họ và tên không được bỏ trống',
        });
      }

      if (email.length == 0) {
        return res.status(400).json({
          message: 'Email không được bỏ trống',
        });
      }

      if (phone.length == 0) {
        return res.status(400).json({
          message: 'Số điện thoại không được bỏ trống',
        });
      }

      if (!(await APIController.isEmailValid(email))) {
        return res.status(400).json({ message: 'Email không chính xác' });
      }

      if (user) {
        return res.status(400).json({
          message: 'Địa chỉ email đã tồn tại trong hệ thống',
        });
      }

      if (user2) {
        return res.status(400).json({
          message: 'Số điện thoại đã tồn tại trong hệ thống',
        });
      }
      if (password.length == 0) {
        return res.status(400).json({
          message: 'Mật khẩu không được bỏ trống',
        });
      }

      if (confirm_password.length == 0) {
        return res.status(400).json({
          message: 'Mật khẩu xác nhận không được bỏ trống',
        });
      }

      if (password != confirm_password) {
        return res.status(400).json({
          message: 'Mật khẩu xác nhận không chính xác',
        });
      }

      const users = new User({
        fullname,
        email,
        phone,
        password: hashedPassword,
        level: 'user',
        status: 'active',
        token: null,
      });

      if (await users.save()) {
        res.status(200).json({
          message: 'Tạo tài khoản thành công',
          redirect: '/auth/login',
        });
      } else {
        res.status(400).json({
          message: 'Tạo tài khoản thất bại! Vui lòng thử lại',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async GetLogout(req, res) {
    try {
      // Xóa cookie chứa token
      res.clearCookie('token');
      res.redirect('/auth/login');
    } catch (error) {
      res.redirect('/auth/login');
    }
  }

  static async UpInfo(req, res) {
    try {
      const { fullname, username, phone } = req.body;

      const users = await User.findOne({ _id: req.user._id });

      if (fullname.length == 0) {
        return res.status(400).json({
          message: 'Họ và tên không được bỏ trống',
        });
      }

      if (username.length == 0) {
        return res.status(400).json({
          message: 'username không được bỏ trống',
        });
      }

      if (users.username != username) {
        if (await User.findOne({ username: username })) {
          return res.status(400).json({
            message: 'username đã tồn tại',
          });
        }
      }

      if (phone.length != 0) {
        if (phone != users.phone) {
          if (await User.findOne({ phone: phone })) {
            return res.status(400).json({
              message: 'Số điện thoại đã tồn tại',
            });
          }
        }
      }

      users.fullname = fullname;
      users.username = username;
      users.phone = phone;

      // Save the updated user
      if (await users.save()) {
        res.status(200).json({
          message: 'Cập nhật thông tin người dùng thành công',
        });
      } else {
        res.status(400).json({
          message: 'Cập nhật thông tin người dùng thất bại',
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async UpPass(req, res) {
    try {
      const { old_password, new_password, confirm_password } = req.body;

      const userId = req.user.id; // Lấy ID của người dùng từ phiên đăng nhập

      if (old_password.length == 0) {
        return res.status(400).json({
          message: 'Mật khẩu cũ không được bỏ trống',
        });
      }

      if (new_password.length == 0) {
        return res.status(400).json({
          message: 'Mật khẩu mới không được bỏ trống',
        });
      }

      if (confirm_password.length == 0) {
        return res.status(400).json({
          message: 'Xác nhận lại mật khẩu mới không được bỏ trống',
        });
      }

      // Kiểm tra mật khẩu hiện tại
      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({
          message: 'Người dùng không tồn tại',
        });
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        old_password,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          message: 'Mật khẩu cũ không chính xác',
        });
      }

      // Kiểm tra mật khẩu mới và xác nhận mật khẩu mới
      if (new_password !== confirm_password) {
        return res.status(400).json({
          message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
        });
      }

      // Cập nhật mật khẩu mới
      const hash_new_password = await bcrypt.hash(new_password, 10);
      user.password = hash_new_password;

      if (await user.save()) {
        res.status(200).json({
          message: 'Mật khẩu đã được thay đổi thành công',
        });
      } else {
        res.status(400).json({
          message: 'Đổi mật khẩu thất bại',
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async DeleteAddress(req, res) {
    try {
      const id = req.params.id;
      const userId = req.user._id;

      const data = await Address.findOne({ _id: id, UserID: userId });

      if (!data) {
        return res.status(400).json({
          message: 'Địa chỉ không tồn tại',
        });
      }

      if (data.default == 'true') {
        // Tìm một địa chỉ phụ khác
        const update = await Address.findOne({
          UserID: userId,
          default: 'false',
        });

        if (update) {
          update.default = true;
          await update.save();
        }

        // Xóa địa chỉ chính
        if (await Address.deleteOne({ _id: id, UserID: userId })) {
          return res.status(200).json({
            message: 'Địa chỉ đã được xóa thành công',
            redirect: '/info/address',
          });
        } else {
          return res.status(400).json({
            message: 'Xóa Địa chỉ thất bại',
          });
        }
      } else {
        // Xóa địa chỉ không phải là mặc định
        if (await Address.deleteOne({ _id: id, UserID: userId })) {
          return res.status(200).json({
            message: 'Địa chỉ đã được xóa thành công',
            redirect: '/info/address',
          });
        } else {
          return res.status(400).json({
            message: 'Xóa Địa chỉ thất bại',
          });
        }
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async EditAddress(req, res) {
    try {
      const { fullname, phone, address, type } = req.body;

      const id = req.params.id;
      const userId = req.user._id;

      const data = await Address.findOne({ _id: id, UserID: userId });

      if (!data) {
        return res.status(400).json({
          message: 'Địa chỉ không tồn tại',
        });
      }

      if (fullname.length == 0) {
        return res.status(400).json({
          message: 'Họ và tên không được bỏ trống',
        });
      }

      if (phone.length == 0) {
        return res.status(400).json({
          message: 'Số điện thoại không được bỏ trống',
        });
      }

      if (address.length == 0) {
        return res.status(400).json({
          message: 'Địa chỉ không được bỏ trống',
        });
      }
      let Default = false;

      if (type) {
        if (type != 1) {
          return res.status(400).json({
            message: 'Loại địa chỉ không hợp lệ',
          });
        } else {
          Default = true;
        }
      }

      if (data.default == 'true') {
        if (!Default) {
          const check1 = await Address.findOne({ default: false });
          if (check1) {
            check1.default = true;
            await check1.save();
          }
        }
      }

      if (data.default == 'false') {
        if (Default) {
          const check2 = await Address.findOne({ default: true });
          if (check2) {
            check2.default = false;
            await check2.save();
          }
        }
      }

      data.fullname = fullname;
      data.phone = phone;
      data.address = address;
      data.default = Default;

      if (await data.save()) {
        res.status(200).json({
          message: 'Cập nhập địa chỉ mới thành công',
          redirect: '/info/address',
        });
      } else {
        res.status(400).json({
          message: 'Cập nhập địa chỉ thất bại',
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async AddAddress(req, res) {
    try {
      const { fullname, phone, address, type } = req.body;

      if (fullname.length == 0) {
        return res.status(400).json({
          message: 'Họ và tên không được bỏ trống',
        });
      }

      if (phone.length == 0) {
        return res.status(400).json({
          message: 'Số điện thoại không được bỏ trống',
        });
      }

      if (address.length == 0) {
        return res.status(400).json({
          message: 'Địa chỉ không được bỏ trống',
        });
      }

      let Default = false;
      if (!type) {
        const check = await Address.findOne({ default: true });
        if (!check) {
          return res.status(400).json({
            message:
              'Hiện chưa có địa chỉ mặc định vui lòng thêm địa chỉ mặc định',
          });
        }
      } else {
        if (type != 1) {
          return res.status(400).json({
            message: 'Loại địa chỉ không hợp lệ',
          });
        } else {
          Default = true;
        }
      }

      const create = new Address({
        UserID: req.user._id,
        fullname,
        phone,
        address,
        default: Default,
      });
      if (Default) {
        const check = await Address.findOne({ default: true });
        if (check) {
          check.default = false;
          await check.save();
        }
      }

      if (await create.save()) {
        res.status(200).json({
          message: 'Thêm địa chỉ mới thành công',
          redirect: '/info/address',
        });
      } else {
        res.status(400).json({
          message: 'Thêm địa chỉ thất bại',
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async Admin_UpSetting(req, res) {
    try {
      const { title, description, keyword, hotline, vat } = req.body;

      const setting = await Setting.findOne();
      setting.title = title;
      setting.description = description;
      setting.keyword = keyword;
      setting.hotline = hotline;
      setting.vat = vat;

      // Save the updated user
      if (await setting.save()) {
        res.status(200).json({
          message: 'Cập nhật cài đặt website thành công',
        });
      } else {
        res.status(400).json({
          message: 'Cập nhật cài đặt website thất bại',
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async Admin_EditUser(req, res) {
    try {
      const id = req.params.id;
      const users = await User.findOne({ _id: id });

      const { username, fullname, level, email, phone } = req.body;

      if (!users) {
        return res.status(400).json({
          message: 'Tài khoản không tồn tại',
        });
      }

      if (username.length == 0) {
        return res.status(400).json({
          message: 'Tên đăng nhập không được bỏ trống',
        });
      }

      if (fullname.length == 0) {
        return res.status(400).json({
          message: 'Họ và tên không được bỏ trống',
        });
      }

      if (email.length == 0) {
        return res.status(400).json({
          message: 'Email không được bỏ trống',
        });
      }

      if (!(await APIController.isEmailValid(email))) {
        return res.status(400).json({ message: 'Email không chính xác' });
      }

      if (users.username != username) {
        if (await User.findOne({ username: username })) {
          return res.status(400).json({
            message: 'username đã tồn tại',
          });
        }
      }

      if (users.email != email) {
        if (await User.findOne({ email: email })) {
          return res.status(400).json({
            message: 'Email đã tồn tại',
          });
        }
      }

      if (phone.length != 0) {
        if (phone != users.phone) {
          if (await User.findOne({ phone: phone })) {
            return res.status(400).json({
              message: 'Số điện thoại đã tồn tại',
            });
          }
        }
      }

      if (level.length == 0) {
        return res.status(400).json({
          message: 'Cấp bậc không được bỏ trống',
        });
      }

      if (!(await APIController.isLevelValid(level))) {
        return res.status(400).json({
          message: 'Cấp bậc không hợp lệ',
        });
      }

      users.username = username;
      users.fullname = fullname;
      users.email = email;
      users.phone = phone;
      users.level = level;

      // Save the updated user
      if (await users.save()) {
        res.status(200).json({
          message: 'Cập nhật thông tin người dùng thành công',
        });
      } else {
        res.status(400).json({
          message: 'Cập nhật thông tin người dùng thất bại',
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async Admin_DeleteUser(req, res) {
    try {
      const id = req.params.id;
      const users = await User.findOne({ _id: id });

      if (!users) {
        res.status(400).json({
          message: 'Tài khoản không tồn tại',
        });
      }

      if (await User.deleteOne({ _id: id })) {
        res.status(400).json({
          message: 'Tài khoản đã được xóa thành công',
          redirect: '?ok',
        });
      } else {
        res.status(400).json({
          message: 'Xóa tài khoản thất bại',
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async Admin_CreateMenu(req, res) {
    try {
      const { logo, name, path } = req.body;
      const path2 = await APIController.removeSpecialCharacters(path);

      try {
        if (!logo) {
          return res.status(400).json({
            message: 'Logo không được bỏ trống', // Message in Vietnamese, replace with appropriate language if needed
          });
        }

        if (!name) {
          return res.status(400).json({
            message: 'Tên menu không được bỏ trống', // Message in Vietnamese, replace with appropriate language if needed
          });
        }

        if (!path2) {
          return res.status(400).json({
            message: 'Đường dẫn menu không được bỏ trống', // Message in Vietnamese, replace with appropriate language if needed
          });
        }

        const existingMenu = await Menu.findOne({ path: path2 });
        if (existingMenu) {
          return res.status(400).json({
            message: 'Đường dẫn đã tồn tại', // Message in Vietnamese, replace with appropriate language if needed
          });
        }

        const newMenu = new Menu({
          logo,
          name,
          path: path2,
        });

        await newMenu.save();

        return res.status(200).json({
          message: 'Tạo Menu thành công', // Message in Vietnamese, replace with appropriate language if needed
        });
      } catch (error) {
        console.error('Error creating menu:', error);
        return res.status(500).json({
          message: 'Đã xảy ra lỗi trong quá trình tạo Menu', // Message in Vietnamese, replace with appropriate language if needed
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }
  static async Admin_CreateMark(req, res) {
    try {
      const { name } = req.body;

      if (name.length == 0) {
        return res.status(400).json({
          message: 'Tên thương hiệu không được bỏ trống',
        });
      }

      const insert = new Mark({
        name,
      });

      if (await insert.save()) {
        res.status(200).json({
          message: 'Tạo thương hiệu thành công',
        });
      } else {
        res.status(400).json({
          message: 'Tạo thương hiệu thất bại! Vui lòng thử lại',
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async Admin_addProducts(req, res) {
    try {
      const {
        name,
        path,
        price,
        menu,
        mark,
        show,
        content,
        description,
        thumbnail,
        ListType,
      } = req.body;
      const path2 = await APIController.removeSpecialCharacters(path);

      if (name.length == 0) {
        return res.status(400).json({
          message: 'Tên sản phẩm không được bỏ trống',
        });
      }

      if (path2.length == 0) {
        return res.status(400).json({
          message: 'Đường dẫn không được bỏ trống',
        });
      }

      const checkPath = await Products.findOne({ path: path2 });

      if (checkPath) {
        return res.status(400).json({
          message: 'Đường dẫn đã tồn tại',
        });
      }

      if (price.length == 0) {
        return res.status(400).json({
          message: 'Giá sản phẩm không được bỏ trống',
        });
      }

      if (isNaN(Number(price))) {
        return res.status(400).json({
          message: 'Giá sản phẩm phải là 1 số',
        });
      }

      if (content.length == 0) {
        return res.status(400).json({
          message: 'Mô tả ngắn không được bỏ trống',
        });
      }

      if (show.length == 0) {
        return res.status(400).json({
          message: 'Mô tả tính năng không được bỏ trống',
        });
      }

      if (description.length == 0) {
        return res.status(400).json({
          message: 'Mô tả sản phẩm không được bỏ trống',
        });
      }

      if (!thumbnail) {
        return res.status(400).json({
          message: 'Ảnh thumbnail không được bỏ trống',
        });
      }

      if (thumbnail.length == 0) {
        return res.status(400).json({
          message: 'Ảnh thumbnail không được bỏ trống',
        });
      }

      const thumbnail2 = JSON.parse(thumbnail);

      if (thumbnail2[0].length == 0) {
        return res.status(400).json({
          message: 'Ảnh thumbnail không được bỏ trống',
        });
      }

      if (!thumbnail2[0].src) {
        return res.status(400).json({
          message: 'Ảnh thumbnail không được bỏ trống',
        });
      }

      if (thumbnail2[0].src.length == 0) {
        return res.status(400).json({
          message: 'Ảnh thumbnail không được bỏ trống',
        });
      }

      const ListType2 = JSON.parse(ListType);

      if (ListType2.length > 0) {
        if (ListType2[0].data.length == 0) {
          return res.status(400).json({
            message: 'Loại không được bỏ trống',
          });
        }
      }

      const check = await Menu.findOne({ _id: menu });

      if (!check) {
        return res.status(400).json({
          message: 'Menu không tồn tại',
        });
      }

      const check2 = await Mark.findOne({ _id: mark });

      if (!check2) {
        return res.status(400).json({
          message: 'Thương hiệu không tồn tại',
        });
      }

      const insert = new Products({
        menu,
        mark,
        path: path2,
        name,
        price,
        content,
        show,
        description,
        ListType: ListType2,
        thumbnail: thumbnail2,
        sell: 0,
        discount: 0,
        TypeDiscount: 'off',
      });

      if (await insert.save()) {
        res.status(200).json({
          message: 'Thêm sản phẩm thành công',
        });
      } else {
        res.status(400).json({
          message: 'Thêm sản phẩm thất bại! Vui lòng thử lại',
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async Admin_EditMenu(req, res) {
    try {
      const id = req.params.id;
      const check = await Menu.findOne({ _id: id });

      const { logo, name, path } = req.body;
      const path2 = await APIController.removeSpecialCharacters(path);

      if (!check) {
        return res.status(400).json({
          message: 'Menu không tồn tại',
        });
      }

      if (!logo) {
        return res.status(400).json({
          message: 'Logo không được bỏ trống',
        });
      }

      if (name.length == 0) {
        return res.status(400).json({
          message: 'Tên menu không được bỏ trống',
        });
      }

      if (path2.length == 0) {
        return res.status(400).json({
          message: 'Đường dẫn menu không được bỏ trống',
        });
      }

      if (check.path != path2) {
        if (await Menu.findOne({ path: path2 })) {
          return res.status(400).json({
            message: 'Đường dẫn menu đã tồn tại',
          });
        }
      }

      check.logo = logo;
      check.name = name;
      check.path = path2;

      // Save the updated user
      if (await check.save()) {
        res.status(200).json({
          message: 'Cập nhật menu thành công',
        });
      } else {
        res.status(400).json({
          message: 'Cập nhật menu thất bại',
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async Admin_EditMark(req, res) {
    try {
      const id = req.params.id;
      const check = await Mark.findOne({ _id: id });

      const { name } = req.body;

      if (!check) {
        return res.status(400).json({
          message: 'thương hiệu không tồn tại',
        });
      }

      if (name.length == 0) {
        return res.status(400).json({
          message: 'Tên thương hiệu không được bỏ trống',
        });
      }

      check.name = name;

      // Save the updated user
      if (await check.save()) {
        res.status(200).json({
          message: 'Cập nhật thương hiệu thành công',
        });
      } else {
        res.status(400).json({
          message: 'Cập nhật thương hiệu thất bại',
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async Admin_EditProducts(req, res) {
    try {
      const id = req.params.id;
      const {
        name,
        path,
        price,
        menu,
        mark,
        show,
        content,
        description,
        TypeDiscount,
        discount,
      } = req.body;
      const path2 = await APIController.removeSpecialCharacters(path);

      const checks = await Products.findOne({ _id: id });

      if (!checks) {
        res.status(400).json({
          message: 'Sản phẩm không tồn tại',
        });
      }

      if (name.length == 0) {
        return res.status(400).json({
          message: 'Tên sản phẩm không được bỏ trống',
        });
      }

      if (path2.length == 0) {
        return res.status(400).json({
          message: 'Đường dẫn không được bỏ trống',
        });
      }

      const checkPath = await Products.findOne({ path: path2 });

      if (checkPath) {
        if (checkPath._id != id) {
          return res.status(400).json({
            message: 'Đường dẫn đã tồn tại',
          });
        }
      }

      if (TypeDiscount.length == 0) {
        return res.status(400).json({
          message: 'Loại giảm giá không được bỏ trống',
        });
      }

      if (price.length == 0) {
        return res.status(400).json({
          message: 'Giá sản phẩm không được bỏ trống',
        });
      }

      if (isNaN(Number(price))) {
        return res.status(400).json({
          message: 'Giá sản phẩm phải là 1 số',
        });
      }

      if (TypeDiscount == '-') {
        if (Number(price) < Number(discount)) {
          return res.status(400).json({
            message: 'Giá trị giảm giá không được lớn hơn giá sản phẩm',
          });
        }
      }

      if (TypeDiscount == '%') {
        if (100 < discount) {
          return res.status(400).json({
            message: 'Giá trị giảm giá không được lớn hơn giá sản phẩm',
          });
        }
      }

      if (TypeDiscount.length != 0) {
        if (!(await APIController.TypeDiscount(TypeDiscount))) {
          return res.status(400).json({
            message: 'Loại giảm giá không hợp lệ',
          });
        }

        if (TypeDiscount != 'off') {
          if (discount.length == 0) {
            return res.status(400).json({
              message: 'Giá trị giảm giá không được bỏ trống',
            });
          }

          if (discount.length != 0) {
            if (isNaN(Number(price))) {
              return res.status(400).json({
                message: 'Giá trị giảm giá phải là 1 số',
              });
            }
          }
        }
      }

      if (content.length == 0) {
        return res.status(400).json({
          message: 'Mô tả ngắn không được bỏ trống',
        });
      }

      if (show.length == 0) {
        return res.status(400).json({
          message: 'Mô tả tính năng không được bỏ trống',
        });
      }

      if (description.length == 0) {
        return res.status(400).json({
          message: 'Mô tả chi tiết không được bỏ trống',
        });
      }

      const check = await Menu.findOne({ _id: menu });

      if (!check) {
        return res.status(400).json({
          message: 'Menu không tồn tại',
        });
      }

      const check2 = await Mark.findOne({ _id: mark });

      if (!check2) {
        return res.status(400).json({
          message: 'Thương hiệu không tồn tại',
        });
      }

      checks.mark = mark;
      checks.menu = menu;
      checks.path = path2;
      checks.name = name;
      checks.price = price;
      checks.content = content;
      checks.show = show;
      checks.description = description;
      checks.TypeDiscount = TypeDiscount;

      if (TypeDiscount != 'off') {
        checks.discount = discount;
      }

      if (await checks.save()) {
        res.status(200).json({
          message: 'Cập nhập sản phẩm thành công',
        });
      } else {
        res.status(400).json({
          message: 'Cập nhập sản phẩm thất bại! Vui lòng thử lại',
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async DeleteProduct(req, res) {
    try {
      const id = req.params.id;
      const data = await Products.findOne({ _id: id });

      if (!data) {
        res.status(400).json({
          message: 'Sản phẩm không tồn tại',
        });
      }

      if (await Products.deleteOne({ _id: id })) {
        res.status(400).json({
          message: 'Sản phẩm đã được xóa thành công',
          redirect: '?ok',
        });
      } else {
        res.status(400).json({
          message: 'Xóa sản phẩm thất bại',
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async PaymentCart(req, res) {
    var money = 0; // Initialize total money outside the loop

    if (typeof req.cookies.cartItems !== 'undefined') {
      const parsedCartItems = JSON.parse(req.cookies.cartItems);

      if (parsedCartItems.total != 0) {
        const Addresss = await Address.findOne({ default: "true" });

        if (!Addresss) {
          return res.status(400).json({
            message: 'Bạn chưa thêm địa chỉ mặc định',
          });
        } else {
          await Promise.all(
            parsedCartItems.items.map(async function (data) {
              const check2 = await Products.findOne({ _id: data.id });

              const items = await Promise.all(
                data.items.map(async function (data2) {
                  return {
                    type: data2.type,
                    main: data2.main,
                    value: data2.value,
                  };
                }),
              );

              var prices = 0;
              if (check2.TypeDiscount == '%') {
                prices = check2.price - (check2.price * check2.discount) / 100;
              } else if (check2.TypeDiscount == '-') {
                prices = check2.price - check2.discount;
              } else {
                prices = check2.price;
              }

              var itemTotal = data.quantity * prices; // Calculate the total for this item
              money += Number(itemTotal.toFixed()); // Accumulate total money
              const  Order = new Orders({
                UserID:req.user._id,
                productID: check2._id,
                name: check2.name,
                prices: prices,
                quantity: data.quantity,
                total: Number(itemTotal.toFixed()), // Round total for the item to 2 decimal places
                discount: check2.discount,
                TypeDiscount: check2.TypeDiscount,
                items: items,
                address: Addresss._id,
                status: 'pending',
              });

              check2.sell = 1;
              await check2.save();
              await Order.save();
            }),
          );
          res.clearCookie('cartItems');

          res.status(200).json({
            message: 'Đã thanh toán thành công',
            redirect: '/cart',
          });
        }
      } else {
        return res.status(400).json({
          message: 'Giỏ hàng không được bỏ trống',
        });
      }
    } else {
      return res.status(400).json({
        message: 'Giỏ hàng không được bỏ trống',
      });
    }
  }

  static async Admin_Orders_ThanhCong(req, res) {
    const id = req.params.id;
    const data = await Orders.findOne({ _id: id });

    if (!data) {
      res.status(400).json({
        message: 'Đơn không tồn tại',
      });
    }

    data.status = 'success';

    if (await data.save()) {
      res.status(200).json({
        message: 'Đã cập nhập đơn thành công',
        redirect: '?ok',
      });
    } else {
      res.status(400).json({
        message: 'Đã cập nhập đơn thất bại',
      });
    }
  }

  static async Admin_Orders_Vanchuyen(req, res) {
    const id = req.params.id;
    const data = await Orders.findOne({ _id: id });

    if (!data) {
      res.status(400).json({
        message: 'Đơn không tồn tại',
      });
    }

    data.status = 'ship';

    if (await data.save()) {
      res.status(200).json({
        message: 'Đã cập nhập đơn thành công',
        redirect: '?ok',
      });
    } else {
      res.status(400).json({
        message: 'Đã cập nhập đơn thất bại',
      });
    }
  }

  static async Admin_Orders_Hoanthanh(req, res) {
    const id = req.params.id;
    const data = await Orders.findOne({ _id: id });

    if (!data) {
      res.status(400).json({
        message: 'Đơn không tồn tại',
      });
    }

    data.status = 'done';

    if (await data.save()) {
      res.status(200).json({
        message: 'Đã cập nhập đơn thành công',
        redirect: '?ok',
      });
    } else {
      res.status(400).json({
        message: 'Đã cập nhập đơn thất bại',
      });
    }
  }

  static async Admin_Orders_Huydon(req, res) {
    const id = req.params.id;
    const data = await Orders.findOne({ _id: id });

    if (!data) {
      res.status(400).json({
        message: 'Đơn không tồn tại',
      });
    }

    data.status = 'cancel';

    if (await data.save()) {
      res.status(200).json({
        message: 'Đã cập nhập đơn thành công',
        redirect: '?ok',
      });
    } else {
      res.status(400).json({
        message: 'Đã cập nhập đơn thất bại',
      });
    }
  }

  static async Admin_DeleteMenu(req, res) {
    const id = req.params.id;
    const data = await Menu.findOne({ _id: id });

    if (!data) {
      res.status(400).json({
        message: 'Menu không tồn tại',
      });
    }

    if (await Menu.deleteOne({ _id: id })) {
      res.status(200).json({
        message: 'Menu đã được xóa thành công',
        redirect: '?ok',
      });
    } else {
      res.status(400).json({
        message: 'Xóa menu thất bại',
      });
    }
  }

  static async Admin_DeleteMark(req, res) {
    const id = req.params.id;
    const data = await Mark.findOne({ _id: id });

    if (!data) {
      res.status(400).json({
        message: 'thương hiệu không tồn tại',
      });
    }

    if (await Mark.deleteOne({ _id: id })) {
      res.status(200).json({
        message: 'thương hiệu đã được xóa thành công',
        redirect: '?ok',
      });
    } else {
      res.status(400).json({
        message: 'Xóa thương hiệu thất bại',
      });
    }
  }

  static async Admin_CreateVoucher(req, res) {
    try {
      const { code, total, price } = req.body;

      try {
        const code2 = await APIController.removeSpecialCharacters(code);

        if (!code2) {
          return res.status(400).json({
            message: 'Mã Voucher không được bỏ trống',
          });
        }

        if (!total) {
          return res.status(400).json({
            message: 'Số lượng không được bỏ trống',
          });
        }

        if (isNaN(Number(total))) {
          return res.status(400).json({
            message: 'Số lượng Voucher phải là một số',
          });
        }

        if (!price) {
          return res.status(400).json({
            message: 'Giá trị không được bỏ trống',
          });
        }

        if (isNaN(Number(price))) {
          return res.status(400).json({
            message: 'Giá trị Voucher phải là một số',
          });
        }

        const existingVoucher = await Voucher.findOne({ code: code2 });
        if (existingVoucher) {
          return res.status(400).json({
            message: 'Mã đã tồn tại',
          });
        }

        const insert = new Voucher({
          code: code2,
          total,
          price,
          used: 0,
        });

        await insert.save();

        return res.status(200).json({
          message: 'Tạo Voucher thành công',
        });
      } catch (error) {
        console.error('Error creating voucher:', error);
        return res.status(500).json({
          message: 'Đã xảy ra lỗi trong quá trình tạo Voucher',
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async Admin_DeleteVoucher(req, res) {
    const id = req.params.id;
    const data = await Voucher.findOne({ _id: id });

    if (!data) {
      res.status(400).json({
        message: 'Voucher không tồn tại',
      });
    }

    if (await Voucher.deleteOne({ _id: id })) {
      res.status(200).json({
        message: 'Voucher đã được xóa thành công',
        redirect: '?ok',
      });
    } else {
      res.status(400).json({
        message: 'Xóa Voucher thất bại',
      });
    }
  }

  static async FindVoucher(req, res) {
    try {
      const { code } = req.body;

      if (code.length == 0) {
        res.status(400).json({
          message: 'Mã không được bỏ trống',
        });
      } else {
        const check = await Voucher.findOne({ code: code });

        if (!check) {
          res.status(400).json({
            message: 'Voucher không tồn tại',
          });
        } else {
          if (check.total == check.used) {
            res.status(200).json({
              message: 'Voucher đã lượt sử dụng',
            });
          }

          res.status(400).json({
            status: 'success',
            message: 'Áp dụng voucher thành công',
            code: code,
            price: check.price,
          });
        }
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }

  static async HuyDon(req, res) {
    try {
      const id = req.params.id;
      const Order = await Orders.findOne({ _id: id });

      if (!Order) {
        res.status(400).json({
          message: 'Đơn hàng không tồn tại',
        });
      }
      if (Order.status != 'pending') {
        res.status(200).json({
          message: 'Đơn hàng không thể hủy khi đơn đã được xác nhận ',
        });
      }

      Order.status = 'cancel';

      if (await Order.save()) {
        res.status(200).json({
          message: 'Đơn hàng đã hủy thành công',
          redirect: '?ok',
        });
      } else {
        res.status(400).json({
          message: 'Đơn hàng đã hủy thất bại',
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Có lỗi gì đó đã xảy ra vui lòng thử lại!' });
    }
  }
}

export default APIController;
