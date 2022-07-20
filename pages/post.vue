<template>
  <div>
    <div class="d-none">
      <img ref="isbn" src="" />
      <v-file-input
        ref="file"
        type="file"
        accept="image/*"
        @change="uploadImg($event)"
      />
    </div>

    <v-dialog v-model="isbn.loadDialog" width="500">
      <template #activator="{ on, attrs }">
        <v-btn v-bind="attrs" text v-on="on"> 책 정보 입력 </v-btn>
      </template>

      <v-card>
        <v-list>
          <v-list-item @click="$refs.file.$refs.input.click()">
            <v-icon left> mdi-upload </v-icon> 컴퓨터에서 책 사진 업로드
          </v-list-item>
          <v-list-item @click="showCamera">
            <v-icon left> mdi-barcode-scan </v-icon> 카메라로 ISBN 촬영
          </v-list-item>
          <v-list-item @click="isbn.pictureBarcode = true">
            <v-icon left> mdi-barcode </v-icon> 사진으로 ISBN 촬영
          </v-list-item>
          <v-list-item @click="isbn.inputISBN = true">
            <v-icon left> mdi-form-textbox </v-icon> ISBN 입력
          </v-list-item>
          <v-list-item @click="isbn.findISBN = true">
            <v-icon left> mdi-book-search </v-icon> 책 찾기
          </v-list-item>
        </v-list>

        <v-dialog
          v-model="isbn.videoBarcode"
          :width="$vuetify.breakpoint.xs ? '90%' : '70%'"
          height="90%"
        >
          <v-card v-if="isbn.videoBarcode" height="100%" width="100%">
            <div id="container">
              <video
                id="videoElement"
                ref="video"
                autoplay="true"
                width="100%"
              />
            </div>
            <v-card-actions>
              <v-btn @click="takeISBNVideo"> ISBN 바코드 찍기 </v-btn>
              <v-btn color="error" @click="isbn.videoBarcode = false">
                <v-icon left> mdi-close-outline </v-icon>취소
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="isbn.pictureBarcode" width="500">
          <v-card>
            <v-progress-linear
              v-if="loading"
              indeterminate
              color="white"
              class="mb-0"
            />
            <v-card-title> IBSN 사진 </v-card-title>

            <br />

            <v-card-text>
              <v-file-input
                type="file"
                accept="image/*"
                label="ISBN 사진"
                color="grey"
                outlined
                dense
                @change="uploadFile($event)"
              />
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn text @click="isbn.pictureBarcode = false"> 취소 </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="isbn.inputISBN" width="500">
          <v-card>
            <v-progress-linear
              v-if="loading"
              indeterminate
              color="white"
              class="mb-0"
            />
            <v-card-title> 입력 </v-card-title>

            <br />

            <v-card-text>
              <v-text-field
                v-if="isbn.inputISBN"
                v-model="post.isbn"
                autofocus
                label="ISBN"
                @keyup.enter="fetchi"
              />
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn text @click="isbn.inputISBN = false"> 취소 </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="isbn.findISBN" width="700">
          <v-card>
            <v-progress-linear
              v-if="loading"
              indeterminate
              color="white"
              class="mb-0"
            />
            <v-card-title> 책 찾기 </v-card-title>

            <br />

            <v-card-text>
              <v-text-field
                v-if="isbn.findISBN"
                v-model="searching_title"
                autofocus
                label="책 제목"
                @keyup.enter="fetchISBN"
              />
            </v-card-text>

            <v-list>
              <v-list-item
                v-for="item in searched_isbn"
                v-if="item.volumeInfo.industryIdentifiers"
                :key="item.volumeInfo.industryIdentifiers[0].identifier"
                @click="
                  fetchFromSearch(
                    item.volumeInfo.industryIdentifiers[0].identifier
                  )
                "
              >
                <v-list-item-avatar
                  v-if="item.volumeInfo.imageLinks"
                  rounded="sm"
                >
                  <v-img :src="item.volumeInfo.imageLinks.thumbnail" />
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title v-text="item.volumeInfo.title" />

                  <v-spacer />

                  <v-list-item-subtitle
                    v-text="
                      `${
                        item.volumeInfo.authors
                          ? item.volumeInfo.authors[0]
                          : 'unkown'
                      } - ${
                        item.volumeInfo.pageCount
                          ? item.volumeInfo.pageCount
                          : 'unkown'
                      }`
                    "
                  />
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-card-actions>
              <v-spacer />
              <v-btn text @click="isbn.findISBN = false"> 취소 </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card>
    </v-dialog>

    <v-row class="my-10">
      <v-rating
        v-model="post.rating"
        color="blue"
        required
        size="30"
        class="mx-auto"
      />
    </v-row>

    <v-text-field v-model="post.title" label="제목" />

    <v-row class="gap10" style="margin: 0.5px 0">
      <v-text-field v-model="post.author" label="작가" />
      <v-text-field v-model="post.pageCount" label="페이지" />
    </v-row>

    <v-checkbox
      v-model="post.isPublic"
      :label="`${post.isPublic ? '' : '(프로필 페이지에서만 공개됨) 비'}공개`"
      color="blue"
    />

    <div class="text--primary">
      <v-textarea
        v-model="post.content"
        label="책 소개"
        hint="아직 책을 읽지 않은 사람들에게 책을 소개하세요!"
      />
    </div>

    <v-alert v-if="error" type="error" class="ma-5" v-text="error" />

    <v-btn color="primary" text @click="postcontent">
      올리기 <v-icon right> mdi-note-plus </v-icon>
    </v-btn>

    <div class="ma-auto mt-10">
      <v-img
        v-if="post.image"
        :src="post.image"
        class="rounded-lg"
        max-width="200"
      />
    </div>
  </div>
