// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill';
import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import VueI18n from 'vue-i18n';
import 'weui/dist/style/weui.css';
import './assets/weui_custom.css';
import './assets/mobile.css';
import weui from 'weui.js';
import util from './common/utils';
import loading from './components/component/Loading';
import message from './components/component/message/index';
// import InfiniteScroll from 'vue-infinite-scroll';
Vue.prototype.selfUtil = util;
Vue.prototype.weui = weui;

Vue.use(VueI18n);
Vue.use(message);

const i18n = new VueI18n({
  locale: 'EN', // 语言标识
  messages: {
    'CN': require('./assets/lang/cn'), // 中文语言包
    'EN': require('./assets/lang/en') // 英文语言包
  }
});

Vue.config.productionTip = false;
Vue.component(loading.name, loading);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  router,
  store,
  components: { App },
  template: '<App/>'
});
