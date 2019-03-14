<template>
  <div id="master" :class="theme === 'light' ? 'light' : 'dark'">
    <div class="page" >
      <div class="weui-cells" style="margin-top: 0px">
        <!--<router-link to="/upcoin" class="weui-cell weui-cell_access">-->
          <!--<div class="weui-cell__bd">-->
            <!--<p>{{$t("message.up_coin")}}</p>-->
          <!--</div>-->
          <!--<div class="weui-cell__ft">-->
          <!--</div>-->
        <!--</router-link>-->
        <!--<router-link to="/coinlist" class="weui-cell weui-cell_access">-->
          <!--<div class="weui-cell__bd">-->
            <!--<p>{{$t("message.service_coin")}}</p>-->
          <!--</div>-->
          <!--<div class="weui-cell__ft">-->
          <!--</div>-->
        <!--</router-link>-->
        <!--<router-link to="/coincost" class="weui-cell weui-cell_access" href="javascript:;">-->
          <!--<div class="weui-cell__bd">-->
            <!--<p>{{$t("message.cost_of_carry")}}</p>-->
          <!--</div>-->
          <!--<div class="weui-cell__ft">-->
          <!--</div>-->
        <!--</router-link>-->
        <a class="weui-cell weui-cell_access" @click="changeLang" href="javascript:;">
          <div class="weui-cell__bd">
            <p>{{$t("message.change_lang")}}</p>
          </div>
          <div class="weui-cell__ft">
          </div>
        </a>
        <a class="weui-cell weui-cell_access" href="https://btexorg.zendesk.com/hc/zh-cn/requests/new">
          <div class="weui-cell__bd">
            <p>{{$t("message.work_order")}}</p>
          </div>
          <div class="weui-cell__ft">
          </div>
        </a>
        <a class="weui-cell weui-cell_access" href="https://btexorg.zendesk.com/hc">
          <div class="weui-cell__bd">
            <p>{{$t("message.helper")}}</p>
          </div>
          <div class="weui-cell__ft">
          </div>
        </a>
        <router-link to="/about" class="weui-cell weui-cell_access">
          <div class="weui-cell__bd">
            <p>{{$t("message.about_us")}}</p>
          </div>
          <div class="weui-cell__ft">
          </div>
        </router-link>

        <div class="theme">
          <div class="key">
            <p>{{$t("message.dark_theme")}}</p>
          </div>
          <div class="right">
            <input class="weui-switch" v-model="setTheme" type="checkbox">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Setting',
    data() {
      return {
        setTheme: false
      };
    },
    methods: {
      changeLang() {
        var that = this;
        this.weui.actionSheet([
          {
            label: '中文',
            onClick: function () {
              that.$i18n.locale = 'CN';
              window.lang = 'CN';
              that.$store.dispatch('setLang', 'zh');
            }
          }, {
            label: 'English',
            onClick: function () {
              that.$i18n.locale = 'EN';
              window.lang = 'CN';
              that.$store.dispatch('setLang', 'en');
            }
          }
        ], [
          {
            label: that.$t('message.cancel'),
            onClick: function () {
              console.log('cancel');
            }
          }
        ], {
          onClose: function() {
            console.log('close');
          }
        });
        // this.weui.picker([{
        //     label: '中文',
        //     value: 'cn'
        //   }, {
        //     label: 'English',
        //     value: 'en'
        //   }], {
        //     onChange: function (result) {
        //       console.log(result[0].value);
        //     },
        //     onConfirm: function (result) {
        //       console.log(result[0].value);
        //       if (result[0].value === 'cn') {
        //         that.$i18n.locale = 'CN';
        //       } else if (result[0].value === 'en') {
        //         that.$i18n.locale = 'EN';
        //       } else {
        //         that.$i18n.locale = 'EN';
        //       }
        //     }
        //   }
        // );
      }
    },
    computed: {
      theme () {
        return this.$store.state.theme;
      }
    },
    watch: {
      setTheme: function (newVal) {
        if (newVal) {
          this.$store.dispatch('setTheme', 'dark');
          window.localStorage.setItem('theme', 'dark');
        } else {
          this.$store.dispatch('setTheme', 'light');
          window.localStorage.setItem('theme', 'light');
        }
      }
    },
    created() {
      if (this.$store.state.theme === 'dark') {
        this.setTheme = true;
      } else {
        this.setTheme = false;
      }
    }
  };
</script>

<style scoped>
  .dark{
    background-color: #2a4862;
    min-height: 100vh;
  }
  .dark .theme{
      color: #ffffff;
      border-top: 10px solid #1F3547;
      border-bottom: 10px solid #1F3547;
  }
  .light .theme{
    color: #000000;
    border-top: 10px solid #f8f8f8;
    border-bottom: 10px solid #f8f8f8;
  }
  .theme{
    display: flex;
    justify-content: space-between;
    padding: 10px 15px;
  }
</style>
