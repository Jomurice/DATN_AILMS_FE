
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../components/home/HomeUser.vue";
import ProfileView from "../components/account/Profile.vue";
import AccountManagerment from "../components/admin/AccountManagerment.vue";
import AccountDetail from "../components/admin/AccountDetail.vue";
import Warehouse from "../components/warehouseManagement/Warehouse.vue";
import WarehouseDetail from "../components/warehouseManagement/detail/Warehouse-Detail.vue";
import Zone from "../components/warehouseManagement/Zone.vue";
import Aisle from "../components/warehouseManagement/Aisle.vue";
import Login from '../components/Login.vue'
import ProductManagerment from "../components/Product/ProductManagerment.vue"
import ProductDetail from "../components/Product/ProductDetail.vue"




const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },

  {
    path: "/",
    component: HomeView,
    children: [
      { path: "profile", component: ProfileView },
      { path: "products", component: ProductManagerment },
      { path: "products/:id", component: ProductDetail, props: true },
      { path: "warehouse", component: Warehouse },
      { path: "warehouse/:id/zone", component: Zone, props: true },
      { path: "warehouse/:id/zone/:id/aisle", component: Aisle, props: true },

      // Admin
      {
        path: "admin/account",
        component: AccountManagerment,
      },
      {
        path: "admin/account/add",
        component: AccountDetail,
      },
      {
        path: "admin/account/:id/detail",
        component: AccountDetail,
        props: true,
      },
      {
        path: "admin/warehouse",
        component: Warehouse,
      },
      {
        path: "admin/warehouse/:id/detail",
        component: WarehouseDetail,
        props: true,
      },
    ],
  },
];



const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;