<template>
    <div class="page">
      <div class="market">
        <div class="tabs">
          <div class="group">
            <div class="group-item" :class="{'on': groupCurrent==10001}" @click="changeGroup(10001)">
              {{$t("message.favorite")}}
            </div>
            <div class="group-item" v-for="(baseToken, index) in basetokens" :key="index" :class="{'on': groupCurrent==(baseToken.id+20000)}" @click="changeGroup(baseToken.id+20000)">
              {{baseToken.sym_name}}
            </div>
            <div class="group-item" v-for="(group, index) in coinGroups" :key="index" :class="{'on': groupCurrent==group.id}" @click="changeGroup(group.id)">
              {{group.name}}
            </div>
            <div class="group-item" :class="{'on': groupCurrent==10000}" @click="changeGroup(10000)">
              {{$t("message.a_little")}}
            </div>
          </div>
          <div class="search">
            <div class="search-btn" @click="searchAction"><img src="../../assets/img/search.png"></div>
          </div>
        </div>
        <div class="sort">
          <div class="pair" @click="sortAction('volume')">
            {{$t("message.trading_volume")}}
            <span class="caret-wrapper" :class="{ 'up': sortAsc && sortField == 'volume', 'down': !sortAsc && sortField == 'volume' }"><i class="sort-caret ascending"></i><i class="sort-caret descending"></i></span>
          </div>
          <div class="price" @click="sortAction('price')">
            {{$t("message.new_price")}}
            <span class="caret-wrapper" :class="{ 'up': sortAsc && sortField == 'price', 'down': !sortAsc && sortField == 'price' }"><i class="sort-caret ascending"></i><i class="sort-caret descending"></i></span>
          </div>
          <div class="increase" @click="sortAction('increase')">
            {{$t("message.increase")}}
            <span class="caret-wrapper" :class="{ 'up': sortAsc && sortField == 'increase', 'down': !sortAsc && sortField == 'increase' }"><i class="sort-caret ascending"></i><i class="sort-caret descending"></i></span>
          </div>
        </div>
        <div class="coins" v-if="!loading">
          <div class="coin" v-for="(item, index) in coinInfoShow" :key="index" @click="toMarketChart(item.currencyId)">
            <div class="pair">
              <img v-if="item.icon" class="logo" :src="''+item.icon"/>
              <img v-else class="logo" src="../../assets/img/eosio_EOS.png"/>
              <p class="coin-name">
                {{item.asset_symbol}}/{{getBaseToken(item.base_id)}}
                <span class="start-icons">
                  <img src="../../assets/img/start.png" v-for="(num, index) in item.grade" :key="index" :alt="num" />
                </span>
              </p>
              <p class="volume">{{$t("message.volume24")}} {{formatNum(item.volume)}}</p>
            </div>
            <div class="price">
              <p class="price-eos">{{item.newPrice}}</p>
              <p class="price-cny">≈¥{{computedPrice(item.newPrice, item.base_id)}}</p>
            </div>
            <div class="increase">
              <p class="increase-value" :style="getColor(item.change)">{{item.change === null ? ('0.00 %') :
                (item.change+'%')}}</p>
            </div>
          </div>
        </div>
        <div style="font-size: 0.875rem;text-align: center;color: #878787; padding: 10px 0px;" v-if="coinInfoShow.length == 0">{{$t("message.no_coin")}}</div>
        <loading v-if="loading" />
      </div>
    </div>
</template>

