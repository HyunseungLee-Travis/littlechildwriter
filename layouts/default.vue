<template>
  <v-app>
    <v-app-bar fixed app color="#22272E" class="elevation-0">
      <NuxtLink to="/" class="text-decoration-none white--text">
        <v-avatar size="30">
          <v-img src="/icon.png" />
        </v-avatar>
      </NuxtLink>

      <v-spacer />

      <v-menu open-on-hover top offset-y>
        <template #activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on">
            Little 작가 <v-icon right> mdi-chevron-down </v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item to="/post">
            <v-list-item-title>글 올리기</v-list-item-title>
          </v-list-item>
          <v-list-item to="/list">
            <v-list-item-title>글 리스트</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-spacer />

      <v-dialog
        v-if="userInfo.uid"
        v-model="notifOverlay"
        width="700"
        scrollable
      >
        <template #activator="{ on, attrs }">
          <v-btn icon class="amber--text" v-bind="attrs" v-on="on">
            <v-icon v-text="notif.length > 0 ? 'mdi-bell-ring' : 'mdi-bell'" />
          </v-btn>
        </template>

        <v-card>
          <v-list v-if="notif.length > 0">
            <v-list-item v-for="(d, i) in notif" :key="i" @click="load(d.link)">
              <v-list-item-avatar>
                <v-img :src="d.photoURL" />
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title v-text="d.title" />
                <v-list-item-subtitle v-text="d.time" />
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <v-card-actions>
            <v-btn text @click="clearEverything">
              모두 지우기 <v-icon right> mdi-delete </v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <UserMenu />
    </v-app-bar>

    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import UserMenu from './UserMenu.vue'
import { db } from '@/plugins/firebase'

export default {
  data() {
    return {
      notif: [],
      notifOverlay: false
    }
  },
  mounted() {
    setTimeout(() => this.getNotification(), 500)
  },
  methods: {
    async clearEverything() {
      await db.ref(`/users/${this.userInfo.uid}/notification`).remove()
      this.notif = []
    },
    getNotification() {
      db.ref(`/users/${this.userInfo.uid}/notification`).on(
        'child_added',
        async (s) => this.notif.push(await s.val())
      )
    },
    load(link) {
      this.notifOverlay = false
      this.$forceUpdate()
      this.$router.push(link)
    }
  },
  components: {
    UserMenu
  }
}
</script>
