<template>
  <v-dialog v-model="dialog" width="500">
    <template #activator="{ on, attrs }">
      <v-btn
        color="red lighten-2"
        v-bind="attrs"
        @click="dialog = true"
        v-on="on"
      >
        <v-icon left> mdi-{{ icon }} </v-icon>
        {{ btnTitle }}
      </v-btn>
    </template>

    <v-card>
      <v-card-title v-text="title" />
      <v-card-text v-text="text" />

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" text @click="cb"> 👌 OK </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    cb: {
      type: Function,
      required: true
    },
    btnTitle: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      dialog: false
    }
  }
}
</script>
