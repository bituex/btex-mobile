<template>
  <div class="page" :class="theme === 'light' ? 'light' : 'dark'">
    <div class="user-info">
      <div class="account-name">{{account.name}}</div>
      <div class="setting" @click="settingAction">
        <!--<i class="fa fa-cog"></i>-->
        <img v-if="theme === 'dark'" src="../../assets/img/setting.png"/>
        <img v-if="theme === 'light'" src="../../assets/img/setting_light.png"/>
      </div>
    </div>
    <div class="user">
      <div class="user-asset">
        <div class="account-total">
          <span>{{$t("message.total_valuation")}}（EOS）</span>
          <!--<span>EOS&nbsp;{{$t("message.blance")}}:1,1122.1222</span>-->
        </div>
        <div class="account-total-value">
          <span v-if="!loadingValuation">{{valuation}}</span>
          <i v-if="loadingValuation" class="weui-loading"></i>
        </div>
        <div class="account-data">
          <div class="current">
            <router-link to="/my/entrust">{{$t("message.current_entrust")}}</router-link>
          </div>
          <div class="history">
            <router-link to="/my/record">{{$t("message.history_deal")}}</router-link>
          </div>
          <div class="history">
            <router-link to="/coinlist">{{$t("message.service_coin")}}</router-link>
          </div>
        </div>
      </div>
    </div>
    <div class="assets">
      <div class="assets-title">
        <div class="actions">
          <label for="weuiAgree" class="weui-agree">
            <input id="weuiAgree" type="checkbox" v-model="hiddenZero" class="weui-agree__checkbox">
            <span class="weui-agree__text">
                {{$t('message.hidden_zero')}}
            </span>
          </label>
        </div>
        <div class="search">
          <input type="search" class="search-text" v-model="searchText" id="searchInput"
                 :placeholder="$t('message.search')" required="">
        </div>
      </div>
      <!--v-if="!loading"-->
      <div class="assets-list">
        <div class="asset" v-for="(item,index) in coinInfo" v-show="getShowState(item)" :key="index">
          <router-link :to="'/market/chart/'+item.currencyId">
            <div class="top">
              <div class="coin-name">{{item.asset_symbol}}</div>
              <div class="coin-blance">{{$t("message.blance")}}:{{item.blance}}</div>
            </div>
            <div class="bottom" v-if="item.asset_symbol !='EOS'">
              <div class="item">
                <div class="key">{{$t("message.cost")}}</div>
                <div class="value">{{item.cost_price}}</div>
              </div>
              <div class="item">
                <div class="key">{{$t("message.valuation")}}(EOS)</div>
                <div class="value">{{item.valuation}}</div>
              </div>
              <div class="item">
                <div class="key">{{$t("message.profit_loss")}}</div>
                <div class="value">{{computeProfitLoss(item)}}%</div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
      <loading v-if="loading"/>
    </div>
  </div>
</template>

