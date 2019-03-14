import Vue from 'vue';
import Vuex from 'vuex';
import util from '../common/utils';

Vue.use(Vuex);

const state = {
  scatter: null,
  identity: null,
  basetokens: null,
  contractCoins: null,
  serverCoins: null,
  costCoins: null,
  blances: null,
  banners: null,
  notices: null,
  lang: null,
  theme: 'light'
};
const mutations = {
  changeIdentity(state, identity) {
    state.identity = identity;
  },
  changeSactter(state, scatter) {
    state.scatter = scatter;
  },
  changeBaseTokens(state, basetokens) {
    state.basetokens = basetokens;
  },
  changeContractCoins(state, coins) {
    state.contractCoins = coins;
  },
  changeServerCoins(state, coins) {
    state.serverCoins = coins;
  },
  changeCostCoins(state, coins) {
    state.costCoins = coins;
  },
  changeBlances(state, blances) {
    state.blances = blances;
  },
  changeBanners(state, banners) {
    state.banners = banners;
  },
  changeNotices(state, notices) {
    state.notices = notices;
  },
  changeLang(state, lang) {
    state.lang = lang;
  },
  changeTheme(state, theme) {
    state.theme = theme;
  }
};
const actions = {
  loginAsync(context) {
    return new Promise((resolve, reject) => {
      context.state.scatter.getIdentity({
        accounts: [util.network]
      }).then(identity => {
        // let account = identity.accounts.find(x => x.blockchain === 'eos');
        context.commit('changeIdentity', identity);
        resolve();
      }).catch(error => {
        reject(error);
      });
    });
  },
  setScatter(context, scatter) {
    context.commit('changeSactter', scatter);
  },
  setBaseToken(context, basetokens) {
    context.commit('changeBaseTokens', basetokens);
  },
  setContractCoins(context, coins) {
    context.commit('changeContractCoins', coins);
  },
  setServerCoins(context, coins) {
    context.commit('changeServerCoins', coins);
  },
  setCostCoins(context, coins) {
    context.commit('changeCostCoins', coins);
  },
  setBlances(context, blances) {
    context.commit('changeBlances', blances);
  },
  setBanners(context, banners) {
    context.commit('changeBanners', banners);
  },
  setNotices(context, notices) {
    context.commit('changeNotices', notices);
  },
  setLang(context, lang) {
    context.commit('changeLang', lang);
  },
  setTheme(context, theme) {
    context.commit('changeTheme', theme);
  }
};

// getters are functions
const getters = {
  identity: state => state.identity,
  scatter: state => state.scatter,
  contractCoins: state => state.contractCoins,
  serverCoins: state => state.serverCoins,
  costCoins: state => state.costCoins,
  blances: state => state.blances,
  basetokens: state => state.basetokens
};

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
});
