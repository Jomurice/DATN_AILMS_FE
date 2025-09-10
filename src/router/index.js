import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../components/home/HomeUser.vue";
import Forgotpass from "../components/account/Forgotpass.vue";
import ChangePassword from "../components/account/Change-password.vue";
import Login from '../components/Login.vue';

import ProfileView from "../components/account/Profile.vue";
import Accounts from "../components/admin/AccountManagerment.vue";
import AccountForm from "../components/admin/AccountForm.vue";
import AccountDetail from "../components/admin/AccountDetail.vue";

import Warehouse from "../components/warehouseManagement/Warehouse.vue";
import WarehouseDetail from "../components/warehouseManagement/detail/Warehouse-Detail.vue";
import Zone from "../components/warehouseManagement/Zone.vue";
import Aisle from "../components/warehouseManagement/Aisle.vue";
import Shelf from "../components/warehouseManagement/Shelf.vue";
import Bin from "../components/warehouseManagement/Bin.vue";

import Products from "../components/Product/ProductManagerment.vue";
import ProductForm from "../components/Product/ProductForm.vue";
import ProductDetail from "../components/Product/ProductDetail.vue";

import Category from "../components/category/CategoryList.vue";
import CategoryForm from "../components/category/CategoryForm.vue";

import Dashboard from "../components/dashboard/Dashboard.vue";


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
      
      { path: "dashboard", component: Dashboard },
      // Modules khớp TopNav
      { path: "profile", component: ProfileView },

      // Product
        { path: "product", component: Products },
      { path: "product/add", component: ProductForm },
      { path: "product/:id", name: "product-detail", component: ProductDetail, props: true },
      { path: "product/:id/edit", name: "product-edit", component: ProductForm, props: true },

      // Category
      { path: "category", component: Category },
      { path: "category/add", component: CategoryForm },
      { path: "category/:id/detail", component: CategoryForm, props: true },

      // Warehouse chain
      { path: "warehouse", component: Warehouse },
      { path: "warehouse/:wid/zone", component: Zone, props: true },
      { path: "warehouse/:wid/zone/:zid/aisle", component: Aisle, props: true },
      { path: "warehouse/:wid/zone/:zid/aisle/:aid/shelf", component: Shelf, props: true },
      { path: "warehouse/:wid/zone/:zid/aisle/:aid/shelf/:sid/bin", name:"bin", component: Bin, props: true },

      // Admin
      { path: "admin/account", component: Accounts },
      { path: "admin/account/add", component: AccountForm },
{ path: "admin/account/:id/edit", component: AccountForm, props: true },
{ path: "admin/account/:id/detail", component: AccountDetail, props: true },
      { path: "admin/warehouse", component: Warehouse },
      { path: "admin/warehouse/:id/detail", component: WarehouseDetail, props: true },

      // catch-all
      { path: ":pathMatch(.*)*", redirect: "/product" },
    ],
  },
];

export default createRouter({ history: createWebHistory(), routes });
