<template>
  <div class="container-fluid px-3 py-4" v-if="order">
    <div class="section-card p-3">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h5 class="fw-bold mb-1">Phiếu xuất {{ order.code }}</h5>
          <div class="text-muted small">
            Khách hàng: {{ order.customer || '—' }} • Ngày tạo: {{ fmtDate(order.createdAt) }} • Trạng thái: {{ order.status }}
          </div>
        </div>
        <div class="d-flex gap-2">
          <RouterLink class="btn btn-outline-secondary btn-sm" to="/outbound">← Danh sách</RouterLink>
          <button class="btn btn-success btn-sm" :disabled="!canComplete" @click="complete">Xuất hàng</button>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2 mt-3">
        <input v-model.trim="serial" @keyup.enter="scan" class="form-control mono" placeholder="Quét serial…"/>
        <select v-model="selectedItemId" class="form-select" style="max-width:360px">
          <option disabled value="">-- Chọn dòng sản phẩm --</option>
          <option v-for="it in order.items" :key="it.id" :value="it.id">
            {{ it.product?.name || it.name || it.sku }} (YC:{{ it.orderQuantity }} | ĐQ:{{ it.scannedQuantity }})
          </option>
        </select>
        <button class="btn btn-primary" @click="scan">Quét</button>
      </div>

      <div class="table-responsive mt-3">
        <table class="table table-hover mb-0 table-balanced">
          <thead class="thead-soft">
            <tr>
              <th>SKU</th><th>Tên</th><th>Loại</th><th>Hãng</th>
              <th class="text-end">YC</th><th class="text-end">Đã quét</th>
              <th>Serials</th><th class="text-center" style="width:1%">Xóa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in order.items" :key="it.id" class="align-top">
              <td class="mono">{{ it.sku || it.product?.sku }}</td>
              <td :title="it.name || it.product?.name">{{ (it.name || it.product?.name) }}</td>
              <td>{{ it.categoryName || it.product?.categoryName }}</td>
              <td>{{ it.brandName || it.product?.brandName }}</td>
              <td class="text-end mono">{{ it.orderQuantity }}</td>
              <td class="text-end mono">{{ it.scannedQuantity }}</td>
              <td>
                <div class="d-flex flex-wrap gap-2">
                  <span v-for="s in (it.scannedSerials||[])" :key="s.id||s.serialNumber" class="badge bg-light text-dark mono">
                    {{ s.serialNumber || s.id }}
                  </span>
                </div>
              </td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-danger" @click="removeItem(it.id)">Xóa</button>
              </td>
            </tr>
            <tr v-if="!order.items?.length">
              <td colspan="8" class="text-center text-muted">Chưa có dòng hàng</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
  <div v-else class="container-fluid px-3 py-4 text-muted">Đang tải…</div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { outboundOrderService } from "@/services/outboundOrderService";

const route = useRoute(); const router = useRouter();
const order = ref(null);
const serial = ref("");
const selectedItemId = ref("");
const userId = ref("");
const canComplete = computed(()=> (order.value?.items||[]).some(x => (x.scannedQuantity||0) > 0));

function fmtDate(d){ if(!d) return '—'; try{ if(typeof d==='string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d; const t=new Date(d); return isNaN(+t)?d:t.toISOString().slice(0,10) }catch{ return d } }

async function load(){
  const { id } = route.params;
  const data = await outboundOrderService.getById(id, { includeItems: true });
  order.value = data;
  if(order.value?.items?.length && !selectedItemId.value) selectedItemId.value = order.value.items[0].id;
}

async function scan(){
  const s = (serial.value||"").trim(); if(!s || !selectedItemId.value) return;
  await outboundOrderService.scanItem(selectedItemId.value, s, userId.value);
  serial.value=""; await load();
}

async function removeItem(itemId){
  if(!confirm("Xóa dòng này?")) return;
  await outboundOrderService.removeItem(itemId);
  await load();
}

async function complete(){
  await outboundOrderService.complete(order.value.id, { confirmedAt: new Date().toISOString() });
  router.push("/outbound");
}

onMounted(async ()=>{
  try{ const u = JSON.parse(localStorage.getItem("auth_user") || "null"); userId.value = u?.id || u?.userId || u?.uid || u?.sub || ""; }catch{}
  await load();
});
</script>

<style scoped>
.section-card{ background:#fff; border:1px solid #eef2f7; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,0.03); }
.thead-soft th{ background:#ffe3cf; border-top:1px solid #ffc29e; border-bottom:1px solid #ffc29e; }
.table-balanced th, .table-balanced td{ vertical-align:middle; white-space:nowrap; height:56px; }
.mono{ font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; }
</style>
