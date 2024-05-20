import Address from '../model/Address';
import Menu from '../model/Menu';
import Mark from '../model/Mark';
import Products from '../model/Products';
import moment from 'moment';

class HomeController {
  static async GetHome(req, res) {
    let menu = await Menu.find();
    return res.render('index', { user: req.user, menu });
  }

  static async GetLogin(req, res) {
    return res.render('auth/login', { user: req.user });
  }

  static async GetCart(req, res) {
    var cartItems = [];
   var money = 0;
    if (typeof req.cookies.cartItems !== 'undefined') {
      const parsedCartItems = JSON.parse(req.cookies.cartItems);
      if (parsedCartItems.total !== 0) {
        await Promise.all(
          parsedCartItems.items.map(async function (data) {
            const check2 = await Products.findOne({ _id: data.id });
            if (check2) {
              const items = await Promise.all(
                data.items.map(async function (data2) {
                  return {
                    type: {
                      id: data2.main,
                      name: check2.ListType[data2.main].name,
                      class: data2.type,
                    },
                    value: {
                      id: data2.value,
                      text: check2.ListType[data2.main].data[data2.value],
                      type: check2.ListType[data2.main].type,
                    },
                  };
                }),
              );
              var prices = 0;
              const menu = await Menu.findOne({ _id: check2.menu });
              const mark = await Mark.findOne({ _id: check2.mark });
              var prices = check2.price;
              if (check2.TypeDiscount == '%') {
                prices = check2.price - (check2.price * check2.discount) / 100;
              } else if (check2.TypeDiscount == '-') {
                prices = check2.price - check2.discount;
              }
              money +=data.quantity*prices;
              cartItems.push({
                id: check2._id,
                name: check2.name,
                quantity: data.quantity,
                menu: menu ? menu : 'MENU KHÔNG TỒN TẠI',
                mark: mark ? mark : 'THƯƠNG HIỆU KHÔNG TỒN TẠI',
                price: {
                  main: {
                    num: check2.price * data.quantity,
                    text: new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(check2.price * data.quantity),
                  },
                  total: {
                    num: prices * data.quantity,
                    text: new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(prices * data.quantity),
                  },
                },
                content: check2.content,
                show: check2.show,
                description: check2.description,
                thumbnail: check2.thumbnail,
                sell: check2.sell,
                discount: {
                  type: check2.TypeDiscount,
                  value: check2.discount,
                },
                TypeDiscount: check2.TypeDiscount,
                createdAt: moment(check2.createdAt).format(
                  'DD/MM/YYYY - HH:mm:ss',
                ),
                outID: check2._id,
                items: items,
              });
            }
          }),
        );
      }
    }
    
    money = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(money);

    return res.render('product/cart', { user: req.user, cartItems: cartItems ,money:money });
  }

  static async GetSearch(req, res) {
    return res.render('product/search', { user: req.user });
  }

  static async GetRegister(req, res) {
    return res.render('auth/register', { user: req.user });
  }

  static async GetProduct(req, res) {
    const path = req.params.path;
    const data = await Products.findOne({ path: path });
    
    if (!data) {
      return res.redirect("/");
    }
    
    const menu = await Menu.findOne({ _id: data.menu });
    const mark = await Mark.findOne({ _id: data.mark });
    
    var prices = data.price;
    if (data.TypeDiscount == '%') {
      prices = data.price - (data.price * data.discount) / 100;
    } else if (data.TypeDiscount == '-') {
      prices = data.price - data.discount;
    }
    
    const processedData = {
      _id: data._id,
      menu: menu ? menu : 'MENU KHÔNG TỒN TẠI',
      mark: mark ? mark : 'THƯƠNG HIỆU KHÔNG TỒN TẠI',
      path: data.path,
      name: data.name,
      price: {
        main:{
          num: data.price,
          text: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(data.price)
        },
        total:{
          num: prices,
          text: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(prices)
        }
      },
      content: data.content,
      show: data.show,
      description: data.description,
      ListType: (data.ListType),
      thumbnail: (data.thumbnail),
      sell: data.sell,
      discount: {
        type: data.TypeDiscount,
        value: data.discount
      },
      TypeDiscount: data.TypeDiscount,
      createdAt: moment(data.createdAt).format('DD/MM/YYYY - HH:mm:ss'),
      outID: data._id,
    };
    

    return res.render('product/views', { user: req.user, get: processedData });
  }

  static async GetProfile(req, res) {
    return res.render('info/profile', { user: req.user });
  }
  static async GetProfile2(req, res) {
    return res.render('info/setting', { user: req.user });
  }
  static async GetProfile3(req, res) {
    return res.render('info/orders', { user: req.user });
  }
  static async GetProfile4(req, res) {
    return res.render('info/security', { user: req.user });
  }
  static async GetProfile5(req, res) {
    let all = await Address.find({ UserID: req.user._id });
    return res.render('info/address', { user: req.user, all });
  }
}

export default HomeController;
