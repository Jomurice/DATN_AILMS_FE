// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../components/home/HomeUser.vue";
import Forgotpass from "../components/account/Forgotpass.vue";
import ChangePassword from "../components/account/Change-password.vue";
import Login from '../components/Login.vue';
import ProfileView from "../components/account/Profile.vue";
import Accounts from "../components/admin/AccountManagerment.vue";
import AccountDetail from "../components/admin/AccountDetail.vue";
import Warehouse from "../components/warehouseManagement/Warehouse.vue";
import WarehouseDetail from "../components/warehouseManagement/detail/Warehouse-Detail.vue";
import Zone from "../components/warehouseManagement/Zone.vue";
import Aisle from "../components/warehouseManagement/Aisle.vue";
import Bin from "../components/warehouseManagement/Bin.vue";
import Shelf from "../components/warehouseManagement/Shelf.vue";
import Products from "../components/Product/ProductManagerment.vue";
import ProductDetail from "../components/Product/ProductDetail.vue";
import Category from "../components/category/CategoryList.vue";
import CategoryDetail from "../components/category/CategoryForm.vue";




const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  { path: "/forgot-password", component: Forgotpass},
  { path: "/change-password", component: ChangePassword},

  {
    path: "/",
    component: HomeView,
    children: [          
      { path: "profile", component: ProfileView },
      { path: "product", component: Products },
      { path: "product/add", component: ProductDetail },
      { path: "product/:id/detail", component: ProductDetail, props: true },
      { path: "warehouse", component: Warehouse },
      { path: "warehouse/:id/zone", component: Zone, props: true },
      { path: "warehouse/:id/zone/:id/aisle", component: Aisle, props: true },
      { path: "warehouse/:id/zone/:id/aisle/:id/shelf", component: Shelf, props: true },
      { path: "warehouse/:id/zone/:id/aisle//:id/shelf/:id/bin", component: Bin, props: true },
      { path: "category", component: Category },
      { path: "category/add", component: CategoryDetail },
      { path: "category/:id/detail", component: CategoryDetail, props: true },

      // Admin
      {
        path: "warehouse/:wid/zone/:zid/aisle/:aid/shelf/:sid/bin",
        name: "bin",
        component: Bin,
        props: true,
      },

      // Admin
      { path: "admin/account", component: Accounts },
      { path: "admin/account/add", component: AccountDetail },
      { path: "admin/account/:id/detail", component: AccountDetail, props: true },
      { path: "admin/warehouse", component: Warehouse },
      { path: "admin/warehouse/:id/detail", component: WarehouseDetail, props: true },

    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
