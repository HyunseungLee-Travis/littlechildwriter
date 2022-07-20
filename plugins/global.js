import Vue from 'vue'
import { auth, db } from '@/plugins/firebase'

Vue.mixin({
  data: () => ({
    userInfo: {
      displayName: '',
      photoURL: '',
      uid: '',
      email: ''
    }
  }),
  created() {
    this.getUserInfo()
  },
  methods: {
    updateLibris(uid, val) {
      db.ref(`users/${uid}/libris`).transaction((cv) => cv + val)
    },
    getUserInfo() {
      auth.onAuthStateChanged((u) => {
        if (u) {
          const { displayName, photoURL, uid, email } = u

          this.userInfo = {
            displayName,
            photoURL,
            email,
            uid
          }
        }
      })
    },
    notify(title, link) {
      const time = new Date().toLocaleDateString()

      db.ref(`users/${this.uid}/notification`).push({
        title,
        time,
        link,
        photoURL: this.userInfo.photoURL
      })
    }
  }
})
