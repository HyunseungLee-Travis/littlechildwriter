<template>
  <v-form v-model="valid" class="my-10">
    <h1>기본 설정</h1>

    <v-divider />
    <br />

    <v-row class="mx-1 gap5">
      <v-text-field
        v-model="userInfo.displayName"
        label="Name"
        placeholder="Name"
        filled
        required
        dense
        solo
        validate-on-blur
        :rules="[
          (v) => v || 'Name is required',
          (v) => v.length <= 30 || 'Name must be less than 30 characters'
        ]"
        value="name"
        prepend-inner-icon="mdi-account"
      />
      <v-text-field
        v-model="userInfo.email"
        label="Email"
        placeholder="Email"
        filled
        required
        dense
        disabled
        solo
        validate-on-blur
        :rules="[
          (v) => v || 'Email is required',
          (v) => /^\S+@\S+\.\S+$/.test(v) || 'Email must be valid'
        ]"
        value="userInfo.email"
        prepend-inner-icon="mdi-email"
      />
    </v-row>

    <v-row class="mx-1 gap5">
      <v-text-field
        v-model="userInfo.uid"
        label="UID"
        placeholder="UID"
        filled
        required
        dense
        solo
        validate-on-blur
        disabled
        value="uid"
        prepend-inner-icon="mdi-account"
      />
    </v-row>

    <v-card tile justify-center class="rounded-lg">
      <v-card-title>프로필 아바타</v-card-title>
      <v-divider />
      <br />
      <v-text-field
        v-model="userInfo.photoURL"
        label="URL"
        placeholder="URL"
        filled
        required
        flat
        dense
        solo
        validate-on-blur
        :rules="[
          (v) => v || 'Name is required',
          (v) => v.length <= 10000 || 'Name must be less than 10000 characters'
        ]"
        value="photo"
        prepend-inner-icon="mdi-camera"
      />
      <v-card-text class="d-flex justify-center">
        <v-avatar size="100">
          <v-img :src="userInfo.photoURL" />
        </v-avatar>
      </v-card-text>
    </v-card>

    <br /><br />

    <v-card tile justify-center class="rounded-lg">
      <v-card-title>자신을 소개하세요!</v-card-title>
      <v-card-text class="d-flex justify-center">
        <v-textarea
          v-model="userDB.bio"
          required
          flat
          outlined
          dense
          solo
          validate-on-blur
          label="Bio"
          :rules="[
            (v) => v || 'Bio is required',
            (v) => v.length > 10 || 'Bio must be more than 10 characters'
          ]"
          placeholder="나의 소개"
          no-resize
        />
      </v-card-text>
    </v-card>

    <br /><br />

    <h1>홈 설정</h1>

    <v-divider />
    <br />

    <v-card tile justify-center class="rounded-lg">
      <v-card-title>이런 책 어때?</v-card-title>
      <v-divider />
      <br />
      <v-card-text>
        <v-checkbox
          v-model="userDB.suggest"
          label="이런 책 어때? 기능 사용하기"
        />
      </v-card-text>
    </v-card>

    <br />

    <v-card tile justify-center class="rounded-lg">
      <v-card-title>특집 프로젝트 선택하기</v-card-title>
      <v-divider />
      <br />
      <v-virtual-scroll :items="project" height="300" item-height="64">
        <template #default="{ item }">
          <v-radio-group v-model="userDB.checked" class="ml-10">
            <v-radio :label="`${item.title}`" :value="item.title" />
          </v-radio-group>
        </template>
      </v-virtual-scroll>
    </v-card>

    <br />

    <v-card-title>비공개 프로젝트</v-card-title>
    <v-divider />
    <br />
    <BookCard :items="project" :simple="true" :sp="true" />

    <v-row justify="center" class="gap5">
      <v-btn color="primary" @click="update">
        <v-icon left> mdi-account </v-icon>
        업데이트
      </v-btn>
    </v-row>
  </v-form>
</template>

<script>
import { auth, db } from '@/plugins/firebase'

export default {
  data() {
    return {
      valid: true,
      project: [],
      userDB: {
        bio: '',
        background: '',
        checked: {},
        suggest: true
      }
    }
  },
  async mounted() {
    this.get()

    await db.ref('/contents').once('value', async (s) => {
      Object.values(await s.val()).forEach((c) => {
        if (c.uid === this.userInfo.uid) {
          const { title, content, image, uid, displayName, time, isPublic } = c

          this.project.push({
            title,
            description: content,
            image,
            uid,
            displayName,
            time,
            isPublic,
            link: `${c.uid}-${c.time}`
          })
        }
      })
    })
  },
  methods: {
    get() {
      auth.onAuthStateChanged((u) => {
        if (u) {
          db.ref(`/users/${this.userInfo.uid}`).on('value', (s) => {
            const { bio, background, checked, suggest } = s.val()

            this.userDB = {
              ...this.userDB,
              bio,
              background,
              checked,
              suggest
            }
          })
        }
      })
    },
    update() {
      const { displayName, photoURL, uid } = this.userInfo
      const { bio, background, checked, suggest } = this.userDB
      const project = this.project

      auth.currentUser
        .updateProfile({
          displayName,
          photoURL
        })
        .then(() => {
          db.ref(`/users/${uid}`).update({
            displayName,
            photoURL,
            bio,
            background,
            checked: checked ?? {},
            project,
            suggest
          })

          this.get()
          this.$router.push(`/user/${uid}`)
        })
    }
  }
}
</script>
