import { createRouter, createWebHistory } from "vue-router";
import { tokenService } from "../services/TokenService"; 

import HomeView from "../components/home/HomeUser.vue";
import Forgotpass from "../components/account/Forgotpass.vue";
import ChangePassword from "../components/account/Change-password.vue";
import Login from "../components/Login.vue";

import ProfileView from "../components/account/Profile.vue";
import Accounts from "../components/admin/AccountManagerment.vue";
import AccountForm from "../components/admin/AccountForm.vue";

import Warehouse from "../components/warehouseManagement/Warehouse.vue";
import WarehouseMenu from "../components/NewWarehouse/WarehouseMenu.vue";

import ProductDetails from "../components/Product/ProductDetails.vue";
import Products from "../components/Product/ProductManagerment.vue";
import ProductForm from "../components/Product/ProductForm.vue";

import Category from "../components/category/CategoryList.vue";
import CategoryForm from "../components/category/CategoryForm.vue";

import Dashboard from "../components/dashboard/Dashboard.vue";

import Inbound from "../components/inbound/Inbound.vue";
import PurchaseOrderCreate from "../components/inbound/PurchaseOrderCreate.vue";
import PurchaseOrderDetail from "../components/inbound/PurchaseOrderDetail.vue";
import Outbound from "../components/outbound/Outbound.vue";
import OutboundOrderCreate from "../components/outbound/OutboundOrderCreate.vue";
import OutboundOrderDetail from "../components/outbound/OutboundOrderDetail.vue";
import CustomerList from "../components/outbound/CustomerList.vue";
import SuppliersFrom from "../components/inbound/SuppliersForm.vue";

import OutboundPage from "../components/outbound/OutboundPage.vue";

import InventoryCheckList from "../components/inventory_check/InventoryCheckList.vue";
import InventoryCheckCreate from "../components/inventory_check/InventoryCheckCreate.vue";
import InventoryCheckDetail from "../components/inventory_check/InventoryCheckDetail.vue";

import InventoryReport from "../components/report/InventoryReport.vue";

import WarehouseCreateForm from "../components/NewWarehouse/WarehouseCreateForm.vue";
import PurchacseOrderManagement from "../components/PO/PurchacseOrderManagement.vue";

