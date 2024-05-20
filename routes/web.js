import express from 'express';

import PagesController from '../app/controller/pages';
import AdminController from '../app/controller/admin';
import APIController from '../app/controller/api';

import AuthAPI from '../app/middleware/AuthAPI';

import Admin from '../app/middleware/Admin';
import AdminAPI from '../app/middleware/AdminAPI';
import CheckUser from '../app/middleware/CheckUser';
import LoginAPI from '../app/middleware/LoginAPI';

const router = express.Router();

// users
router.get('/', CheckUser, PagesController.GetHome);
router.get('/auth/login', CheckUser, PagesController.GetLogin);
router.get('/auth/register', CheckUser, PagesController.GetRegister);
router.get('/info/profile', CheckUser, PagesController.GetProfile);
router.get('/info/setting', CheckUser, PagesController.GetProfile2);
router.get('/info/orders', CheckUser, PagesController.GetProfile3);
router.get('/info/security', CheckUser, PagesController.GetProfile4);
router.get('/info/address', CheckUser, PagesController.GetProfile5);
router.get('/cart', CheckUser, PagesController.GetCart);

router.get('/search', CheckUser, PagesController.GetSearch);
router.get('/:path/views', CheckUser, PagesController.GetProduct);

router.get('/logout', CheckUser, APIController.GetLogout);

router.get('/admin/', Admin, AdminController.GetHome);
router.get('/admin/setting', Admin, AdminController.GetSetting);
router.get('/admin/mark/create', Admin, AdminController.CreateMark);
router.get('/admin/mark', Admin, AdminController.GetMark);
router.get('/admin/mark/:id/edit', Admin, AdminController.EditMark);
router.get('/admin/member', Admin, AdminController.GetMember);
router.get('/admin/menu/create', Admin, AdminController.CreateMenu);
router.get('/admin/menu', Admin, AdminController.GetMenu);
router.get('/admin/menu/:id/edit', Admin, AdminController.EditMenu);
router.get('/admin/voucher/create', Admin, AdminController.CreateVoucher);
router.get('/admin/voucher', Admin, AdminController.GetVoucher);
router.get('/admin/products/add', Admin, AdminController.AddProduct);
router.get('/admin/products/:id/edit', Admin, AdminController.EditProduct);
router.get('/admin/products', Admin, AdminController.ListProduct);
router.get('/admin/member/:id/edit', Admin, AdminController.EditMember);
router.get('/admin/orders/pending', Admin, AdminController.OrdersPending);
router.get('/admin/orders/done', Admin, AdminController.OrdersDone);
router.get('/admin/orders/cancel', Admin, AdminController.OrdersCancel);
router.get('/admin/orders/ship', Admin, AdminController.OrdersShip);

router.post('/api/voucher/check', APIController.FindVoucher);
router.get('/api/product/list', CheckUser, APIController.list_Product);

router.post('/api/auth/register', LoginAPI, APIController.GetRegister);
router.post('/api/auth/login', LoginAPI, APIController.GetLogin);

router.post('/api/user/change-info', AuthAPI, APIController.UpInfo);
router.post('/api/user/change-password', AuthAPI, APIController.UpPass);
router.post('/api/user/add-address', AuthAPI, APIController.AddAddress);

router.post('/api/orders', AuthAPI, APIController.PaymentCart);


router.get(
  '/api/user/:id/delete-address',
  AuthAPI,
  APIController.DeleteAddress,
);
router.post('/api/user/:id/edit-address', AuthAPI, APIController.EditAddress);

router.post('/api/admin/setting', AdminAPI, APIController.Admin_UpSetting);
router.post(
  '/api/admin/member/:id/edit',
  AdminAPI,
  APIController.Admin_EditUser,
);
router.get(
  '/api/admin/member/:id/delete',
  AdminAPI,
  APIController.Admin_DeleteUser,
);

router.get('/api/orders/:id/cancel', AuthAPI, APIController.HuyDon);
router.post('/api/admin/menu/create', AdminAPI, APIController.Admin_CreateMenu);
router.post('/api/admin/menu/:id/edit', AdminAPI, APIController.Admin_EditMenu);
router.get(
  '/api/admin/menu/:id/delete',
  AdminAPI,
  APIController.Admin_DeleteMenu,
);
router.post('/api/admin/mark/create', AdminAPI, APIController.Admin_CreateMark);
router.post('/api/admin/mark/:id/edit', AdminAPI, APIController.Admin_EditMark);
router.get(
  '/api/admin/mark/:id/delete',
  AdminAPI,
  APIController.Admin_DeleteMark,
);

router.post(
  '/api/admin/voucher/create',
  AdminAPI,
  APIController.Admin_CreateVoucher,
);
router.get(
  '/api/admin/voucher/:id/delete',
  AdminAPI,
  APIController.Admin_DeleteVoucher,
);
router.get(
  '/api/admin/products/:id/delete',
  AdminAPI,
  APIController.DeleteProduct,
);

router.get(
  '/api/admin/Orders/:id/ship',
  AdminAPI,
  APIController.Admin_Orders_Vanchuyen,
);
router.get(
  '/api/admin/Orders/:id/done',
  AdminAPI,
  APIController.Admin_Orders_Hoanthanh,
);
router.get(
  '/api/admin/Orders/:id/cancel',
  AdminAPI,
  APIController.Admin_Orders_Huydon,
);

router.post(
  '/api/admin/products/add',
  AdminAPI,
  APIController.Admin_addProducts,
);
router.post(
  '/api/admin/products/:id/edit',
  AdminAPI,
  APIController.Admin_EditProducts,
);
router.post('/api/cart/payment', APIController.PaymentCart);

module.exports = router;
