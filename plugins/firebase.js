import firebase from 'firebase/compat/app'
import 'firebase/compat/database'
import 'firebase/compat/auth'

firebase.initializeApp({
  apiKey: 'AIzaSyDI6kfyE4xQlPqD7Dem3OxiI9lhA4IxQ-I',
  authDomain: 'littlechildwriter.firebaseapp.com',
  projectId: 'littlechildwriter',
  storageBucket: 'littlechildwriter.appspot.com',
  messagingSenderId: '986081147205',
  appId: '1:986081147205:web:fadaee26490f1f173d662c',
  measurementId: 'G-F7Z7BLCQDQ'
})

const db = firebase.database()
const auth = firebase.auth()
const login = firebase.auth

export { db, auth, login }
