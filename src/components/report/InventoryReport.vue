<template>
  <div class="container-fluid px-4 py-4">
    <h4 class="fw-bold mb-3">BÁO CÁO NHẬP – XUẤT – TỒN</h4>

    <!-- FILTER -->
    <div class="card mb-3">
      <div class="card-body row g-3 align-items-end">

        <div class="col-md-3">
          <label class="form-label">Từ ngày</label>
          <input type="date" v-model="startDate" class="form-control" />
        </div>

        <div class="col-md-3">
          <label class="form-label">Đến ngày</label>
          <input type="date" v-model="endDate" class="form-control" />
        </div>

        <div class="col-md-3">
          <label class="form-label">
            Kho <span class="text-danger">*</span>
          </label>
          <select v-model="warehouseId" class="form-select">
            <option value="">-- Chọn kho --</option>
            <option v-for="w in warehouses" :key="w.id" :value="w.id">
              {{ w.name }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Sản phẩm</label>
          <select v-model="productId" class="form-select">
            <option value="">-- Tất cả sản phẩm --</option>
            <option v-for="p in products" :key="p.id" :value="p.id">
              {{ p.name }} ({{ p.sku }})
            </option>
          </select>
        </div>

        <div class="col-12 text-end">
          <button class="btn btn-primary me-2" @click="search">
            Xem báo cáo
          </button>
          <button
            class="btn btn-success"
            :disabled="!reportData.length"
            @click="exportExcel"
          >
            Xuất Excel
          </button>
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-4 text-muted">
      Đang tải dữ liệu...
    </div>

    <!-- TABLE -->
    <div v-else class="card">
      <div class="card-body table-responsive">
        <table class="table table-bordered align-middle">
          <thead class="table-light">
            <tr>
              <th>SKU</th>
              <th>Sản phẩm</th>
              <th>Kho</th>
              <th class="text-end">Tồn đầu</th>
              <th class="text-end">Nhập</th>
              <th class="text-end">Xuất</th>
              <th class="text-end">Tồn cuối</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!reportData.length">
              <td colspan="7" class="text-center text-muted">
                Không có dữ liệu
              </td>
            </tr>

            <tr v-for="item in reportData" :key="item.productId">
              <td>{{ item.sku }}</td>
              <td>{{ item.productName }}</td>
              <td>{{ item.warehouseName }}</td>
              <td class="text-end">{{ item.openingStock }}</td>
              <td class="text-end">{{ item.totalIn }}</td>
              <td class="text-end">{{ item.totalOut }}</td>
              <td class="text-end fw-bold">{{ item.closingStock }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PAGINATION -->
    <div
      v-if="totalPages > 1"
      class="d-flex justify-content-between align-items-center mt-3"
    >
      <div class="text-muted">
        Tổng: {{ totalElements }} dòng
      </div>

      <ul class="pagination mb-0">
        <li class="page-item" :class="{ disabled: page === 0 }">
          <button class="page-link" @click="changePage(page - 1)">‹</button>
        </li>

        <li class="page-item disabled">
          <span class="page-link">
            Trang {{ page + 1 }} / {{ totalPages }}
          </span>
        </li>

        <li class="page-item" :class="{ disabled: page + 1 >= totalPages }">
          <button class="page-link" @click="changePage(page + 1)">›</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import { toast } from 'vue-sonner';

import { reportService } from '@/services/report/reportService';
import { productService } from '@/services/product/productService';
import { warehouseService } from '@/services/WarehouseService';

export default {
  name: 'InventoryReport',

  data() {
    return {
      loading: false,

      warehouses: [],
      products: [],

      startDate: '',
      endDate: '',
      warehouseId: '',
      productId: '',

      reportData: [],
      page: 0,
      size: 10,
      totalPages: 0,
      totalElements: 0
    };
  },

  async mounted() {
    await this.loadMasterData();
  },

  methods: {
    async loadMasterData() {
      try {
        this.warehouses = await warehouseService.getAllWarehouses();
        this.products = await productService.getAll();
      } catch (e) {
        console.error(e);
        toast.error('Tải dữ liệu danh mục thất bại');
      }
    },

    async search() {
      if (!this.warehouseId) {
        toast.error('Vui lòng chọn kho!');
        return;
      }
      this.page = 0;
      await this.loadReport();
    },

    async changePage(p) {
      if (p < 0 || p >= this.totalPages) return;
      this.page = p;
      await this.loadReport();
    },

    async loadReport() {
      this.loading = true;
      try {
        const res = await reportService.getInventorySummary({
          startDate: this.startDate || null,
          endDate: this.endDate || null,
          warehouseId: this.warehouseId,
          productId: this.productId || null,
          page: this.page,
          size: this.size
        });

        const result = res.result;
        this.reportData = result.content || [];
        this.totalPages = result.totalPages;
        this.totalElements = result.totalElements;
      } catch (e) {
        console.error(e);
        toast.error('Tải báo cáo thất bại');
      } finally {
        this.loading = false;
      }
    },

    async exportExcel() {
      const res = await reportService.getInventorySummary({
        startDate: this.startDate || null,
        endDate: this.endDate || null,
        warehouseId: this.warehouseId,
        productId: this.productId || null,
        page: 0,
        size: 999999
      });

      const data = res.result.content || [];

      const headerRows = [
        ['BÁO CÁO NHẬP - XUẤT - TỒN'],
        [`Từ ngày: ${this.startDate || '---'}  Đến ngày: ${this.endDate || '---'}`],
        [`Kho: ${this.warehouses.find(w => w.id === this.warehouseId)?.name || ''}`],
        [
          `Sản phẩm: ${
            this.productId
              ? this.products.find(p => p.id === this.productId)?.name
              : 'Tất cả sản phẩm'
          }`
        ],
        []
      ];

      const tableHeader = [[
        'SKU',
        'Sản phẩm',
        'Kho',
        'Tồn đầu',
        'Nhập',
        'Xuất',
        'Tồn cuối'
      ]];

      const tableData = data.map(i => [
        i.sku,
        i.productName,
        i.warehouseName,
        i.openingStock,
        i.totalIn,
        i.totalOut,
        i.closingStock
      ]);

      const ws = XLSX.utils.aoa_to_sheet([
        ...headerRows,
        ...tableHeader,
        ...tableData
      ]);

      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'BaoCao_NXT');

      XLSX.writeFile(
        wb,
        `BaoCao_NXT_${this.startDate || 'ALL'}_${this.endDate || 'ALL'}.xlsx`
      );
    }
  }
};
</script>

<style scoped>
.table th {
  white-space: nowrap;
}
</style>
