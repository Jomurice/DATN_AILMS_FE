<template>
  <div class="change-password">
    <h2>Change Password</h2>
    <form @submit.prevent="handleChangePassword">
      <input
        type="password"
        v-model="form.currentPassword"
        placeholder="Current Password"
        required
      />
      <input
        type="password"
        v-model="form.newPassword"
        placeholder="New Password"
        required
      />
      <input
        type="password"
        v-model="form.confirmPassword"
        placeholder="Confirm New Password"
        required
      />
      <button type="submit">Change Password</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">{{ success }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const error = ref('')
const success = ref('')

function handleChangePassword() {
  error.value = ''
  success.value = ''
  if (form.value.newPassword !== form.value.confirmPassword) {
    error.value = 'New passwords do not match.'
    return
  }
  // TODO: Replace with API call
  setTimeout(() => {
    success.value = 'Password changed successfully!'
    form.value.currentPassword = ''
    form.value.newPassword = ''
    form.value.confirmPassword = ''
  }, 500)
}
</script>

<style scoped>
.change-password {
  max-width: 400px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
input {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
}
.error {
  color: #dc2626;
  margin-top: 8px;
}
.success {
  color: #16a34a;
  margin-top: 8px;
}
</style>