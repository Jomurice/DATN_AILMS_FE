<template>
  <div class="aisle-management">
    <!-- LIST -->
    <div v-if="ui==='list'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold m-0">Danh sách</h5>
        <button class="btn btn-primary" @click="openAdd">+ Add Aisle</button>
      </div>

      <div v-if="items.length">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th style="width:260px">ID</th>
              <th>Tên</th>
              <th>Mã</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in items" :key="a.id">
              <td class="text-monospace small">{{ a.id }}</td>
              <td>{{ a.name }}</td>
              <td>{{ a.code }}</td>
              <td class="d-flex gap-2 flex-wrap">
                <button class="btn btn-sm btn-outline-warning" @click="openEdit(a)">Edit</button>
                <button class="btn btn-sm btn-outline-info" @click="openDetail(a.id)">Detail</button>
                <router-link :to="`/warehouse/${wid}/zone/${zid}/aisle/${a.id}/shelf`" class="btn btn-sm btn-outline-secondary">Show Shelves</router-link>
                <button class="btn btn-sm btn-outline-danger" @click="remove(a.id)">Delete</button>
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
        <h5 class="fw-bold m-0">{{ isEdit ? 'Cập nhật Aisle' : 'Thêm Aisle' }}</h5>
        <button class="btn btn-outline-secondary" @click="back">← Quay lại</button>
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <form class="row g-3" @submit.prevent="submit" novalidate>
            <div class="col-md-6">
              <label class="form-label">Tên Aisle <span class="text-danger">*</span></label>
              <input v-model.trim="form.name" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Mã <span class="text-danger">*</span></label>
              <input v-model.trim="form.code" class="form-control" required />
            </div>
            <div class="col-12 small text-muted">Context: wid={{ wid }}, zid={{ zid }}</div>
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
        <h5 class="fw-bold m-0">Chi tiết Aisle</h5>
        <button class="btn btn-outline-secondary" @click="back">← Quay lại</button>
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <div class="mb-2"><small class="text-muted">ID</small><div class="fw-medium">{{ detail?.id }}</div></div>
          <div class="mb-2"><small class="text-muted">Tên</small><div>{{ detail?.name }}</div></div>
          <div class="mb-2"><small class="text-muted">Mã</small><div>{{ detail?.code }}</div></div>
          <div class="mb-2"><small class="text-muted">Zone</small><div>{{ detail?.zone?.name || '—' }}</div></div>

          <h6 class="fw-bold mt-4">Shelves ({{ shelves.length }})</h6>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead><tr><th style="width:220px">ID</th><th>Tên</th><th>Mã</th><th>#Bin</th><th></th></tr></thead>
              <tbody>
                <tr v-for="s in shelves" :key="s.id">
                  <td class="text-monospace small">{{ s.id }}</td>
                  <td>{{ s.name }}</td>
                  <td>{{ s.code }}</td>
                  <td>{{ s.bins?.length ?? 0 }}</td>
                  <td>
                    <router-link class="btn btn-sm btn-outline-primary" :to="`/warehouse/${wid}/zone/${zid}/aisle/${detail.id}/shelf/${s.id}/bin`">Manage Bins</router-link>
                  </td>
                </tr>
                <tr v-if="shelves.length===0">
                  <td colspan="5" class="text-center text-muted">Chưa có Shelf</td>
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
import { aisleService } from "../../services/AisleService"
import { shelfService } from "../../services/ShelfService"

const route = useRoute()
const wid = route.params.wid || route.params.id
const zid = route.params.zid || route.params.id

const ui = ref("list")
const items = ref([])
const shelves = ref([])
const isEdit = ref(false)
const editingId = ref(null)
const detail = ref(null)
const form = ref({ name:"", code:"" })

async function load(){ items.value = await aisleService.getAll(String(zid)) }

function openAdd(){ isEdit.value=false; editingId.value=null; form.value={name:"",code:""}; ui.value="form" }
function openEdit(a){ isEdit.value=true; editingId.value=a.id; form.value={name:a.name, code:a.code}; ui.value="form" }
async function openDetail(id){ detail.value = await aisleService.getById(String(id)); shelves.value = await shelfService.getAll(String(id)); ui.value="detail" }
function back(){ ui.value="list" }

async function submit(){
  if (isEdit.value) await aisleService.update(String(editingId.value), form.value)
  else await aisleService.create(String(zid), form.value)
  await load(); back()
}
async function remove(id){ if(confirm("Xoá aisle?")){ await aisleService.remove(String(id)); await load() } }

onMounted(load)
</script>

<style scoped>
.aisle-management{ padding:24px; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,.1) }
</style>
