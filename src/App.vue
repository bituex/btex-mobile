<template>
  <div id="app">
      <router-view/>
  </div>
</template>

<script>
import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import util from './common/utils';
import EosUtil from './common/EosUtils';
ScatterJS.plugins(new ScatterEOS());
export default {
  name: 'App',
  created () {
    // 设置用户的语言
    console.log(util.getUrlParam('locale'));
    let lang = util.getUrlParam('locale') || navigator.language || navigator.userLanguage;
    lang = lang.substr(0, 2);
    this.$store.dispatch('setLang', lang);
    if (lang === 'zh') {
      this.$i18n.locale = 'CN';
      window.lang = 'CN';
    } else if (lang === 'en') {
      this.$i18n.locale = 'EN';
      window.lang = 'EN';
    } else {
      this.$i18n.locale = 'EN';
      window.lang = 'EN';
    }
    // 设置默认节点
    let dbNode = window.btex.node_configs[0];
    let network = {
      protocol: dbNode.protocol, // Defaults to https
      blockchain: 'eos',
      host: dbNode.host,
      port: dbNode.port,
      chainId: dbNode.chain_id
    };
    util.network = network;
    util.httpEndpoint = network.protocol + '://' + network.host + ':' + network.port;
    // 获取基础交易币种
    let that = this;
    var params = {'scope': 'btexexchange', 'code': 'btexexchange', 'table': 'basetokens', 'json': 'true', 'limit': -1};
    EosUtil.getTableRow(params, function (rows) {
      if (rows && rows.length > 0) {
        that.$store.dispatch('setBaseToken', rows);
      }
    });
    // var that = this;
    ScatterJS.scatter.connect('BTEX').then(connected => {
      if (!connected) {
        // this.weui.alert('User does not have Scatter installed/unlocked.', {
        //   buttons: [{
        //     label: that.$t('message.confirm'),
        //     type: 'primary'
        //   }]
        // });
        this.$message({
          type: 'error',
          text: 'User does not have Scatter installed/unlocked.',
          duration: 3000
        });
        return false;
      } else {
        let scatter = ScatterJS.scatter;
        this.$store.dispatch('setScatter', scatter);
        window.ScatterJS = null;
        this.$store.dispatch('loginAsync').then(() => {
          // console.log('登录成功');
        }).catch(error => {
          this.$message({
            type: 'error',
            text: JSON.stringify(error.message),
            duration: 3000
          });
        });
      }
    });
  },
  methods: {
  }
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
  max-width: 768px;
  margin: 0 auto;
  overflow: auto;
}
</style>
