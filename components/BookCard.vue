<template>
  <v-lazy>
    <v-row class="row">
      <v-card
        v-for="(item, i) in items"
        v-if="sp ? item.isPublic === false : item.isPublic !== false"
        :key="i"
        :width="
          $vuetify.breakpoint.width < 400
            ? 150
            : $vuetify.breakpoint.xs
            ? 185
            : $vuetify.breakpoint.sm
            ? 215
            : $vuetify.breakpoint.md
            ? 215
            : 225
        "
        class="mx-auto my-5 elevation-0 transparent"
      >
        <v-card :to="`/content/${item.time}`" class="elevation-0 transparent">
          <v-img
            :src="item.image"
            class="white--text align-end rounded-lg"
            :gradient="simple ? '' : 'to bottom, rgba(0,0,0,0), rgba(0,0,0,.5)'"
          >
            <v-card-title v-if="!simple" v-text="item.views" />
          </v-img>

          <v-card-title class="primary--text" v-text="item.title" />

          <v-card-subtitle>
            <NuxtLink :to="`/user/${item.uid}`" v-text="item.displayName" />
            <span class="text--disabled">
              {{ new Date(parseInt(item.time)).getMonth() }}/{{
                new Date(parseInt(item.time)).getDate()
              }}
            </span>
          </v-card-subtitle>
        </v-card>

        <v-divider v-if="!simple" />

        <v-slide-y-transition>
          <v-card v-show="!simple" class="transparent elevation-0">
            <v-card-actions v-if="userInfo.uid" class="my-1 justify-center">
              <v-btn
                icon
                :disabled="item.liked[userInfo.uid] == true"
                @click="likeThis(item)"
              >
                <v-icon> mdi-thumb-up </v-icon>
              </v-btn>
              <span class="subheading" v-text="item.likes" />
            </v-card-actions>
          </v-card>
        </v-slide-y-transition>
      </v-card>
    </v-row>
  </v-lazy>
</template>

<script>
import { db } from '@/plugins/firebase.js'

export default {
  props: {
    items: {
      type: Array,
      required: true
    },
    simple: {
      type: Boolean,
      default: false
    },
    sp: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    likeThis(it) {
      it.likes++
      ;(it.liked
        ? {
            [this.userInfo.uid]: false
          }
        : it.liked)[this.userInfo.uid] = true

      db.ref(`/contents/${it.time}/liked/${this.userInfo.uid}`).set(true)

      this.updateLibris(this.userInfo.uid, 0.1)
      this.updateLibris(it.uid, 0.1)
    }
  }
}
</script>

<style scoped>
.row {
  margin-top: 5px;
  gap: 3px;
  margin: 5px;
}
</style>
