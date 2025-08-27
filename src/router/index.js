
  

import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../components/home/Home.vue";
import ProfileView from "../components/account/Profile.vue";
import AccountManagerment from "../components/admin/AccountManagerment.vue";
import Warehouse from "../components/warehouseManagement/Warehouse.vue";
import Zone from "../components/warehouseManagement/Zone.vue";
import Aisle from "../components/warehouseManagement/Aisle.vue";    
import Login from '../components/Login.vue'
import ProductManagerment from "../components/Product/ProductManagerment.vue"
import ProductDetail from "../components/Product/ProductDetail.vue"
const routes = [
  
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: "/products", component: ProductManagerment },
  { path: '/products/:id', component: ProductDetail },
    {path: "/", name: "home", component: HomeView},
    {path: "/profile", name: "profile", component: ProfileView,meta: { title: 'Profile' }},
    {path: "/warehouse",
        component: Warehouse,
        meta: { title: 'Warehouse' }
    },
    
    {path: '/warehouse/:id/zone', component: Zone, meta: { title: 'Zone' },props: true },
    {path: '/warehouse/:id/zone/:id/aisle', component: Aisle, meta: { title: 'Aisle' },props: true },

    {path:'/admin',
    meta: { title: 'Admin' },
    children: [
        {
            path: 'account-managerment', 
            component: AccountManagerment,
            meta: { title: 'Account Managerment' }
        },
    ]
    }

]



const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;