<template>
  <div>
    <v-parallax class="parallax" src="/background.avif">
      <div class="ma-auto">
        <div class="mx-3">
          <v-btn v-if="userInfo.uid" to="/post" color="primary" block>
            글 올리기 <v-icon right> mdi-arrow-right-thin </v-icon>
          </v-btn>
          <v-btn v-else to="/login" color="primary" block>
            로그인 <v-icon right> mdi-account </v-icon>
          </v-btn>
        </div>

        <v-card
          class="d-flex justify-center align-center pa-10 rounded-xl my-5"
          height="300"
          max-width="500"
          :elevation="2"
        >
          <div>
            <h1>Little 작가</h1>
            <br />
            <p>글을 올리고, 새롭게 배우고, 대화하기!</p>
          </div>
        </v-card>

        <div class="d-flex justify-center">
          <v-btn to="/list" class="mx-3">
            글 <v-icon right> mdi-text-box-multiple-outline </v-icon>
          </v-btn>
          <v-btn to="/classes" class="mx-3">
            클래스 <v-icon right> mdi-google-classroom </v-icon>
          </v-btn>
        </div>
      </div>
    </v-parallax>

    <v-card-title style="margin-top: 600px"> 최근 포스트 </v-card-title>
    <v-divider class="mx-5 mb-5" />
    <LazyBookCard
      :items="recent"
      :uid="userInfo.uid"
      :display-name="userInfo.displayName"
      :simple="true"
    />

    <v-card-title>인기있는 포스트</v-card-title>
    <v-divider class="mx-5 mb-5" />
    <LazyBookCard
      :items="popular"
      :uid="userInfo.uid"
      :display-name="userInfo.displayName"
      :simple="true"
    />

    <v-card class="mx-5 my-10 transparent elevation-0">
      <v-card-text>
        <h2>명예의 전당</h2>

        <v-timeline :dense="$vuetify.breakpoint.xs" clipped>
          <v-timeline-item
            v-for="(item, i) in lbt"
            v-if="item.image || item.name"
            :key="item.uid"
            :icon="iconify(i)"
          >
            <v-card
              class="mx-auto"
              max-width="344"
              :to="`/user/${item.uid}`"
              :color="item.uid === userInfo.uid ? 'primary' : ''"
            >
              <v-list-item>
                <v-list-item-content>
                  <div class="text-overline mb-4">
                    {{ i + 1 }}등 ({{ Math.round(item.libris) }} Libris)
                  </div>
                  <v-list-item-title
                    v-if="item.name"
                    class="mb-1"
                    v-text="item.name"
                  />
                </v-list-item-content>

                <v-list-item-avatar
                  v-if="item.image"
                  :size="$vuetify.breakpoint.xs ? 50 : 70"
                  color="#1E1E1E"
                >
                  <v-img :src="item.image" />
                </v-list-item-avatar>
              </v-list-item>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { db } from '@/plugins/firebase.js'

export default {
  data() {
    return {
      lbt: [],
      recent: [],
      popular: []
    }
  },
  created() {
    this.postlist()
    this.topLibrisUsers()
  },
  methods: {
    iconify(a) {
      return (
        'mdi-chess-' +
        (a === 0
          ? 'king'
          : a === 1
          ? 'queen'
          : a === 2
          ? 'knight'
          : a === 3
          ? 'bishop'
          : 'pawn')
      )
    },
    postlist() {
      db.ref('/contents')
        .limitToLast(4)
        .on('child_added', async (s) => this.recent.unshift(await s.val()))

      db.ref('/contents')
        .orderByChild('likes')
        .limitToLast(4)
        .on('child_added', async (s) => this.popular.unshift(await s.val()))
    },
    topLibrisUsers() {
      db.ref('/users')
        .orderByChild('libris')
        .on('child_added', async (s) => {
          const data = await s.val()

          this.lbt.unshift({
            name: data.displayName,
            libris: data.libris ?? 0,
            image: data.photoURL,
            uid: s.key
          })
        })
    }
  }
}
</script>

<style scoped>
.parallax {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
}
</style>
