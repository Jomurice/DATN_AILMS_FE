<template>
  <div class="container-fluid vh-100 d-flex justify-content-center align-items-center p-0 m-0">
    <div class="row w-100 h-100 m-0 shadow-none border-0">
      
      
      <div class="col-lg-8 d-none d-lg-flex bg-light justify-content-center align-items-center p-0 m-0">
        <img src="/src/assets/hinh2.png" class="img-fluid h-100 w-100" alt="illustration" />
      </div>

      
      <div class="col-12 col-lg-4 d-flex flex-column justify-content-center p-5" style="background-color: #ffffff;">
        <h2 class="fw-bold text-primary mb-4 text-center">WELCOME</h2>

        <form @submit.prevent="handleLogin">
          
          <div class="mb-3">
            <label for="username" class="form-label">Tài Khoản :</label>
            <input
              type="text"
              id="username"
              v-model="username"
              @input="clearError('username')"   
              class="form-control"
              :class="{ 'is-invalid': errors.username }"
              placeholder="Nhập username"
            />
            <div class="invalid-feedback">{{ errors.username }}</div>
          </div>

         
          <div class="mb-3">
            <label for="password" class="form-label">Mật Khẩu :</label>
            <input
              type="password"
              id="password"
              v-model="password"
              @input="clearError('password')"   
              class="form-control"
              :class="{ 'is-invalid': errors.password }"
              placeholder="Nhập mật khẩu"
            />
            <div class="invalid-feedback">{{ errors.password }}</div>
          </div>

          <router-link to="/forgot-password" class="link">Quên mật khẩu ?</router-link>
          
          <div v-if="apiError" class="alert alert-danger py-2">{{ apiError }}</div>

          
          <button type="submit" class="btn btn-primary w-100" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            Login
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { authService } from "../services/authService";
import { tokenService } from "../services/TokenService";
import { passwordService } from "../services/PasswordService";

const router = useRouter();
const auth = tokenService();
const username = ref("");
const password = ref("");
const errors = ref({});
const apiError = ref("");
const loading = ref(false);


const clearError = (field) => {
  if (errors.value[field]) {
    errors.value[field] = "";
  }
}

const validateForm = () => {
  errors.value = {};
  let valid = true;

  if (!username.value) {
    errors.value.username = "Vui lòng nhập username";
    valid = false;
  } else if (username.value.length < 4) {
    errors.value.username = "Username phải có ít nhất 4 ký tự";
    valid = false;
  }

  if (!password.value) {
    errors.value.password = "Vui lòng nhập mật khẩu";
    valid = false;
  } else if (password.value.length < 4) {
    errors.value.password = "Mật khẩu phải ít nhất 4 ký tự";
    valid = false;
  }

  return valid;
}

const handleLogin = async () => {
  apiError.value = "";
  if (!validateForm()) return;

  loading.value = true;
  try {
    const authData = await authService.login(username.value, password.value) 
    console.log(authData)
    auth.setToken(authData)
    router.push("/profile");
  } catch (error) {
      apiError.value = "Tên đăng nhập hoặc mật khẩu không đúng !";
  } finally {
    loading.value = false;
  }
}

async function forgotPassword() {
  try {
    await passwordService.forgotPass()
  } catch (error) {
    
  }
}
</script>

<style scoped>
.container-fluid {
  background: #f8f9fa;
  padding: 0 !important;
  margin: 0 !important;
}

.link {
  display: block;
  max-width: fit-content;
  padding: 10px 5px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  text-decoration: none;
  border-radius: 6px;
}
.link:hover {
  color: rgb(47, 47, 243);
}

h2 {
  font-size: 2rem;
}
@media (max-width: 768px) {
  h2 {
    font-size: 1.5rem;
  }
}
</style>