</template>

<script>
import { db } from '@/plugins/firebase.js'

export default {
  data() {
    return {
      post: {
        isbn: '',
        title: '',
        image: '',
        pageCount: '',
        categories: [],
        rating: 5,
        content: '',
        time: Date.now(),
        isPublic: true
      },

      isbn: {
        videoBarcode: false,
        pictureBarcode: false,
        inputISBN: false,
        findISBN: false,
        loadDialog: false
      },

      loading: false,
      error: '',
      searching_title: '',
      searched_isbn: [],

      formats: ['code_39', 'codabar', 'ean_13', 'ean_8', 'upc_a']
    }
  },
  methods: {
    fetchFromSearch(isbn) {
      this.post.isbn = isbn
      this.isbn.findISBN = false
      this.fetchi()
      this.isbn.loadDialog = false
    },
    async fetchISBN() {
      this.loading = true

      await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${this.searching_title}&maxResults=40`
      )
        .then((res) => res.json())
        .then((search) => (this.searched_isbn = search.items))

      this.loading = false
    },
    showCamera() {
      this.isbn.videoBarcode = true

      navigator.mediaDevices.getUserMedia &&
        navigator.mediaDevices
          .getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 4096 },
              height: { ideal: 2160 }
            }
          })
          .then((s) => (this.$refs.video.srcObject = s))
          .catch(() => (this.isbn.pictureBarcode = false))
    },
    takeISBNVideo() {
      this.loading = true

      if ('BarcodeDetector' in window) {
        new BarcodeDetector({
          formats: this.formats
        })
          .detect(this.$refs.video)
          .then((res) => res[0].rawValue)
          .then((a) => {
            this.post.isbn = JSON.stringify(a, null, 2).replace(/"/g, '')
            this.fetchi()
            this.isbn.videoBarcode = false
            this.isbn.loadDialog = false
          })
          .catch(() => alert('다시 찍어주세요'))
      }

      this.loading = false
    },
    uploadFile(file) {
      this.loading = true

      const reader = new FileReader()

      reader.onload = () => {
        this.$refs.isbn.src = reader.result
        const tempImage = new Image()
        tempImage.src = reader.result
        tempImage.onload = () => {
          if ('BarcodeDetector' in window)
            new BarcodeDetector({
              formats: this.formats
            })
              .detect(this.$refs.isbn)
              .then((res) => res[0].rawValue)
              .then((a) => {
                this.post.isbn = JSON.stringify(a, null, 2).replace(/"/g, '')
                this.fetchi()
                this.isbn.pictureBarcode = false
                this.isbn.loadDialog = false
              })
              .catch((err) => alert(err.message))
        }
      }

      reader.readAsDataURL(file)

      this.loading = false
    },
    uploadImg(file) {
      const reader = new FileReader()

      reader.addEventListener(
        'load',
        () => (this.post.image = reader.result),
        false
      )

      file && reader.readAsDataURL(file)
      this.isbn.loadDialog = false
    },
    postcontent() {
      const {
        title,
        content,
        rating,
        isbn,
        time,
        image,
        pageCount,
        categories,
        isPublic
      } = this.post

      const { uid, displayName } = this.userInfo

      db.ref(`/contents/${time}`).set({
        title,
        content,
        rating,
        isbn,
        time,
        image,
        pageCount,
        categories,
        isPublic,
        likes: 1,
        liked: {
          [this.userInfo.uid]: true
        },
        views: 0,
        uid,
        displayName
      })

      this.updateLibris(this.userInfo.uid, this.post.pageCount / 100)
      this.notify(
        `${this.userInfo.uid}님이 글을 올렸습니다`,
        `/content/${time}`
      )
      this.$router.push(`/content/${time}`)
    },
    async fetchi() {
      this.loading = true

      await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${this.post.isbn}`
      )
        .then((res) => res.json())
        .then((res) =>
          res.totalItems === 0
            ? this.makeError('ISBN을 찾을 수 없습니다')
            : [res.items[0].volumeInfo, res.items[0].selfLink]
        )
        .then(([vol, link]) => {
          const {
            title,
            imageLinks: { thumbnail: image },
            authors: author,
            pageCount
          } = vol

          this.post = {
            ...this.post,
            title,
            image,
            pageCount,
            author
          }

          return link
        })
        .then(async (link) => {
          await fetch(link)
            .then((res) => res.json())
            .then(
              (res) =>
                (this.post = {
                  ...this.post,
                  categories: res.volumeInfo.categories
                })
            )
        })
        .catch((e) => this.makeError(e.message))

      this.isbn.inputISBN = false
      this.loading = false
    },
    makeError(e) {
      this.error = e
      setTimeout(() => (this.error = ''), 5000)
    }
  }
}
</script>
