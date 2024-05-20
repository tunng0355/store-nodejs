import moment from 'moment';
import User from '../model/User';
import Menu from '../model/Menu';
import Voucher from '../model/Voucher';
import Products from '../model/Products';
import Orders from '../model/Order';
import Mark from '../model/Mark';
import Address from '../model/Address';

class AdminController {
  static async StatusOrders(data) {
    if (data == 'done') {
      return 'hoàn thành';
    } else if (data == 'pending') {
      return 'chờ xác nhận';
    } else if (data == 'ship') {
      return 'Đang vận chuyển';
    } else {
      return 'đã hủy';
    }
  }

  static async GetHome(req, res) {
    return res.render('admin/index', {
      user: req.user,
      site: req.site,
    });
  }

  static async GetSetting(req, res) {
    return res.render('admin/setting', {
      user: req.user,
      site: req.site,
    });
  }

  static async GetMember(req, res) {
    const users = await User.find();

    const list = users.map((data) => ({
      _id: data._id,
      username: data.username,
      fullname: data.fullname,
      email: data.email,
      phone: data.phone,
      country: data.country,
      level: data.level,
      createdAt: moment(data.createdAt).format('DD/MM/YYYY - HH:mm:ss'),
    }));

    return res.render('admin/member', {
      user: req.user,
      site: req.site,
      list,
    });
  }

  static async ListProduct(req, res) {
    try {
      const Product = await Products.find();

      const list = await Promise.all(
        Product.map(async (data) => {
          const menu = await Menu.findOne({ _id: data.menu });
          const mark = await Mark.findOne({ _id: data.mark });
          var prices = 0;
          if (data.TypeDiscount == '%') {
            prices = data.price - (data.price * data.discount) / 100;
          } else if (data.TypeDiscount == '-') {
            prices = data.price - data.discount;
          } else {
            prices = 0;
          }
          return {
            _id: data._id,
            menu: menu ? menu : 'MENU KHÔNG TỒN TẠI',
            mark: mark ? mark : 'THƯƠNG HIỆU KHÔNG TỒN TẠI',
            path: data.path,
            name: data.name,
            price: new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(data.price),
            prices: new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(prices),
            content: data.content,
            show: data.show,
            description: data.description,
            ListType: data.ListType,
            thumbnail: data.thumbnail,
            sell: data.sell,
            discount: data.discount,
            TypeDiscount: data.TypeDiscount,
            createdAt: moment(data.createdAt).format('DD/MM/YYYY - HH:mm:ss'),
            outID: data._id,
          };
        }),
      );

      return res.render('admin/products/index', {
        user: req.user,
        site: req.site,
        list,
      });
    } catch (error) {
      return res.render('admin/products/index', {
        user: req.user,
        site: req.site,
        list: [],
      });
    }
  }

  static async AddProduct(req, res) {
    const list = await Menu.find();
    const mark = await Mark.find();

    return res.render('admin/products/add', {
      user: req.user,
      site: req.site,
      list,
      mark,
    });
  }

  static async EditProduct(req, res) {
    try {
      const id = req.params.id;
      const data = await Products.findOne({ _id: id });
      const list = await Menu.find();
      const mark = await Mark.find();

      if (!data) {
        res.redirect('/admin/products');
      }

      return res.render('admin/products/edit', {
        user: req.user,
        site: req.site,
        data,
        list,
        mark,
      });
    } catch (error) {
      res.redirect('/admin/products');
    }
  }

  static async EditMember(req, res) {
    try {
      const id = req.params.id;
      const users = await User.findOne({ _id: id });

      if (!users) {
        res.redirect('/admin/member');
      }

      return res.render('admin/member/edit', {
        user: req.user,
        site: req.site,
        users: users,
      });
    } catch (error) {
      res.redirect('/admin/member');
    }
  }

