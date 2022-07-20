<template>
  <div class="create">
    <h1>계정 만들기</h1>
    <p>계정이 있으면 <NuxtLink to="/login"> 로그인 </NuxtLink>하기</p>
    <v-divider />
    <br />
    <v-form v-model="valid">
      <v-text-field v-model="username" label="이름" required />
      <v-text-field
        v-model="email"
        label="Email"
        placeholder="Email"
        required
        outlined
        clearable
        validate-on-blur
        :rules="[
          (v) => v || 'E-mail is required',
          (v) => /.+@.+/.test(v) || 'E-mail must be valid'
        ]"
        prepend-inner-icon="mdi-email"
      />
      <v-text-field
        v-model="password"
        label="Password"
        placeholder="Password"
        required
        outlined
        clearable
        validate-on-blur
        :rules="[
          (v) => v || 'Password is required',
          (v) => v.length > 6 || 'Password must be more than 6 characters'
        ]"
        prepend-inner-icon="mdi-key"
      />
      <v-btn color="primary" @click="makeAccount">
        <v-icon left> mdi-account </v-icon> 게정 만들기
      </v-btn>
      <div v-if="error" class="error" v-text="error.message" />
    </v-form>
  </div>
</template>

<script>
import { auth, db } from '@/plugins/firebase.js'

export default {
  data() {
    return {
      email: '',
      password: '',
      username: '',
      valid: false,
      error: ''
    }
  },
  methods: {
    async makeAccount() {
      if (this.valid) {
        await auth
          .createUserWithEmailAndPassword(this.email, this.password)
          .then(() => {
            db.ref(`/users/${auth.currentUser.uid}`).set({
              username: this.username,
              photoURL: '',
              libris: 0,
              bio: `새롭게 계정 만든 ${this.username}입니다. (바꾸고 깊다면 편집 버튼을 누르세요.)`,
              subscribe: [],
              subscriber: []
            })

            this.$router.push('/')
          })
          .catch((e) => (this.error = e.message))
      }
    }
  }
}
</script>

<style scoped>
.create {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 88px);
}
</style>
