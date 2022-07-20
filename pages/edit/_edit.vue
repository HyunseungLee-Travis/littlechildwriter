<template>
  <div>
    <div>
      <v-row class="my-5">
        <v-rating
          v-model="post.rating"
          color="blue"
          required
          size="30"
          class="mx-auto"
        />
      </v-row>

      <v-form>
        <v-row class="editrow">
          <v-text-field
            v-model="post.title"
            label="제목"
            :hint="post.subtitle"
          />

          <v-text-field v-model="post.pageCount" label="페이지" />
        </v-row>

        <div class="text--primary">
          <v-textarea
            v-model="post.content"
            label="책 소개"
            hint="아직 책을 읽지 않은 사람들에게 책을 요약하세요!"
          />
        </div>
      </v-form>
    </div>

    <div>
      <v-btn color="primary" class="elevation-0" @click="update">
        업데이트 <v-icon right> mdi-note-plus </v-icon>
      </v-btn>

      <DialogComponent
        :cb="() => $router.push(`/content/${post.time}`)"
        btn-title="취소"
        title="진짜로 취소하겠습니까?"
        text="취소하면 복구할 수 없습니다"
        icon="arrow-left"
      />
    </div>

    <v-alert
      v-if="error"
      dense
      outlined
      type="error"
      class="ma-3"
      v-text="error"
    />
  </div>
</template>

<script>
import { auth, db } from '@/plugins/firebase.js'

export default {
  asyncData({ params }) {
    const time = params.edit
    return {
      time
    }
  },
  data() {
    return {
      post: {
        title: '',
        content: '',
        image: '',
        time: '',
        rating: 0,
        displayName: '',
        pageCount: 0,
        isbn: '',
        uid: ''
      },

      error: ''
    }
  },

  mounted() {
    auth.onAuthStateChanged((u) => u && this.getPost())
  },
  methods: {
    update() {
      try {
        const {
          title,
          content,
          image,
          time,
          rating,
          displayName,
          pageCount,
          isbn
        } = this.post

        db.ref(`/contents/${this.time}`).update({
          title,
          content,
          rating,
          isbn,
          image,
          pageCount,
          displayName,
          time: parseInt(time)
        })

        this.$router.push(`/content/${time}`)
      } catch (err) {
        this.error = err.message
      }
    },
    async getPost() {
      this.post = (await db.ref(`/contents/${this.time}`).once('value')).val()
    }
  }
}
</script>

<style>
.editrow {
  margin-left: 0.5px;
  margin-right: 0.5px;
  gap: 10px;
}
</style>
