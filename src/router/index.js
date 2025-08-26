import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import ProductManagerment from "../components/Product/ProductManagerment.vue";

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: "/products", component: ProductManagerment }
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
