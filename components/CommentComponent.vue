<template>
  <div>
    <v-text-field
      v-if="userInfo.uid"
      v-model="comment"
      flat
      solo
      hide-details
      label="댓글 달기"
      :disabled="disabled"
      @keydown.enter="commentpost"
    >
      <template #append>
        <v-btn icon depressed :disabled="disabled" @click="commentpost">
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </template>
    </v-text-field>

    <v-timeline v-if="!dontshow" dense clipped>
      <v-slide-x-transition group>
        <v-timeline-item v-for="(message, i) in comments" :key="message.time">
          <template #icon>
            <v-tooltip left>
              <template #activator="{ on, attrs }">
                <v-avatar
                  v-bind="attrs"
                  size="40"
                  :color="message.badWord ? 'red' : '#23262e'"
                  v-on="on"
                >
                  <v-img :src="message.photoURL" />
                </v-avatar>
              </template>
              <span v-text="message.displayName" />
            </v-tooltip>
          </template>

          <v-row>
            <v-card
              rounded
              width="100%"
              class="d-flex mr-5 elevation-0"
              :color="message.badWord ? 'red' : '#23262e'"
            >
              <div>
                <v-card-subtitle
                  v-if="!message.edit"
                  v-text="message.content"
                />
                <v-card-subtitle v-else>
                  <v-text-field
                    v-model="updatedcomment"
                    hide-details
                    flat
                    label="댓글 변경"
                    solo
                    @keydown.enter="updatecomment(i)"
                  >
                    <template #append>
                      <v-btn
                        class="mx-0"
                        icon
                        depressed
                        @click="updatecomment(i)"
                      >
                        <v-icon>mdi-send</v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-card-subtitle>
              </div>

              <v-spacer />

              <v-card-actions>
                <v-menu offset-y>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-if="userInfo.displayName === message.displayName"
                      icon
                      v-bind="attrs"
                      cols="1"
                      v-on="on"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      v-if="!message.badWord"
                      @click="editcomment(i)"
                    >
                      <v-list-item-title>
                        <v-icon left> mdi-pencil </v-icon>

                        {{ comments[i].edit ? '취소' : '수정' }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="delcomment(i)">
                      <v-list-item-title>
                        <v-icon left> mdi-delete </v-icon> 삭제
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <span v-if="message.badWord">
                  <v-icon>mdi-alert-circle</v-icon>
                </span>
              </v-card-actions>
            </v-card>
          </v-row>
        </v-timeline-item>
      </v-slide-x-transition>
    </v-timeline>
  </div>
</template>

<script>
import * as filter from 'leo-profanity'
import { db } from '@/plugins/firebase.js'

export default {
  props: {
    id: {
      type: String,
      required: true
    },
    dbr: {
      type: String,
      required: true
    },
    dontshow: {
      type: Boolean,
      default: false
    },
    cb: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      comment: '',
      updatedcomment: '',
      comments: [],
      disabled: false
    }
  },
  created() {
    this.getComments()
  },
  methods: {
    editcomment(i) {
      this.comments[i].edit = !this.comments[i].edit
      this.updatedcomment = this.comments[i].content
      this.$forceUpdate()
    },
    updatecomment(i) {
      this.comments[Object.keys(this.comments)[i]] = {
        ...this.comments[i],
        content: this.updatedcomment,
        edited: true,
        time: Date.now()
      }

      delete this.comments[i].edit
      this.$forceUpdate()
      db.ref(this.dbr).set(this.comments)
    },
    getComments() {
      db.ref(this.dbr).on('child_added', async (s) =>
        this.comments.push(await s.val())
      )
    },
    delcomment(i) {
      const delComment = this.comments
      const cmt = db.ref(this.dbr)
      delComment.splice(i, 1)
      cmt.set(delComment)
    },
    commentpost() {
      if (this.comment.length > 0) {
        const comments = db.ref(this.dbr)

        filter.loadDictionary('en-us')

        const { displayName, photoURL, uid } = this.userInfo

        comments.push({
          uid,
          photoURL,
          displayName,
          time: Date.now(),
          content: filter.clean(this.comment),
          badWord: filter.check(this.comment)
        })

        this.notify(this.comment, this.id)
        this.updateLibris(this.userInfo.uid, 0.1)

        this.comment = ''

        this.cb()
      }
    }
  }
}
</script>
