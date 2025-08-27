import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../components/home/Home.vue";
import ProfileView from "../components/account/Profile.vue";
import AccountManagerment from "../components/admin/AccountManagerment.vue";
import AccountDetail from "../components/admin/AccountDetail.vue";
import Warehouse from "../components/warehouseManagement/Warehouse.vue";
import WarehouseDetail from "../components/warehouseManagement/detail/Warehouse-Detail.vue";
import Zone from "../components/warehouseManagement/Zone.vue";
import Aisle from "../components/warehouseManagement/Aisle.vue";    

const routes = [
    {path: "/", name: "home", component: HomeView},
    {path: "/profile", name: "profile", component: ProfileView,meta: { title: 'Profile' }},
    {path: "/warehouse",
        children:[
            {path:'/admin/warehouse'}
        ],
        component: Warehouse, meta: { title: 'Warehouse' }},
    {path: '/warehouse/:id/zone', component: Zone, meta: { title: 'Zone' },props: true },
    {path: '/warehouse/:id/zone/:id/aisle', component: Aisle, meta: { title: 'Aisle' },props: true },



    {path:'/admin',
    meta: { title: 'Admin' },
    children: [
        {
            path: 'account', 
            component: AccountManagerment,
            meta: { title: 'Account' }
        },
        {
            path:'account/:id/detail',
            component: AccountDetail,
            meta: {title: 'Detail'}
        },
        {
            path: 'warehouse/detail',
            children: [
               { path: 'warehouse/:id/detail'}
            ],
            component: WarehouseDetail,
            meta: {title: 'Detail'}
        },
    ]
    }
]



const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;