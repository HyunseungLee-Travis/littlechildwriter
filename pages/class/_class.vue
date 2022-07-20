<template>
  <div>
    <v-tabs
      v-model="tab"
      show-arrows
      center-active
      grow
      background-color="#23262E"
    >
      <v-tab class="bg"> 홈 </v-tab>
      <v-tab class="bg"> 글 쓰기 </v-tab>
      <v-tab class="bg"> 다른 친구들 </v-tab>
      <v-tab v-if="classInfo.uid === userInfo.uid" class="bg"> 설정 </v-tab>

      <v-tab-item class="bg">
        <br />

        <h1 class="primary--text" v-text="classInfo.name" />
        <h4 class="grey--text">선생님 {{ classInfo.creator }}</h4>
        <p class="my-5" v-text="classInfo.description" />

        <br />

        <v-card
          v-for="(item, i) in classInfo.contents"
          v-if="item.book"
          :key="item.title"
          class="d-flex mt-5 elevation-0"
          rounded
          :to="`/content/${item.time}`"
        >
          <v-icon color="orange" class="ml-4"> mdi-book </v-icon>
          <div>
            <v-card-title>
              {{ item.displayName }}의 {{ item.title }}
            </v-card-title>
            <v-card-subtitle
              v-text="new Date(item.time).toLocaleDateString()"
            />
          </div>

          <v-spacer />

          <v-card-actions>
            <v-menu v-if="userInfo.uid === item.uid" offset-y>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  v-bind="attrs"
                  cols="1"
                  v-on="on"
                  @click.stop.prevent=""
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="deleteContent(i)">
                  <v-list-item-title>
                    <v-icon left> mdi-delete </v-icon> 삭제
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-card-actions>
        </v-card>

        <v-card v-else class="mt-5">
          <div class="d-flex">
            <v-avatar size="40" class="ml-3 mt-6">
              <v-img :src="item.photoURL" class="rounded-lg" />
            </v-avatar>
            <div>
              <v-card-title>{{ item.displayName }}의 공지사항</v-card-title>
              <v-card-subtitle
                v-text="new Date(item.time).toLocaleDateString()"
              />
            </div>
            <v-spacer />
            <v-card-actions>
              <v-menu v-if="userInfo.uid === item.uid" offset-y>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    v-bind="attrs"
                    cols="1"
                    v-on="on"
                    @click.stop.prevent=""
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="deleteContent(i)">
                    <v-list-item-title>
                      <v-icon left> mdi-delete </v-icon> 삭제
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-card-actions>
          </div>
          <v-card-text v-text="item.content" />
        </v-card>
      </v-tab-item>

      <v-tab-item class="bg">
        <br />

        <v-select
          v-model="post.type"
          :items="['책', '공지사항']"
          label="종류 선택"
          outlined
        />

        <v-card v-if="post.type === '책'">
          <v-card-title>책 내용 업로드</v-card-title>
          <v-card-text>
            <v-text-field v-model="post.title" label="제목" />

            <div v-if="post.time">
              <h2>선택됨</h2>
              <br />
              <v-img :src="post.image" max-width="200" class="rounded-lg" />
            </div>
          </v-card-text>

          <v-card-actions class="ma-2 gap20">
            <v-btn color="primary" class="elevation-0" @click="postcontent">
              올리기<v-icon right> mdi-note-plus </v-icon>
            </v-btn>

            <v-dialog v-model="dialog" width="700">
              <template #activator="{ on, attrs }">
                <div class="text-center">
                  <v-btn color="red lighten-2" v-bind="attrs" v-on="on">
                    선택
                  </v-btn>
                </div>
              </template>

              <v-card>
                <v-row no-gutters>
                  <v-card
                    v-for="i in listev.filter((i) => i.uid == userInfo.uid)"
                    :key="i.title"
                    @click="
                      post.time = i.time
                      post.image = i.image
                      dialog = false
                    "
                    class="elevation-0"
                  >
                    <v-img
                      :src="i.image"
                      class="rounded-lg ma-3"
                      max-width="100"
                    />
                  </v-card>
                </v-row>
              </v-card>
            </v-dialog>
          </v-card-actions>
        </v-card>

        <v-card v-else>
          <CommentComponent
            :id="`/class/${id}`"
            :dbr="`classes/${id}/contents`"
            :dontshow="true"
            :cb="() => (tab = 0)"
            class="mt-5"
          />
        </v-card>
      </v-tab-item>

      <v-tab-item class="bg">
        <v-card class="mt-5">
          <v-card-title>다른 친구들</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(item, i) in classInfo.users"
                :key="i"
                :to="`/user/${item.uid}`"
              >
                <v-list-item-title v-text="item.displayName" />
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-tab-item>

      <v-tab-item v-if="classInfo.uid === userInfo.uid" class="bg">
        <v-card class="mt-5">
          <v-card-title>수업 세부정보</v-card-title>
          <v-card-text>
            <v-text-field v-model="classInfo.name" label="수업 이름" required />
            <v-text-field
              v-model="classInfo.description"
              label="수업 설명"
              required
            />
            <v-checkbox
              v-model="classInfo.public"
              label="수업 전체 공개 여부"
              required
            />
            <v-btn
              color="primary"
              class="mt-5"
              :disabled="!classInfo.name || !classInfo.description"
              @click="updateClass"
            >
              수업 정보 수정
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card class="mt-5">
          <v-card-title>수업에 참여하는 사용자</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="item in classInfo.users"
                :key="item.uid"
                :to="`/user/${item.uid}`"
              >
                <v-list-item-title v-text="item.displayName" />

                <v-list-item-action>
                  <v-menu offset-y>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        icon
                        v-bind="attrs"
                        cols="1"
                        v-on="on"
                        @click.stop.prevent=""
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="deleteUser(item.uid)">
                        <v-list-item-title>
                          <v-icon left> mdi-delete </v-icon> 삭제
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <v-text-field v-model="userUid" label="사용자 UID" required />
            <v-btn color="primary" class="mt-5" @click="addUser">
              사용자 추가
            </v-btn>
          </v-card-text>
        </v-card>
        <v-card class="mt-5">
          <v-card-title>삭제</v-card-title>
          <v-card-text>
            <DialogComponent
              :cb="deleteClass"
              btn-title="삭제"
              title="진짜로 삭제하겠습니까?"
              text="삭제하면 복구할 수 없습니다"
              icon="delete"
            />
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import { db } from '@/plugins/firebase.js'

