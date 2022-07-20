<template>
  <div>
    <v-dialog v-model="makingClassDialog" width="500">
      <template #activator="{ on, attrs }">
        <v-btn color="primary" v-bind="attrs" v-on="on">
          <v-icon left> mdi-google-classroom </v-icon> 만들기
        </v-btn>
      </template>

      <v-stepper v-model="makingClassSteps">
        <v-stepper-header>
          <v-stepper-step :complete="makingClassSteps > 0" step="1">
            기본 정보
          </v-stepper-step>

          <v-divider />

          <v-stepper-step step="2"> 이미지 업로드 </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-card-title> 클래스 기본 정보 </v-card-title>

            <v-card-text>
              <v-text-field
                v-model="classInfo.name"
                label="클래스 이름"
                required
              />

              <v-text-field
                v-model="classInfo.description"
                label="클래스 설명"
                required
              />

              <v-checkbox v-model="classInfo.public" label="공개" />
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" text @click="makingClassSteps = 2">
                👌 OK
              </v-btn>
            </v-card-actions>
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-card-title> 클래스 고급 정보 </v-card-title>

            <v-card-text>
              <v-text-field
                v-model="classInfo.image"
                prepend-icon="mdi-google-classroom"
                label="클래스 사진 URL"
                required
              />

              <v-file-input
                type="file"
                accept="image/*"
                label="또는... 클래스 사진 업로드"
                color="grey"
                outlined
                dense
                @change="uploadFile($event)"
              />
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn text @click="makeAClass">
                <v-icon left> mdi-check </v-icon> 만들기
              </v-btn>
            </v-card-actions>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-dialog>

    <br /><br />

    <v-data-iterator :items="fetchedClasses" hide-default-footer>
      <template #default="props">
        <v-row class="mt-5 ma-1 gap10">
          <v-card
            v-for="item in props.items"
            v-if="
              item.public ||
              item.uid === userInfo.uid ||
              Object.values(item.users).filter((e) => e.uid === userInfo.uid)
                .length > 0
            "
            :key="item.creator + item.name"
            class="my-3 transparent elevation-0"
          >
            <v-card class="transparent elevation-0" :to="`/class/${item.id}`">
              <v-img
                :src="item.image"
                width="50vh"
                class="ma-auto rounded-lg"
                :gradient="
                  item.public ? '' : 'to bottom, rgba(0,0,0,0), rgba(0,0,0,.5)'
                "
              >
                <v-avatar>
                  <v-img :src="item.photoURL" />
                </v-avatar>
              </v-img>

              <v-card-title class="primary--text">
                {{ item.name }} ({{ item.public ? '공개' : '비공개' }})
              </v-card-title>
              <v-card-subtitle> Created by {{ item.creator }} </v-card-subtitle>
            </v-card>
          </v-card>
        </v-row>
      </template>
    </v-data-iterator>
  </div>
</template>

<script>
import { db } from '@/plugins/firebase.js'

export default {
  data() {
    return {
      fetchedClasses: [],

      classInfo: {
        name: '',
        description: '',
        image: '',
        creator: '',
        id: '',
        liked: {},
        totalPosts: {},
        comments: [],
        public: true,
        users: []
      },

      makingClassDialog: false,
      makingClassSteps: 1
    }
  },
  created() {
    this.fetchClass()
  },

  methods: {
    makeAClass() {
      this.makingClassDialog = false

      const { displayName, uid, photoURL } = this.userInfo

      this.classInfo = {
        ...this.classInfo,
        creator: displayName,
        id: uid + this.classInfo.name,
        uid,
        photoURL
      }

      db.ref('classes')
        .child(this.userInfo.uid + this.classInfo.name)
        .set(this.classInfo)

      this.classInfo = {}
      this.makingClassDialog = false
      this.makingClassSteps = 1
    },
    fetchClass() {
      db.ref('classes').on('child_added', async (s) =>
        this.fetchedClasses.push(await s.val())
      )
    }
  }
}
</script>
