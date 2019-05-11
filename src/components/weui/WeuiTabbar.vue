<template>
  <div class="weui-tabbar">
    <router-link to = "/home" class = "weui-tabbar__item" active-class = "weui-bar__item_on">
      <span style="display: inline-block;position: relative;">
          <img src="./custom_img/icon_home_on.png" v-if="currentSelect=='home'" alt="" class="weui-tabbar__icon">
          <img src="./custom_img/icon_home.png" v-else alt="" class="weui-tabbar__icon">
          <!--<span class="weui-badge" style="position: absolute;top: -2px;right: -13px;">8</span>-->
      </span>
      <p class="weui-tabbar__label">{{$t("message.home")}}</p>
    </router-link>
    <router-link to = "/market" class = "weui-tabbar__item" active-class = "weui-bar__item_on">
      <img src="./custom_img/icon_market_on.png" v-if="currentSelect=='market'" alt="" class="weui-tabbar__icon">
      <img src="./custom_img/icon_market.png" v-else alt="" class="weui-tabbar__icon">
      <p class="weui-tabbar__label">{{$t("message.market")}}</p>
    </router-link>
    <router-link :to = "tradeUrl" class = "weui-tabbar__item" active-class = "weui-bar__item_on" :class="{'weui-bar__item_on': currentSelect=='trade'}">
      <span style="display: inline-block;position: relative;">
          <img src="./custom_img/icon_trade_on.png" v-if="currentSelect=='trade'" alt="" class="weui-tabbar__icon">
          <img src="./custom_img/icon_trade.png" v-else alt="" class="weui-tabbar__icon">
          <!--<span class="weui-badge weui-badge_dot" style="position: absolute;top: 0;right: -6px;"></span>-->
      </span>
      <p class="weui-tabbar__label">{{$t("message.exchange")}}</p>
    </router-link>
    <a href= "http://bituex.rajasoft.cn/m/" class = "weui-tabbar__item" active-class = "weui-bar__item_on">
      <span style="display: inline-block;position: relative;">
          <img src="./custom_img/icon_fiat_on.png" v-if="currentSelect=='invest'" alt="" class="weui-tabbar__icon">
          <img src="./custom_img/icon_fiat.png" v-else alt="" class="weui-tabbar__icon">
      </span>
      <p class="weui-tabbar__label">{{$t("message.fiat")}}</p>
    </a>
    <router-link to = "/my" class = "weui-tabbar__item" active-class = "weui-bar__item_on">
      <img src="./custom_img/icon_my_on.png" v-if="currentSelect=='my'" alt="" class="weui-tabbar__icon">
      <img src="./custom_img/icon_my.png" v-else alt="" class="weui-tabbar__icon">
      <p class="weui-tabbar__label">{{$t("message.my")}}</p>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'WeuiTabbar',
  data: function () {
    return {
      currentSelect: '',
      tradeUrl: '/trade'
    };
  },
  props: ['tabCurrent'],
  methods: {
  },
  watch: {
    $route(to, from) {
      var path = to.path;
      if (path.indexOf('/market') !== -1) {
        this.currentSelect = 'market';
      } else if (path.indexOf('/trade') !== -1) {
        this.tradeUrl = path;
        this.currentSelect = 'trade';
      } else if (path.indexOf('/my') !== -1) {
        this.currentSelect = 'my';
      } else {
        this.currentSelect = 'home';
      }
    }
  },
  created() {
    this.currentSelect = this.tabCurrent;
    let currencyId = window.localStorage.getItem('currencyId');
    if (currencyId) {
      this.tradeUrl = '/trade/' + currencyId;
    }
  }
};
</script>

<style scoped>

</style>
