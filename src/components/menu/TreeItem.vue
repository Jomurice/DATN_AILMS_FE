<template>
  <div class="tree-item" @click="selectNode(node)" :class="{ active: isSelected(node) }">

      <span>{{ node.title }}</span>

    <nav v-if="node.children?.length" @click.stop="toggle(node.id)" :class="['toggle', { active: isOpen(node.id) }]">
      <span class="fw-bold fs-4 m-0 arrow"> &gt; </span>
    </nav>
  </div>

    <div v-show="isOpen(node.id)" class="tree-children">
      <TreeItem
      v-for="children in node.children" :key="children.id" :node="children" 
      :isOpen="isOpen" :toggle="toggle" :isSelected="isSelected" :selectNode="selectNode" 
      />
    </div>
</template>

<script setup>
defineProps({
  node:Object,
  isOpen: Function,
  isSelected: Function,
  toggle: Function,
  selectNode: Function
})
</script>

<style scoped>

.arrow {
  display: inline-block;
  transition: transform 0.3s ease;
}

.toggle.active .arrow {
  transform: rotate(90deg);
}

.tree-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-height: 40px;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
}

.tree-item:hover {
  background-color: #d9d9d9ea;
  /* color: #0823eaf9; */
}

.tree-item.active {
  background-color: rgba(37, 37, 251, 0.912);
  color: white;
  font-weight: 700 !important;
}

.tree-children {
  padding-left: 22px;
  max-width: 210px;
}

</style>
