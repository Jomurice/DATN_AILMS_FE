<template>
  <div class="shelf-management">
    <!-- LIST -->
    <div v-if="ui==='list'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold m-0">Danh sách</h5>
        <button class="btn btn-primary" @click="openAdd">+ Add Shelf</button>
      </div>

      <div v-if="items.length">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th style="width:260px">ID</th>
              <th>Tên</th>
              <th>Mã</th>
              <th>Aisle</th>
              <th class="text-end">#Bin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in items" :key="s.id">
              <td class="text-monospace small">{{ s.id }}</td>
              <td>{{ s.name }}</td>
              <td>{{ s.code }}</td>
              <td>{{ s.aisle?.name || '—' }}</td>
              <td class="text-end">{{ s.bins?.length ?? 0 }}</td>
              <td class="d-flex gap-2 flex-wrap">
                <button class="btn btn-sm btn-outline-warning" @click="openEdit(s)">Edit</button>
                <button class="btn btn-sm btn-outline-info" @click="openDetail(s.id)">Detail</button>
                <router-link
                  class="btn btn-sm btn-outline-secondary"
                  :to="`/warehouse/${wid}/zone/${zid}/aisle/${aid}/shelf/${s.id}/bin`"
                >
                  Show Bins
                </router-link>
                <button class="btn btn-sm btn-outline-danger" @click="remove(s.id)">Delete</button>
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
        <h5 class="fw-bold m-0">{{ isEdit ? 'Cập nhật Shelf' : 'Thêm Shelf' }}</h5>
        <button class="btn btn-outline-secondary" @click="back">← Quay lại</button>
      </div>
      <div class="card border-0 shadow-sm"><div class="card-body p-4">
        <form class="row g-3" @submit.prevent="submit">
          <div class="col-md-6"><label class="form-label">Tên</label><input v-model.trim="form.name" class="form-control" required></div>
          <div class="col-md-6"><label class="form-label">Mã (SHELF-x)</label><input v-model.trim="form.code" class="form-control" required></div>
          <div class="col-12 small text-muted">Context: wid={{wid}}, zid={{zid}}, aid={{aid}}</div>
          <div class="col-12">
            <button class="btn btn-primary">{{ isEdit ? 'Cập nhật' : 'Thêm mới' }}</button>
            <button class="btn btn-outline-secondary ms-2" type="button" @click="back">Huỷ</button>
          </div>
        </form>
      </div></div>
    </div>

    <!-- DETAIL -->
    <div v-else-if="ui==='detail'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold m-0">Chi tiết Shelf</h5>
        <button class="btn btn-outline-secondary" @click="back">← Quay lại</button>
      </div>
      <div class="card border-0 shadow-sm"><div class="card-body">
        <div class="mb-2"><small class="text-muted">ID</small><div class="fw-medium">{{ detail?.id }}</div></div>
        <div class="mb-2"><small class="text-muted">Tên</small><div>{{ detail?.name }}</div></div>
        <div class="mb-2"><small class="text-muted">Mã</small><div>{{ detail?.code }}</div></div>
        <div class="mb-2"><small class="text-muted">Aisle</small><div>{{ detail?.aisle?.name || '—' }}</div></div>

        <h6 class="fw-bold mt-4">Bins ({{ bins.length }})</h6>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead><tr><th style="width:220px">ID</th><th>Tên</th><th>Mã</th><th class="text-end">Sức chứa</th><th class="text-end">Hiện có</th></tr></thead>
            <tbody>
              <tr v-for="b in bins" :key="b.id">
                <td class="text-monospace small">{{ b.id }}</td>
                <td>{{ b.name }}</td>
                <td>{{ b.code }}</td>
                <td class="text-end">{{ b.capacity ?? '—' }}</td>
                <td class="text-end">{{ b.currentQty ?? '—' }}</td>
              </tr>
              <tr v-if="bins.length===0">
                <td colspan="5" class="text-center text-muted">Chưa có Bin</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import { shelfService } from "../../services/ShelfService"
import { binService } from "../../services/BinService"

const route = useRoute()
const wid = route.params.wid || route.params.id
const zid = route.params.zid || route.params.id
const aid = route.params.aid

const ui = ref("list")
const items = ref([])
const bins = ref([])
const isEdit = ref(false)
const editingId = ref(null)
const detail = ref(null)
const form = ref({ name:"", code:"" })

async function load(){ items.value = await shelfService.getAll(String(aid)) }

function openAdd(){ isEdit.value=false; editingId.value=null; form.value={name:"",code:""}; ui.value="form" }
function openEdit(s){ isEdit.value=true; editingId.value=s.id; form.value={name:s.name, code:s.code}; ui.value="form" }
async function openDetail(id){ detail.value = await shelfService.getById(String(id)); bins.value = await binService.list(String(id)); ui.value="detail" }
function back(){ ui.value="list" }

async function submit(){
  if (isEdit.value) await shelfService.update(String(editingId.value), { ...form.value, aisleId: aid })
  else await shelfService.create(String(aid), form.value)
  await load(); back()
}
async function remove(id){ if(confirm("Xoá shelf?")){ await shelfService.remove(String(id)); await load() } }

onMounted(load)
</script>

<style scoped>
.shelf-management{ padding:24px; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,.1) }
</style>
