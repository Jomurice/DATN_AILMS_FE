<template>
  <aside class="side">
    <div class="brand"><i class="fa-solid fa-sitemap me-2"></i>Sơ đồ kho</div>
    <nav class="tree">
      <div v-for="wh in tree" :key="wh.id" class="tree-node">
        <div class="tree-item" :class="{ active: selected === key(wh) }" @click="select(wh, `/warehouse/${wh.id}/zone`)">
          <button v-if="wh.children" class="toggle" @click.stop="toggle(wh)">
            <i :class="isOpen(wh) ? 'fa-solid fa-minus' : 'fa-solid fa-plus'"></i>
          </button>
          <span class="label"><i class="fa-solid fa-warehouse me-2"></i>{{ wh.label }}</span>
        </div>
        <div v-show="isOpen(wh)" class="tree-children">
          <div v-for="z in wh.children" :key="z.id" class="tree-node">
            <div class="tree-item" :class="{ active: selected === key(z) }" @click="select(z, `/warehouse/${props.selectedIds.wid}/zone/${z.id}/aisle`)">
              <button v-if="z.children" class="toggle" @click.stop="toggle(z)">
                <i :class="isOpen(z) ? 'fa-solid fa-minus' : 'fa-solid fa-plus'"></i>
              </button>
              <span class="label"><i class="fa-solid fa-border-all me-2"></i>{{ z.label }}</span>
            </div>
            <div v-show="isOpen(z)" class="tree-children">
              <div v-for="a in z.children" :key="a.id" class="tree-node">
                <div class="tree-item" :class="{ active: selected === key(a) }" @click="select(a, `/warehouse/${props.selectedIds.wid}/zone/${props.selectedIds.zid}/aisle/${a.id}/shelf`)">
                  <button v-if="a.children" class="toggle" @click.stop="toggle(a)">
                    <i :class="isOpen(a) ? 'fa-solid fa-minus' : 'fa-solid fa-plus'"></i>
                  </button>
                  <span class="label"><i class="fa-solid fa-bars me-2"></i>{{ a.label }}</span>
                </div>
                <div v-show="isOpen(a)" class="tree-children">
                  <div v-for="s in a.children" :key="s.id" class="tree-node">
                    <div class="tree-item" :class="{ active: selected === key(s) }" @click="select(s, `/warehouse/${props.selectedIds.wid}/zone/${props.selectedIds.zid}/aisle/${props.selectedIds.aid}/shelf/${s.id}/bin`)">
                      <button v-if="s.children" class="toggle" @click.stop="toggle(s)">
                        <i :class="isOpen(s) ? 'fa-solid fa-minus' : 'fa-solid fa-plus'"></i>
                      </button>
                      <span class="label"><i class="fa-solid fa-table-cells me-2"></i>{{ s.label }}</span>
                    </div>
                    <div v-show="isOpen(s)" class="tree-children">
                      <div v-for="b in s.children" :key="b.id" class="tree-item leaf" :class="{ active: selected === key(b) }" @click="select(b, `/warehouse/${props.selectedIds.wid}/zone/${props.selectedIds.zid}/aisle/${props.selectedIds.aid}/shelf/${s.id}/bin`)">
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
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { warehouseService } from "../../services/WarehouseService";
import { zoneService } from "../../services/ZoneService";
import { aisleService } from "../../services/AisleService";
import { shelfService } from "../../services/ShelfService";
import { binService } from "../../services/BinService";

const props = defineProps({
  selectedIds: { type: Object, default: () => ({}) } // { wid, zid, aid, sid }
});
const router = useRouter();
const tree = ref([]);
const opened = ref(new Set());
const selected = ref(null);

const key = (n) => `${n.type}:${n.id}`;
const isOpen = (n) => opened.value.has(key(n));
const toggle = (n) => {
  const k = key(n);
  if (isOpen(n)) opened.value.delete(k);
  else {
    opened.value.add(k);
    loadChildren(n);
  }
};
const select = (node, path) => {
  selected.value = key(node);
  router.push(path);
};

async function loadChildren(n) {
  if (n.children?.length) return;
  const id = String(n.id);
  if (n.type === "warehouse") {
    const zs = await zoneService.getAll(id) || [];
    n.children = zs.map((z) => ({ id: z.id, label: z.name, type: "zone", children: [] }));
  } else if (n.type === "zone") {
    const as = await aisleService.getAll(id) || [];
    n.children = as.map((a) => ({ id: a.id, label: a.name, type: "aisle", children: [] }));
  } else if (n.type === "aisle") {
    const ss = await shelfService.getAll(id) || [];
    n.children = ss.map((s) => ({ id: s.id, label: s.name, type: "shelf", children: [] }));
  } else if (n.type === "shelf") {
    const bs = await binService.list(id) || [];
    n.children = bs.map((b) => ({ id: b.id, label: b.name || b.code, type: "bin", children: [] }));
  }
}

async function build() {
  const whs = await warehouseService.getAll() || [];
  tree.value = whs.map((w) => ({ id: w.id, label: w.name, type: "warehouse", children: [] }));
}

async function syncSelection() {
  const { wid, zid, aid, sid } = props.selectedIds || {};
  opened.value.clear();
  selected.value = null;

  for (const w of tree.value) {
    if (String(w.id) === String(wid)) {
      opened.value.add(key(w));
      if (!zid) {
        selected.value = key(w);
        return;
      }
      await loadChildren(w);
      for (const z of w.children) {
        if (String(z.id) === String(zid)) {
          opened.value.add(key(z));
          if (!aid) {
            selected.value = key(z);
            return;
          }
          await loadChildren(z);
          for (const a of z.children) {
            if (String(a.id) === String(aid)) {
              opened.value.add(key(a));
              if (!sid) {
                selected.value = key(a);
                return;
              }
              await loadChildren(a);
              for (const s of a.children) {
                if (String(s.id) === String(sid)) {
                  opened.value.add(key(s));
                  selected.value = key(s);
                  await loadChildren(s);
                  return;
                }
              }
            }
          }
        }
      }
    }
  }
}

onMounted(async () => {
  await build();
  await syncSelection();
});

watch(() => props.selectedIds, syncSelection, { deep: true });
</script>

<style scoped>
.side {
  width: 300px;
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  position: sticky;
  top: 96px;
  height: calc(100vh - 110px);
  overflow: auto;
}
.brand {
  font-weight: 700;
  font-size: 18px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.tree-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
}
.tree-item.active {
  background: #1f6bff;
  color: #fff;
}
.tree-item.leaf {
  padding-left: 36px;
}
.toggle {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tree-children {
  padding-left: 22px;
}
@media (max-width: 992px) {
  .side { width: 100%; height: auto; position: static; }
}
</style>