  static async OrdersPending(req, res) {
    const Orderx = await Orders.find({ status: 'pending' });

  
    const list = await Promise.all(
      


      Orderx.map(async (data) => {
        return {
          _id: data._id,
          productID:data.productID,
          name:data.name,
          UserID: data.UserID,
          prices: data.prices,
          quantity:data.quantity,
          total: data.total,
          address: await Address.findOne({_id:data.address}),
          discount:data.discount,
          TypeDiscount:data.TypeDiscount,
          items: data.items,
          status: await AdminController.StatusOrders(data.status),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      }),
    );
    return res.render('admin/orders/pending', {
      user: req.user,
      site: req.site,
      menu: req.menu,
      list: list,
    });
  }

  static async OrdersShip(req, res) {
    const Orderx = await Orders.find({ status: 'ship' });

  
   
    const list = await Promise.all(
      


      Orderx.map(async (data) => {
        return {
          _id: data._id,
          productID:data.productID,
          name:data.name,
          UserID: data.UserID,
          prices: data.prices,
          quantity:data.quantity,
          total: data.total,
          address: await Address.findOne({_id:data.address}),
          discount:data.discount,
          TypeDiscount:data.TypeDiscount,
          items: data.items,
          status: await AdminController.StatusOrders(data.status),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      }),
    );
    return res.render('admin/orders/pending', {
      user: req.user,
      site: req.site,
      menu: req.menu,
      list: list,
    });
  }

  static async OrdersDone(req, res) {
    const Orderx = await Orders.find({ status: 'done' });

    const list = await Promise.all(
      


      Orderx.map(async (data) => {
        return {
          _id: data._id,
          productID:data.productID,
          name:data.name,
          UserID: data.UserID,
          prices: data.prices,
          quantity:data.quantity,
          total: data.total,
          address: await Address.findOne({_id:data.address}),
          discount:data.discount,
          TypeDiscount:data.TypeDiscount,
          items: data.items,
          status: await AdminController.StatusOrders(data.status),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      }),
    );
    return res.render('admin/orders/pending', {
      user: req.user,
      site: req.site,
      menu: req.menu,
      list: list,
    });
  }

  static async OrdersCancel(req, res) {
    const Orderx = await Orders.find({ status: 'cancel' });

   
    const list = await Promise.all(
      


      Orderx.map(async (data) => {
        return {
          _id: data._id,
          productID:data.productID,
          name:data.name,
          UserID: data.UserID,
          prices: data.prices,
          quantity:data.quantity,
          total: data.total,
          address: await Address.findOne({_id:data.address}),
          discount:data.discount,
          TypeDiscount:data.TypeDiscount,
          items: data.items,
          status: await AdminController.StatusOrders(data.status),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      }),
    );
    return res.render('admin/orders/pending', {
      user: req.user,
      site: req.site,
      menu: req.menu,
      list: list,
    });
  }

  static async CreateMark(req, res) {
    return res.render('admin/mark/create', {
      user: req.user,
      site: req.site,
    });
  }

  static async GetMark(req, res) {
    const data = await Mark.find();

    const list = data.map((data) => ({
      _id: data._id,
      name: data.name,
      createdAt: moment(data.createdAt).format('DD/MM/YYYY - HH:mm:ss'),
    }));

    return res.render('admin/mark/index', {
      user: req.user,
      site: req.site,
      list,
    });
  }

  static async EditMark(req, res) {
    try {
      const id = req.params.id;
      const check = await Mark.findOne({ _id: id });

      if (!check) {
        res.redirect('/admin/mark');
      }

      return res.render('admin/mark/edit', {
        user: req.user,
        site: req.site,
        data: check,
      });
    } catch (error) {
      res.redirect('/admin/mark');
    }
  }

  static async CreateMenu(req, res) {
    return res.render('admin/menu/create', {
      user: req.user,
      site: req.site,
    });
  }

  static async GetMenu(req, res) {
    const data = await Menu.find();

    const list = data.map((data) => ({
      _id: data._id,
      logo: data.logo,
      name: data.name,
      path: data.path,
      createdAt: moment(data.createdAt).format('DD/MM/YYYY - HH:mm:ss'),
    }));

    return res.render('admin/menu/index', {
      user: req.user,
      site: req.site,
      list,
    });
  }

  static async EditMenu(req, res) {
    try {
      const id = req.params.id;
      const check = await Menu.findOne({ _id: id });

      if (!check) {
        res.redirect('/admin/menu');
      }

      return res.render('admin/menu/edit', {
        user: req.user,
        site: req.site,
        data: check,
      });
    } catch (error) {
      res.redirect('/admin/menu');
    }
  }

  static async CreateVoucher(req, res) {
    return res.render('admin/voucher/create', {
      user: req.user,
      site: req.site,
    });
  }

  static async GetVoucher(req, res) {
    try {
      const check = await Voucher.find();

      const list = check.map((data) => ({
        _id: data._id,
        code: data.code,
        price: data.price,
        total: data.total,
        used: data.used,
        createdAt: moment(data.createdAt).format('DD/MM/YYYY - HH:mm:ss'),
      }));

      return res.render('admin/voucher/index', {
        user: req.user,
        site: req.site,
        list,
      });
    } catch (error) {
      return res.end(error);
    }
  }
}

export default AdminController;
