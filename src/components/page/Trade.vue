<template>
    <div class="page" :class="theme === 'light' ? 'light' : 'dark'">
      <div class="trade-page">
        <div class="tarde-container">
          <div class="full-left">
            <div class="full-left-top" id="kline">
              <div class="coin-info">
                <div class="coin-one">
                  <div @click="showCoinAction" class="coin-name">
                    <img v-if="serverCurrency.icon" class="logo" :src="''+serverCurrency.icon"/>
                    <img v-else class="logo" src="../../assets/img/eosio_EOS.png"/>
                    <div class="name">
                      <p>{{currencyNow.asset_symbol+'/'+baseToken.sym_name}}&nbsp;<i class="fa fa-angle-right"></i></p>
                      <p class="contract-name">{{serverCurrency.contract_name}}</p>
                    </div>
                  </div>
                  <div class="priceandstate">
                    <!--<div class="current-price">-->
                      <!--<span class="big">{{currencyNow.newPrice}}</span>-->
                      <!--<span>≈ ¥{{computedPrice(currencyNow.newPrice)}}</span>-->
                    <!--</div>-->
                    <div class="current-state" @click="goChart" v-bind:class="{ 'green': currencyNow.change>0, 'red': currencyNow.change<0 }">
                      <span>{{currencyNow.change}}%&nbsp;<i style="vertical-align: middle;"><img style="width: 10px; display: inline-block;" :src="require('../../assets/img/hangqing.png')"/></i></span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="full-trade">
                <div class="ad-create">
                  <div class="ad-select">
                    <div class="buy" @click="buyClick" v-bind:class="classBuy">
                      <span>{{$t("message.buy")}}</span>
                    </div>
                    <div class="sell" @click="sellClick" v-bind:class="classSell">
                      <span>{{$t("message.sell")}}</span>
                    </div>
                  </div>
                  <div class="ad-create-box">
                    <div class="input-container">
                      <el-input-number size="small" v-model="orderPrice" :precision="6" :step="0.000001"></el-input-number>
                    </div>
                    <div class="input-container" >
                      <el-input size="small" v-model="orderQuantity" @focus="quantityChange" :placeholder="$t('message.quantity')">
                        <template slot="append">{{currencyNow.asset_symbol}}</template>
                      </el-input>
                    </div>
                    <div class="trade-price">
                      <p>{{$t("message.trade_amount")}}&nbsp;{{orderAmount}}&nbsp;{{baseToken.sym_name}}</p>
                      <p>{{$t("message.feel_amount")}}&nbsp;{{feelAmount}}&nbsp;{{baseToken.sym_name}}<span v-if="baseToken.sym_name=='EOS'">({{$t("message.mining")}}&nbsp;{{mining}}BT)</span></p>
                    </div>
                    <div class="quik-num-btns">
                      <span @click="quickQuantity(1)" :class="{active: this.quickQuantityType==1}">25%</span>
                      <span @click="quickQuantity(2)" :class="{active: this.quickQuantityType==2}">50%</span>
                      <span @click="quickQuantity(3)" :class="{active: this.quickQuantityType==3}">75%</span>
                      <span @click="quickQuantity(4)" :class="{active: this.quickQuantityType==4}">100%</span>
                    </div>
                    <div class="trade-price" style="padding-bottom: 4px;" v-if="createType=='buy'">
                      {{$t("message.can_user")}}&nbsp;{{baseToken.sym_name}}&nbsp;&nbsp;&nbsp;{{userAccountInfo.eos}}&nbsp;&nbsp;
                    </div>
                    <div class="trade-price" style="padding-bottom: 4px;" v-if="createType=='sell'">
                      {{$t("message.can_user")}}&nbsp;{{currencyNow.asset_symbol}}&nbsp;&nbsp;&nbsp;{{userAccountInfo.exCoin}}&nbsp;&nbsp;
                    </div>
                    <div class="trade-price">
                      <span style="color:#409EFF;font-size: 0.75rem;" v-if="!account" >{{$t("message.login")}}</span>
                      <span style="color:#409EFF;font-size: 0.75rem;" v-if="account">{{account.name}}</span>
                    </div>
                    <div class="trade-submit">
                      <a href="javascript:;" v-if="serverCurrency.tradable" class="weui-btn weui-btn_mini block" @click="createOrder" :class="createType=='buy'?'weui-btn_buy':'weui-btn_sell'">{{getOrderType(currencyNow.asset_symbol)}}</a>
                      <a href="javascript:;" v-if="!serverCurrency.tradable" class="weui-btn weui-btn_mini block weui-btn_none">{{getOrderType(currencyNow.asset_symbol)}}</a>
                      <!--<div class="error-msg" style="height: 13px;"></div>-->
                    </div>
                  </div>
                </div>
                <div class="ad-list">
                  <div class="spot-box">
                    <ul class="spot-head">
                      <li>{{$t("message.price")}}({{baseToken.sym_name}})</li>
                      <li>{{$t("message.quantity")}}</li>
                    </ul>
                    <div class="scroll-box">
                      <ul class="sell-list">
                        <li v-for="(sell, index) in sells" :key="index" @click="quickOrderPrice(sell.price)">
                          <span class="red">{{sell.price}}</span>
                          <span>{{sell.qtys_f}}</span>
                          <i class="ambg ambg1" :style="'width:' + getAmbgWidth(sell.qtys, 'sell')"></i>
                        </li>
                      </ul>
                      <div class="ticker" @click="quickOrderPrice(currencyNow.newPrice)">
                        <!--v-bind:class="{ 'down': currencyNow.change>0, 'up': currencyNow.change<=0 }"-->
                        <span>{{currencyNow.newPrice}}</span>
                        <span>≈¥{{computedPrice(currencyNow.newPrice)}}</span>
                      </div>
                      <ul class="buy-list">
                        <li v-for="(buy, index) in buys" :key="index" @click="quickOrderPrice(buy.price)">
                          <span class="green">{{buy.price}}</span>
                          <span>{{buy.qtys_f}}</span>
                          <i class="ambg" :style="'width:' + getAmbgWidth(buy.qtys, 'buy')"></i>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="full-left-bottom">
              <div class="order-trade">
                <div class="order-tab">
                  <div class="tabs">
                    <div class="tab-item" :class="{'active': activeAdName=='first'}" @click="changTab('first')">{{$t("message.current_entrust")}}</div>
                    <div class="tab-item" :class="{'active': activeAdName=='second'}" @click="changTab('second')">{{$t("message.history_deal")}}</div>
                    <div class="pr">
                      <span>显示其他交易对</span><input class="weui-switch" v-model="showOther" type="checkbox">
                    </div>
                  </div>
                  <div class="tabs-content">
                    <div class="user-order-box" v-if="activeAdName == 'first'">
                      <div class="user-order" v-for="(item,index) in currentOrder" :key="index">
                        <div class="o-action" @click="cancelOrderAction(item.id,item.typeKey, item.c_id)">{{$t("message.revoke")}}</div>
                        <div class="o-top">
                          <span class="o-type buy" v-if="item.typeKey==='buy'">{{$t("message.buy")}}</span>
                          <span class="o-type sell" v-if="item.typeKey==='sell'">{{$t("message.sell")}}</span>
                          <span class="o-type">{{item.token_name + '/' + getBaseTokenStr(item.token_base_id)}}</span>
                          <span class="o-time">{{item.time}}</span>
                        </div>
                        <div class="o-bottom" v-if="item.typeKey==='buy'">
                          <div class="o-info">
                            <div class="info-name">{{$t("message.entrust_price")}}</div>
                            <div class="info-value">{{item.price}}</div>
                          </div>
                          <div class="o-info">
                            <div class="info-name">{{$t("message.entrust_amount")}}</div>
                            <div class="info-value">{{item.amount_total}}</div>
                          </div>
                          <div class="o-info">
                            <div class="info-name">{{$t("message.deal_amount")}}</div>
                            <div class="info-value">{{parseFloat(item.amount_total-item.amount).toFixed(4)}}</div>
                          </div>
                        </div>
                        <div class="o-bottom" v-if="item.typeKey==='sell'">
                          <div class="o-info">
                            <div class="info-name">{{$t("message.entrust_price")}}</div>
                            <div class="info-value">{{item.price}}</div>
                          </div>
                          <div class="o-info">
                            <div class="info-name">{{$t("message.entrust_quantity")}}</div>
                            <div class="info-value">{{item.qty_total}}</div>
                          </div>
                          <div class="o-info">
                            <div class="info-name">{{$t("message.deal_quantity")}}</div>
                            <div class="info-value">{{parseFloat(item.qty_total-item.qty).toFixed(6)}}</div>
                          </div>
                        </div>
                      </div>
                      <div class="user-order-none" v-if="currentOrder.length==0">
                        <p>{{$t("message.no_entrust")}}</p>
                      </div>
                    </div>
                    <div class="user-order-box" v-if="activeAdName == 'second'">
                      <div class="user-order" v-for="(item,index) in dealRecordList" :key="index">
                        <div class="o-top">
                          <span class="o-type buy" v-if="item.buy_account == account.name">{{$t("message.buy")}}</span>
                          <span class="o-type sell" v-if="item.sell_account == account.name">{{$t("message.sell")}}</span>
                          <span class="o-type">{{item.token_name + '/' + getBaseTokenStr(item.token_base_id)}}</span>
                          <span class="o-time">{{item.create_date}}</span>
                        </div>
                        <div class="o-bottom">
                          <div class="o-info">
                            <div class="info-name">{{$t("message.deal_price")}}</div>
                            <div class="info-value">{{item.price}}</div>
                          </div>
                          <div class="o-info">
                            <div class="info-name">{{$t("message.deal_quantity")}}</div>
                            <div class="info-value">{{item.quantity}}</div>
                          </div>
                          <div class="o-info">
                            <div class="info-name">{{$t("message.deal_amount")}}</div>
                            <div class="info-value">{{item.total_price}}</div>
                          </div>
                        </div>
                        <div class='o-bottom'>
                          <div class='o-info'>
                            <div class='info-name'>{{$t('message.feel_amount')}}({{baseToken.sym_name}})</div>
                            <div class='info-value' v-if="item.buy_account == account.name && item.sell_account != account.name">{{parseFloat(item.fee_buyer).toFixed(4)}}</div>
                            <div class='info-value' v-if="item.sell_account == account.name && item.buy_account != account.name">{{parseFloat(item.fee_seller).toFixed(4)}}</div>
                            <div class='info-value' v-if="item.buy_account == account.name && item.sell_account == account.name">{{parseFloat(item.fee_buyer + item.fee_seller).toFixed(4)}}</div>
                          </div>
                          <div class='o-info2'>
                            <div class='info-name'>{{$t('message.tx_id')}}</div>
                            <div class='info-value'>
                              <a :href="'https://eosq.app/tx/'+item.tx_id" style="color: #47A9FF;text-decoration: none">{{item.tx_id}}</a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="user-order-none" v-if="dealRecordList.length==0">
                        <p>{{$t("message.no_deal")}}</p>
                      </div>
                      <loading v-if='loading && !isLast' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CoinMenu :show-coins="showCoin" :currency-id="currencyId" :group-now="baseToken.id" @on-showcoins-change="showCoinChange" @on-select="selectCoin"></CoinMenu>
      </div>
    </div>