import BrandView from "../components/brand/BrandView.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "login", component: Login },
  { path: "/forgot-password", name: "forgot-password", component: Forgotpass },
  {
    path: "/change-password",
    name: "change-password",
    component: ChangePassword,
  },

  {
    path: "/",
    component: HomeView,
    meta: { requiresAuth: true },
    children: [
      {
        path: "brand",
        name: "brand",
        meta: { title: "Quản lý Thương hiệu", roles: ["ADMIN"] },
        component: BrandView,
      },
      {
        path: "inventory-check",
        name: "inventory-check-list",
        meta: { title: "Kiểm kê kho", roles: ["ADMIN", "LM", "WO"] },
        component: InventoryCheckList,
      },
      {
        path: "inventory-check/new",
        name: "inventory-check-create",
        meta: { title: "Tạo phiếu kiểm kê", roles: ["ADMIN", "LM"] },
        component: InventoryCheckCreate,
      },
      {
        path: "inventory-check/:id",
        name: "inventory-check-detail",
        meta: { title: "Thực hiện kiểm kê", roles: ["ADMIN", "LM", "WO"] },
        component: InventoryCheckDetail,
        props: true,
      },
      {
        path: "inventory-report",
        name: "inventory-report",
        meta: { title: "Báo cáo kiểm kê", roles: ["ADMIN", "LM"] },
        component: InventoryReport,
      },
      { path: "", redirect: "inbound" },

      {
        path: "dashboard",
        name: "dashboard",
        meta: { title: "Trang chủ", roles: ["ADMIN", "LM"] },
        component: Dashboard,
      },
      {
        path: "profile",
        name: "profile",
        meta: { title: "Thông tin cá nhân", roles: ["ADMIN", "LM", "WO"] },
        component: ProfileView,
      },

      // Product
      {
        path: "product",
        name: "product",
        meta: { title: "Hàng hóa", roles: ["ADMIN", "LM"] },
        component: Products,
      },
      {
        path: "productDetails",
        name: "productDetails",
        meta: { roles: ["ADMIN", "LM"] },
        component: ProductDetails,
      },
      {
        path: "product/add",
        name: "product-add",
        meta: { title: "Thêm", roles: ["ADMIN"] },
        component: ProductForm,
      },
      {
        path: "product/:id/edit",
        name: "product-edit",
        meta: { title: "Sửa", roles: ["ADMIN"] },
        component: ProductForm,
        props: true,
      },

      // Category
      {
        path: "category",
        name: "category",
        meta: { title: "Loại sản phẩm", roles: ["ADMIN", ] },
        component: Category,
      },
      {
        path: "category/add",
        name: "category-add",
        meta: { title: "Thêm", roles: ["ADMIN"] },
        component: CategoryForm,
      },
      {
        path: "category/:id/detail",
        name: "category-detail",
        meta: { title: "Sửa", roles: ["ADMIN"] },
        component: CategoryForm,
        props: true,
      },

      { 
        path: "/warehouses", 
        name: "Warehouses", 
        meta: { roles: ["ADMIN"] },
        component: Warehouse 
      },
      {
        path: "warehouse",
        name: "warehouse",
        meta: { title: "Kho", roles: ["ADMIN"] },
        component: Warehouse,
      },

      {
        path: "/warehousesmenu",
        name: "WarehousesMenu",
        meta: { roles: ["ADMIN"] },
        component: WarehouseMenu,
      },
      {
        path: "/warehouses/create",
        name: "WarehouseCreate",
        meta: { roles: ["ADMIN"] },
        component: WarehouseCreateForm,
      },

      {
        path: "/suppliers",
        name: "suppliers",
        meta: { roles: ["ADMIN"] },
        component: SuppliersFrom,
      },
      {
        path: "/purchaseorder",
        name: "purchaseorder",
        meta: { roles: ["ADMIN"] },
        component: PurchacseOrderManagement,
      },

      // Inbound & Outbound
      {
        path: "inbound",
        name: "inbound",
        meta: { title: "Nhập hàng", roles: ["ADMIN", "LM", "WO"] },
        component: Inbound,
      },
      {
        path: "inbound/new",
        name: "inbound-create",
        meta: { title: "Тạo đơn mua", roles: ["ADMIN"] },
        component: PurchaseOrderCreate,
      },
      {
        path: "inbound/:id",
        name: "inbound-detail",
        meta: { title: "Chi tiết đơn mua", roles: ["ADMIN", "LM", "WO"] },
        component: PurchaseOrderDetail,
        props: true,
      },
      {
        path: "outbound",
        name: "outbound",
        meta: { title: "Xuất hàng", roles: ["ADMIN", "LM", "WO"] },
        component: OutboundPage,
      },
      {
        path: "outbound/new",
        name: "outbound-create",
        meta: { title: "Tạo phiếu xuất", roles: ["ADMIN", "LM"] },
        component: OutboundOrderCreate,
      },
      {
        path: "outbound/:id",
        name: "outbound-detail",
        meta: { title: "Chi tiết phiếu xuất", roles: ["ADMIN", "LM", "WO"] },
        component: OutboundOrderDetail,
        props: true,
      },
      {
        path: "customer",
        name: "customer",
        meta: { title: "khách hàng", roles: ["ADMIN"] },
        component: CustomerList,
        props: true,
      },
      { 
        path: ":pathMatch(.*)*", 
        redirect: "/inbound" 
      },
    ],
  },

  // ============ ADMIN ROUTES ============
  {
    path: "/admin",
    name: "admin",
    meta: { title: "Quản lý", requiresAuth: true, roles: ["ADMIN"] },
    component: HomeView,
    children: [
      {
        path: "account",
        name: "admin-account",
        meta: { title: "Nhân sự", roles: ["ADMIN"] },
        component: Accounts,
      },
      {
        path: "account/add",
        name: "admin-account-add",
        meta: { title: "Thêm", roles: ["ADMIN"] },
        component: AccountForm,
      },
      {
        path: "account/:id/edit",
        name: "admin-account-edit",
        meta: { title: "Sửa", roles: ["ADMIN"] },
        component: AccountForm,
        props: true,
      },
    ],
  },
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ========================== 
// Navigation Guard Checking Authentication and Authorization
// =========================
router.beforeEach(async (to, from, next) => {
  const authStore = tokenService();
  
  // wating loading token and get role
  if (!authStore.token) {
    await authStore.loadToken();
  }

  const token = authStore.token;
  const userRole = authStore.userRole;

  // Если пользователь не авторизован и пытается зайти на защищенный маршрут
  if (to.path !== "/login" && !token) {
    next("/login");
    return;
  }

  // Если пользователь авторизован и пытается зайти на /login
  if (to.path === "/login" && token) {
    // Перенаправление в зависимости от роли
    if (userRole === "WO") {
      next("/inbound");
    } else {
      next("/dashboard");
    }
    return;
  }

  // Проверка ролей
  if (to.matched.some(record => record.meta.roles)) {
    const requiredRoles = to.meta.roles;
    
    if (!requiredRoles.includes(userRole)) {
      // Пользователь не имеет доступа - перенаправляем на стартовую страницу роли
      console.warn(`Access denied: User role "${userRole}" does not have access to "${to.path}"`);
      
      if (userRole === "WO") {
        next("/inbound");
      } else {
        next("/dashboard");
      }
      return;
    }
  }

  next();
});

export default router;