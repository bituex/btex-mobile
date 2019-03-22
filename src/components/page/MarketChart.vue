<template>
  <div id="master" :class="theme === 'light' ? 'light' : 'dark'">
    <div class="page">
      <div class="trade-page">
        <div class="tarde-container">
          <div class="full-left">
            <div class="full-left-top" id="kline">
              <div class="coin-info">
                <div class="coin-one" >
                  <div class="coin-name" @click="showCoinAction">
                    <img v-if="serverCurrency.icon" class="logo" :src="''+serverCurrency.icon"/>
                    <img v-else class="logo" src="../../assets/img/eosio_EOS.png"/>
                    <div class="name">
                      <p>{{currencyNow.asset_symbol+'/'+baseToken.sym_name}}&nbsp;<i class="fa fa-angle-right"></i></p>
                      <p class="contract-name">{{serverCurrency.contract_name}}</p>
                    </div>
                  </div>
                    <div class="coin-start">
                      <span class="start-name">{{$t("message.coin_start")}}</span>
                      <span class="start-icons" v-if="serverCurrency.grade > 0">
                        <img src="../../assets/img/start.png" v-for="(num, index) in serverCurrency.grade" :key="index" :alt="num" />
                      </span>
                    </div>
                </div>
                <div class="current-trade">
                  <div class="trade-left" v-bind:class="{ 'green': currencyNow.change>0, 'red': currencyNow.change<0 }">
                    <div class="price">{{currencyNow.newPrice}}</div>
                    <div class="change">
                      <span class="change-value">{{currencyNow.change+'%'}}</span>
                      <span class="price-value">≈ ¥{{computedPrice(currencyNow.newPrice, currencyNow.base_id)}}</span>
                    </div>
                  </div>
                  <div class="trade-right">
                    <div class="right-item">
                      <span>{{$t("message.hight")}}(24H)</span>
                      <span>{{serverCurrency.hight_price}}</span>
                    </div>
                    <div class="right-item">
                      <span>{{$t("message.low")}}(24H)</span>
                      <span>{{serverCurrency.lower_price}}</span>
                    </div>
                    <div class="right-item">
                      <span>{{$t("message.volume")}}(24H)</span>
                      <span>{{serverCurrency.volume}}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="full-kline">
                <ChartView v-if="currencyId !==''" interval="D" :symbol="currencyId" url="/trade/view"></ChartView>
              </div>
            </div>
            <div class="full-left-bottom">
              <div class="order-trade">
                <div class="order-tab">
                  <div class="tabs">
                    <div class="tab-item" :class="{'active': activeAdName=='first'}" @click="changTab('first')">{{$t("message.deep_merger")}}</div>
                    <div class="tab-item" :class="{'active': activeAdName=='second'}" @click="changTab('second')">{{$t("message.new_deal")}}</div>
                    <div class="tab-item" :class="{'active': activeAdName=='third'}" @click="changTab('third')">{{$t("message.intro")}}</div>
                  </div>
                  <div class="tabs-content">
                    <div class="spot-box" v-if="activeAdName == 'first'">
                      <ul class="spot-head">
                        <li>{{$t("message.bid")}}</li>
                        <li>{{$t("message.quantity")}}</li>
                        <li>{{$t("message.price")}}({{baseToken.sym_name}})</li>
                        <li>{{$t("message.quantity")}}</li>
                        <li>{{$t("message.selling")}}</li>
                      </ul>
                      <div class="scroll-box">
                        <ul class="buy-list">
                          <li v-for="(buy, index) in buys" :key="index">
                            <span>{{index+1}}</span>
                            <span>{{buy.qtys_f}}</span>
                            <span><i class="green">{{buy.price}}</i>&nbsp;</span>
                            <i class="ambg" :style="'width:' + getAmbgWidth(buy.qtys, 'buy')"></i>
                          </li>
                        </ul>
                        <ul class="sell-list">
                          <li v-for="(sell, index) in sells" :key="index">
                            <span>&nbsp;<i class="red">{{sell.price}}</i></span>
                            <span>{{sell.qtys_f}}</span>
                            <span>{{index+1}}</span>
                            <i class="ambg ambg1" :style="'width:' + getAmbgWidth(sell.qtys, 'sell')"></i>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div class="deals-box" v-if="activeAdName == 'second'">
                      <ul class="deals-head">
                        <li>{{$t("message.time")}}</li>
                        <li>{{$t("message.quantity")}}({{currencyNow.asset_symbol}})</li>
                        <li>{{$t("message.price")}}</li>
                      </ul>
                      <ul class="deals-list">
                        <li v-for="(record, index) in records" :key="index">
                          <span>{{record.create_date}}</span>
                          <span>{{record.quantity}}</span>
                          <span>{{record.price}}</span>
                        </li>
                      </ul>
                    </div>
                    <div class="coin-about" v-if="activeAdName == 'third'">
                      <div class="coin-name">
                        <img v-if="serverCurrency.icon" style="vertical-align: text-bottom; width: 20px;background-color: #fff;border-radius: 10px;" :src="serverCurrency.icon" />
                        <img v-else style="vertical-align: text-bottom; width: 20px;background-color: #fff;border-radius: 10px;" src="../../assets/img/eosio_EOS.png"/>
                        <span>{{serverCurrency.asset_symbol}}</span>
                      </div>
                      <div class="coin-info2" v-if="serverCurrency.intro">
                        {{serverCurrency.intro}}
                      </div>
                      <div class="coin-contract">
                        <span class="key">{{$t("message.contract")}}</span>
                        <span class="key-value">{{serverCurrency.contract_name}}</span>
                      </div>
                      <div class="coin-website" v-if="serverCurrency.website">
                        <span class="key">{{$t("message.website")}}</span>
                        <span class="key-value">{{serverCurrency.website}}</span>
                      </div>
                      <div class="coin-website">
                        <span class="key">{{$t("message.total_supply")}}</span>
                        <span class="key-value">{{currencyNowSupply.max_supply}}</span>
                      </div>
                      <div class="coin-website">
                        <span class="key">{{$t("message.circulating")}}</span>
                        <span class="key-value">{{currencyNowSupply.supply}}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="full-bottom">
            <div class="actions">
              <div class="buy" @click="goTrade('buy')">{{$t("message.buy")}}</div>
              <div class="sell" @click="goTrade('sell')">{{$t("message.sell")}}</div>
              <div class="favorites" v-if="favorite" @click="favoriteAction">
                <img src="../../assets/img/favorites2.png"><span>{{$t("message.favorite_have")}}</span>
              </div>
              <div class="favorites" v-if="!favorite" @click="favoriteAction">
                <img src="../../assets/img/favorites.png"><span>{{$t("message.favorite_add")}}</span>
              </div>
            </div>
          </div>
        </div>
        <CoinMenu :show-coins="showCoin" :currency-id="currencyId" :favorite="favorite" :group-now="baseToken.id" @on-showcoins-change="showCoinChange" @on-select="selectCoin"></CoinMenu>
      </div>
    </div>
  </div>
