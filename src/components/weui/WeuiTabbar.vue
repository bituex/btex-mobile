<template>
  <div class="weui-tabbar">
    <a href="javascript:;" @click="selectAction('home')" class="weui-tabbar__item" :class="{'weui-bar__item_on': currentSelect=='home'}">
      <span style="display: inline-block;position: relative;">
          <img src="./custom_img/icon_home_on.png" v-if="currentSelect=='home'" alt="" class="weui-tabbar__icon">
          <img src="./custom_img/icon_home.png" v-else alt="" class="weui-tabbar__icon">
          <!--<span class="weui-badge" style="position: absolute;top: -2px;right: -13px;">8</span>-->
      </span>
      <p class="weui-tabbar__label">{{$t("message.home")}}</p>
    </a>
    <a href="javascript:;" @click="selectAction('market')" class="weui-tabbar__item" :class="{'weui-bar__item_on': currentSelect=='market'}">
      <img src="./custom_img/icon_market_on.png" v-if="currentSelect=='market'" alt="" class="weui-tabbar__icon">
      <img src="./custom_img/icon_market.png" v-else alt="" class="weui-tabbar__icon">
      <p class="weui-tabbar__label">{{$t("message.market")}}</p>
    </a>
    <a href="javascript:;" @click="selectAction('trade')" class="weui-tabbar__item" :class="{'weui-bar__item_on': currentSelect=='trade'}">
      <span style="display: inline-block;position: relative;">
          <img src="./custom_img/icon_trade_on.png" v-if="currentSelect=='trade'" alt="" class="weui-tabbar__icon">
          <img src="./custom_img/icon_trade.png" v-else alt="" class="weui-tabbar__icon">
          <!--<span class="weui-badge weui-badge_dot" style="position: absolute;top: 0;right: -6px;"></span>-->
      </span>
      <p class="weui-tabbar__label">{{$t("message.trade")}}</p>
    </a>
    <a href="javascript:;" @click.prevent="selectAction('invest')" class="weui-tabbar__item" :class="{'weui-bar__item_on': currentSelect=='invest'}">
      <span style="display: inline-block;position: relative;">
          <img src="./custom_img/icon_invest_on.png" v-if="currentSelect=='invest'" alt="" class="weui-tabbar__icon">
          <img src="./custom_img/icon_invest.png" v-else alt="" class="weui-tabbar__icon">
        <!--<span class="weui-badge weui-badge_dot" style="position: absolute;top: 0;right: -6px;"></span>-->
      </span>
      <p class="weui-tabbar__label">{{$t("message.bonus")}}</p>
    </a>
    <a href="javascript:;" @click.stop="selectAction('my')" class="weui-tabbar__item" :class="{'weui-bar__item_on': currentSelect=='my'}">
      <img src="./custom_img/icon_my_on.png" v-if="currentSelect=='my'" alt="" class="weui-tabbar__icon">
      <img src="./custom_img/icon_my.png" v-else alt="" class="weui-tabbar__icon">
      <p class="weui-tabbar__label">{{$t("message.my")}}</p>
    </a>
  </div>
</template>

<script>
export default {
  name: 'WeuiTabbar',
  data: function () {
    return {
      currentSelect: 'home'
    };
  },
  props: ['tabCurrent'],
  methods: {
    selectAction (key) {
      this.currentSelect = key;
      console.log(key);
      if (key === 'trade') {
        let currencyId = window.localStorage.getItem('currencyId');
        if (currencyId) {
          this.$router.replace('/' + key + '/' + currencyId);
        } else {
          this.$router.replace('/' + key);
        }
      } else {
        this.$router.replace('/' + key);
      }
    }
  },
  created() {
    this.currentSelect = this.tabCurrent;
  }
};
</script>

<style scoped>

</style>