<script>
  import Enumerable from 'linq';
  import EOSUtil from '../../common/EosUtils';
  import {mapState} from 'vuex';

  export default {
    name: 'My',
    data() {
      return {
        // 页面数据
        account: {name: ''},
        coinInfo: [],
        eosBlance: {},
        valuation: 0,
        hiddenZero: true,
        searchText: '',
        // tabCurrent: 'my',
        loading: false,
        loadingValuation: false
      };
    },
    components: {
      // WeuiTabbar
    },
    watch: {
      identity: function (newIdentity) {
        if (newIdentity) {
          let account = newIdentity.accounts.find(x => x.blockchain === 'eos');
          this.account = account;
          // 获取币种
          if (this.contractCoins && this.serverCoins && this.costCoins) {
            this.mergeData(this.contractCoins, this.serverCoins, this.costCoins);
          } else {
            this.getCoins();
          }
        }
      },
      contractCoins: function (newCoin) {
        if (newCoin && this.serverCoins && this.costCoins) {
          this.mergeData(newCoin, this.serverCoins, this.costCoins);
        }
      },
      serverCoins: function (newCoin) {
        if (newCoin && this.contractCoins && this.costCoins) {
          this.mergeData(this.contractCoins, newCoin, this.costCoins);
        }
      },
      costCoins: function (newCoin) {
        if (newCoin && this.contractCoins && this.serverCoins) {
          this.mergeData(this.contractCoins, this.serverCoins, newCoin);
        }
      }
    },
    computed: mapState({
      identity: state => state.identity,
      contractCoins: state => state.contractCoins,
      serverCoins: state => state.serverCoins,
      costCoins: state => state.costCoins,
      blances: state => state.blances,
      basetokens: state => state.basetokens,
      theme () {
        return this.$store.state.theme;
      }
    }),
    methods: {
      // 计算涨跌幅
      computeProfitLoss(item) {
        if (parseFloat(item.cost_price) > 0) {
          let num = (parseFloat(item.newPrice) - parseFloat(item.cost_price)) / parseFloat(item.cost_price) * 100;
          return parseFloat(num).toFixed(2);
        } else {
          return 0;
        }
      },
      settingAction() {
        this.$router.push('/setting');
      },
      getShowState(coin) {
        if (this.searchText !== '') {
          if (coin.asset_symbol.indexOf(this.searchText.toUpperCase()) === -1) {
            return false;
          }
        }
        if (this.hiddenZero) {
          if (parseFloat(coin.blance) > 0) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      },
      getCoins() {
        var that = this;
        that.loading = true;
        that.loadingValuation = true;
        var p1 = new Promise(function (resolve, reject) {
          var params = {
            'scope': 'btexexchange',
            'code': 'btexexchange',
            'table': 'tokenpairs',
            'json': 'true',
            'limit': -1,
            'lower_bound': 0
          };
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
            if (res.result.error === 0) {
              // 获取成功， 拼接，链上数据
              resolve(res.result.records);
            }
          });
        });
        var p3 = new Promise(function (resolve, reject) {
          that.selfUtil.apiAxios('POST', that.selfUtil.host + '/service/api/currency/cost/prices', {'params': {account_name: that.account.name}}, res => {
            // console.log(res);
            if (res.result.error === 0) {
              // 获取成功， 拼接，链上数据
              resolve(res.result.records);
            }
          });
        });
        Promise.all([p1, p2, p3]).then(function (results) {
          // 分析获取  对应的人民币价格
          that.$store.dispatch('setContractCoins', results[0]);
          that.$store.dispatch('setServerCoins', results[1]);
          that.$store.dispatch('setCostCoins', results[2]);
          that.mergeData(results[0], results[1], results[2]);
          that.loading = false;
        }).catch(err => {
          // this.weui.alert(err);
          this.$message({
            type: 'error',
            text: err,
            duration: 3000
          });
        });
      },
      mergeData(coinInfo, coinServer, coinCosts) {
        var that = this;
        // 合并总数据
        for (var i = 0; i < coinInfo.length; i++) {
          let queryResult = Enumerable.from(coinServer)
            .where(function (x) {
              return x.currency_id === coinInfo[i].currencyId;
            })
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
            coinInfo[i].grade = parseInt(queryResult[0].grade);
            coinInfo[i].tradable = queryResult[0].tradable;
            coinInfo[i].icon = queryResult[0].icon;
          }
          let queryCostResult = Enumerable.from(coinCosts)
            .where(function (x) {
              return x.currency_id === coinInfo[i].currencyId;
            })
            .toArray();
          if (queryCostResult.length > 0) {
            coinInfo[i].buy_quantity = queryCostResult[0].buy_quantity;
            coinInfo[i].sell_quantity = queryCostResult[0].sell_quantity;
            coinInfo[i].cost_price = parseFloat(queryCostResult[0].cost_price).toFixed(6);
          } else {
            coinInfo[i].buy_quantity = 0;
            coinInfo[i].sell_quantity = 0;
            coinInfo[i].cost_price = 0;
          }
        }
        let baseTokens = Enumerable.from(this.basetokens).where(function (x) {
          return x.sym_name === 'EOS';
        }).toArray();
        let showList = Enumerable.from(coinInfo).where(function (x) {
          return x.tradable && x.base_id === baseTokens[0].id;
        }).orderByDescending('x=>x.change').orderByDescending('x=>x.sort').toArray();
        // this.coinInfo = showList;
        // 获取EOS估值
        var eosBlance = {
          contractName: 'eosio.token',
          asset_symbol: 'EOS',
          newPrice: 1,
          asset_precision: 4,
          currencyId: 0
        };
        showList.unshift(eosBlance);
        if (this.blances) {
          let valuation = Enumerable.from(this.blances)
            .select(o => o.valuation).sum();
          // 总估值
          that.valuation = valuation.toFixed(4);
          that.loadingValuation = false;
          // 每个币种估值
          showList.forEach(function (item) {
            let blance = Enumerable.from(that.blances).singleOrDefault(function (x) {
              return x.currencyId === item.currencyId;
            });
            if (blance) {
              item.blance = blance.blance;
              item.valuation = parseFloat(blance.valuation).toFixed(4);
            } else {
              item.blance = 0;
              item.valuation = 0;
            }
          });
          that.coinInfo = showList;
        } else {
          if (this.account.name !== '') {
            this.loadingValuation = true;
            EOSUtil.getTotalEos(this.account.name, showList, function (err, blances) {
              if (err) {
                // that.weui.alert(err);
                that.$message({
                  type: 'error',
                  text: err,
                  duration: 3000
                });
              } else {
                that.$store.dispatch('setBlances', blances);
                let valuation = Enumerable.from(blances)
                  .select(o => o.valuation).sum();
                // 总估值
                that.loadingValuation = false;
                that.valuation = valuation.toFixed(4);
                // 每个币种的估值
                showList.forEach(function (item) {
                  let blance = Enumerable.from(blances).singleOrDefault(function (x) {
                    return x.currencyId === item.currencyId;
                  });
                  item.blance = blance.blance;
                  item.valuation = parseFloat(blance.valuation).toFixed(4);
                });
                that.coinInfo = showList;
              }
            });
          }
        }
      }
    },
    created() {
      // 获取账号详情
      if (this.identity) {
        let account = this.identity.accounts.find(x => x.blockchain === 'eos');
        this.account = account;
        // 获取币种
        if (this.contractCoins && this.serverCoins && this.costCoins) {
          this.mergeData(this.contractCoins, this.serverCoins, this.costCoins);
        } else {
          this.getCoins();
        }
      } else {
        // var that = this;
        // this.weui.alert(this.$t('message.alert_please_log_in_first'), {
        //   buttons: [{
        //     label: that.$t('message.confirm'),
        //     type: 'primary',
        //     onClick: function () {
        //       that.$router.replace('/');
        //     }
        //   }]
        // });
      }
    }
  };
