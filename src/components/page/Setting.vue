<template>
  <div id="master">
    <div class="page">
      <div class="weui-cells">
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
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Setting',
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
    created() {
      // 设置标题
      // document.title = this.$t('message.setting');
    }
  };
</script>

<style scoped>

</style>