</template>

<script>
  import ChartView from '../chart/chartView.vue';
  import CoinMenu from '../component/CoinMenu.vue';
  import EosUtil from '../../common/EosUtils';
  import Enumerable from 'linq';
  import moment from 'moment';
  import {mapState} from 'vuex';

  export default {
    name: 'MarketChart',
    data() {
      return {
        activeAdName: 'first',
        currencyId: '',
        currencyNow: {asset_symbol: '', change: 0, newPrice: 0},
        favorite: false,
        baseToken: {sym_name: ''},
        serverCurrency: {hight_price: 0, lower_price: 0, volume: 0, contract_name: 'eosio', asset_symbol: 'EOS', intro: '', website: '', max_supply: 0, supply: 0},
        eosCnyPrice: 0,
        sells: [],
        buys: [],
        orderMaxBuyQty: 0,
        orderMaxSellQty: 0,
        records: [],
        orderIntever: null,
        currencyNowSupply: {},
        // 币种组件参数
        showCoin: false,
        account: null
      };
    },
    mounted() {
    },
    components: {
      ChartView, CoinMenu
    },
    computed: mapState({
      identity: state => state.identity,
      serverCoins: state => state.serverCoins,
      basetokens: state => state.basetokens,
      theme () {
        return this.$store.state.theme;
      }
    }),
    watch: {
      basetokens: function (newTokens) {
        if (newTokens && this.currencyId) {
          this.getBaseToken(this.currencyNow.base_id);
        }
      },
      identity: function (newIdentity) {
        if (newIdentity) {
          // console.log(newIdentity);
          let account = newIdentity.accounts.find(x => x.blockchain === 'eos');
          this.account = account;
          if (this.currencyId) {
            // 获取自选
            this.getFavorite(this.currencyId);
          }
        }
      },
      currencyId: function (newCurrencyId) {
        if (newCurrencyId !== '' && this.account) {
          this.getFavorite(newCurrencyId);
        }
      }
    },
    methods: {
      changTab(key) {
        this.activeAdName = key;
      },
      getAmbgWidth(num, type) {
        if (type === 'buy') {
          if (this.orderMaxBuyQty === 0) {
            return '0px';
          } else {
            return parseFloat(parseFloat(num) / this.orderMaxBuyQty * 100).toFixed(2) + '%';
          }
        } else {
          if (this.orderMaxSellQty === 0) {
            return '0px';
          } else {
            return parseFloat(parseFloat(num) / this.orderMaxSellQty * 100).toFixed(2) + '%';
          }
        }
      },
      getColor(change) {
        let newClass;
        if (parseFloat(change) < 0) {
          newClass = 'color: #F87070';
        } else if (parseFloat(change) > 0) {
          newClass = 'color: #14BC63';
        } else {
          newClass = 'color: #FFFFFF';
        }
        return newClass;
      },
      // 获取合约流通量和总量
      getContractSupply(code, symbol) {
        var that = this;
        EosUtil.getContractSupply(code, symbol, function (c) {
          that.currencyNowSupply = c[symbol];
        });
      },
      // 获取当前数据库币种
      getCoin(currencyId) {
        let that = this;
        let data = {};
        data.currency_id = currencyId;
        // data.account_name = this.account.name;
        this.selfUtil.apiAxios('POST', this.selfUtil.host + '/service/api/currency/details', {'params': data}, res => {
          // console.log(res);
          if (res.result.error === 0) {
            // 获取成功
            that.serverCurrency = res.result.record;
            that.serverCurrency.volume = that.selfUtil.formatNnum(parseFloat(that.serverCurrency.volume));
            that.serverCurrency.grade = parseInt(that.serverCurrency.grade);
            that.getContractSupply(that.serverCurrency.contract_name, that.serverCurrency.asset_symbol);
          }
        });
      },
      // 获取自选
      getFavorite(currencyId) {
        let that = this;
        if (this.account) {
          let data = {};
          data.currency_id = currencyId;
          data.account_name = this.account.name;
          this.selfUtil.apiAxios('POST', this.selfUtil.host + '/service/api/currency/favorite/check', {'params': data}, res => {
            // console.log(res);
            if (res.result.error === 0) {
              // 获取成功
              that.favorite = res.result.record.favorite;
            }
          });
        }
      },
      // 显示币种列表
      showCoinAction() {
        this.showCoin = true;
      },
      showCoinChange(val) {
        this.showCoin = val;
      },
      selectCoin(currency) {
        // this.currencyNow = {asset_symbol: currency.asset_symbol, change: currency.change, newPrice: currency.newPrice, asset_precision: currency.asset_precision};
        this.currencyId = currency.currencyId;
        this.currencyNow = currency;
        this.initData(currency.currencyId);
      },
      initData(currencyId) {
        this.sells = [];
        this.buys = [];
        this.records = [];
        this.orderMaxBuyQty = 0;
        this.orderMaxSellQty = 0;
        this.favorite = false;
        this.getOrder(currencyId);
        this.getCoin(currencyId);
        this.getCurrencyCoin(currencyId);
        this.getLastDealRecords(currencyId);
      },
      // 去交易
      goTrade(tradeType) {
        // window.location.href = '/#/m/trade/info';
        if (this.currencyId !== '') {
          // this.$router.replace();
          this.$router.replace('/trade/' + this.currencyId + '/' + tradeType);
        } else {
          // this.$router.replace('/trade/');
          this.$router.replace('/trade');
        }
      },
      // 获取最近交易
      getLastDealRecords(currencyId) {
        let that = this;
        // 发送
        that.selfUtil.apiAxios('POST', that.selfUtil.host + '/service/api/record', {'params': {limit: 50, page: 1, currency_id: currencyId}}, res => {
          // console.log(res);
          if (res.result.error === 0) {
            // 获取成功
            if (res.result.records.length > 0) {
              let records = [];
              for (let i = 0; i < res.result.records.length; i++) {
                let record = res.result.records[i];
                record.create_date = moment.utc(record.create_date).local().format('MM-DD HH:mm');
                records.push(record);
              }
              that.records = records;
            }
          }
        });
      },
      // 获取卖单数据
      // 获取买单数据
      getOrder(currencyId) {
        let that = this;
        let p1 = new Promise(function (resolve, reject) {
          let p2Params = {'scope': currencyId, 'code': 'btexexchange', 'table': 'sellorders', 'json': 'true', 'limit': 200, 'lower_bound': 0};
          EosUtil.getTableRows(p2Params, [], function (rows) {
            resolve(rows);
          });
        });
        let p2 = new Promise(function (resolve, reject) {
          let p2Params = {'scope': currencyId, 'code': 'btexexchange', 'table': 'buyorders', 'json': 'true', 'limit': 200, 'lower_bound': 0};
          EosUtil.getTableRows(p2Params, [], function (rows) {
            resolve(rows);
          });
        });
        Promise.all([p1, p2]).then(function (results) {
          // var rows = res.rows;
          let sellRows = results[0];
          let sellOrders = [];
          for (let i = 0; i < sellRows.length; i++) {
            let sellOrder = {
              price: parseFloat(sellRows[i].price),
              qty: parseFloat(sellRows[i].qty.split(' ')[0]),
              qty_total: parseFloat(sellRows[i].qty_total.split(' ')[0])
            };
            sellOrders.push(sellOrder);
          }
          let sells = Enumerable.from(sellOrders)
            .groupBy('$.price', null,
              function (key, g) {
                return {
                  price: key,
                  qtys: g.sum('$.qty'),
                  qty_totals: g.sum('$.qty_total')
                };
              })
            .toArray();
          // 排序
          sells.sort(function (x, y) {
            return y.price - x.price;
          });
          let sellShows = [];
          let sellCount = sells.length > 10 ? 10 : sells.length;
          for (let j = sells.length - 1; j >= (sells.length - sellCount); j--) {
            let sell = {
              price: sells[j].price.toFixed(6),
              qtys: sells[j].qtys,
              qtys_f: that.selfUtil.formatNnum(sells[j].qtys),
              qty_totals: sells[j].qty_totals.toFixed(4)
            };
            sellShows.push(sell);
          }
          that.sells = sellShows;
          let buyRows = results[1];
          let buyOrders = [];
          for (let i = 0; i < buyRows.length; i++) {
            let buyOrder = {};
            buyOrder.price = parseFloat(buyRows[i].price);
            let amount = parseFloat(buyRows[i].amount.split(' ')[0]);
            let amountTotal = parseFloat(buyRows[i].amount_total.split(' ')[0]);
            buyOrder.qty = amount / buyOrder.price;
            buyOrder.qty_total = amountTotal / buyOrder.price;
            buyOrders.push(buyOrder);
          }
          let buys = Enumerable.from(buyOrders)
            .groupBy('$.price', null,
              function (key, g) {
                return {
                  price: key,
                  qtys: g.sum('$.qty'),
                  qty_totals: g.sum('$.qty_total')
                };
              }).where(function(x) {
              return x.qtys >= 0.0001;
            }).toArray();
          // 排序
          buys.sort(function (x, y) {
            return y.price - x.price;
          });
          let buyShows = [];
          let butCount = buys.length > 10 ? 10 : buys.length;
          for (let j = 0; j < butCount; j++) {
            let buy = {
              price: buys[j].price.toFixed(6),
              qtys: buys[j].qtys,
              qtys_f: that.selfUtil.formatNnum(buys[j].qtys),
              qty_totals: buys[j].qty_totals.toFixed(4)
            };
            buyShows.push(buy);
          }
          that.buys = buyShows;
          // 获取最大
          let sellMaxOrders = Enumerable.from(sellShows).orderByDescending('x=>x.qtys').toArray();
          let buyMaxOrders = Enumerable.from(buyShows).orderByDescending('x=>x.qtys').toArray();
          if (buyMaxOrders && buyMaxOrders.length > 0) {
            that.orderMaxBuyQty = buyMaxOrders[0].qtys;
          }
          if (sellMaxOrders && sellMaxOrders.length > 0) {
            that.orderMaxSellQty = sellMaxOrders[0].qtys;
          }
        });
      },
      // 获取当前币种
      getCurrencyCoin(currencyId) {
        var that = this;
        var params = {'scope': 'btexexchange', 'code': 'btexexchange', 'table': 'tokenpairs', 'json': 'true', 'limit': 1, 'lower_bound': currencyId};
        EosUtil.getTableRow(params, function (rows) {
          if (rows && rows.length > 0) {
            // that.currencyId = rows[0].id;
            that.currencyNow.asset_symbol = rows[0].sym_name;
            that.currencyNow.newPrice = parseFloat(rows[0].price).toFixed(6);
            that.currencyNow.startPrice = parseFloat(rows[0].open_price).toFixed(6);
            that.currencyNow.base_id = rows[0].base_id;
            if (that.basetokens) {
              that.getBaseToken(rows[0].base_id);
            }
            if ((parseFloat(that.currencyNow.newPrice) === 0 || parseFloat(that.currencyNow.startPrice) === 0)) {
              that.currencyNow.change = 0;
            } else {
              let change = parseFloat(parseFloat((parseFloat(that.currencyNow.newPrice) - parseFloat(that.currencyNow.startPrice)) / that.currencyNow.startPrice * 100).toFixed(2));
              if (change > 999) {
                that.currencyNow.change = 999;
              } else if (change < -999) {
                that.currencyNow.change = -999;
              } else {
                that.currencyNow.change = change;
              }
            }
          }
        });
      },
      // 自选
      favoriteAction() {
        if (this.account && this.currencyId) {
          this.selfUtil.apiAxios('POST', this.selfUtil.host + '/service/api/currency/favorite/toggle', {'params': {currency_id: this.currencyId, account_name: this.account.name}}, res => {
            if (res.result.error === 0) {
              this.favorite = !this.favorite;
            }
          });
        }
      },
      computedPrice(num) {
        if (this.baseToken) {
          if (this.baseToken.sym_name === 'EOS') {
            let eosPrice = parseFloat(window.btex.eos_market_price) * parseFloat(window.btex.us_dollar_exchange_rate);
            let sum = parseFloat(num) * eosPrice;
            sum = sum.toFixed(4);
            return sum;
          } else if (this.baseToken.sym_name === 'USDT') {
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
      getBaseToken(baseId) {
        if (this.basetokens) {
          let queryResult = Enumerable.from(this.basetokens)
            .where(function (x) {
              return x.id === baseId;
            })
            .toArray();
          this.baseToken = queryResult[0];
        }
      }
    },
    created() {
      // 设置标题
      // document.title = this.$t('message.market');
      // 接收币种id
      if (this.$route.params.currencyId) {
        let currencyId = this.$route.params.currencyId;
        this.currencyId = currencyId;
        this.getCurrencyCoin(currencyId);
        this.initData(currencyId);
      } else {
        // 没有币种，查询排名第一的币种
        if (this.serverCoins) {
          let showList = Enumerable.from(this.serverCoins).orderByDescending('x=>x.turnover').orderByDescending('x=>x.sort').toArray();
          let currencyId = showList[0].currency_id;
          this.currencyId = currencyId;
          this.currencyNow.asset_symbol = showList[0].asset_symbol;
          this.getCurrencyCoin(currencyId);
          this.initData(currencyId);
        } else {
          this.selfUtil.apiAxios('POST', this.selfUtil.host + '/service/api/currencies', {'params': {}}, res => {
            if (res.result.error === 0) {
              // 获取成功， 拼接，链上数据
              let showList = Enumerable.from(res.result.records).orderByDescending('x=>x.turnover').orderByDescending('x=>x.sort').toArray();
              let currencyId = showList[0].currency_id;
              this.currencyId = currencyId;
              this.currencyNow.asset_symbol = showList[0].asset_symbol;
              this.getCurrencyCoin(currencyId);
              this.initData(currencyId);
            }
          });
        }
      }
      // 获取用户信息
      if (this.identity) {
        let account = this.identity.accounts.find(x => x.blockchain === 'eos');
        this.account = account;
        if (this.currencyId) {
          // 获取自选
          this.getFavorite(this.currencyId);
        }
      }
      // 获取币种统计详情
      this.getCoin(this.currencyId);
      var that = this;
      // 定时获取
      this.orderIntever = setInterval(() => {
        if (that.currencyId !== '') {
          that.getCoin(that.currencyId);
          that.getCurrencyCoin(that.currencyId);
          // 获取最新成交
          that.getLastDealRecords(that.currencyId);
          that.getOrder(that.currencyId);
        }
      }, 5000);
    },
    beforeDestroy() {
      // 清除定时器
      window.clearInterval(this.orderIntever);
    }
  };
</script>

<style lang="scss" scoped>
  .dark{
    .trade-page {
      background-color: #000;
      .tarde-container {
        .full-left {
          box-sizing: border-box;
          .full-left-top {
            display: flex;
            flex-grow: 1;
            box-sizing: border-box;
            background-color: #fff;
            flex-direction: column;
            .coin-info {
              background: #2A4862;
              .coin-one {
                display: flex;
                width: 100%;
                padding: 8px 0px 4px  0px;
                .coin-name {
                  font-size: 16px;
                  padding-left: 10px;
                  flex: 1;
                  position: relative;
                  display: flex;
                  .logo{
                    width: 26px;
                    height: 26px;
                    vertical-align: middle;
                    border-radius: 13px;
                    background-color: #fff;
                    margin-right: 10px;
                  }
                  .name{
                    flex: 1;
                    p{
                      line-height: 1em;
                    }
                    p.contract-name{
                      font-size: 12px;
                      color: #909090;
                    }
                  }
                }
                .coin-start {
                  flex: 1;
                  padding-left: 20px;
                  box-sizing: border-box;
                  display: flex;
                  span{
                    flex: 1;
                    vertical-align: middle;
                  }
                  .start-name{
                    font-size: 12px;
                    color: #FFFFFF;
                    opacity: 0.5;vertical-align: middle;
                    line-height: 26px;
                  }
                  .start-icons{
                    padding-right: 10px;
                    vertical-align: middle;
                    padding-top: 4px;
                    img{
                      float: right;
                      width: 8px;
                      height: 8px;
                      margin-left: 4px;
                      margin-top: 4px;
                      vertical-align: middle;
                    }
                  }
                }
              }
              .coin-one, .current-trade {
                color: #fff;
                margin-right: 0px;
                font-size: 12px;
              }
              .current-trade {
                padding-left: 10px;
                display: flex;
                .trade-left{
                  flex: 1;
                  padding-right: 10px;
                  .price{
                    font-size: 26px;
                    line-height: 1em;
                    padding-bottom: 6px;
                    color: #FFFFFF;
                  }
                  .change{
                    span.change-value{
                      text-align: left;
                      color: #FFFFFF;
                    }
                    span.price-value{
                      text-align: left;
                      margin-left: 8px;
                      color: #FFFFFF;
                    }
                  }
                }
                .trade-left.green{
                  .price{
                    color: #14BC63;
                  }
                  .change{
                    .change-value{
                      color: #14BC63;
                    }
                    .price-value{
                      color: #14BC63;
                    }
                  }
                }
                .trade-left.red{
                  .price{
                    color: #FF8181;
                  }
                  .change{
                    .change-value{
                      color: #FF8181;
                    }
                    .price-value{
                      color: #FF8181;
                    }
                  }
                }
                .trade-right{
                  flex: 1;
                  padding-left: 10px;
                  .right-item{
                    padding-right: 10px;
                    display: flex;
                    span{
                      flex: 1;
                    }
                    span:nth-child(1){
                      text-align: left;
                    }
                    span:nth-child(2){
                      text-align: right;
                    }
                  }
                }
              }
            }
            .full-kline {
              overflow: hidden;
              width: 100%;
              height: 380px;
              background-color: #1F3548;
              iframe{
                width: 100%;
                height: 320px;
                overflow: hidden;
              }
            }
          }
          .full-left-bottom {
            /*height: 345px;*/
            margin-bottom: 0;
            overflow-x: auto;
            overflow-y: hidden;
            box-sizing: border-box;
            background: #1F3548;
            .order-trade {
              font-size: 12px;
              height: calc(100% - 0px);
              .order-tab{
                .tabs{
                  background: #2a4862;
                  padding: 0 10px;
                  margin: 0;
                  .tab-item{
                    margin-right: 20px;
                    height: 40px;
                    box-sizing: border-box;
                    line-height: 40px;
                    display: inline-block;
                    list-style: none;
                    font-size: 12px;
                    font-weight: 500;
                    color: #fff;
                    opacity: .5;
                    position: relative;
                  }
                  .tab-item.active{
                    opacity: 1;
                    border-bottom: 2px solid #589ad3;
                  }
                }
              }
              .spot-box {
                height: 305px;
                width: 100%;
                position: relative;
                padding-bottom: 45px;
                .spot-head {
                  color: #5A81A3;
                  padding: 0px;
                  line-height: 24px;
                  height: 24px;
                  padding-top: 10px;
                  li {
                    list-style: none;
                    float: left;
                    font-size: 12px;
                    text-align: center;
                  }
                  li:nth-of-type(5n+3) {
                    width: 20%;
                  }
                  li:nth-of-type(5n+2), li:nth-of-type(5n+4) {
                    width: 30%;
                  }
                  li:nth-of-type(5n+1), li:nth-of-type(5n+5) {
                    width: 10%;
                  }
                }
                .scroll-box {
                  height: calc(100% - 34px);
                  overflow-y: auto;
                  padding: 0px 10px;
                  width: 100%;
                  box-sizing: border-box;
                  display: flex;
                  .sell-list {
                    padding: 0px;
                    width: 50%;
                    li {
                      list-style: none;
                      padding: 5px 0px;
                      height: 16px;
                      line-height: 16px;
                      text-align: center;
                      font-size: 12px;
                      position: relative;
                      span {
                        color: #fff;
                        display: inline-block;
                        float: left;
                      }
                      span .green {
                        color: #14BC63;
                        font-style: normal;
                      }
                      span .red {
                        color: #F87070;
                        font-style: normal;
                      }
                      span:nth-of-type(5n+3) {
                        width: 20%;
                        text-align: right;
                      }
                      span:nth-of-type(5n+2), span:nth-of-type(5n+4) {
                        width: 45%;
                        /*text-align: right;*/
                      }
                      span:nth-of-type(5n+1), span:nth-of-type(5n+5) {
                        width: 35%;
                        text-align: left;
                      }
                      i.ambg {
                        height: 99%;
                        position: absolute;
                        left: 0;
                        opacity: .3;
                        top: 50%;
                        transform: translateY(-50%);
                        background: RGBA(82,177,109,.35);
                      }
                      i.ambg1{
                        background: RGBA(232,18,52,.5);
                      }
                    }
                  }
                  .buy-list {
                    padding: 0px;
                    width: 50%;
                    li {
                      list-style: none;
                      padding: 5px 0px;
                      height: 16px;
                      line-height: 16px;
                      text-align: center;
                      font-size: 12px;
                      position: relative;
                      span {
                        color: #fff;
                        display: inline-block;
                        float: left;
                      }
                      span .green {
                        color: #14BC63;
                        font-style: normal;
                      }
                      span .red {
                        color: #F87070;
                        font-style: normal;
                      }
                      span:nth-of-type(5n+3) {
                        width: 35%;
                        text-align: right;
                      }
                      span:nth-of-type(5n+2), span:nth-of-type(5n+4) {
                        width: 45%;
                        /*text-align: left;*/
                      }
                      span:nth-of-type(5n+1), span:nth-of-type(5n+5) {
                        width: 20%;
                        text-align: left;
                      }
                      i.ambg {
                        height: 99%;
                        position: absolute;
                        right: 0;
                        opacity: .3;
                        top: 50%;
                        transform: translateY(-50%);
                        background: RGBA(82,177,109,.35);
                      }
                    }
                  }
                }
              }
              .deals-box {
                min-height: 200px;
                width: 100%;
                position: relative;
                padding-bottom: 55px;
                box-sizing: border-box;
                .deals-head {
                  color: #5A81A3;
                  padding: 10px 10px 0px 10px;
                  line-height: 24px;
                  li {
                    list-style: none;
                    float: left;
                    font-size: 12px;
                    text-align: right;
                    width: 33%;
                  }
                  li:nth-of-type(3n+1) {
                    text-align: left;
                  }
                }
                .deals-list {
                  height: calc(100% - 24px);
                  overflow-y: auto;
                  padding: 0px 10px;
                  li {
                    list-style: none;
                    padding: 5px 0px;
                    height: 16px;
                    line-height: 16px;
                    text-align: right;
                    font-size: 12px;
                    span {
                      color: #cbc8c8;
                      display: inline-block;
                      float: left;
                      width: 33%;
                    }
                    span:nth-of-type(3n+1) {
                      text-align: left;
                    }
                    span.green {
                      color: #14BC63;
                    }
                    span.red {
                      color: #F87070;
                    }
                  }
                }
              }
              .coin-about{
                color: #cbc8c8;
                padding: 10px;
                padding-bottom: 55px;
                .coin-name{
                  font-size: 16px;
                  padding: 10px 0px;
                }
                .coin-info2 {
                  line-height: 1.3em;
                  letter-spacing: 2px;
                  padding: 10px 0px;
                  text-align: justify;
                }
                .coin-contract {
                  padding: 10px 0px;
                  display: flex;
                  .key {
                    flex: 1;
                  }
                  .key-value {
                    flex: 2;
                    text-align: right;
                  }
                }
                .coin-website {
                  padding: 10px 0px;
                  display: flex;
                  .key {
                    flex: 1;
                  }
                  .key-value {
                    flex: 2;
                    text-align: right;
                  }
                }
              }
            }
          }
        }
      }
      .full-bottom {
        width: 100%;
        position: fixed;
        bottom: 0px;
        .actions {
          display: flex;
          color: #fff;
          text-align: center;
          width: 100%;
          font-size: 14px;
          .sell {
            background: #F87070;
            padding: 12px 0px;
            flex: 1;
          }
          .buy {
            background: #14BC63;
            padding: 12px 0px;
            flex: 1;
          }
          .favorites{
            background: #2C4962;
            vertical-align: middle;
            padding: 12px 10px;
            img{
              width: 17px;
              height: 17px;
              vertical-align: middle;
            }
            span{
              padding-left: 4px;
              height: 100%;
              vertical-align: middle;
              color: #B1CFE8;
              font-size: 14px;
            }
          }
        }
      }
    }
  }
  .light{
    .trade-page {
      background-color: #000;
      .tarde-container {
        .full-left {
          box-sizing: border-box;
          .full-left-top {
            display: flex;
            flex-grow: 1;
            box-sizing: border-box;
            background-color: #fff;
            flex-direction: column;
            .coin-info {
              background: #FFFFFF;
              padding-bottom: 8px;
              .coin-one {
                display: flex;
                width: 100%;
                padding: 8px 0px 4px  0px;
                .coin-name {
                  font-size: 16px;
                  padding-left: 10px;
                  flex: 1;
                  position: relative;
                  display: flex;
                  .logo{
                    width: 26px;
                    height: 26px;
                    vertical-align: middle;
                    border-radius: 13px;
                    background-color: #fff;
                    margin-right: 10px;
                  }
                  .name{
                    flex: 1;
                    p{
                      line-height: 1em;
                    }
                    p.contract-name{
                      font-size: 12px;
                      color: #909090;
                    }
                  }
                }
                .coin-start {
                  flex: 1;
                  padding-left: 20px;
                  box-sizing: border-box;
                  display: flex;
                  span{
                    flex: 1;
                    vertical-align: middle;
                  }
                  .start-name{
                    font-size: 12px;
                    color: #262626;
                    opacity: 0.5;vertical-align: middle;
                    line-height: 26px;
                  }
                  .start-icons{
                    padding-right: 10px;
                    vertical-align: middle;
                    padding-top: 4px;
                    img{
                      float: right;
                      width: 8px;
                      height: 8px;
                      margin-left: 4px;
                      margin-top: 4px;
                      vertical-align: middle;
                    }
                  }
                }
              }
              .coin-one, .current-trade {
                color: #262626;
                margin-right: 0px;
                font-size: 12px;
              }
              .current-trade {
                padding-left: 10px;
                display: flex;
                .trade-left{
                  flex: 1;
                  padding-right: 10px;
                  .price{
                    font-size: 26px;
                    line-height: 1em;
                    padding-bottom: 6px;
                    color: #262626;
                  }
                  .change{
                    span.change-value{
                      text-align: left;
                      color: #262626;
                    }
                    span.price-value{
                      text-align: left;
                      margin-left: 8px;
                      color: #262626;
                    }
                  }
                }
                .trade-left.green{
                  .price{
                    color: #14BC63;
                  }
                  .change{
                    .change-value{
                      color: #14BC63;
                    }
                    .price-value{
                      color: #14BC63;
                    }
                  }
                }
                .trade-left.red{
                  .price{
                    color: #FF8181;
                  }
                  .change{
                    .change-value{
                      color: #FF8181;
                    }
                    .price-value{
                      color: #FF8181;
                    }
                  }
                }
                .trade-right{
                  flex: 1;
                  padding-left: 10px;
                  .right-item{
                    padding-right: 10px;
                    display: flex;
                    span{
                      flex: 1;
                    }
                    span:nth-child(1){
                      text-align: left;
                    }
                    span:nth-child(2){
                      text-align: right;
                    }
                  }
                }
              }
            }
            .full-kline {
              overflow: hidden;
              width: 100%;
              height: 380px;
              background-color: #ffffff;
              border-top: 1px solid #E8E8E8;
              iframe{
                width: 100%;
                height: 320px;
                overflow: hidden;
              }
            }
          }
          .full-left-bottom {
            /*height: 345px;*/
            margin-bottom: 0;
            overflow-x: auto;
            overflow-y: hidden;
            box-sizing: border-box;
            background: #ffffff;
            .order-trade {
              font-size: 12px;
              height: calc(100% - 0px);
              .order-tab{
                .tabs{
                  background: #F8F8F8;
                  padding: 0 10px;
                  margin: 0;
                  .tab-item{
                    margin-right: 20px;
                    height: 40px;
                    box-sizing: border-box;
                    line-height: 40px;
                    display: inline-block;
                    list-style: none;
                    font-size: 12px;
                    font-weight: 500;
                    color: #9F9F9F;
                    /*opacity: .5;*/
                    position: relative;
                  }
                  .tab-item.active{
                    opacity: 1;
                    color: #262626;
                    border-bottom: 2px solid #589ad3;
                  }
                }
              }
              .spot-box {
                height: 305px;
                width: 100%;
                position: relative;
                padding-bottom: 45px;
                .spot-head {
                  color: #5A81A3;
                  padding: 0px;
                  line-height: 24px;
                  height: 24px;
                  padding-top: 10px;
                  li {
                    list-style: none;
                    float: left;
                    font-size: 12px;
                    text-align: center;
                  }
                  li:nth-of-type(5n+3) {
                    width: 20%;
                  }
                  li:nth-of-type(5n+2), li:nth-of-type(5n+4) {
                    width: 30%;
                  }
                  li:nth-of-type(5n+1), li:nth-of-type(5n+5) {
                    width: 10%;
                  }
                }
                .scroll-box {
                  height: calc(100% - 34px);
                  overflow-y: auto;
                  padding: 0px 10px;
                  width: 100%;
                  box-sizing: border-box;
                  display: flex;
                  .sell-list {
                    padding: 0px;
                    width: 50%;
                    li {
                      list-style: none;
                      padding: 5px 0px;
                      height: 16px;
                      line-height: 16px;
                      text-align: center;
                      font-size: 12px;
                      position: relative;
                      span {
                        color: #262626;
                        display: inline-block;
                        float: left;
                      }
                      span .green {
                        color: #14BC63;
                        font-style: normal;
                      }
                      span .red {
                        color: #F87070;
                        font-style: normal;
                      }
                      span:nth-of-type(5n+3) {
                        width: 20%;
                        text-align: right;
                        color: #9F9F9F;
                      }
                      span:nth-of-type(5n+2), span:nth-of-type(5n+4) {
                        width: 45%;
                        /*text-align: right;*/
                      }
                      span:nth-of-type(5n+1), span:nth-of-type(5n+5) {
                        width: 35%;
                        text-align: left;
                      }
                      i.ambg {
                        height: 99%;
                        position: absolute;
                        left: 0;
                        opacity: .3;
                        top: 50%;
                        transform: translateY(-50%);
                        background: RGBA(82,177,109,.35);
                      }
                      i.ambg1{
                        background: RGBA(232,18,52,.5);
                      }
                    }
                  }
                  .buy-list {
                    padding: 0px;
                    width: 50%;
                    li {
                      list-style: none;
                      padding: 5px 0px;
                      height: 16px;
                      line-height: 16px;
                      text-align: center;
                      font-size: 12px;
                      position: relative;
                      span {
                        color: #262626;
                        display: inline-block;
                        float: left;
                      }
                      span .green {
                        color: #14BC63;
                        font-style: normal;
                      }
                      span .red {
                        color: #F87070;
                        font-style: normal;
                      }
                      span:nth-of-type(5n+3) {
                        width: 35%;
                        text-align: right;
                      }
                      span:nth-of-type(5n+2), span:nth-of-type(5n+4) {
                        width: 45%;
                        /*text-align: left;*/
                      }
                      span:nth-of-type(5n+1), span:nth-of-type(5n+5) {
                        width: 20%;
                        text-align: left;
                        color: #9F9F9F;
                      }
                      i.ambg {
                        height: 99%;
                        position: absolute;
                        right: 0;
                        opacity: .3;
                        top: 50%;
                        transform: translateY(-50%);
                        background: RGBA(82,177,109,.35);
                      }
                    }
                  }
                }
              }
              .deals-box {
                min-height: 200px;
                width: 100%;
                position: relative;
                padding-bottom: 55px;
                box-sizing: border-box;
                .deals-head {
                  color: #5A81A3;
                  padding: 10px 10px 0px 10px;
                  line-height: 24px;
                  li {
                    list-style: none;
                    float: left;
                    font-size: 12px;
                    text-align: right;
                    width: 33%;
                  }
                  li:nth-of-type(3n+1) {
                    text-align: left;
                  }
                }
                .deals-list {
                  height: calc(100% - 24px);
                  overflow-y: auto;
                  padding: 0px 10px;
                  li {
                    list-style: none;
                    padding: 5px 0px;
                    height: 16px;
                    line-height: 16px;
                    text-align: right;
                    font-size: 12px;
                    span {
                      color: #262626;
                      display: inline-block;
                      float: left;
                      width: 33%;
                    }
                    span:nth-of-type(3n+1) {
                      text-align: left;
                    }
                    span.green {
                      color: #14BC63;
                    }
                    span.red {
                      color: #F87070;
                    }
                  }
                }
              }
              .coin-about{
                color: #262626;
                padding: 10px;
                padding-bottom: 55px;
                .coin-name{
                  font-size: 16px;
                  padding: 10px 0px;
                }
                .coin-info2 {
                  line-height: 1.3em;
                  letter-spacing: 2px;
                  padding: 10px 0px;
                  text-align: justify;
                }
                .coin-contract {
                  padding: 10px 0px;
                  display: flex;
                  .key {
                    flex: 1;
                  }
                  .key-value {
                    flex: 2;
                    text-align: right;
                  }
                }
                .coin-website {
                  padding: 10px 0px;
                  display: flex;
                  .key {
                    flex: 1;
                  }
                  .key-value {
                    flex: 2;
                    text-align: right;
                  }
                }
              }
            }
          }
        }
      }
      .full-bottom {
        width: 100%;
        position: fixed;
        bottom: 0px;
        .actions {
          display: flex;
          color: #fff;
          text-align: center;
          width: 100%;
          font-size: 14px;
          .sell {
            background: #F87070;
            padding: 12px 0px;
            flex: 1;
          }
          .buy {
            background: #14BC63;
            padding: 12px 0px;
            flex: 1;
          }
          .favorites{
            background: #FFFFFF;
            vertical-align: middle;
            padding: 12px 10px;
            border-top: 1px solid #E8E8E8;
            img{
              width: 17px;
              height: 17px;
              vertical-align: middle;
            }
            span{
              padding-left: 4px;
              height: 100%;
              vertical-align: middle;
              color: #262626;
              font-size: 14px;
            }
          }
        }
      }
    }
  }
</style>
