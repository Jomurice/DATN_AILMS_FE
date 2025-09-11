<template>
  <aside class="side">
    <div class="brand"><i class="fa-solid fa-sitemap me-2"></i>Sơ đồ kho</div>

    <nav class="tree">
      <div v-for="wh in tree" :key="wh.id" class="tree-node">
        <div class="tree-item" :class="{active: isSelected(wh)}">
          <button class="toggle" @click.stop="toggle(wh)"><i :class="isOpen(wh)?'fa-solid fa-minus':'fa-solid fa-plus'"></i></button>
          <span class="label" @click="goWarehouse(wh)"><i class="fa-solid fa-warehouse me-2"></i>{{ wh.label }}</span>
        </div>

        <div v-show="isOpen(wh)" class="tree-children">
          <div v-for="z in wh.children" :key="z.id" class="tree-node">
            <div class="tree-item" :class="{active: isSelected(z)}">
              <button class="toggle" @click.stop="toggle(z)"><i :class="isOpen(z)?'fa-solid fa-minus':'fa-solid fa-plus'"></i></button>
              <span class="label" @click="goZone(wh,z)"><i class="fa-solid fa-border-all me-2"></i>{{ z.label }}</span>
            </div>

            <div v-show="isOpen(z)" class="tree-children">
              <div v-for="a in z.children" :key="a.id" class="tree-node">
                <div class="tree-item" :class="{active: isSelected(a)}">
                  <button class="toggle" @click.stop="toggle(a)"><i :class="isOpen(a)?'fa-solid fa-minus':'fa-solid fa-plus'"></i></button>
                  <span class="label" @click="goAisle(wh,z,a)"><i class="fa-solid fa-bars me-2"></i>{{ a.label }}</span>
                </div>

                <div v-show="isOpen(a)" class="tree-children">
                  <div v-for="s in a.children" :key="s.id" class="tree-node">
                    <div class="tree-item" :class="{active: isSelected(s)}">
                      <button class="toggle" @click.stop="toggle(s)"><i :class="isOpen(s)?'fa-solid fa-minus':'fa-solid fa-plus'"></i></button>
                      <span class="label" @click="goShelf(wh,z,a,s)"><i class="fa-solid fa-table-cells me-2"></i>{{ s.label }}</span>
                    </div>

                    <div v-show="isOpen(s)" class="tree-children">
                      <div v-for="b in s.children" :key="b.id" class="tree-item leaf" @click="goBin(wh,z,a,s,b)">
                        <i class="fa-solid fa-box-archive me-2"></i>{{ b.label }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import { warehouseService } from "../../services/WarehouseService"
import { zoneService } from "../../services/ZoneService"
import { aisleService } from "../../services/AisleService"
import { shelfService } from "../../services/ShelfService"
import { binService } from "../../services/BinService"

const props = defineProps({
  selectedIds: { type:Object, default: ()=>({}) } // { wid, zid, aid, sid }
})
const router = useRouter()

const tree = ref([])
const opened = ref(new Set())
const currentKeys = ref(new Set())
const S = v => String(v ?? "")
const keyOf = (n)=>`${n.type}:${S(n.id)}`
function isOpen(n){ return opened.value.has(keyOf(n)) }
function toggle(n){ if(isOpen(n)) opened.value.delete(keyOf(n)); else { opened.value.add(keyOf(n)); ensureChildren(n) } }
function isSelected(n){ return currentKeys.value.has(keyOf(n)) }

async function build(){
  const whs = await warehouseService.getAll() || []
  tree.value = whs.map(w=>({ id:S(w.id), label:w.name, type:'warehouse', children:[] }))
}
async function ensureChildren(n){
  if (n.children && n.children.length) return
  if (n.type==='warehouse'){
    const zs = await zoneService.getAll(S(n.id)) || []
    n.children = zs.map(z=>({ id:S(z.id), label:z.name, type:'zone', parent:n, children:[] }))
  } else if (n.type==='zone'){
    const as = await aisleService.getAll(S(n.id)) || []
    n.children = as.map(a=>({ id:S(a.id), label:a.name, type:'aisle', parent:n, children:[] }))
  } else if (n.type==='aisle'){
    const ss = await shelfService.getAll(S(n.id)) || []
    n.children = ss.map(s=>({ id:S(s.id), label:s.name, type:'shelf', parent:n, children:[] }))
  } else if (n.type==='shelf'){
    const bs = await binService.list(S(n.id)) || []
    n.children = bs.map(b=>({ id:S(b.id), label:b.name || b.code, type:'bin', parent:n, children:[] }))
  }
}

/* chọn node theo props.selectedIds để highlight & auto-open */
async function syncSelection(){
  currentKeys.value = new Set()
  const { wid, zid, aid, sid } = props.selectedIds || {}
  for (const w of tree.value){
    if (S(w.id)===S(wid)){ opened.value.add(keyOf(w)); currentKeys.value.add(keyOf(w)); await ensureChildren(w)
      for (const z of w.children){ if (S(z.id)===S(zid)){ opened.value.add(keyOf(z)); currentKeys.value.add(keyOf(z)); await ensureChildren(z)
        for (const a of z.children){ if (S(a.id)===S(aid)){ opened.value.add(keyOf(a)); currentKeys.value.add(keyOf(a)); await ensureChildren(a)
          for (const s of a.children){ if (S(s.id)===S(sid)){ opened.value.add(keyOf(s)); currentKeys.value.add(keyOf(s)); await ensureChildren(s) } }
        }}
      }}
  }
}
}
function goWarehouse(w){ router.push(`/warehouse/${w.id}/zone`) }
function goZone(w,z){ router.push(`/warehouse/${w.id}/zone/${z.id}/aisle`) }
function goAisle(w,z,a){ router.push(`/warehouse/${w.id}/zone/${z.id}/aisle/${a.id}/shelf`) }
function goShelf(w,z,a,s){ router.push(`/warehouse/${w.id}/zone/${z.id}/aisle/${a.id}/shelf/${s.id}/bin`) }
function goBin(w,z,a,s,b){ router.push(`/warehouse/${w.id}/zone/${z.id}/aisle/${a.id}/shelf/${s.id}/bin`) }

onMounted(async()=>{ await build(); await syncSelection() })
watch(()=>props.selectedIds, syncSelection, { deep:true })
</script>

<style scoped>
.side{
  width:300px; background:#ffffff; color:#000000; border-radius:14px; padding:14px;
  position:sticky; top:96px; height:calc(100vh - 110px); overflow:auto;
}
.brand{ font-weight:700; display:flex; align-items:center; margin-bottom:10px; font-size:18px; }
.tree-item{ display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:10px; cursor:pointer; color:#000000; }
.tree-item:hover{ background:#f0f0f0; }
.tree-item.active{ background:#1f6bff; color:#fff; }
.tree-item.leaf{ padding-left:36px; }
.toggle{ width:26px; height:26px; border-radius:6px; border:1px solid #cccccc; background:transparent; color:#000000; display:flex; align-items:center; justify-content:center; }
.tree-children{ padding-left:22px; }
</style>