<template>
  <div class="warehouse-management">
    <!-- LIST -->
    <div v-if="ui === 'list'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold m-0">Danh sách Warehouse</h5>
        <button class="btn btn-primary" @click="openAdd">+ Add Warehouse</button>
      </div>

      <div v-if="items.length">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th style="width:260px">ID</th>
              <th>Tên</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="w in items" :key="w.id">
              <td class="text-monospace small">{{ w.id }}</td>
              <td>{{ w.name }}</td>
              <td>{{ w.location }}</td>
              <td class="d-flex gap-2 flex-wrap">
                <button class="btn btn-sm btn-outline-warning" @click="openEdit(w)">Edit</button>
                <button class="btn btn-sm btn-outline-info" @click="openDetail(w.id)">Detail</button>
                <router-link :to="`/warehouse/${w.id}/zone`" class="btn btn-sm btn-outline-secondary">Show
                  Zones</router-link>
                <button class="btn btn-sm btn-outline-danger" @click="remove(w.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-muted">Không có dữ liệu…</div>
    </div>

    <!-- FORM -->
    <div v-else-if="ui === 'form'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold m-0">{{ isEdit ? 'Cập nhật Warehouse' : 'Thêm Warehouse' }}</h5>
        <button class="btn btn-outline-secondary" @click="back">← Quay lại</button>
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <form class="row g-3" @submit.prevent="submit" novalidate>
            <div class="col-md-6">
              <label class="form-label">Tên <span class="text-danger">*</span></label>
              <input v-model.trim="form.name" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Location <span class="text-danger">*</span></label>
              <input v-model.trim="form.location" class="form-control" required />
            </div>
            <div class="col-12">
              <button class="btn btn-primary">{{ isEdit ? 'Cập nhật' : 'Thêm mới' }}</button>
              <button type="button" class="btn btn-outline-secondary ms-2" @click="back">Huỷ</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- DETAIL -->
    <div v-else-if="ui === 'detail'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold m-0">Chi tiết Warehouse</h5>
        <button class="btn btn-outline-secondary" @click="back">← Quay lại</button>
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <div class="mb-2"><small class="text-muted">ID</small>
            <div class="fw-medium">{{ detail?.id }}</div>
          </div>
          <div class="mb-2"><small class="text-muted">Tên</small>
            <div>{{ detail?.name }}</div>
          </div>
          <div class="mb-2"><small class="text-muted">Location</small>
            <div>{{ detail?.location }}</div>
          </div>

          <h6 class="fw-bold mt-4">Zones ({{ zones.length }})</h6>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th style="width:220px">ID</th>
                  <th>Tên</th>
                  <th>Mô tả</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="z in zones" :key="z.id">
                  <td class="text-monospace small">{{ z.id }}</td>
                  <td>{{ z.name }}</td>
                  <td>{{ z.description }}</td>
                  <td>
                    <router-link class="btn btn-sm btn-outline-primary"
                      :to="`/warehouse/${detail.id}/zone/${z.id}/aisle`">Manage Aisles</router-link>
                  </td>
                </tr>
                <tr v-if="zones.length === 0">
                  <td colspan="4" class="text-center text-muted">Chưa có Zone</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { warehouseService } from "../../services/WarehouseService"
import { zoneService } from "../../services/ZoneService"

const ui = ref("list")
const items = ref([])
const zones = ref([])
const isEdit = ref(false)
const editingId = ref(null)
const detail = ref(null)
const form = ref({ name: "", location: "" })

async function load() { items.value = await warehouseService.getAll() }

function openAdd() { isEdit.value = false; editingId.value = null; form.value = { name: "", location: "" }; ui.value = "form" }
function openEdit(w) { isEdit.value = true; editingId.value = w.id; form.value = { name: w.name, location: w.location }; ui.value = "form" }
async function openDetail(id) { detail.value = await warehouseService.getById(String(id)); zones.value = await zoneService.getAll(String(id)); ui.value = "detail" }
function back() { ui.value = "list" }

async function submit() {
  if (isEdit.value) await warehouseService.update(editingId.value, form.value)
  else await warehouseService.create(form.value)
  await load(); back()
}
async function remove(id) { if (confirm("Xoá warehouse?")) { await warehouseService.remove(id); await load() } }

onMounted(load)
</script>

<style scoped>
.warehouse-management {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .1)
}
</style>