<script>
import Enumerable from 'linq';
import EOSUtil from '../../common/EosUtils';
import {mapState} from 'vuex';
export default {
  name: 'Market',
  data () {
    return {
      timeIntever: null,
      // 页面数据
      // tabCurrent: 'market',
      account: null,
      groupCurrent: 10001,
      coinInfo: [],
      coinInfoShow: [],
      coinSelf: [],
      coinGroups: [],
      loading: false,
      sortAsc: false,
      sortField: ''
    };
  },
  components: {
    // WeuiTabbar
  },
  computed: mapState({
    identity: state => state.identity,
    contractCoins: state => state.contractCoins,
    serverCoins: state => state.serverCoins,
    basetokens: state => state.basetokens
  }),
  watch: {
    identity: function (newIdentity) {
      if (newIdentity) {
        // console.log(newIdentity);
        let account = newIdentity.accounts.find(x => x.blockchain === 'eos');
        this.account = account;
        // 获取账号详情
        this.getFavoriteCoins();
      }
    },
    coinInfo: function(newCoinInfo) {
      if (newCoinInfo) {
        this.handleFind();
        this.sortDoing();
      }
    },
    groupCurrent: function (newGroup) {
      if (newGroup !== '') {
        this.handleFind();
      } else {
        this.coinInfoShow = this.coinInfo;
      }
    },
    contractCoins: function (newCoin) {
      if (newCoin && this.serverCoins) {
        this.mergeData(newCoin, this.serverCoins);
      }
    },
    serverCoins: function (newCoin) {
      if (newCoin && this.contractCoins) {
        this.mergeData(this.contractCoins, newCoin);
      }
    },
    basetokens: function (newBase) {
      let groupCurrent = window.localStorage.getItem('groupId');
      if (groupCurrent) {
        this.groupCurrent = parseInt(groupCurrent);
      } else {
        this.groupCurrent = newBase[0].id + 20000;
      }
    },
    coinSelf: function (newSelf) {
      this.handleFind();
    }
  },
  methods: {
    sortAction(field) {
      this.sortField = field;
      this.sortAsc = !this.sortAsc;
      this.sortDoing();
    },
    sortDoing() {
      var field = this.sortField;
      if (field === 'volume') {
        if (this.sortAsc) {
          this.coinInfoShow = Enumerable.from(this.coinInfoShow).orderBy('x=>x.volume').toArray();
        } else {
          this.coinInfoShow = Enumerable.from(this.coinInfoShow).orderByDescending('x=>x.volume').toArray();
        }
      } else if (field === 'price') {
        if (this.sortAsc) {
          this.coinInfoShow = Enumerable.from(this.coinInfoShow).orderBy('x=>x.newPrice').toArray();
        } else {
          this.coinInfoShow = Enumerable.from(this.coinInfoShow).orderByDescending('x=>x.newPrice').toArray();
        }
      } else if (field === 'increase') {
        if (this.sortAsc) {
          this.coinInfoShow = Enumerable.from(this.coinInfoShow).orderBy('x=>x.change').toArray();
        } else {
          this.coinInfoShow = Enumerable.from(this.coinInfoShow).orderByDescending('x=>x.change').toArray();
        }
      } else {
      }
    },
    searchAction() {
      this.$router.push('/market/search');
    },
    toMarketChart(id) {
      this.$router.push('/market/chart/' + id);
    },
    getColor(change) {
      let newClass;
      if (parseFloat(change) < 0) {
        newClass = 'background: #F87070';
      } else if (parseFloat(change) > 0) {
        newClass = 'background: #14BC63';
      } else {
        newClass = 'background: #818181';
      }
      return newClass;
    },
    formatNum(num) {
      return this.selfUtil.formatNnum(num);
    },
    computedPrice(num, baseId) {
      let baseSym = this.getBaseToken(baseId);
      if (baseSym !== '') {
        if (baseSym === 'EOS') {
          let eosPrice = parseFloat(window.btex.eos_market_price) * parseFloat(window.btex.us_dollar_exchange_rate);
          let sum = parseFloat(num) * eosPrice;
          sum = sum.toFixed(4);
          return sum;
        } else if (baseSym === 'USDT') {
          let usdtPrice = parseFloat(window.btex.usdt_market_price) * parseFloat(window.btex.us_dollar_exchange_rate);
          let sum = parseFloat(num) * usdtPrice;
          sum = sum.toFixed(4);
          return sum;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    },
    changeGroup(groupName) {
      this.groupCurrent = groupName;
      window.localStorage.setItem('groupId', groupName);
    },
    getCoins() {
      var that = this;
      var p1 = new Promise(function (resolve, reject) {
        var params = {'scope': 'btexexchange', 'code': 'btexexchange', 'table': 'tokenpairs', 'json': 'true', 'limit': 200, 'lower_bound': 0};
        EOSUtil.getTableRows(params, [], function (rows) {
          var coins = [];
          for (var i = 0; i < rows.length; i++) {
            let params = {};
            params.asset_symbol = rows[i].sym_name;
            params.asset_precision = rows[i].precision;
            params.newPrice = parseFloat(rows[i].price).toFixed(6);
            params.startPrice = parseFloat(rows[i].open_price).toFixed(6);
            params.highPrice = 0;
            params.lowPrice = 0;
            params.volume = 0;
            params.currencyId = rows[i].id;
            params.contractName = rows[i].contract;
            params.volumePrice = 0;
            params.st = false;
            params.group_id = 0;
            params.creator = rows[i].creator;
            params.pledge = rows[i].pledge;
            params.base_id = rows[i].base_id;
            if ((parseFloat(params.newPrice) === 0 || parseFloat(params.startPrice) === 0)) {
              params.change = 0;
            } else {
              params.change = parseFloat((parseFloat(params.newPrice) - parseFloat(params.startPrice)) / params.startPrice * 100).toFixed(2);
            }
            coins.push(params);
          }
          resolve(coins);
        });
      });
      var p2 = new Promise(function (resolve, reject) {
        that.selfUtil.apiAxios('POST', that.selfUtil.host + '/service/api/currencies', {'params': {}}, res => {
          // console.log(res);
          if (res.result.error === 0) {
            // 获取成功， 拼接，链上数据
            resolve(res.result.records);
          }
        });
      });
      Promise.all([p1, p2]).then(function (results) {
        // 分析获取  对应的人民币价格
        that.$store.dispatch('setContractCoins', results[0]);
        that.$store.dispatch('setServerCoins', results[1]);
        that.mergeData(results[0], results[1]);
        that.loading = false;
      }).catch(err => {
        this.$message({
          type: 'error',
          text: err,
          duration: 3000
        });
      });
    },
    mergeData(coinInfo, coinServer) {
      // 合并总数据
      for (var i = 0; i < coinInfo.length; i++) {
        let queryResult = Enumerable.from(coinServer)
          .where(function (x) { return x.currency_id === coinInfo[i].currencyId; })
          .toArray();
        if (queryResult.length > 0) {
          coinInfo[i].highPrice = queryResult[0].hight_price;
          coinInfo[i].lowPrice = queryResult[0].lower_price;
          coinInfo[i].volume = parseFloat(queryResult[0].volume);
          coinInfo[i].volumePrice = parseFloat(queryResult[0].turnover);
          let change = parseFloat(coinInfo[i].change);
          if (change > 999) {
            coinInfo[i].change = 999;
          } else if (change < -999) {
            coinInfo[i].change = -999;
          } else {
            coinInfo[i].change = change;
          }
          coinInfo[i].group_id = queryResult[0].group_id;
          coinInfo[i].st = queryResult[0].st;
          if (queryResult[0].sort) {
            coinInfo[i].sort = parseInt(queryResult[0].sort);
          } else {
            coinInfo[i].sort = 0;
          }
          if (queryResult[0].grade) {
            coinInfo[i].grade = parseInt(queryResult[0].grade);
          } else {
            coinInfo[i].grade = 0;
          }
          coinInfo[i].tradable = queryResult[0].tradable;
          coinInfo[i].icon = queryResult[0].icon;
        }
      }
      let showList = Enumerable.from(coinInfo).where(function (x) {
        return x.tradable;
      }).orderBy('x=>x.currencyId').orderByDescending('x=>x.volumePrice').orderByDescending('x=>x.sort').toArray();
      this.coinInfo = showList;
      // console.log(this.coinInfo);
    },
    // 获取币种分组
    getCoinGroup() {
      let that = this;
      this.selfUtil.apiAxios('POST', this.selfUtil.host + '/service/api/currency/groups', {'params': {}}, res => {
        // console.log(res);
        if (res.result.error === 0) {
          that.coinGroups = res.result.records;
        }
      });
    },
    handleFind() {
      let coinInfo = this.coinInfo;
      let key = this.groupCurrent;
      let selectCoins = Enumerable.from(coinInfo);
      if (parseInt(key) === 0) {
        // 全部
        this.coinInfoShow = coinInfo;
      } else if (parseInt(key) === 10000) {
        this.coinInfoShow = selectCoins.where(function (x) {
          return x.st;
        }).toArray();
      } else if (parseInt(key) === 10001) {
        // 自选
        let currencyIds = '';
        let coinSelf = this.coinSelf;
        for (let i = 0; i < coinSelf.length; i++) {
          currencyIds += coinSelf[i].currency_id;
        }
        this.coinInfoShow = selectCoins.where(function (x) {
          return currencyIds.indexOf(x.currencyId) !== -1;
        }).toArray();
      } else if (parseInt(key) >= 20000) {
        // 币种分组
        this.coinInfoShow = selectCoins.where(function (x) {
          return x.base_id + 20000 === parseInt(key);
        }).toArray();
      } else {
        // 分组
        this.coinInfoShow = selectCoins.where(function (x) {
          return x.group_id === parseInt(key);
        }).toArray();
      }
    },
    // 获取自选币种
    getFavoriteCoins() {
      var that = this;
      let accountName = this.account.name;
      that.selfUtil.apiAxios('POST', that.selfUtil.host + '/service/api/currency/favorites', {'params': {account_name: accountName}}, res => {
        // console.log(res);
        if (res.result.error === 0) {
          // 获取成功， 拼接，链上数据
          that.coinSelf = res.result.records;
        }
      });
    },
    getBaseToken(baseId) {
      if (this.basetokens) {
        let queryResult = Enumerable.from(this.basetokens)
          .where(function (x) {
            return x.id === baseId;
          })
          .toArray();
        return queryResult[0].sym_name;
      } else {
        return '';
      }
    }
  },
  created() {
    // 设置标题
    // document.title = this.$t('message.market');
    // 获取币种分组
    this.getCoinGroup();
    // 获取币种
    if (this.contractCoins && this.serverCoins) {
      this.mergeData(this.contractCoins, this.serverCoins);
    } else {
      this.loading = true;
      this.getCoins();
    }
    if (this.identity) {
      let account = this.identity.accounts.find(x => x.blockchain === 'eos');
      this.account = account;
      // 获取账号详情
      this.getFavoriteCoins();
    }
    if (this.basetokens) {
      let groupCurrent = window.localStorage.getItem('groupId');
      if (groupCurrent) {
        this.groupCurrent = parseInt(groupCurrent);
      } else {
        this.groupCurrent = this.basetokens[0].id + 20000;
      }
    }
    let that = this;
    this.timeIntever = setInterval(function () {
      that.getCoins();
    }, 5000);
  },
  beforeDestroy() {
    window.clearInterval(this.timeIntever);
  }
};
</script>

<style lang="scss" scoped>
  .market{
    position: relative;
    overflow: auto;
    padding-bottom: 50px;
    display: flex;
    flex-direction: column;
    padding-top: 78px;
    /*height: calc(100vh - 50px);*/
    .tabs{
      display: flex;
      padding: 0px 15px;
      background-color: #1F3547;
      height: 44px;
      position: fixed;
      top: 0px;
      width: 100%;
      max-width: 768px;
      box-sizing: border-box;
      z-index: 100;
      .group{
        flex: 1;
        display: block;
        overflow-x: auto;
        white-space: nowrap;
        padding: 8px 0px;
        .group-item{
          font-size: 0.875rem;
          color: #FFFFFF;
          margin-right: 15px;
          box-sizing: border-box;
          text-align: center;
          display: inline-block;
        }
        .group-item.on{
          color: #F9AA44;
          border-bottom: 2px solid #F9AA44;
        }
      }
      .search{
        width: 40px;
        text-align: right;
        .search-btn{
          float: right;
          padding: 12px 10px;
          cursor: pointer;
          img{
            width: 16px;
          }
        }
      }
    }
    .sort{
      display: flex;
      padding: 0px 15px 0px 15px;
      font-size: 0.875rem;
      color: #878787;
      height: 34px;
      background-color: #1F3547;
      position: fixed;
      top: 44px;
      width: 100%;
      box-sizing: border-box;
      z-index: 100;
      .pair{
        flex: 2;
      }
      .price {
        flex: 1.2;
      }
      .increase{
        flex: 1;
        text-align: center;
      }
      .caret-wrapper{
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        height: 34px;
        width: 14px;
        vertical-align: middle;
        cursor: pointer;
        overflow: initial;
        position: relative;
        .sort-caret {
          width: 0;
          height: 0;
          border: 5px solid transparent;
          position: absolute;
          left: 2px;
        }
        .ascending {
          border-bottom-color: #878787;
          top: 5px;
        }
        .descending {
          /*border-top-color: #278eda;*/
          border-top-color: #878787;
          bottom: 7px;
        }
      }
      .caret-wrapper.up{
        .ascending {
          border-bottom-color: #278eda;
        }
      }
      .caret-wrapper.down{
        .descending {
          border-top-color: #278eda;
        }
      }
    }
    .coins {
      padding: 5px 15px;
      background-color: #1F3547;
      /*height: calc(100% - 45px);*/
      overflow: auto;
      .coin{
        margin-bottom: 15px;
        display: flex;
        .pair{
          flex: 2;
          position: relative;
          padding-left: 40px;
          .logo{
            width: 32px;
            position: absolute;
            left: 0px;
            top: 3px;
            border-radius: 16px;
            background: #fff;
          }
          .coin-name{
            font-size: 1rem;
            color: #FFFFFF;
            .start-icons{
              padding-left: 0px;
              img{
                width: 8px;
                height: 8px;
                margin-right: 1px;
                vertical-align: middle;
              }
            }
          }
          .volume{
            font-size: 0.75rem;
            color: #818181;
          }
        }
        .price{
          flex: 1;
          padding-top: 2px;
          .price-eos{
            font-size: 0.875rem;
            color: #14BC63;
          }
          .price-cny{
            font-size: 0.75rem;
            color: #818181;
          }
        }
        .increase{
          flex: 1;
          padding: 7.2px 0px;
          .increase-value{
            background: #5AB36D;
            border-radius: 6px;
            font-size: 0.875rem;
            color: #FFFFFF;
            text-align: center;
            padding: 4px 0px;
          }
        }
      }
    }
  }
</style>
