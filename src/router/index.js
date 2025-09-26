import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../components/home/HomeUser.vue";
import Forgotpass from "../components/account/Forgotpass.vue";
import ChangePassword from "../components/account/Change-password.vue";
import Login from '../components/Login.vue';

import ProfileView from "../components/account/Profile.vue";
import Accounts from "../components/admin/AccountManagerment.vue";
import AccountForm from "../components/admin/AccountForm.vue";

import Warehouse from "../components/warehouseManagement/Warehouse.vue";
import Zone from "../components/warehouseManagement/Zone.vue";
import Aisle from "../components/warehouseManagement/Aisle.vue";
import Shelf from "../components/warehouseManagement/Shelf.vue";
import Bin from "../components/warehouseManagement/Bin.vue";


import WarehouseMenu from "../components/NewWarehouse/WarehouseMenu.vue";

import Products from "../components/Product/ProductManagerment.vue";
import ProductForm from "../components/Product/ProductForm.vue";

import Category from "../components/category/CategoryList.vue";
import CategoryForm from "../components/category/CategoryForm.vue";

import Dashboard from "../components/dashboard/Dashboard.vue";

import Inbound from "../components/inbound/Inbound.vue";
import PurchaseOrderCreate from "../components/inbound/PurchaseOrderCreate.vue";
import PurchaseOrderDetail from "../components/inbound/PurchaseOrderDetail.vue";
import Outbound from "../components/outbound/Outbound.vue";



import locationManager from "../components/location/locationManager.vue";
import WarehouseCreateForm from "../components/NewWarehouse/WarehouseCreateForm.vue";

 const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "login", component: Login },
  { path: "/forgot-password", name: "forgot-password", component: Forgotpass },
  { path: "/change-password", name: "change-password", component: ChangePassword },

  {
    path: "/",
    component: HomeView,
    children: [
      { path: "", redirect: "product" },

      { path: "dashboard", name: "dashboard", meta: {title: 'Trang chủ'}, component: Dashboard },
      { path: "profile", name: "profile", meta: {title: 'Thông tin cá nhân'}, component: ProfileView },

      // Product
      { path: "product", name: "product", meta: {title: 'Hàng hóa'}, component: Products },
      { path: "product/add", name: "product-add", meta: {title: 'Thêm'}, component: ProductForm },
      { path: "product/:id/edit", name: "product-edit", meta: {title: 'Sửa'}, component: ProductForm, props: true },

      // Category
      { path: "category", name: "category", meta: {title: 'Loại sản phẩm'}, component: Category },
      { path: "category/add", name: "category-add", meta: {title: 'Thêm'}, component: CategoryForm },
      { path: "category/:id/detail", name: "category-detail", meta: {title: 'Sửa'}, component: CategoryForm, props: true },

      { path: "/warehouses", name: "Warehouses", component: Warehouse },
      // Warehouse chain
      { path: "warehouse", name: "warehouse", meta: {title: 'Kho'}, component: Warehouse },
      { path: "warehouse/:wid/zone", name: "zone", meta: {title: 'Khu'}, component: Zone, props: true },
      { path: "warehouse/:wid/zone/:zid/aisle", name: "aisle", meta: {title: 'Dãy'}, component: Aisle, props: true },
      { path: "warehouse/:wid/zone/:zid/aisle/:aid/shelf", name: "shelf", meta: {title: 'Kệ'}, component: Shelf, props: true },
      { path: "warehouse/:wid/zone/:zid/aisle/:aid/shelf/:sid/bin", name: "bin", meta: {title: 'Ô'}, component: Bin, props: true },

      { path: "/warehousesmenu", name: "WarehousesMenu", component: WarehouseMenu },
      { path: "/warehouses/create",name: "WarehouseCreate",component: WarehouseCreateForm,},
      // Inbound & Outbound
      { path: "inbound", name: "inbound", meta: {title: 'Nhập hàng'}, component: Inbound},
       { path: "inbound/new", name: "inbound-create", meta: { title: "Tạo đơn mua" }, component: PurchaseOrderCreate },
      { path: "inbound/:id", name: "inbound-detail", meta: { title: "Chi tiết đơn mua" }, component: PurchaseOrderDetail, props: true },
      { path: "outbound", name: "outbound", meta: {title: 'Xuất hàng'}, component: Outbound},

      { path: ":pathMatch(.*)*", redirect: "/product" },

      // locationManager 
      {path:"location", name: "location", meta:{title: 'Quản lý vị trí kho'}, component: locationManager },
    ],
  },

  {
    path: "/admin",
    name: "admin",
    meta: {title: 'Quản lý'},
    component: HomeView,
    children:[
      { path: "account", name: "admin-account", meta: {title: 'Nhân sự'}, component: Accounts },
      { path: "account/add", name: "admin-account-add", meta: {title: 'Thêm'}, component: AccountForm },
      { path: "account/:id/edit", name: "admin-account-edit", meta: {title: 'Sửa'}, component: AccountForm, props: true },
    ]
  }
];

export default createRouter({ history: createWebHistory(), routes });
