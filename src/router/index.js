


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
// import ProductManagerment from "../components/Product/ProductManagerment.vue"
// import ProductDetail from "../components/Product/ProductDetail.vue"




const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    // { path: "/products", component: ProductManagerment },
    // { path: '/products/:id', component: ProductDetail },
    { path: "/profile", name: "profile", component: ProfileView, meta: { title: 'Profile' } },
    { path: "/warehouse", component: Warehouse, meta: { title: 'Warehouse' } },
    { path: '/warehouse/:id/zone', component: Zone, meta: { title: 'Zone' }, props: true },
    { path: '/warehouse/:id/zone/:id/aisle', component: Aisle, meta: { title: 'Aisle' }, props: true },
    


    {
        path: '/admin',
        component: HomeView,
        meta: { title: 'Admin' },
        children: [
            {
                path: 'account',
                component: AccountManagerment,
                meta: { title: 'Account' }
            },
            {
                path: 'account/add',
                component: AccountDetail,
                meta: { title: 'Account' }
            },
            {
                path: 'account/:id/detail',
                component: AccountDetail,
                meta: { title: 'Detail' }
            },
            {
                path: "warehouse",
                component: Warehouse,
                meta: { title: 'Warehouse' }
            },
            {
                path: "warehouse/detail",
                component: WarehouseDetail,
                meta: { title: 'Warehouse' }
            },
            {
                path: "warehouse/:id/detail",
                component: WarehouseDetail,
                meta: { title: "Warehouse Detail" },
                props: true
            }
        ]
    }

]



const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;