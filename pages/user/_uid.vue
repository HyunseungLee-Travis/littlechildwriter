<template>
  <div>
    <v-row class="ma-auto">
      <v-avatar size="80">
        <v-img :src="targetUser.photoURL" class="elevation-1" />
      </v-avatar>

      <div class="d-flex align-center">
        <div>
          <h2 class="my-auto mx-5 zmax" v-text="targetUser.displayName" />
          <p class="grey--text ml-5">구독자 {{ subscriberNumber }}명</p>
        </div>
      </div>

      <v-btn
        v-if="userInfo.uid !== uid"
        class="ml-auto my-auto float-right"
        color="red"
        @click="subscribe"
        v-text="subscribed ? '취소' : '구독'"
      />
      <v-btn v-else class="ml-auto my-auto" color="primary" to="/account">
        편집 <v-icon right> mdi-pencil </v-icon>
      </v-btn>
    </v-row>

    <br />

    <v-tabs
      v-model="tab"
      show-arrows
      center-active
      grow
      background-color="#23262E"
    >
      <v-tab v-if="project.title" class="bg"> 홈 </v-tab>
      <v-tab class="bg"> 포스트 </v-tab>
      <v-tab class="bg"> 구독자 </v-tab>
      <v-tab class="bg"> 채팅 </v-tab>
      <v-tab class="bg"> 정보 </v-tab>

      <v-tabs-items v-model="tab" class="py-5 transparent">
        <v-tab-item v-if="project.title">
          <v-card width="100%" class="mx-auto my-3 transparent elevation-0">
            <v-card-title class="primary--text" v-text="project.title" />
            <v-card-text v-text="project.description" />
          </v-card>
        </v-tab-item>

        <v-tab-item>
          <v-select
            v-model="rating"
            :items="['모두', 5, 4, 3, 2, 1]"
            label="평점 선택"
            outlined
          />
          <LazyBookCard
            :items="
              rating === '모두'
                ? listev
                : listev.filter((item) => item.rating === rating)
            "
            :uid="uid"
            :display-name="targetUser.displayName"
            :simple="true"
          />
        </v-tab-item>

        <v-tab-item>
          <v-list color="#23262E">
            <v-list-item
              v-for="item in Object.keys(subscription)"
              :key="item"
              :to="`/user/${item}`"
            >
              <v-list-item-content>
                <v-list-item-title v-text="subscription[item]" />
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-tab-item>

        <v-tab-item>
          <CommentComponent :id="`/user/${uid}`" :dbr="`users/${uid}/chat`" />
        </v-tab-item>

        <v-tab-item>
          <div v-if="targetUser.bio">
            <v-card-title v-text="targetUser.bio" />
            <v-divider class="my-10" />
          </div>

          <v-list flat class="rounded-lg">
            <v-subheader>통계</v-subheader>

            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-library</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="Math.round(targetUser.libris)" />
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-book-open</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title v-text="listev.length" />
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>

    <br /><br />
  </div>
</template>

<script>
import { db } from '@/plugins/firebase.js'

export default {
  asyncData({ params }) {
    const uid = params.uid
    return { uid }
  },
  data() {
    return {
      rating: '모두',
      tab: 0,

      targetUser: {
        libris: '',
        username: '',
        photoURL: '',
        bio: ''
      },

      subscription: [],
      subscribed: false,
      subscriberNumber: 0,

      project: {},
      listev: []
    }
  },
  created() {
    this.fetchContent()
    this.getTargetUserInfo()
  },
  methods: {
    fetchContent() {
      db.ref('/contents/').on('child_added', async (s) => {
        const data = await s.val()
        data.uid === this.uid && this.listev.unshift(data)
      })
    },
    getTargetUserInfo() {
      db.ref(`/users/${this.uid}/`)
        .once('value')
        .then((res) => res.val())
        .then(
          ({
            libris,
            displayName,
            photoURL,
            bio,
            subscriber,
            checked,
            ...rest
          }) => {
            this.targetUser = {
              libris,
              displayName,
              photoURL,
              bio
            }

            this.subscription = subscriber ?? []
            this.subscriberNumber = Object.keys(subscriber).length
            this.subscribed = Object.keys(subscriber).includes(
              this.userInfo.uid
            )

            if (rest.project)
              rest.project.forEach((item) => {
                item.title === checked && (this.project = item)
              })
          }
        )
    },
    subscribe() {
      if (this.subscribed) {
        db.ref(`/users/${this.userInfo.uid}/subscribe/${this.uid}`).remove()
        db.ref(`/users/${this.uid}/subscriber/${this.userInfo.uid}`).remove()

        delete this.subscription[this.userInfo.uid]
        this.subscribed = false
        this.subscriberNumber--
        this.targetUser.libris -= 10

        this.updateLibris(this.uid, -10)
        this.notify(
          `${this.userInfo.uid}님이 구독했습니다`,
          `/user/${this.uid}`
        )
      } else {
        db.ref(`/users/${this.userInfo.uid}/subscribe/${this.uid}`).set(
          this.targetUser.displayName
        )
        db.ref(`/users/${this.uid}/subscriber/${this.userInfo.uid}`).set(
          this.userInfo.displayName
        )

        this.subscription[this.userInfo.uid] = this.userInfo.displayName
        this.subscribed = true
        this.subscriberNumber++
        this.targetUser.libris += 10

        this.updateLibris(this.uid, 10)
        this.notify(
          `${this.userInfo.uid}님이 구독을 취소했습니다`,
          `/user/${this.uid}`
        )
      }
    }
  }
}
</script>

<style scoped>
.imgback {
  position: absolute;
  top: 0;
  left: 0;
}

.bg {
  background-color: #23262e;
}
</style>
