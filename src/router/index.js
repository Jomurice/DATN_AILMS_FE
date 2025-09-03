// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../components/home/HomeUser.vue";
import ProfileView from "../components/account/Profile.vue";
import AccountManagerment from "../components/admin/AccountManagerment.vue";
import AccountDetail from "../components/admin/AccountDetail.vue";
import Warehouse from "../components/warehouseManagement/Warehouse.vue";
import WarehouseDetail from "../components/warehouseManagement/detail/Warehouse-Detail.vue";
import Zone from "../components/warehouseManagement/Zone.vue";
import Aisle from "../components/warehouseManagement/Aisle.vue";
import Shelf from "../components/warehouseManagement/Shelf.vue";
import Bin from "../components/warehouseManagement/Bin.vue";
import Login from "../components/Login.vue";


import ProductManagerment from "../components/Product/ProductManagerment.vue";
import ProductDetail from "../components/Product/ProductDetail.vue";
import ProductForm from "../components/Product/ProductForm.vue";
import CategoryList from "../components/category/CategoryList.vue";
import CategoryForm from "../components/category/CategoryForm.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },

  {
    path: "/",
    component: HomeView,
    children: [
      { path: "", redirect: "products" },                

      // Products
      { path: "profile", component: ProfileView },
      { path: "products", name: "products", component: ProductManagerment },
      { path: "products/form/:id?", name: "product-form", component: ProductForm },
      { path: "products/:id", name: "product-detail", component: ProductDetail, props: true },

      // Categories
      { path: "categories", name: "category-list", component: CategoryList },
      { path: "categories/add", name: "category-add", component: CategoryForm },
      { path: "categories/:id/edit", name: "category-edit", component: CategoryForm },

      // Warehouse system
      { path: "warehouse", component: Warehouse },
      { path: "warehouse/:wid/zone", component: Zone, props: true },
      { path: "warehouse/:wid/zone/:zid/aisle", component: Aisle, props: true },
      { path: "warehouse/:wid/zone/:zid/aisle/:aid/shelf", component: Shelf, props: true },
      {
        path: "warehouse/:wid/zone/:zid/aisle/:aid/shelf/:sid/bin",
        name: "bin",
        component: Bin,
        props: true,
      },

      // Admin
      { path: "admin/account", component: AccountManagerment },
      { path: "admin/account/add", component: AccountDetail },
      { path: "admin/account/:id/detail", component: AccountDetail, props: true },
      { path: "admin/warehouse", component: Warehouse },
      { path: "admin/warehouse/:id/detail", component: WarehouseDetail, props: true },

      
      { path: ":pathMatch(.*)*", redirect: "/products" },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
