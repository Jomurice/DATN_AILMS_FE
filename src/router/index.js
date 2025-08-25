import { createRouter, createWebHistory } from 'vue-router'
import UserManagement from '../components/admin/UserManagement.vue'

const routes = [
  { path: '/', redirect: '/users' },
  { path: '/users', name: 'UserList', component: UserManagement },
  { path: '/users/add', name: 'UserAdd', component: UserManagement },
  { path: '/users/edit/:id', name: 'UserEdit', component: UserManagement, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router