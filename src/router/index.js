import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../components/home/HomeUser.vue";
import Forgotpass from "../components/account/Forgotpass.vue";
import ChangePassword from "../components/account/Change-password.vue";
import Login from '../components/Login.vue';

import ProfileView from "../components/account/Profile.vue";
import Accounts from "../components/admin/AccountManagerment.vue";
import AccountForm from "../components/admin/AccountForm.vue";

import Warehouse from "../components/warehouseManagement/Warehouse.vue";
import WarehouseDetail from "../components/warehouseManagement/detail/Warehouse-Detail.vue";
import Zone from "../components/warehouseManagement/Zone.vue";
import Aisle from "../components/warehouseManagement/Aisle.vue";
import Shelf from "../components/warehouseManagement/Shelf.vue";
import Bin from "../components/warehouseManagement/Bin.vue";

import Products from "../components/Product/ProductManagerment.vue";
import ProductForm from "../components/Product/ProductForm.vue";

import Category from "../components/category/CategoryList.vue";
import CategoryForm from "../components/category/CategoryForm.vue";

import Dashboard from "../components/dashboard/Dashboard.vue";

import Inbound from "../components/inbound/Inbound.vue";
import Outbound from "../components/outbound/Outbound.vue";



const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  { path: "/forgot-password", component: Forgotpass },
  { path: "/change-password", component: ChangePassword },

  {
    path: "/",
    component: HomeView,
    children: [
      { path: "", redirect: "product" },

      { path: "dashboard", meta: {title: 'Trang chủ'}, component: Dashboard },
      { path: "profile", meta: {title: 'Thông tin cá nhân'}, component: ProfileView },

      // Product
      { path: "product", meta: {title: 'Hàng hóa'}, component: Products },
      { path: "product/add", meta: {title: 'Thêm'}, component: ProductForm },
      { path: "product/:id/edit", meta: {title: 'Sửa'}, component: ProductForm, props: true },
      // { path: "product/:id/edit", name: "product-edit", component: ProductForm, props: true },

      // Category
      { path: "category", meta: {title: 'Loại sản phẩm'}, component: Category },
      { path: "category/add", meta: {title: 'Thêm'}, component: CategoryForm },
      { path: "category/:id/detail", meta: {title: 'Sửa'}, component: CategoryForm, props: true },

      // Warehouse chain
      { path: "warehouse", meta: {title: 'Kho'}, component: Warehouse },
      { path: "warehouse/:wid/zone", meta: {title: 'Khu'}, component: Zone, props: true },
      { path: "warehouse/:wid/zone/:zid/aisle", meta: {title: 'Dãy'}, component: Aisle, props: true },
      { path: "warehouse/:wid/zone/:zid/aisle/:aid/shelf", meta: {title: 'Kệ'}, component: Shelf, props: true },
      { path: "warehouse/:wid/zone/:zid/aisle/:aid/shelf/:sid/bin", meta: {title: 'Ô'}, component: Bin, props: true },

      //inbound
      { path: "inbound", meta: {title: 'Nhập hàng'}, component: Inbound},
      //outbound
      { path: "outbound", meta: {title: 'Xuất hàng'}, component: Outbound},

      // Admin

      // catch-all
      { path: ":pathMatch(.*)*", redirect: "/product" },
    ],
  },

  { path: "/admin", meta: {title: 'Quản lý'}, component: HomeView,
    children:[
      { path: "account", meta: {title: 'Nhân sự'}, component: Accounts },
      { path: "account/add", meta: {title: 'Thêm'}, component: AccountForm },
      { path: "account/:id/edit", meta: {title: 'Sửa'}, component: AccountForm, props: true },
      // { path: "warehouse", component: Warehouse },
      // { path: "warehouse/:id/detail", component: WarehouseDetail, props: true },
    ]}
];

export default createRouter({ history: createWebHistory(), routes });
