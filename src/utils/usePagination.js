import { computed } from 'vue'

export function usePagination(listRef, payloadRef, delta = 3) {
  const totalPages = computed(() =>
    Math.ceil((listRef.value?.totalElements || 0) / payloadRef.value.size)
  )

  const visiblePages = computed(() => {
    const current = payloadRef.value.page + 1
    const total = totalPages.value

    let start = Math.max(1, current - delta)
    let end = Math.min(total, current + delta)

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })

  return { totalPages, visiblePages }
};

// function changePage(listData, newPage,payload) {
//   listData.value.conntent = [];
//   if (newPage < 0 || newPage >= Math.ceil((listData.value.totalElements || 0) / payload.value.size)) return;
//   payload.value.page = newPage;
//   loadOrders();
// };