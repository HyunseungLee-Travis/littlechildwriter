<template>
  <div>
    <iframe
      v-if="fetchedBookID"
      frameborder="0"
      scrolling="no"
      class="zmax frame"
      :src="`https://books.google.co.kr/books?id=${fetchedBookID}&lpg=PP1&pg=PP1&output=embed`"
      width="100%"
      height="100%"
    />
    <v-btn
      v-if="fetchedBookID"
      bottom
      right
      fixed
      color="primary"
      class="zmax"
      @click="fetchedBookID = ''"
    >
      닫기
    </v-btn>

    <v-card class="my-3">
      <div class="cardy">
        <div class="text-center ma-auto">
          <v-img
            :src="post.image"
            width="200"
            class="ma-auto ml-5 my-5 rounded-lg"
          >
            <template #placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="grey lighten-5" />
              </v-row>
            </template>
          </v-img>
        </div>

        <div class="ma-auto pa-1">
          <v-card-title class="h1" v-text="post.title" />

          <v-card-subtitle>
            by
            <NuxtLink :to="`/user/${post.uid}`" v-text="post.displayName" />
          </v-card-subtitle>

          <v-rating
            dense
            readonly
            half-increments
            size="20"
            color="amber"
            background-color="white"
            :value="post.rating"
            class="ml-3"
          />

          <v-card-text>
            <p class="my-5" v-text="post.content" />
            <v-chip-group class="my-5" column>
              <v-chip v-for="tag in tags" :key="tag.icon" label>
                <v-icon left> mdi-{{ tag.icon }} </v-icon>
                {{ tag.val }}
              </v-chip>
            </v-chip-group>
          </v-card-text>
        </div>
      </div>
    </v-card>

    <div class="text-center my-10">
      <div v-if="post.uid === userInfo.uid" class="mb-10">
        <DialogComponent
          :cb="del"
          btn-title="삭제"
          title="진짜로 삭제하겠습니까?"
          text="삭제하면 복구할 수 없습니다"
          icon="delete"
        />
        <v-btn :to="`/edit/${time}`" class="ml-3" color="blue lighten-2">
          <v-icon left> mdi-pencil </v-icon> 편집
        </v-btn>
      </div>

      <v-btn text to="/list">
        <v-icon left>mdi-chevron-left</v-icon> 뒤로
      </v-btn>
      <v-btn text @click="loadIframe">
        <v-icon left> mdi-file-find </v-icon> 미리보기
      </v-btn>
      <v-dialog width="700">
        <template #activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on">
            <v-icon left> mdi-shape </v-icon> 카테고리
          </v-btn>
        </template>

        <v-card style="background-color: #23262e">
          <v-card-text>
            <br />
            <v-chip
              v-for="tag in post.categories"
              :key="tag"
              ripple
              outlined
              label
              :to="`/list?search=${tag}`"
              class="ma-2 d-block"
            >
              #{{ tag }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>

    <CommentComponent
      :id="`/content/${time}`"
      :dbr="`contents/${time}/comments`"
    />

    <br /><br /><br /><br />

    <template v-if="post.categories && suggested[0]">
      <h1>이런 책 어때?</h1>

      <v-row no-gutters>
        <v-card
          v-for="(item, i) in suggested"
          :key="i"
          :width="$vuetify.breakpoint.width < 1264 ? 150 : 210"
          class="mx-auto my-5 elevation-0 transparent"
          :href="item.infoLink"
        >
          <v-img :src="item.thumbnail" class="rounded-lg" />
        </v-card>
      </v-row>
    </template>
  </div>
</template>

<script>
import { db } from '@/plugins/firebase.js'

export default {
  asyncData({ params }) {
    const time = params.content
    return {
      time
    }
  },
  data() {
    return {
      comment: '',
      comments: [],

      tags: {
        views: {
          icon: 'eye',
          val: 0
        },
        time: {
          icon: 'calendar-clock',
          val: ''
        },
        page: {
          icon: 'book-open-page-variant',
          val: 0
        }
      },

      post: {
        isbn: '',
        liked: {},
        categories: [],
        uid: ''
      },

      fetchedBookID: '',
      suggested: []
    }
  },
  async created() {
    await this.getPost()
    this.growView()
    this.fetchContent()
  },
  methods: {
    async fetchContent() {
      const cat = [...this.post.categories]
      cat.forEach((tag, i) => (cat[i] = encodeURIComponent(`'${tag}'`)))

      let done = false,
        n = 5

      while (!done) {
        await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=subject:${cat.join(
            ','
          )}&maxResults=${n}`
        )
          .then((res) => res.json())
          .then((data) => {
            const length = data.items.length

            if (length > 4) done = true
            else cat.shift(), (n -= length)

            for (let i = 0; i < length; i++) {
              const book = data.items[i]

              if (
                book.volumeInfo.imageLinks.thumbnail &&
                book.volumeInfo.title !== this.post.title
              ) {
                const {
                  imageLinks: { thumbnail },
                  infoLink
                } = book.volumeInfo

                this.suggested.push({
                  thumbnail,
                  infoLink
                })

                if (i === 4) break
              }
            }
          })
          .catch(() => cat.shift())
      }
    },
    async loadIframe() {
      let fetched = ''

      await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${this.post.isbn}`
      )
        .then((res) => res.json())
        .then((res) => {
          fetched = res.items[0].id
        })

      this.fetchedBookID = fetched
    },
    async del() {
      await db.ref(`contents/${this.time}`).remove()
      this.updateLibris(this.userInfo.uid, -(this.post.pageCount / 100))
      this.$router.push('/list')
    },
    async getPost() {
      const post = await db
        .ref(`/contents/${this.time}`)
        .once('value')
        .then((r) => r.val())

      post !== null && Object.keys(post).length !== 1 && (this.post = post)

      this.tags = {
        views: {
          icon: 'eye',
          val: this.post.views + 1
        },
        time: {
          icon: 'calendar-clock',
          val: new Date(parseInt(this.time)).toLocaleDateString()
        },
        page: {
          icon: 'book-open-page-variant',
          val: this.post.pageCount
        }
      }
    },
    growView() {
      db.ref(`contents/${this.time}/views`).set(this.tags.views.val)
      this.updateLibris(this.post.uid, 0.1)
      this.updateLibris(this.userInfo.uid, 0.1)
    }
  }
}
</script>

<style scoped>
.frame {
  position: absolute;
  border: 0px;
  top: 0px;
  left: 0px;
}

.cardy {
  display: flex;
  padding: 10px;
}

@media screen and (max-width: 605px) {
  .cardy {
    display: block;
  }
}
</style>
