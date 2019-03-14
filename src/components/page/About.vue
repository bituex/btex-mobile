<template>
  <div id="master">
    <div class="page" :class="theme === 'light' ? 'light' : 'dark'">
      <div class="about-top">
        <div class="logo">
          <img v-if="theme === 'dark'" src="/btex_website/static/logo.png"/>
          <img v-if="theme === 'light'" src="/btex_website/static/logo_light.png"/>
        </div>
        <div class="intro">
          {{$t("message.btex_intro")}}
        </div>
      </div>
      <div class="about-fotter">
        <p class="version">{{$t("message.version_current")}}：1.0.0</p>
        <p class="slogan-cn">全新一代EOS去中心化交易所</p>
        <p class="slogan-en">New Generation Decentralization Exchange on EOS</p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'About',
    methods: {},
    computed: {
      theme () {
        return this.$store.state.theme;
      }
    },
    created() {
      // 设置标题
      // document.title = this.$t('message.about_us');
    }
  };
</script>

<style lang="scss" scoped>
  .page.dark{
    background-color: #1F3547;
    min-height: 100vh;
    .about-top {
      padding-top: 20px;
      .logo {
        text-align: center;
        padding: 30px;
        img {
          width: 140px;
          margin: 0 auto;
        }
      }
      .intro {
        font-size: 0.75rem;
        color: #FFFFFF;
        padding: 0px 50px;
        text-align: justify;
      }
    }

    .about-fotter {
      position: fixed;
      bottom: 0px;
      width: 100%;
      color: #FFFFFF;
      text-align: center;
      .version {
        font-size: 1rem;
      }
      .slogan-cn {
        font-size: 0.875rem;
        margin-top: 20px;
      }
      .slogan-en {
        font-size: 0.625rem;
        margin-bottom: 20px;
      }
    }
  }
  .page.light{
    .about-top {
      padding-top: 20px;
      .logo {
        text-align: center;
        padding: 30px;
        img {
          width: 140px;
          margin: 0 auto;
        }
      }
      .intro {
        font-size: 0.75rem;
        color: #262626;
        padding: 0px 50px;
        text-align: justify;
      }
    }

    .about-fotter {
      position: fixed;
      bottom: 0px;
      width: 100%;
      color: #262626;
      text-align: center;
      .version {
        font-size: 1rem;
      }
      .slogan-cn {
        font-size: 0.875rem;
        margin-top: 20px;
      }
      .slogan-en {
        font-size: 0.625rem;
        margin-bottom: 20px;
      }
    }
  }
</style>
