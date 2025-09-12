<template>
  <div class="container-fluid px-3 py-4">
    <div class="pbox">
      <WarehouseSide />
      <main class="main">
        <div class="crumb">
          <span class="crumb-title">Sơ đồ kho</span>
        </div>
        <div v-if="ui === 'list'" class="section-card">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
            <h4 class="fw-bold mb-0">Danh sách kho</h4>
            <button class="btn btn-success btn-sm btn-ctl" @click="openAdd">+ Thêm</button>
          </div>
          <div class="table-responsive">
            <table v-if="items.length" class="table table-hover mb-0">
              <thead class="bg-light">
                <tr class="text-uppercase small fw-bold">
                  <th style="width:260px">ID</th>
                  <th>Tên</th>
                  <th>Vị trí</th>
                  <th class="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="w in items" :key="w.id">
                  <td class="text-monospace small">{{ w.id }}</td>
                  <td>{{ w.name }}</td>
                  <td>{{ w.location }}</td>
                  <td class="text-center">
                    <div class="d-flex gap-2 justify-content-center">
                      <button class="btn btn-sm btn-outline-warning btn-ctl" @click="openEdit(w)">Sửa</button>
                      <button class="btn btn-sm btn-outline-info btn-ctl" @click="openDetail(w.id)">Chi tiết</button>
                      <RouterLink class="btn btn-sm btn-outline-secondary btn-ctl" :to="`/warehouse/${w.id}/zone`">Xem khu</RouterLink>
                      <button class="btn btn-sm btn-outline-danger btn-ctl" @click="remove(w.id)">Xoá</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="text-muted p-3">Không có dữ liệu…</div>
          </div>
        </div>
        <div v-else-if="ui === 'form'" class="section-card">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
            <h4 class="fw-bold mb-0">{{ isEdit ? 'Cập nhật kho' : 'Thêm kho' }}</h4>
            <div>
              <button class="btn btn-outline-secondary btn-sm me-2" @click="$router.back()">⟵ Trở về</button>
              <button class="btn btn-outline-secondary btn-sm" @click="ui = 'list'">← Quay lại</button>
            </div>
          </div>
          <div class="card border-0 shadow-sm p-4">
            <form class="row g-3" @submit.prevent="submit">
              <div class="col-md-6">
                <label class="form-label">Tên <span class="text-danger">*</span></label>
                <input v-model.trim="form.name" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Vị trí <span class="text-danger">*</span></label>
                <input v-model.trim="form.location" class="form-control" required />
              </div>
              <div class="col-12">
                <button class="btn btn-primary btn-ctl">{{ isEdit ? 'Cập nhật' : 'Thêm mới' }}</button>
                <button type="button" class="btn btn-outline-secondary btn-ctl ms-2" @click="ui = 'list'">Huỷ</button>
              </div>
            </form>
          </div>
        </div>
        <div v-else-if="ui === 'detail'" class="section-card">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
            <h4 class="fw-bold mb-0">Chi tiết kho</h4>
            <div>
              <button class="btn btn-outline-secondary btn-sm me-2" @click="$router.back()">⟵ Trở về</button>
              <button class="btn btn-outline-secondary btn-sm" @click="ui = 'list'">← Quay lại</button>
            </div>
          </div>
          <div class="card border-0 shadow-sm p-4">
            <div class="mb-2"><small class="text-muted">ID</small><div class="fw-medium">{{ detail?.id }}</div></div>
            <div class="mb-2"><small class="text-muted">Tên</small><div>{{ detail?.name }}</div></div>
            <div class="mb-2"><small class="text-muted">Vị trí</small><div>{{ detail?.location }}</div></div>
            <h6 class="fw-bold mt-4">Khu — {{ zones.length }}</h6>
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="bg-light">
                  <tr class="text-uppercase small fw-bold">
                    <th style="width:220px">ID</th>
                    <th>Tên</th>
                    <th>Mã</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="z in zones" :key="z.id">
                    <td class="text-monospace small">{{ z.id }}</td>
                    <td>{{ z.name }}</td>
                    <td>{{ z.code }}</td>
                    <td>
                      <RouterLink class="btn btn-sm btn-outline-primary btn-ctl" :to="`/warehouse/${detail.id}/zone/${z.id}/aisle`">Quản lý dãy</RouterLink>
                    </td>
                  </tr>
                  <tr v-if="!zones.length"><td colspan="4" class="text-center text-muted">Chưa có khu</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { warehouseService } from "../../services/WarehouseService";
import { zoneService } from "../../services/ZoneService";
import WarehouseSide from "./_WarehouseSide.vue";

const router = useRouter();
const ui = ref("list");
const items = ref([]);
const zones = ref([]);
const isEdit = ref(false);
const editingId = ref(null);
const detail = ref(null);
const form = ref({ name: "", location: "" });

async function load() {
  items.value = await warehouseService.getAll() || [];
}
function openAdd() {
  isEdit.value = false;
  editingId.value = null;
  form.value = { name: "", location: "" };
  ui.value = "form";
}
function openEdit(w) {
  isEdit.value = true;
  editingId.value = w.id;
  form.value = { name: w.name, location: w.location };
  ui.value = "form";
}
async function openDetail(id) {
  detail.value = await warehouseService.getById(String(id));
  zones.value = await zoneService.getAll(String(id)) || [];
  ui.value = "detail";
}
async function submit() {
  if (isEdit.value) await warehouseService.update(editingId.value, form.value);
  else await warehouseService.create(form.value);
  await load();
  ui.value = "list";
}
async function remove(id) {
  if (confirm("Xoá kho này?")) {
    await warehouseService.remove(id);
    await load();
  }
}

onMounted(load);
</script>

<style scoped>
.pbox { display: flex; gap: 16px; width: 100%; }
.main { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.crumb { display: flex; align-items: center; justify-content: space-between; }
.crumb-title { font-weight: 700; font-size: 18px; }
.section-card { background: #fff; border: 1px solid #eef2f7; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.table th, .table td { vertical-align: middle; }
.btn-ctl { min-width: 110px; }
@media (max-width: 992px) {
  .pbox { flex-direction: column; }
}
</style>