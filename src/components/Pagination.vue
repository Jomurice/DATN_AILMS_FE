<template>
    <div class="mt-2 gap-2 d-flex justify-content-center flex-wrap">
        <!-- Prev -->
        <button class="btn btn-outline-primary btn-sm" :disabled="payload.page === 0"
            @click="changePage(payload.page - 1)">
            &lt;
        </button>


        <!-- First -->
        <button v-if="visiblePages[0] > 1" class="btn btn-outline-primary btn-sm" @click="changePage( 0)">
            1
        </button>

        <span v-if="visiblePages[0] > 2">...</span>

        <!-- Pages -->
        <button v-for="page in visiblePages" :key="page" class="btn btn-sm" :class="(page - 1) === payload.page
            ? 'btn-primary text-white'
            : 'btn-outline-primary'" @click="changePage(page - 1)">
            {{ page }}
        </button>

        <span v-if="visiblePages.at(-1) < totalPages - 1">...</span>

        <!-- Last -->
        <button v-if="visiblePages.at(-1) < totalPages" class="btn btn-outline-primary btn-sm"
            @click="changePage(totalPages - 1)">
            {{ totalPages }}
        </button>

        <!-- Next -->
        <button class="btn btn-outline-primary btn-sm" :disabled="payload.page >= totalPages - 1"
            @click="changePage(payload.page + 1)">
            &gt;
        </button>
    </div>
</template>

<script setup>
const props = defineProps({
  payload: Object,
  visiblePages: Array,
  totalPages: Number
});

const emit = defineEmits([
  'change-page'
]);

const changePage = (newPage) => {
    if (newPage < 0 || newPage >= props.totalPages) return
  emit('change-page', newPage)
};
</script>