</script>

<style lang="scss" scoped>
  .page.dark {
    .user-info {
      display: flex;
      padding: 15px 15px 10px 15px;
      position: fixed;
      box-sizing: border-box;
      top: 0px;
      left: 0px;
      right: 0px;
      background: #1F3547;
      height: 53px;
      box-sizing: border-box;
      z-index: 999;
      .account-name {
        font-size: 1rem;
        color: #FFFFFF;
        flex: 1;
      }
      .setting {
        width: 24px;
        color: white;
        img {
          width: 20px;
          height: 19px;
        }
        i {
          font-size: 24px;
        }
      }
    }
    .user {
      padding: 53px 15px 0px 15px;
      background: #1F3547;
      height: 142px;
      position: relative;
      .user-asset {
        background-image: linear-gradient(-225deg, #F76B1C 0%, #FAD961 100%);
        border-radius: 6px;
        .account-total {
          font-size: 0.875rem;
          color: #FFFFFF;
          padding: 20px 20px 0px 20px;
          height: 52px;
          box-sizing: border-box;
        }
        .account-total-value {
          font-size: 1.875rem;
          color: #FFFFFF;
          padding: 20px;
          height: 88px;
          box-sizing: border-box;
        }
        .account-data {
          border-top: 2px solid rgba(248, 248, 248, 0.23);
          display: flex;
          font-size: 0.875rem;
          color: #FFFFFF;
          text-align: center;
          padding: 12px 0px;
          height: 48px;
          box-sizing: border-box;
          box-sizing: border-box;
          .current {
            flex: 1;
            /*border-right: 1px solid rgba(248, 248, 248, 0.33);*/
            a {
              color: #fff;
            }
          }
          .history {
            flex: 1;
            border-left: 1px solid rgba(248, 248, 248, 0.33);
            a {
              color: #fff;
            }
          }
        }
      }
    }
    .assets {
      background-color: #1F3547;
      padding: 50px 0px;
      min-height: calc(100% - 205px);
      box-sizing: border-box;
      .assets-title {
        padding: 10px 0px;
        display: flex;
        .actions {
          flex: 1;
        }
        .search {
          flex: 1;
          .search-text {
            -webkit-appearance: none;
            opacity: 0.5;
            background: transparent;
            border: 1px solid #979797;
            border-radius: 15px;
            padding: 6px 10px;
            background-image: url("../../assets/img/searchh.png");
            background-position: right 10px center;
            background-repeat: no-repeat;
            background-size: 16px 16px;
            margin-right: 15px;
            width: 140px;
            float: right;
            outline: none;
            color: #fff;
          }
        }
      }
      .assets-list {
        padding: 0px 15px;
        .asset {
          border-bottom: 1px solid #2C4962;
          padding: 10px 0px;
          .top {
            display: flex;
            font-size: 0.875rem;
            color: #FFFFFF;
            margin-bottom: 8px;
            .coin-name {
              flex: 1;
            }
            .coin-blance {
              flex: 2;
            }
          }
          .bottom {
            display: flex;
            .item {
              flex: 1;
              font-size: 0.75rem;
              color: #5A81A3;
              .key {
              }
            }
          }
        }
      }
    }
  }

  .page.light {
    .user-info {
      display: flex;
      padding: 15px 15px 10px 15px;
      position: fixed;
      box-sizing: border-box;
      top: 0px;
      left: 0px;
      right: 0px;
      background: #ffffff;
      height: 53px;
      box-sizing: border-box;
      z-index: 999;
      .account-name {
        font-size: 1rem;
        color: #262626;
        flex: 1;
      }
      .setting {
        width: 24px;
        color: #262626;
        img {
          width: 20px;
          height: 19px;
        }
        i {
          font-size: 24px;
        }
      }
    }
    .user {
      padding: 53px 15px 0px 15px;
      background: #ffffff;
      height: 142px;
      position: relative;
      .user-asset {
        background-image: linear-gradient(-225deg, #F76B1C 0%, #FAD961 100%);
        border-radius: 6px;
        .account-total {
          font-size: 0.875rem;
          color: #FFFFFF;
          padding: 20px 20px 0px 20px;
          height: 52px;
          box-sizing: border-box;
        }
        .account-total-value {
          font-size: 1.875rem;
          color: #FFFFFF;
          padding: 20px;
          height: 88px;
          box-sizing: border-box;
        }
        .account-data {
          border-top: 2px solid rgba(248, 248, 248, 0.23);
          display: flex;
          font-size: 0.875rem;
          color: #FFFFFF;
          text-align: center;
          padding: 12px 0px;
          height: 48px;
          box-sizing: border-box;
          box-sizing: border-box;
          .current {
            flex: 1;
            /*border-right: 1px solid rgba(248, 248, 248, 0.33);*/
            a {
              color: #fff;
            }
          }
          .history {
            flex: 1;
            border-left: 1px solid rgba(248, 248, 248, 0.33);
            a {
              color: #fff;
            }
          }
        }
      }
    }
    .assets {
      background-color: #ffffff;
      padding: 50px 0px;
      min-height: calc(100% - 205px);
      box-sizing: border-box;
      .assets-title {
        padding: 10px 0px;
        display: flex;
        .actions {
          flex: 1;
        }
        .search {
          flex: 1;
          .search-text {
            -webkit-appearance: none;
            opacity: 0.5;
            background: transparent;
            border: 1px solid #9f9f9f;
            border-radius: 15px;
            padding: 6px 10px;
            background-image: url("../../assets/img/searchh.png");
            background-position: right 10px center;
            background-repeat: no-repeat;
            background-size: 16px 16px;
            margin-right: 15px;
            width: 140px;
            float: right;
            outline: none;
            color: #9f9f9f;
          }
        }
      }
      .assets-list {
        padding: 0px 15px;
        .asset {
          border-bottom: 1px solid #F8F8F8;
          padding: 10px 0px;
          .top {
            display: flex;
            font-size: 0.875rem;
            color: #262626;
            margin-bottom: 8px;
            .coin-name {
              flex: 1;
            }
            .coin-blance {
              flex: 2;
            }
          }
          .bottom {
            display: flex;
            .item {
              flex: 1;
              font-size: 0.75rem;
              color: #9F9F9F;
              .key {
              }
            }
          }
        }
      }
    }
  }
</style>
