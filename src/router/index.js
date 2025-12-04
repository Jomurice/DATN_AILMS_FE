import { createRouter, createWebHistory } from "vue-router";
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
import SuppliersFrom from "../components/suppliers/SuppliersFrom.vue";

import InventoryCheckList from "../components/inventory_check/InventoryCheckList.vue";
import InventoryCheckCreate from "../components/inventory_check/InventoryCheckCreate.vue";
import InventoryCheckDetail from "../components/inventory_check/InventoryCheckDetail.vue";
import InventoryReport from "../components/report/Report.vue";

import WarehouseCreateForm from "../components/NewWarehouse/WarehouseCreateForm.vue";
import PurchacseOrderManagement from "../components/PO/PurchacseOrderManagement.vue";

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
    children: [
      {
        path: "inventory-check",
        name: "inventory-check-list",
        meta: { title: "Kiểm kê kho" },
        component: InventoryCheckList,
      },
      {
        path: "inventory-check/new",
        name: "inventory-check-create",
        meta: { title: "Tạo phiếu kiểm kê" },
        component: InventoryCheckCreate,
      },
      {
        path: "inventory-check/:id",
        name: "inventory-check-detail",
        meta: { title: "Thực hiện kiểm kê" },
        component: InventoryCheckDetail,
        props: true,
      },
      {
          path: "inventory-report",
          name: "inventory-report",
          meta: { title: "Báo cáo kiểm kê" },
          component: InventoryReport,
      },
      { path: "", redirect: "product" },

      {
        path: "dashboard",
        name: "dashboard",
        meta: { title: "Trang chủ" },
        component: Dashboard,
      },
      {
        path: "profile",
        name: "profile",
        meta: { title: "Thông tin cá nhân" },
        component: ProfileView,
      },

      // Product
      {
        path: "product",
        name: "product",
        meta: { title: "Hàng hóa" },
        component: Products,
      },
      {
        path: 'productDetails',
        name: 'productDetails',
        component: ProductDetails
      },
      {
        path: "product/add",
        name: "product-add",
        meta: { title: "Thêm" },
        component: ProductForm,
      },
      {
        path: "product/:id/edit",
        name: "product-edit",
        meta: { title: "Sửa" },
        component: ProductForm,
        props: true,
      },

      // Category
      {
        path: "category",
        name: "category",
        meta: { title: "Loại sản phẩm" },
        component: Category,
      },
      {
        path: "category/add",
        name: "category-add",
        meta: { title: "Thêm" },
        component: CategoryForm,
      },
      {
        path: "category/:id/detail",
        name: "category-detail",
        meta: { title: "Sửa" },
        component: CategoryForm,
        props: true,
      },

      { path: "/warehouses", name: "Warehouses", component: Warehouse },
      // Warehouse chain
      {
        path: "warehouse",
        name: "warehouse",
        meta: { title: "Kho" },
        component: Warehouse,
      },

      {
        path: "/warehousesmenu",
        name: "WarehousesMenu",
        component: WarehouseMenu,
      },
      {
        path: "/warehouses/create",
        name: "WarehouseCreate",
        component: WarehouseCreateForm,
      },

      {
        path: "/suppliers",
        name: "suppliers",
        component: SuppliersFrom,
      },
      {
        path: "/purchaseorder",
        name: "purchaseorder",
        component: PurchacseOrderManagement,
      },
      // Inbound & Outbound
      {
        path: "inbound",
        name: "inbound",
        meta: { title: "Nhập hàng" },
        component: Inbound,
      },
      {
        path: "inbound/new",
        name: "inbound-create",
        meta: { title: "Tạo đơn mua" },
        component: PurchaseOrderCreate,
      },
      {
        path: "inbound/:id",
        name: "inbound-detail",
        meta: { title: "Chi tiết đơn mua" },
        component: PurchaseOrderDetail,
        props: true,
      },
      {
        path: "outbound",
        name: "outbound",
        meta: { title: "Xuất hàng" },
        component: Outbound,
      },
      {
        path: "outbound/new",
        name: "outbound-create",
        meta: { title: "Tạo phiếu xuất" },
        component: OutboundOrderCreate,
      },
      {
        path: "outbound/:id",
        name: "outbound-detail",
        meta: { title: "Chi tiết phiếu xuất" },
        component: OutboundOrderDetail,
        props: true,
      },
      {
        path: "customer",
        name: "customer",
        meta: { title: "khách hàng" },
        component: CustomerList,
        props: true,
      },
      { path: ":pathMatch(.*)*", redirect: "/product" },



    ],
  },

  {
    path: "/admin",
    name: "admin",
    meta: { title: "Quản lý" },
    component: HomeView,
    children: [
      {
        path: "account",
        name: "admin-account",
        meta: { title: "Nhân sự" },
        component: Accounts,
      },
      {
        path: "account/add",
        name: "admin-account-add",
        meta: { title: "Thêm" },
        component: AccountForm,
      },
      {
        path: "account/:id/edit",
        name: "admin-account-edit",
        meta: { title: "Sửa" },
        component: AccountForm,
        props: true,
      },
    ],
  },
];

export default createRouter({ history: createWebHistory(), routes });
