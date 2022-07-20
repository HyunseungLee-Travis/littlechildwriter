<template>
  <div
    class="d-flex justify-center align-center text-center login"
    style="height: calc(100vh - 100px)"
  >
    <div>
      <h1>로그인</h1>
      <p>계정이 없으면 <NuxtLink to="/create"> 계정 만들기 </NuxtLink></p>

      <v-divider class="my-5" />

      <v-form v-model="valid">
        <v-text-field
          v-model="email"
          label="이메일"
          outlined
          required
          clearable
          validate-on-blur
          :rules="[
            (v) => v || 'E-mail is required',
            (v) => /.+@.+/.test(v) || 'E-mail must be valid'
          ]"
          prepend-inner-icon="mdi-email"
          @keyup.enter="onSubmit"
        />

        <v-text-field
          v-model="password"
          label="암호"
          outlined
          required
          clearable
          validate-on-blur
          :rules="[
            (v) => v || 'Password is required',
            (v) => v.length > 6 || 'Password must be more than 6 characters'
          ]"
          prepend-inner-icon="mdi-key"
          @keyup.enter="onSubmit"
        />

        <v-divider class="my-5" />

        <div class="d-flex justify-center gap10">
          <v-btn color="primary" @click="onSubmit">
            <v-icon left> mdi-account </v-icon>로그인
          </v-btn>
          <v-btn color="success" outlined ripple @click="google">
            <v-icon left> mdi-google </v-icon> Google
          </v-btn>
        </div>
      </v-form>

      <div v-if="error" class="error" v-text="error.message" />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { auth, login } from '@/plugins/firebase.js'

export default defineComponent({
  data() {
    return {
      email: '',
      password: '',
      error: {
        message: ''
      },
      valid: false
    }
  },
  methods: {
    onSubmit() {
      this.valid
        ? auth
            .signInWithEmailAndPassword(this.email, this.password)
            .then(() => this.$router.push('/'))
            .catch((e) => (this.error = e))
        : (this.error.message = '잘못된 정보입니다.')
    },
    google() {
      auth
        .signInWithPopup(new login.GoogleAuthProvider())
        .then(() => this.$router.push('/'))
        .catch((e) => (this.error = e))
    }
  }
})
</script>
