<template>
  <div class="zone-management">
    <!-- LIST -->
    <div v-if="ui==='list'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold m-0">Danh sách Zone (Warehouse: {{ wid }})</h5>
        <button class="btn btn-primary" @click="openAdd">+ Add Zone</button>
      </div>

      <div v-if="items.length">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th style="width:260px">ID</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="z in items" :key="z.id">
              <td class="text-monospace small">{{ z.id }}</td>
              <td>{{ z.name }}</td>
              <td>{{ z.description }}</td>
              <td class="d-flex gap-2 flex-wrap">
                <button class="btn btn-sm btn-outline-warning" @click="openEdit(z)">Edit</button>
                <button class="btn btn-sm btn-outline-info" @click="openDetail(z.id)">Detail</button>
                <router-link :to="`/warehouse/${wid}/zone/${z.id}/aisle`" class="btn btn-sm btn-outline-secondary">Show Aisles</router-link>
                <button class="btn btn-sm btn-outline-danger" @click="remove(z.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-muted">Không có dữ liệu…</div>
    </div>

    <!-- FORM -->
    <div v-else-if="ui==='form'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold m-0">{{ isEdit ? 'Cập nhật Zone' : 'Thêm Zone' }}</h5>
        <button class="btn btn-outline-secondary" @click="back">← Quay lại</button>
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <form class="row g-3" @submit.prevent="submit" novalidate>
            <div class="col-md-6">
              <label class="form-label">Tên Zone <span class="text-danger">*</span></label>
              <input v-model.trim="form.name" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Mô tả</label>
              <input v-model.trim="form.description" class="form-control" />
            </div>
            <div class="col-12 small text-muted">Context: wid={{ wid }}</div>
            <div class="col-12">
              <button class="btn btn-primary">{{ isEdit ? 'Cập nhật' : 'Thêm mới' }}</button>
              <button type="button" class="btn btn-outline-secondary ms-2" @click="back">Huỷ</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- DETAIL -->
    <div v-else-if="ui==='detail'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold m-0">Chi tiết Zone</h5>
        <button class="btn btn-outline-secondary" @click="back">← Quay lại</button>
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <div class="mb-2"><small class="text-muted">ID</small><div class="fw-medium">{{ detail?.id }}</div></div>
          <div class="mb-2"><small class="text-muted">Tên</small><div>{{ detail?.name }}</div></div>
          <div class="mb-2"><small class="text-muted">Mô tả</small><div>{{ detail?.description }}</div></div>
          <div class="mb-2"><small class="text-muted">Warehouse</small><div>{{ detail?.warehouse?.name || '—' }}</div></div>

          <h6 class="fw-bold mt-4">Aisles ({{ aisles.length }})</h6>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead><tr><th style="width:220px">ID</th><th>Tên</th><th>Mã</th><th></th></tr></thead>
              <tbody>
                <tr v-for="a in aisles" :key="a.id">
                  <td class="text-monospace small">{{ a.id }}</td>
                  <td>{{ a.name }}</td>
                  <td>{{ a.code }}</td>
                  <td>
                    <router-link class="btn btn-sm btn-outline-primary" :to="`/warehouse/${wid}/zone/${detail.id}/aisle/${a.id}/shelf`">Manage Shelves</router-link>
                  </td>
                </tr>
                <tr v-if="aisles.length===0">
                  <td colspan="4" class="text-center text-muted">Chưa có Aisle</td>
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
import { useRoute } from "vue-router"
import { zoneService } from "../../services/ZoneService"
import { aisleService } from "../../services/AisleService"

const route = useRoute()
const wid = route.params.wid || route.params.id

const ui = ref("list")
const items = ref([])
const aisles = ref([])
const isEdit = ref(false)
const editingId = ref(null)
const detail = ref(null)
const form = ref({ name:"", description:"" })

async function load(){ items.value = await zoneService.getAll(String(wid)) }

function openAdd(){ isEdit.value=false; editingId.value=null; form.value={name:"",description:""}; ui.value="form" }
function openEdit(z){ isEdit.value=true; editingId.value=z.id; form.value={name:z.name, description:z.description}; ui.value="form" }
async function openDetail(id){ detail.value = await zoneService.getById(String(id)); aisles.value = await aisleService.getAll(String(id)); ui.value="detail" }
function back(){ ui.value="list" }

async function submit(){
  if (isEdit.value) await zoneService.update(String(editingId.value), form.value)
  else await zoneService.create(String(wid), form.value)
  await load(); back()
}
async function remove(id){ if(confirm("Xoá zone?")){ await zoneService.remove(String(id)); await load() } }

onMounted(load)
</script>

<style scoped>
.zone-management{ padding:24px; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,.1) }
</style>