</template>

<script>
  import CoinMenu from '../component/CoinMenu.vue';
  import Eos from 'eosjs';
  import moment from 'moment';
  import EosUtil from '../../common/EosUtils';
  import Enumerable from 'linq';
  import ElInput from '../element/input';
  import ElInputNumber from '../element/input-number';
  export default {
    name: 'Trade',
    data() {
      return {
        showCoin: false,
        activeAdName: 'first',
        createType: 'buy',
        quickQuantityType: 0,
        orderPrice: 0,
        orderQuantity: '',
        account: null,
        orderIntever: null,
        currencyId: '',
        baseToken: {sym_name: ''},
        currencyNow: {asset_symbol: '', change: 0, newPrice: 0, asset_precision: 4},
        serverCurrency: {icon: '', contract_name: ''},
        sells: [],
        buys: [],
        orderMaxBuyQty: 0,
        orderMaxSellQty: 0,
        currentOrder: [],
        // 用户的币种数量
        userAccountInfo: {
          eos: 0,
          exCoin: 0
        },
        firstPrice: true,
        eosInfo: {
          btPrice: 0
        },
        dealRecordList: [],
        // 底部导航
        tabCurrent: 'trade',
        btSupply: null,
        showOther: false,
        // 历史记录加载中
        loading: false,
        pageNum: 1,
        no_data: false
      };
    },
    computed: {
      identity: function () {
        return this.$store.state.identity;
      },
      basetokens: function () {
        return this.$store.state.basetokens;
      },
      scatter: function () {
        return this.$store.state.scatter;
      },
      contractCoins: function () {
        return this.$store.state.contractCoins;
      },
      serverCoins: function () {
        return this.$store.state.serverCoins;
      },
      classBuy: function () {
        return {
          'current': this.createType === 'buy'
        };
      },
      classSell: function () {
        return {
          'current': this.createType === 'sell'
        };
      },
      orderAmount: function () {
        if (parseFloat(this.orderPrice) > 0 && parseFloat(this.orderQuantity) > 0) {
          return parseFloat(parseFloat(this.orderPrice) * parseFloat(this.orderQuantity)).toFixed(4);
        } else {
          return 0;
        }
      },
      feelAmount: function () {
        if (parseFloat(this.orderPrice) > 0 && parseFloat(this.orderQuantity) > 0) {
          if (this.baseToken.sym_name === 'EOS') {
            if (this.createType === 'buy') {
              return 0;
            } else if (this.createType === 'sell') {
              return parseFloat(parseFloat(this.orderPrice) * parseFloat(this.orderQuantity) * 0.002).toFixed(4);
            } else {
              return 0;
            }
          } else {
            if (this.createType === 'buy') {
              return 0;
            } else if (this.createType === 'sell') {
              return parseFloat(parseFloat(this.orderPrice) * parseFloat(this.orderQuantity) * 0.001).toFixed(4);
            } else {
              return 0;
            }
          }
        } else {
          return 0;
        }
      },
      mining: function () {
        let orderAmount = parseFloat(this.orderAmount);
        // let btPrice = parseFloat(this.eosInfo.btPrice);
        // let btPrice = 0.006;
        // if (orderAmount > 0 && btPrice > 0) {
        //   let btNum = (this.orderAmount * 0.001) / btPrice * 1.6;
        //   return parseFloat(btNum).toFixed(4);
        // } else {
        //   return 0;
        // }
        if (this.btSupply) {
          let supplyNum = parseFloat(this.btSupply.supply.split(' ')[0]);
          if (supplyNum > 0 && supplyNum < 25000000) {
            let btPrice = 0.01;
            if (orderAmount > 0) {
              let btNum = this.feelAmount / btPrice * 2;
              return parseFloat(btNum).toFixed(4);
            } else {
              return 0;
            }
          } else if (supplyNum >= 25000000 && supplyNum < 50000000) {
            let btPrice = 0.01;
            if (orderAmount > 0) {
              let btNum = this.feelAmount / btPrice;
              return parseFloat(btNum).toFixed(4);
            } else {
              return 0;
            }
          } else {
            let btPrice = parseFloat(this.eosInfo.btPrice);
            if (orderAmount > 0 && btPrice > 0) {
              let btNum = this.feelAmount / btPrice * 0.5;
              return parseFloat(btNum).toFixed(4);
            } else {
              return 0;
            }
          }
        } else {
          return 0;
        }
      },
      theme () {
        return this.$store.state.theme;
      }
    },
    components: {
      CoinMenu, ElInput, ElInputNumber
    },
    watch: {
      currencyNow: function (newVal) {
        if (this.account) {
          this.getEosCount(this.account.name);
          this.getExCoinCount(this.account.name, newVal.contractName, newVal.asset_symbol);
        }
      },
      identity: function (newIdentity) {
        if (newIdentity) {
          let account = newIdentity.accounts.find(x => x.blockchain === 'eos');
          this.account = account;
          // 获取基础币种数量
          if (this.baseToken) {
            this.getEosCount(account.name);
          }
          if (this.currencyNow.asset_symbol !== '') {
            this.getExCoinCount(account.name, this.currencyNow.contractName, this.currencyNow.asset_symbol);
          }
        }
      },
      basetokens: function (newTokens) {
        if (newTokens && this.currencyId) {
          this.getBaseToken(this.currencyNow.base_id);
        }
      },
      baseToken: function (baseToken) {
        if (this.account) {
          this.getEosCount(this.account.name);
        }
      },
      currencyId: function (newCurrencyId) {
        window.localStorage.setItem('currencyId', newCurrencyId);
      },
      contractCoins: function (newCoins) {
        this.getCurrentOrder();
      },
      showOther: function (show) {
        this.dealRecordList = [];
        this.no_data = false;
        this.getCurrentOrder();
        this.getUserDealRecords(1);
      }
    },
    methods: {
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
        } else {
          newClass = 'color: #14BC63';
        }
        return newClass;
      },
      // 切换到历史成交
      changTab(key) {
        this.activeAdName = key;
        if (key === 'second') {
          this.dealRecordList = [];
          this.no_data = false;
          this.getUserDealRecords(1);
        }
      },
      showCoinAction() {
        this.showCoin = true;
      },
      showCoinChange(val) {
        this.showCoin = val;
      },
      // 跳转图表页
      goChart() {
        this.$router.replace('/market/chart/' + this.currencyId);
      },
      // 获取买入卖出 类型切换的文本
      getOrderType(name) {
        if (this.createType === 'buy') {
          return this.$t('message.buy') + ' ' + name;
        } else if (this.createType === 'sell') {
          return this.$t('message.sell') + ' ' + name;
        } else {
          return '';
        }
      },
      // 买卖类型切换
      buyClick() {
        if (this.createType === 'sell') {
          this.createType = 'buy';
          this.orderQuantity = '';
          this.quickQuantityType = 0;
          if (this.sells.length > 0) {
            this.orderPrice = parseFloat(this.sells[this.sells.length - 1].price);
          } else {
            this.orderPrice = 0;
          }
        }
      },
      // 买卖类型切换
      sellClick() {
        if (this.createType === 'buy') {
          this.createType = 'sell';
          this.orderQuantity = '';
          this.quickQuantityType = 0;
          if (this.buys.length > 0) {
            this.orderPrice = parseFloat(this.buys[0].price);
          } else {
            this.orderPrice = 0;
          }
        } else {
          // console.log('已经是sell');
        }
      },
      // 手动输入数量 置空
      quantityChange() {
        this.quickQuantityType = 0;
      },
      // 百分之数量
      quickQuantity(num) {
        this.quickQuantityType = num;
        let precision = this.currencyNow.asset_precision;
        if (this.createType === 'sell') {
          if (num === 1) {
            this.orderQuantity = parseFloat(this.userAccountInfo.exCoin * 0.25).toFixed(precision);
          } else if (num === 2) {
            this.orderQuantity = parseFloat(this.userAccountInfo.exCoin * 0.5).toFixed(precision);
          } else if (num === 3) {
            this.orderQuantity = parseFloat(this.userAccountInfo.exCoin * 0.75).toFixed(precision);
          } else if (num === 4) {
            this.orderQuantity = parseFloat(this.userAccountInfo.exCoin).toFixed(precision);
          } else {
            this.orderQuantity = 0;
          }
        } else if (this.createType === 'buy') {
          if (this.userAccountInfo.eos === 0 || parseFloat(this.orderPrice) === 0) {
            this.orderQuantity = 0;
          } else {
            if (num === 1) {
              this.orderQuantity = parseFloat((this.userAccountInfo.eos / parseFloat(this.orderPrice) * 0.999) * 0.25).toFixed(precision);
            } else if (num === 2) {
              this.orderQuantity = parseFloat((this.userAccountInfo.eos / parseFloat(this.orderPrice) * 0.999) * 0.5).toFixed(precision);
            } else if (num === 3) {
              this.orderQuantity = parseFloat((this.userAccountInfo.eos / parseFloat(this.orderPrice) * 0.999) * 0.75).toFixed(precision);
            } else if (num === 4) {
              let amount = parseFloat(this.userAccountInfo.eos / parseFloat(this.orderPrice) * 0.999);
              let pamvar = 1;
              for (let i = 0; i < precision; i++) {
                pamvar = pamvar * 10;
              }
              amount = parseInt(parseFloat(amount * pamvar).toFixed(0)) / pamvar;
              this.orderQuantity = amount;
            } else {
              this.orderQuantity = 0;
            }
          }
        } else {
          this.orderQuantity = 0;
        }
      },
      // 获取用户的历史成交
      getUserDealRecords(pageNumber) {
        let that = this;
        if (this.account && this.contractCoins) {
          let data;
          if (this.showOther) {
            data = {
              account: that.account.name,
              limit: 10,
              page: pageNumber
            };
          } else {
            data = {
              account: that.account.name,
              limit: 10,
              page: pageNumber,
              currency_id: that.currencyId
            };
          }
          this.loading = true;
          // 发送
          this.selfUtil.apiAxios('POST', this.selfUtil.host + '/service/api/user/record', {'params': data}, res => {
            that.loading = false;
            if (res.result.error === 0) {
              that.pageNum = pageNumber + 1;
              // 获取成功
              if (res.result.records.length > 0) {
                let records = [];
                let tokens = that.contractCoins;
                for (let i = 0; i < res.result.records.length; i++) {
                  let record = res.result.records[i];
                  // record.create_date = moment(parseInt(record.createtimestamp)).local().format('YYYY-MM-DD HH:mm');
                  record.create_date = moment.utc(record.create_date).local().format('MM-DD HH:mm');
                  let token = Enumerable.from(tokens)
                    .where(function (x) { return x.currencyId === record.currency_id; }).toArray();
                  if (token && token.length > 0) {
                    record.token_name = token[0].asset_symbol;
                    record.token_id = token[0].currencyId;
                    record.token_base_id = token[0].base_id;
                  } else {
                    record.token_name = '';
                    record.token_id = '';
                    record.token_base_id = '';
                  }
                  records.push(record);
                }
                that.dealRecordList = that.dealRecordList.concat(records);
              } else {
                that.no_data = true;
              }
            }
          });
        }
      },
      // 计算交易价格
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
      // 点击修改价格
      quickOrderPrice(price) {
        this.orderPrice = parseFloat(price).toFixed(6);
      },
      // 撤单动作
      cancelOrderAction(orderId, orderType, currencyId) {
        // var that = this;
        if (this.account) {
          if (orderType === 'sell') {
            this.cancelOrder(orderId, 2, currencyId);
          } else {
            this.cancelOrder(orderId, 1, currencyId);
          }
        } else {
          this.$message({
            type: 'error',
            text: this.$t('message.alert_please_log_in_first'),
            duration: 3000
          });
        }
      },
      // 切换币种
      selectCoin(currency) {
        // this.currencyNow = {asset_symbol: currency.asset_symbol, change: currency.change, newPrice: currency.newPrice, asset_precision: currency.asset_precision};
        this.currencyNow = currency;
        this.initData(currency.currencyId);
      },
      initData(currencyId) {
        this.currencyId = currencyId;
        this.firstPrice = true;
        this.sells = [];
        this.buys = [];
        this.currentOrder = [];
        this.dealRecordList = [];
        // this.createType = 'buy';
        this.orderQuantity = '';
        this.quickQuantityType = 0;
        this.orderMaxBuyQty = 0;
        this.orderMaxSellQty = 0;
        this.no_data = false;
        // 获取当前币种（链上）
        this.getCurrencyCoin(currencyId);
        // 服务器coin
        this.getCoin(currencyId);
        this.getOrder(currencyId);
        this.getCurrentOrder();
        this.getUserDealRecords(1);
      },
      // 获取 (计算)当前挂单
      getCurrentOrder() {
        let that = this;
        if (this.account && this.contractCoins) {
          var p1 = new Promise(function (resolve, reject) {
            var params = {
              'scope': that.account.name,
              'code': 'btexexchange',
              'table': 'usellorders',
              'json': 'true',
              'limit': -1,
              'lower_bound': 0
            };
            EosUtil.getTableRow(params, function (rows) {
              resolve(rows);
            });
          });
          var p2 = new Promise(function (resolve, reject) {
            var params = {
              'scope': that.account.name,
              'code': 'btexexchange',
              'table': 'ubuyorders',
              'json': 'true',
              'limit': -1,
              'lower_bound': 0
            };
            EosUtil.getTableRow(params, function (rows) {
              resolve(rows);
            });
          });
          Promise.all([p1, p2]).then(function (results) {
            // 分析获取
            let tokens = that.contractCoins;
            let userSellOrders = results[0];
            let userBuyOrders = results[1];
            let myOrders = [];
            let order;
            for (let i = 0; i < userBuyOrders.length; i++) {
              order = userBuyOrders[i];
              order.typeKey = 'buy';
              order.time = moment(new Date(parseInt(order.order_time))).format('MM-DD HH:mm:ss');
              order.price = parseFloat(order.price).toFixed(6);
              order.amount = parseFloat(order.amount.toString().split(' ')[0]);
              order.amount_total = parseFloat(order.amount_total.toString().split(' ')[0]);
              let token = Enumerable.from(tokens)
                .where(function (x) { return x.currencyId === order.c_id; }).toArray();
              if (token) {
                order.token_name = token[0].asset_symbol;
                order.token_id = token[0].currencyId;
                order.token_base_id = token[0].base_id;
              } else {
                order.token_name = '';
                order.token_id = '';
                order.token_base_id = '';
              }
              myOrders.push(order);
            }
            for (let j = 0; j < userSellOrders.length; j++) {
              order = userSellOrders[j];
              order.typeKey = 'sell';
              order.time = moment(new Date(parseInt(order.order_time))).format('MM-DD HH:mm:ss');
              order.price = parseFloat(order.price).toFixed(6);
              order.qty = parseFloat(order.qty.toString().split(' ')[0]);
              order.qty_total = parseFloat(order.qty_total.toString().split(' ')[0]);
              let token = Enumerable.from(tokens)
                .where(function (x) { return x.currencyId === order.c_id; }).toArray();
              if (token) {
                order.token_name = token[0].asset_symbol;
                order.token_id = token[0].currencyId;
                order.token_base_id = token[0].base_id;
              } else {
                order.token_name = '';
                order.token_id = '';
                order.token_base_id = '';
              }
              myOrders.push(order);
            }
            myOrders.sort(function (x, y) {
              return parseInt(y.order_time) - parseInt(x.order_time);
            });
            if (that.showOther) {
              that.currentOrder = myOrders;
            } else {
              that.currentOrder = Enumerable.from(myOrders).where(x => {
                return x.c_id === that.currencyId;
              }).toArray();
            }
          });
        }
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
          let sellCount = sells.length > 5 ? 5 : sells.length;
          for (let j = sells.length - 1; j >= (sells.length - sellCount); j--) {
            let sell = {
              price: sells[j].price.toFixed(6),
              qtys: sells[j].qtys,
              qtys_f: that.selfUtil.formatNnum(sells[j].qtys),
              qty_totals: sells[j].qty_totals.toFixed(4)
            };
            sellShows.push(sell);
          }
          that.sells = sellShows.reverse();
          if (that.createType === 'buy') {
            // 设置默认价格
            if (that.firstPrice) {
              that.firstPrice = false;
              // 默认买入 显示卖出的最低价
              if (that.sells.length > 0) {
                that.orderPrice = parseFloat(that.sells[that.sells.length - 1].price);
              } else {
                that.orderPrice = 0;
              }
            }
          }
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
              })
            .toArray();
          // 排序
          buys.sort(function (x, y) {
            return y.price - x.price;
          });
          let buyShows = [];
          let butCount = buys.length > 5 ? 5 : buys.length;
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
          if (that.createType === 'sell') {
            // 设置默认价格
            if (that.firstPrice) {
              that.firstPrice = false;
              // 默认买入 显示卖出的最低价
              if (that.buys.length > 0) {
                that.orderPrice = parseFloat(that.buys[0].price);
              } else {
                that.orderPrice = 0;
              }
            }
          }
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
      // 获取用户EOS数量（基础交易货币）
      getEosCount(account) {
        let that = this;
        let options = {
          httpEndpoint: that.selfUtil.httpEndpoint
        };
        let eos = Eos(options);
        eos.getCurrencyBalance(that.baseToken.contract, account, that.baseToken.sym_name).then(function (e) {
          if (e.length > 0) {
            let eosNum = e[0].toString().split(' ')[0];
            that.userAccountInfo.eos = parseFloat(eosNum);
          } else {
            that.userAccountInfo.eos = 0;
          }
        });
      },
      // 获取用户交换币种数量
      getExCoinCount(account, token, symb) {
        let that = this;
        let options = {
          httpEndpoint: that.selfUtil.httpEndpoint
        };
        let eos = Eos(options);
        eos.getCurrencyBalance(token, account, symb).then(function (e) {
          if (e.length > 0) {
            let btNum = e[0].toString().split(' ')[0];
            that.userAccountInfo.exCoin = parseFloat(btNum);
          } else {
            that.userAccountInfo.exCoin = 0;
          }
        });
      },
      // 用户挂单
      createOrder() {
        let that = this;
        if (this.account) {
          if (this.orderQuantity > 0 && parseFloat(this.orderPrice) > 0) {
            var memo = 'order:';
            if (this.createType === 'buy') {
              // 买入挂单
              let orderPrice = parseFloat(that.orderPrice).toFixed(6);
              let amount = parseFloat(that.orderAmount + that.feelAmount).toFixed(4);
              let orderId = new Date().getTime() + Math.random().toString().substr(3, 5);
              memo = memo + '1,';
              memo = memo + orderId + ',';
              memo = memo + that.currencyId + ',';
              memo = memo + parseFloat(orderPrice * 1000000).toFixed(0) + ',';
              memo = memo + '6';
              if (amount < 0.1) {
                this.$message({
                  type: 'error',
                  text: this.$t('message.alert_less_than_zero_point_one'),
                  duration: 3000
                });
              } else if (amount > that.userAccountInfo.eos) {
                this.$message({
                  type: 'error',
                  text: this.$t('message.alert_no_money'),
                  duration: 3000
                });
              } else {
                that.buyOrder('btexexchange', amount, memo);
              }
            } else if (this.createType === 'sell') {
              // 卖出挂单
              let orderPrice = parseFloat(that.orderPrice).toFixed(6);
              let orderId = new Date().getTime() + Math.random().toString().substr(3, 5);
              memo = memo + '2,';
              memo = memo + orderId + ',';
              memo = memo + that.baseToken.id + ',';
              memo = memo + parseFloat(orderPrice * 1000000).toFixed(0) + ',';
              memo = memo + '6';
              let amount = parseFloat(that.orderQuantity).toFixed(that.currencyNow.asset_precision);

              let orderAmount = parseFloat(that.orderAmount).toFixed(4);
              if (orderAmount < 0.1) {
                this.$message({
                  type: 'error',
                  text: this.$t('message.alert_less_than_zero_point_one'),
                  duration: 3000
                });
              } else if (amount > that.userAccountInfo.exCoin) {
                this.$message({
                  type: 'error',
                  text: this.$t('message.alert_no_money'),
                  duration: 3000
                });
              } else {
                that.sellOrder(that.currencyNow.contractName, that.currencyNow.asset_symbol, 'btexexchange', that.currencyNow.asset_precision, amount, memo);
              }
            } else {
              this.$message({
                type: 'error',
                text: this.$t('message.alert_type_error'),
                duration: 3000
              });
            }
          } else {
            this.$message({
              type: 'error',
              text: this.$t('message.alert_less_than_zero'),
              duration: 3000
            });
          }
        } else {
          this.$message({
            type: 'error',
            text: this.$t('message.alert_please_log_in_first'),
            duration: 3000
          });
        }
      },
      buyOrder(to, amount, memo) {
        var that = this;
        if (this.scatter) {
          var eos = this.scatter.eos(that.selfUtil.network, Eos, { expireInSeconds: 60 });
          this.scatter.getIdentity({
            accounts: [that.selfUtil.network]
          }).then(identity => {
            let account = identity.accounts.find(x => x.blockchain === 'eos');
            eos.transaction(
              {
                actions: [
                  {
                    account: that.baseToken.contract,
                    name: 'transfer',
                    authorization: [
                      {
                        actor: account.name,
                        permission: account.authority
                      }
                    ],
                    data: {
                      from: account.name,
                      to: to,
                      quantity: amount + ' ' + that.baseToken.sym_name,
                      memo: memo
                    }
                  }
                ]
              }, (err, res) => {
                if (!err) {
                  setTimeout(function () {
                    that.getCurrencyCoin(that.currencyId);
                    that.getOrder(that.currencyId);
                    that.getCurrentOrder();
                    // 获取用户成交
                    if (that.activeAdName === 'second') {
                      // 显示在 用户 成交记录 界面
                      that.dealRecordList = [];
                      that.no_data = false;
                      that.getUserDealRecords(1);
                    }
                  }, 2000);
                  // 挂单成功
                  this.$message({
                    type: 'success',
                    text: this.$t('message.alert_entrust_success'),
                    duration: 3000
                  });
                } else {
                  if (typeof (err) === 'string') {
                    err = JSON.parse(err);
                    if (err.code === 500) {
                      var errMsg = '';
                      err.error.details.forEach(function (item, index) {
                        errMsg += item.message + ';';
                      });
                      this.$message({
                        type: 'error',
                        text: this.$t('message.alert_entrust_error') + ':' + errMsg,
                        duration: 3000
                      });
                    }
                  } else {
                    this.$message({
                      type: 'error',
                      text: this.$t('message.alert_entrust_error') + ':' + err.message,
                      duration: 3000
                    });
                  }
                }
              });
          }).catch(error => {
            this.$message({
              type: 'error',
              text: this.$t('alert_get_user_error') + ':' + error.message,
              duration: 3000
            });
          });
        } else {
          this.$message({
            type: 'error',
            text: this.$t('message.alert_no_scatter'),
            duration: 3000
          });
        }
      },
      sellOrder(contract, sym, to, precision, amount, memo) {
        let that = this;
        if (this.scatter) {
          let eos = this.scatter.eos(that.selfUtil.network, Eos, { expireInSeconds: 60 });
          this.scatter.getIdentity({
            accounts: [that.selfUtil.network]
          }).then(identity => {
            let account = identity.accounts.find(x => x.blockchain === 'eos');
            eos.transaction(
              {
                actions: [
                  {
                    account: contract,
                    name: 'transfer',
                    authorization: [
                      {
                        actor: account.name,
                        permission: account.authority
                      }
                    ],
                    data: {
                      from: account.name,
                      to: to,
                      quantity: amount + ' ' + sym,
                      memo: memo
                    }
                  }
                ]
              }, (err, res) => {
                if (!err) {
                  // 挂单成功
                  setTimeout(function () {
                    that.getCurrencyCoin(that.currencyId);
                    that.getOrder(that.currencyId);
                    that.getCurrentOrder();
                    // 获取用户成交
                    if (that.activeAdName === 'second') {
                      // 显示在 用户 成交记录 界面
                      that.dealRecordList = [];
                      that.no_data = false;
                      that.getUserDealRecords(1);
                    }
                  }, 2000);
                  this.$message({
                    type: 'success',
                    text: this.$t('message.alert_entrust_success'),
                    duration: 3000
                  });
                } else {
                  if (typeof (err) === 'string') {
                    err = JSON.parse(err);
                    if (err.code === 500) {
                      var errMsg = '';
                      err.error.details.forEach(function (item, index) {
                        errMsg += item.message + ';';
                      });
                      this.$message({
                        type: 'error',
                        text: this.$t('message.alert_entrust_error') + ':' + errMsg,
                        duration: 3000
                      });
                    }
                  } else {
                    this.$message({
                      type: 'error',
                      text: this.$t('message.alert_entrust_error') + ':' + err.message,
                      duration: 3000
                    });
                  }
                }
              });
          }).catch(error => {
            this.$message({
              type: 'error',
              text: this.$t('alert_get_user_error') + ':' + error.message,
              duration: 3000
            });
          });
        } else {
          this.$message({
            type: 'error',
            text: this.$t('message.alert_no_scatter'),
            duration: 3000
          });
        }
      },
      cancelOrder(orderId, oType, currencyId) {
        let that = this;
        if (this.scatter) {
          let eos = this.scatter.eos(that.selfUtil.network, Eos, { expireInSeconds: 60 });
          this.scatter.getIdentity({
            accounts: [that.selfUtil.network]
          }).then(identity => {
            let account = identity.accounts.find(x => x.blockchain === 'eos');
            eos.transaction(
              {
                actions: [
                  {
                    account: 'btexexchange',
                    name: 'cancelorder',
                    authorization: [
                      {
                        actor: account.name,
                        permission: account.authority
                      }
                    ],
                    data: {
                      owner: account.name,
                      pair_id: currencyId,
                      o_id: orderId,
                      o_type: oType
                    }
                  }
                ]
              }, (err, res) => {
                if (!err) {
                  // 撤单成功
                  setTimeout(function () {
                    that.getOrder(that.currencyId);
                    that.getCurrentOrder();
                  }, 2000);
                  this.$message({
                    type: 'success',
                    text: this.$t('message.alert_cancel_success'),
                    duration: 3000
                  });
                } else {
                  if (typeof (err) === 'string') {
                    // this.weui.alert(this.$t('message.alert_cancel_error') + ':' + err);
                    err = JSON.parse(err);
                    if (err.code === 500) {
                      var errMsg = '';
                      err.error.details.forEach(function (item, index) {
                        errMsg += item.message + ';';
                      });
                      this.$message({
                        type: 'error',
                        text: this.$t('message.alert_cancel_error') + ':' + errMsg,
                        duration: 3000
                      });
                    }
                  } else {
                    // this.weui.alert(this.$t('message.alert_cancel_error') + ':' + err.message);
                    this.$message({
                      type: 'error',
                      text: this.$t('message.alert_cancel_error') + ':' + err.message,
                      duration: 3000
                    });
                  }
                }
              });
          }).catch(error => {
            // this.weui.alert(this.$t('alert_get_user_error') + ':' + error.message);
            this.$message({
              type: 'error',
              text: this.$t('alert_get_user_error') + ':' + error.message,
              duration: 3000
            });
          });
        } else {
          // this.weui.alert(this.$t('message.alert_no_scatter'));
          this.$message({
            type: 'error',
            text: this.$t('message.alert_no_scatter'),
            duration: 3000
          });
        }
      },
      // 获取当前币种
      getCurrencyCoin(currencyId) {
        let that = this;
        let params = {'scope': 'btexexchange', 'code': 'btexexchange', 'table': 'tokenpairs', 'json': 'true', 'limit': 1, 'lower_bound': currencyId};
        EosUtil.getTableRow(params, function (rows) {
          if (rows && rows.length > 0) {
            that.currencyId = rows[0].id;
            that.currencyNow.asset_symbol = rows[0].sym_name;
            that.currencyNow.newPrice = parseFloat(rows[0].price).toFixed(6);
            that.currencyNow.startPrice = parseFloat(rows[0].open_price).toFixed(6);
            that.currencyNow.contractName = rows[0].contract;
            that.currencyNow.asset_precision = rows[0].precision;
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
      // 获取BT流通量
      getBTSupply() {
        let that = this;
        EosUtil.getContractSupply('eosbtextoken', 'BT', function (c) {
          that.btSupply = c['BT'];
        });
      },
      // 获取服务器币种
      getCoin(currencyId) {
        let that = this;
        let data = {};
        data.currency_id = currencyId;
        // data.account_name = this.account.name;
        this.selfUtil.apiAxios('POST', this.selfUtil.host + '/service/api/currency/details', {'params': data}, res => {
          if (res.result.error === 0) {
            // 获取成功
            that.serverCurrency = res.result.record;
            that.serverCurrency.volume = that.selfUtil.formatNnum(parseFloat(that.serverCurrency.volume));
            that.serverCurrency.grade = parseInt(that.serverCurrency.grade);
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
          this.baseToken = queryResult[0];
        }
      },
      getBaseTokenStr(baseId) {
        if (this.basetokens && baseId !== '') {
          let queryResult = Enumerable.from(this.basetokens)
            .where(function (x) {
              return x.id === baseId;
            })
            .toArray();
          return queryResult[0].sym_name;
        } else {
          return '';
        }
      },
      scroll() {
        let that = this;
        // 距离底部200px时加载一次
        let distance = document.documentElement.offsetHeight - document.body.scrollTop - document.documentElement.scrollTop - window.innerHeight;
        let bottomOfWindow = distance <= 200;
        if (that.activeAdName === 'second') {
          if (bottomOfWindow && that.loading === false && that.no_data === false) {
            that.getUserDealRecords(that.pageNum);
          }
        }
      }
    },
    mounted() {
      var that = this;
      window.onscroll = function () {
        that.scroll();
      };
    },
    created() {
      // 获取账号详情
      if (this.identity) {
        let account = this.identity.accounts.find(x => x.blockchain === 'eos');
        this.account = account;
      }
      // 获取交易类别
      let tradeType = this.$route.params.tradeType;
      if (tradeType && tradeType === 'sell') {
        this.createType = 'sell';
      }
      // 接收币种id
      if (this.$route.params.currencyId) {
        let currencyId = this.$route.params.currencyId;
        this.currencyId = currencyId;
        if (this.serverCoins) {
          let coin = Enumerable.from(this.serverCoins).singleOrDefault(function (x) {
            return x.currency_id === currencyId;
          });
          this.currencyNow.asset_symbol = coin.asset_symbol;
        }
        this.getCurrencyCoin(currencyId);
        this.initData(currencyId);
      } else {
        // 没有币种，查询排名第一的币种
        if (this.serverCoins) {
          let showList = Enumerable.from(this.serverCoins).where(function (x) {
            return x.tradable;
          }).orderBy('x=>x.currency_id').orderByDescending('x=>x.turnover').orderByDescending('x=>x.sort').toArray();
          let currencyId = showList[0].currency_id;
          this.currencyId = currencyId;
          this.currencyNow.asset_symbol = showList[0].asset_symbol;
          this.getCurrencyCoin(currencyId);
          this.initData(currencyId);
        } else {
          this.selfUtil.apiAxios('POST', this.selfUtil.host + '/service/api/currencies', {'params': {}}, res => {
            if (res.result.error === 0) {
              // 获取成功， 拼接，链上数据
              let showList = Enumerable.from(res.result.records).where(function (x) {
                return x.tradable;
              }).orderBy('x=>x.currency_id').orderByDescending('x=>x.turnover').orderByDescending('x=>x.sort').toArray();
              let currencyId = showList[0].currency_id;
              this.currencyId = currencyId;
              this.currencyNow.asset_symbol = showList[0].asset_symbol;
              this.getCurrencyCoin(currencyId);
              this.initData(currencyId);
            }
          });
        }
      }
      // 获取BT流通量
      this.getBTSupply();
      // 获取bt最新价
      EosUtil.getEosBt(eosInfo => {
        that.eosInfo = eosInfo;
      });
      var that = this;
      // 定时获取余额
      this.orderIntever = setInterval(() => {
        if (this.firstPrice) {
          // 不做处理 为切换让行
        } else {
          if (that.currencyId !== '') {
            that.getCurrencyCoin(that.currencyId);
            // 获取挂单
            that.getOrder(that.currencyId);
          }
          if (that.account && that.baseToken) {
            // 获取EOS数量
            that.getEosCount(that.account.name);
          }
          if (that.account && that.currencyNow.asset_symbol !== '') {
            // 获取交换币种数量
            that.getExCoinCount(that.account.name, that.currencyNow.contractName, that.currencyNow.asset_symbol);
          }
        }
        // 获取bt最新价
        EosUtil.getEosBt(eosInfo => {
          that.eosInfo = eosInfo;
        });
      }, 5000);
    },
    beforeDestroy() {
      window.clearInterval(this.orderIntever);
    }
  };
</script>
<style lang="scss" scoped>
  .page.dark{
    padding-bottom: 50px;
    .trade-page {
      /*min-height: 100vh;*/
      background-color: #1F3548;
      display: flex;
      flex-direction: column;
      .tarde-container {
        height: 100%;
        .full-left {
          height: 100%;
          display: flex;
          -webkit-box-orient: vertical;
          flex-direction: column;
          flex: 1;
          box-sizing: border-box;
          .full-left-top {
            display: flex;
            height: 380px;
            box-sizing: border-box;
            background: #1F3548;
            flex-direction: column;
            position: relative;
            padding-top: 50px;
            .coin-info{
              background: #2A4862;
              height: 50px;
              position: fixed;
              width: 100%;
              top: 0px;
              z-index: 100;
              max-width: 768px;
              .coin-one{
                color: #fff;
                margin-right: 0px;
                font-size: 0.75rem;
                display: flex;
                width: 100%;
                line-height: 50px;
                background-color: #2A4862;
                .priceandstate{
                  flex: 1;
                  /*display: flex;*/
                  /*.current-price{*/
                    /*flex: 1.5;*/
                    /*display: flex;*/
                    /*flex-direction: column;*/
                    /*text-align: right;*/
                    /*line-height: 1em;*/
                    /*span{*/
                      /*flex: 1;*/
                      /*line-height: 1em;*/
                    /*}*/
                  /*}*/
                  .current-state{
                    padding-left: 10px;
                    font-size: 0.875rem;
                    color: #fff;
                    text-align: right;
                    padding-right: 10px;
                    span{
                      padding: 8px 10px;
                      border-radius: 2px;
                      background-color: #818181;
                    }
                  }
                  .current-price .big{
                    font-size: 1.125rem;
                    display: table-cell;
                    vertical-align: bottom;
                    padding-top: 10px;
                  }
                  .current-state.green  span {
                    background-color: #14BC63;
                  }
                  .current-state.red span {
                    background-color: #FF8181;
                  }
                }

                .coin-name{
                  flex: 1.6;
                  /*width: 136px;*/
                  font-size: 1rem;
                  /*padding-left: 10px;*/
                  display: flex;
                  padding: 10px;
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
                      font-size: 0.75rem;
                      color: #909090;
                    }
                  }
                }
              }
            }
            .full-trade{
              overflow: hidden;
              background: #1F3548;
              display: flex;
              .ad-select{
                color: #fff;
                background: #2A4862;
                display: flex;
                margin: 10px;
                text-align: center;
                font-size: 0.75rem;
                margin-bottom: 0px;
                margin-top: 12px;
                .sell{
                  flex: 1;
                  padding: 10px;
                }
                .buy{
                  flex: 1;
                  padding: 10px;
                }
                .buy.current{
                  color: #14BC63;
                  border-bottom: 2px solid #14BC63;
                }
                .sell.current{
                  color: #FF8181;
                  border-bottom: 2px solid #FF8181;
                }
              }
              .ad-create{
                width: 54%;
                .ad-select{
                }
                .ad-create-box{
                  flex: 1;
                  padding: 12px 10px;
                  .input-container,.quik-num-btns,.trade-price,.trade-submit{
                    padding-bottom: 10px;
                  }
                  .quik-num-btns{
                    display: flex;
                    span{
                      display: table-cell;
                      flex: 1;
                      background: rgba(71,122,166,0.16);
                      border-radius: 4px;
                      margin-right: 10px;
                      padding: 5px;
                      text-align: center;
                      font-size: 0.625rem;
                      color: rgba(255,255,255,0.43);
                      cursor: pointer;
                      vertical-align: middle;
                    }
                    span.active{
                      background: rgb(71,122,166);
                    }
                    span:nth-child(4){
                      margin-right: 0px;
                    }
                  }
                  .trade-price{
                    opacity: 0.51;
                    font-size: 0.625rem;
                    color: #FFFFFF;
                    /*margin-bottom: 4px;*/
                  }
                }
              }
              .ad-list{
                flex: 1;
                padding: 8px 0px;
                padding-bottom: 0px;
                .spot-box {
                  height: calc(100% - 0px);
                  width: 100%;
                  position: relative;
                  box-sizing: border-box;
                  .spot-head{
                    height: 24px;
                    color: #5A81A3;
                    padding: 0px 10px;
                    margin: 0px;
                    li {
                      list-style: none;
                      float: left;
                      font-size: 0.75rem;
                      height: 24px;
                      line-height: 24px;
                      text-align: right;
                      width: 50%;
                    }
                    li:nth-of-type(3n+1) {
                      text-align: left;
                    }
                  }
                  .scroll-box{
                    height: calc(100%);
                    overflow-y: auto;
                    padding: 0px 10px;
                    .ticker{
                      font-size: 0.9375rem;
                      height: 28px;
                      line-height: 28px;
                      text-align: right;
                      padding: 0px;
                      color: #b8b8b8;
                      span{
                        width: 50%;
                        float: left;
                      }
                      span:nth-of-type(2n+1) {
                        text-align: left;
                      }
                    }
                    .down{
                      color: #F87070;
                    }
                    .up{
                      color: #14BC63;
                    }
                    .sell-list {
                      padding: 0px;
                      margin: 0px;
                      li {
                        list-style: none;
                        padding: 5px 0px;
                        height: 16px;
                        line-height: 16px;
                        text-align: left;
                        font-size: 0.75rem;
                        position: relative;
                        span {
                          color: #fff;
                          display: inline-block;
                          float: left;
                          width: 50%;
                        }
                        span:nth-of-type(2n) {
                          text-align: right;
                        }
                        span.green {
                          color: #14BC63;
                        }
                        span.red {
                          color: #F87070;
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
                        i.ambg1{
                          background: RGBA(232,18,52,.5);
                        }
                      }
                    }
                    .buy-list {
                      padding: 0px;
                      margin: 0px;
                      li {
                        list-style: none;
                        padding: 5px 0px;
                        height: 16px;
                        line-height: 16px;
                        text-align: left;
                        font-size: 0.75rem;
                        position: relative;
                        span {
                          color: #fff;
                          display: inline-block;
                          float: left;
                          width: 50%;
                        }
                        span:nth-of-type(2n) {
                          text-align: right;
                        }
                        span.green {
                          color: #14BC63;
                        }
                        span.red {
                          color: #F87070;
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
              }
            }
          }
          .full-left-bottom {
            flex-grow: 1;
            margin-bottom: 0;
            overflow-x: auto;
            overflow-y: hidden;
            box-sizing: border-box;
            background: #1F3548;
            min-height: 300px;
            .order-trade {
              font-size: 0.8rem;
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
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #fff;
                    opacity: .5;
                    position: relative;
                  }
                  .tab-item.active{
                    opacity: 1;
                    border-bottom: 2px solid #589ad3;
                  }
                  .pr{
                    display: inline-block;
                    float: right;
                    line-height: 40px;
                    span{
                      color: #fff;
                      opacity: .5;
                      padding-right: 4px;
                    }
                  }
                }
              }
              .user-order-box{
                padding: 0px 10px 10px 10px;
              }
              .user-order{
                background: #2D4E69;
                border-radius: 3px;
                padding: 10px;
                position: relative;
                margin-top: 10px;
                .o-top{
                  .o-type{
                    font-size: 0.875rem;
                    padding-right: 10px;
                    color: #fff
                  }
                  .o-type.buy{
                    color: #14BC63;
                  }
                  .o-type.sell{
                    color: #F87070;
                  }
                  .o-time{
                    font-size: 0.75rem;
                    color: #fff;
                  }
                }
                .o-bottom{
                  display: flex;
                  .o-info{
                    padding-top: 10px;
                    flex: 1;
                    .info-name{
                      font-size: 0.75rem;
                      color: #5A81A3;
                    }
                    .info-value{
                      font-size: 0.75rem;
                      color: #FFFFFF;
                    }
                  }
                  .o-info2{
                    padding-top: 10px;
                    flex: 2;
                    width: 0;
                    .info-name{
                      font-size: 0.75rem;
                      color: #5A81A3;
                    }
                    .info-value{
                      font-size: 0.75rem;
                      color: #FFFFFF;
                      a{
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        width: 100%;
                        display: block;
                      }
                    }
                  }
                  .o-info:nth-child(1){
                    flex: 1.2;
                  }
                }
                .o-action{
                  position: absolute;
                  top: 10px;
                  right: 10px;
                  font-size: 0.75rem;
                  color: #47A9FF;
                  padding: 2px 10px;
                  cursor: pointer;
                  border: 1px solid #47A9FF;
                  border-radius: 4px;
                }
              }
              .user-order-none{
                p{
                  padding: 10px;
                  text-align: center;
                  font-size: 0.75rem;
                  color: #fff;
                }
              }
            }
          }
        }
      }
    }
  }

  .page.light{
    padding-bottom: 50px;
    .trade-page {
      /*min-height: 100vh;*/
      background-color: #ffffff;
      display: flex;
      flex-direction: column;
      .tarde-container {
        height: 100%;
        .full-left {
          height: 100%;
          display: flex;
          -webkit-box-orient: vertical;
          flex-direction: column;
          flex: 1;
          box-sizing: border-box;
          .full-left-top {
            display: flex;
            height: 380px;
            box-sizing: border-box;
            background: #ffffff;
            flex-direction: column;
            position: relative;
            padding-top: 50px;
            .coin-info{
              background: #ffffff;
              height: 50px;
              position: fixed;
              width: 100%;
              top: 0px;
              z-index: 100;
              max-width: 768px;
              border-bottom: 1px solid #f8f8f8;
              .coin-one{
                color: #1E1E1E;
                margin-right: 0px;
                font-size: 0.75rem;
                display: flex;
                width: 100%;
                line-height: 50px;
                background-color: #ffffff;
                .priceandstate{
                  flex: 1;
                  /*display: flex;*/
                  /*.current-price{*/
                  /*flex: 1.5;*/
                  /*display: flex;*/
                  /*flex-direction: column;*/
                  /*text-align: right;*/
                  /*line-height: 1em;*/
                  /*span{*/
                  /*flex: 1;*/
                  /*line-height: 1em;*/
                  /*}*/
                  /*}*/
                  .current-state{
                    padding-left: 10px;
                    font-size: 0.875rem;
                    color: #fff;
                    text-align: right;
                    padding-right: 10px;
                    span{
                      padding: 8px 10px;
                      border-radius: 2px;
                      background-color: #818181;
                    }
                  }
                  .current-price .big{
                    font-size: 1.125rem;
                    display: table-cell;
                    vertical-align: bottom;
                    padding-top: 10px;
                  }
                  .current-state.green  span {
                    background-color: #14BC63;
                  }
                  .current-state.red span {
                    background-color: #FF8181;
                  }
                }

                .coin-name{
                  flex: 1.6;
                  /*width: 136px;*/
                  font-size: 1rem;
                  /*padding-left: 10px;*/
                  display: flex;
                  padding: 10px;
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
                      font-size: 0.75rem;
                      color: #909090;
                    }
                  }
                }
              }
            }
            .full-trade{
              overflow: hidden;
              background: #ffffff;
              display: flex;
              .ad-select{
                color: #fff;
                background: #F8F8F8;
                display: flex;
                margin: 10px;
                text-align: center;
                font-size: 0.75rem;
                margin-bottom: 0px;
                margin-top: 12px;
                .sell{
                  flex: 1;
                  padding: 10px;
                  color: #9F9F9F;
                }
                .buy{
                  flex: 1;
                  padding: 10px;
                  color: #9F9F9F;
                }
                .buy.current{
                  color: #14BC63;
                  border-bottom: 2px solid #14BC63;
                }
                .sell.current{
                  color: #FF8181;
                  border-bottom: 2px solid #FF8181;
                }
              }
              .ad-create{
                width: 54%;
                .ad-select{
                }
                .ad-create-box{
                  flex: 1;
                  padding: 12px 10px;
                  .input-container,.quik-num-btns,.trade-price,.trade-submit{
                    padding-bottom: 10px;
                  }
                  .quik-num-btns{
                    display: flex;
                    span{
                      display: table-cell;
                      flex: 1;
                      background: rgba(249, 170, 68, 0.16);
                      border-radius: 4px;
                      margin-right: 10px;
                      padding: 5px;
                      text-align: center;
                      font-size: 0.625rem;
                      color: rgba(135, 135, 135, 1);
                      cursor: pointer;
                      vertical-align: middle;
                    }
                    span.active{
                      background: rgb(249, 170, 68);
                      color: #ffffff;
                    }
                    span:nth-child(4){
                      margin-right: 0px;
                    }
                  }
                  .trade-price{
                    font-size: 0.625rem;
                    color: #878787;
                    /*margin-bottom: 4px;*/
                  }
                }
              }
              .ad-list{
                flex: 1;
                padding: 8px 0px;
                padding-bottom: 0px;
                .spot-box {
                  height: calc(100% - 0px);
                  width: 100%;
                  position: relative;
                  box-sizing: border-box;
                  .spot-head{
                    height: 24px;
                    color: #5A81A3;
                    padding: 0px 10px;
                    margin: 0px;
                    li {
                      list-style: none;
                      float: left;
                      font-size: 0.75rem;
                      height: 24px;
                      line-height: 24px;
                      text-align: right;
                      width: 50%;
                    }
                    li:nth-of-type(3n+1) {
                      text-align: left;
                    }
                  }
                  .scroll-box{
                    height: calc(100%);
                    overflow-y: auto;
                    padding: 0px 10px;
                    .ticker{
                      font-size: 0.9375rem;
                      height: 28px;
                      line-height: 28px;
                      text-align: right;
                      padding: 0px;
                      color: #000000;
                      span{
                        width: 50%;
                        float: left;
                      }
                      span:nth-of-type(2n+1) {
                        text-align: left;
                      }
                    }
                    .down{
                      color: #F87070;
                    }
                    .up{
                      color: #14BC63;
                    }
                    .sell-list {
                      padding: 0px;
                      margin: 0px;
                      li {
                        list-style: none;
                        padding: 5px 0px;
                        height: 16px;
                        line-height: 16px;
                        text-align: left;
                        font-size: 0.75rem;
                        position: relative;
                        span {
                          color: #353535;
                          display: inline-block;
                          float: left;
                          width: 50%;
                        }
                        span:nth-of-type(2n) {
                          text-align: right;
                        }
                        span.green {
                          color: #14BC63;
                        }
                        span.red {
                          color: #F87070;
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
                        i.ambg1{
                          background: RGBA(232,18,52,.5);
                        }
                      }
                    }
                    .buy-list {
                      padding: 0px;
                      margin: 0px;
                      li {
                        list-style: none;
                        padding: 5px 0px;
                        height: 16px;
                        line-height: 16px;
                        text-align: left;
                        font-size: 0.75rem;
                        position: relative;
                        span {
                          color: #353535;
                          display: inline-block;
                          float: left;
                          width: 50%;
                        }
                        span:nth-of-type(2n) {
                          text-align: right;
                        }
                        span.green {
                          color: #14BC63;
                        }
                        span.red {
                          color: #F87070;
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
              }
            }
          }
          .full-left-bottom {
            flex-grow: 1;
            margin-bottom: 0;
            overflow-x: auto;
            overflow-y: hidden;
            box-sizing: border-box;
            background: #ffffff;
            min-height: 300px;
            .order-trade {
              font-size: 0.8rem;
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
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #181818;
                    opacity: .5;
                    position: relative;
                  }
                  .tab-item.active{
                    opacity: 1;
                    border-bottom: 2px solid #F9AA44;
                  }
                  .pr{
                    display: inline-block;
                    float: right;
                    line-height: 40px;
                    span{
                      color: rgba(159, 159, 159, 1);
                      padding-right: 4px;
                    }
                  }
                }
              }
              .user-order-box{
                padding: 0px 10px 10px 10px;
              }
              .user-order{
                background: #ffffff;
                border-radius: 3px;
                padding: 10px;
                position: relative;
                margin-top: 10px;
                border-bottom: 1px solid #F8F8F8;
                .o-top{
                  .o-type{
                    font-size: 0.875rem;
                    padding-right: 10px;
                    color: #474747;
                  }
                  .o-type.buy{
                    color: #14BC63;
                  }
                  .o-type.sell{
                    color: #F87070;
                  }
                  .o-time{
                    font-size: 0.75rem;
                    color: #474747;
                  }
                }
                .o-bottom{
                  display: flex;
                  .o-info{
                    padding-top: 10px;
                    flex: 1;
                    .info-name{
                      font-size: 0.75rem;
                      color: #9F9F9F;
                    }
                    .info-value{
                      font-size: 0.75rem;
                      color: #181818;
                    }
                  }
                  .o-info2{
                    padding-top: 10px;
                    flex: 2;
                    width: 0;
                    .info-name{
                      font-size: 0.75rem;
                      color: #9F9F9F;
                    }
                    .info-value{
                      font-size: 0.75rem;
                      color: #181818;
                      a{
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        width: 100%;
                        display: block;
                      }
                    }
                  }
                  .o-info:nth-child(1){
                    flex: 1.2;
                  }
                }
                .o-action{
                  position: absolute;
                  top: 10px;
                  right: 10px;
                  font-size: 0.75rem;
                  color: #47A9FF;
                  padding: 2px 10px;
                  cursor: pointer;
                  border: 1px solid #47A9FF;
                  border-radius: 4px;
                }
              }
              .user-order-none{
                p{
                  padding: 10px;
                  text-align: center;
                  font-size: 0.75rem;
                  color: #fff;
                }
              }
            }
          }
        }
      }
    }
  }
</style>