export default {
  asyncData({ params }) {
    const id = params.class
    return { id }
  },
  data() {
    return {
      classInfo: {
        contents: [],
        users: []
      },
      listev: [],
      comments: [],

      post: {
        title: '',
        time: '',
        book: true,
        type: '책'
      },

      editClassDialog: false,
      dialog: false,
      tab: 0,

      userUid: '',
      userName: ''
    }
  },
  created() {
    this.fetchClass()
    this.fetchuserArticles()
  },
  methods: {
    deleteContent(i) {
      delete this.classInfo.contents[i]
      this.$forceUpdate()
      db.ref(`/classes/${this.id}/contents/${i}`).remove()
    },
    updateClass() {
      db.ref(`/classes/${this.id}`).update(this.classInfo)
      this.tab = 0
    },
    async addUser() {
      this.userUid = ''

      await db.ref(`/users/${this.userUid}`).once('value', (snapshot) => {
        this.userName = snapshot.val().displayName
      })

      db.ref(`/classes/${this.id}/users`).push({
        uid: this.userUid,
        displayName: this.userName
      })

      this.notify(
        `${this.userInfo.uid}님이 당신을 클래스에 초대했습니다`,
        `/class/${this.id}`
      )
    },
    deleteUser(uid) {
      db.ref(`/classes/${this.id}/users/`).once('value', (s) => {
        s.forEach(
          (cs) =>
            cs.val().uid === uid &&
            db.ref(`/classes/${this.id}/users/${cs.key}`).remove()
        )
      })
    },
    fetchClass() {
      db.ref(`/classes/${this.id}`).on(
        'value',
        async (s) => (this.classInfo = await s.val())
      )
    },
    async postcontent() {
      const { title, time, book } = this.post
      const { uid, displayName } = this.userInfo

      await db.ref(`/classes/${this.id}/contents`).push({
        title,
        uid,
        time,
        displayName,
        book
      })

      this.post = {
        title: '',
        time: '',
        book: true
      }
      this.tab = 0
    },
    fetchuserArticles() {
      db.ref('/contents/').on('child_added', (s) => {
        const { title, time, uid, displayName, image } = s.val()

        this.listev.unshift({
          title,
          time,
          uid,
          displayName,
          image
        })
      })
    },
    deleteClass() {
      db.ref('classes').child(this.id).remove()
      this.$router.push('/classes')
    }
  }
}
</script>

<style scoped>
.bg {
  background-color: #23262e;
}
</style>
