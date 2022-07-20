<template>
  <v-menu v-if="userInfo.displayName" right min-width="300" rounded>
    <template #activator="{ on }">
      <v-btn icon v-on="on">
        <v-avatar size="35">
          <v-img :src="userInfo.photoURL" />
        </v-avatar>
      </v-btn>
    </template>

    <v-card class="pa-3">
      <div class="d-flex">
        <v-avatar class="ma-auto" size="70">
          <v-img :src="userInfo.photoURL" />
        </v-avatar>
        <div>
          <v-card-title class="ml-3" v-text="userInfo.displayName" />
          <v-card-subtitle class="ml-3" v-text="userInfo.email" />
        </div>
      </div>

      <div class="d-flex justify-center mt-1">
        <v-btn :to="`/user/${userInfo.uid}`" text> 프로필 </v-btn>
        <v-btn to="/account" text> 편집 </v-btn>
        <v-btn text @click="logout"> 로그아웃 </v-btn>
      </div>
    </v-card>
  </v-menu>
  <v-btn v-else to="/login" icon>
    <v-icon>mdi-account-circle</v-icon>
  </v-btn>
</template>

<script>
import { auth } from '@/plugins/firebase'

export default {
  methods: {
    logout() {
      this.userInfo = {
        displayName: '',
        photoURL: '',
        uid: '',
        email: ''
      }
      auth.signOut()
      this.$router.push('/login')
    }
  }
}
</script>
