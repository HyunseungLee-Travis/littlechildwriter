export default {
  loading: {
    color: 'dodgerblue',
    height: '1px'
  },

  head: {
    titleTemplate: '%s | LCW',
    title: 'Little 작가',
    meta: [
      {
        hid: 'description',
        name: 'description',
        content:
          'Learn programming through learning, practicing, and building. Our site includes full courses of python, c, c++, and rust for free in both Korean and English language.'
      },
      {
        name: 'author',
        content: ['Hyunseung', 'Juha Im', 'Jinwon Kim']
      },
      {
        name: 'copyright',
        content: 'LCW'
      },
      {
        name: 'subtitle',
        content: '글을 올리고, 새롭게 배우고, 대화하기'
      },
      {
        name: 'subject',
        content: '글을 올리고, 새롭게 배우고, 대화하기'
      },
      {
        name: 'language',
        content: 'ES, KO-KR'
      }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico'
      },
      {
        rel: 'apple-touch-icon',
        href: '/favicon.ico'
      }
    ]
  },

  css: ['@/assets/css/global.css'],
  plugins: ['~/plugins/firebase', '~/plugins/global'],
  components: true,
  buildModules: ['@nuxtjs/vuetify'],
  modules: ['@nuxtjs/pwa'],
  target: 'static',

  pwa: {
    manifest: {
      short_name: 'LCW',
      name: 'Little Child Writer',
      icons: [
        {
          src: '/pwa/512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: '/pwa/256x256.png',
          sizes: '256x256',
          type: 'image/png'
        },
        {
          src: '/pwa/192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/pwa/144x144.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          src: '/pwa/96x96.png',
          sizes: '96x96',
          type: 'image/png'
        }
      ],
      screenshots: [
        {
          src: '/pwa/books.jpg',
          type: 'image/png',
          sizes: '1600x789'
        }
      ],
      start_url: '/',
      background_color: '#1B1B1D',
      display: 'standalone',
      display_override: ['fullscreen', 'minimal-ui'],
      scope: '/',
      theme_color: '#1B1B1D',
      description: 'Learn, Practice, Build and Deploy',
      categories: ['Education', 'Books', 'Library'],
      author: ['Hyunseung Lee', 'Juha Im', 'Jiwon Kim'],
      orientation: 'portrait',
      dir: 'ltr',
      lang: 'en-US'
    }
  },

  vuetify: {
    customVariables: ['~assets/sass/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: '#159ECB',
          secondary: '#b0bec5',
          info: '#2196F3',
          accent: '#293540',
          success: '#4CAF50',
          warning: '#FFC107',
          error: '#b71c1c'
        }
      }
    }
  },

  router: {
    base: '/'
  }
}
