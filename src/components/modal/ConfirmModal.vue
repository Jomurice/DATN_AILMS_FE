<template>
  <div
    class="modal fade"
    :id="modalId"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">

        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button
            type="button"
            class="btn-close"
            @click="closeModal"
          ></button>
        </div>

        <div class="modal-body">
          <p class="mb-0">{{ message }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="onCancel">
            {{ cancelText }}
          </button>
          <button class="btn btn-danger" @click="onConfirm">
            {{ confirmText }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from "vue";
import { Modal } from "bootstrap";

const props = defineProps({
  show: Boolean,
  modalId: {type: String, required: true},
  title: { type: String, default: "Xác nhận" },
  message: { type: String, default: "Bạn có chắc chắn?" },
  confirmText: { type: String, default: "Xác nhận" },
  cancelText: { type: String, default: "Hủy" },
});

const emit = defineEmits(["confirm", "cancel","closeModal"]);

let modalInstance;
// const modalId = "confirmModal";

onMounted(() => {
  const el = document.getElementById(props.modalId);
  modalInstance = new Modal(el, { backdrop: "static" });
});

watch(
  () => props.show,
  (val) => {
    if (!modalInstance) return;
    val ? modalInstance.show() : modalInstance.hide();
  }
);

function onConfirm() {
  emit("confirm");
}

function onCancel() {
  emit("cancel");
}

function closeModal(){
  emit("closeModal")
}
</script>
