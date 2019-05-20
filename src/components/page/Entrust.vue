<template>
  <div id="master" :class="theme === 'light' ? 'light' : 'dark'">
    <div class="page" >
      <div class="user-order" v-for="(item,index) in currentOrder" :key="index" v-if="currentOrder.length > 0">
        <div class="o-action" @click="cancelOrderAction(item.id,item.typeKey, item.token_id)">{{$t("message.revoke")}}</div>
        <div class="o-top">
          <span class="o-type buy" v-if="item.typeKey==='buy'">{{$t("message.buy")}}</span>
          <span class="o-type sell" v-if="item.typeKey==='sell'">{{$t("message.sell")}}</span>
          <span class="o-time">{{item.token_name}}/{{getBaseToken(item.token_base_id)}}</span>&nbsp;&nbsp;
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
      <div class="user-order-none" v-if="currentOrder.length === 0">
        <p>{{$t("message.no_entrust")}}</p>
      </div>
    </div>
  </div>
</template>

<script>
  import EosUtil from '../../common/EosUtils';
  import moment from 'moment';
  import Enumerable from 'linq';
  import Eos from 'eosjs';
  export default {
    name: 'Entrust',
    data() {
      return {
        account: null,
        currentOrder: [],
        sellOrder: [],
        buyOrder: []
      };
    },
    watch: {
      identity: function (newIdentity) {
        if (newIdentity) {
          var account = newIdentity.accounts.find(x => x.blockchain === 'eos');
          this.account = account;
          this.getEntrust(account.name);
        }
      },
      contractCoins: function (newTokens) {
        // 处理数据
        this.megerData();
      }
    },
    computed: {
      identity: function () {
        return this.$store.state.identity;
      },
      scatter: function () {
        return this.$store.state.scatter;
      },
      contractCoins: function () {
        return this.$store.state.contractCoins;
      },
      basetokens: function () {
        return this.$store.state.basetokens;
      },
      theme () {
        return this.$store.state.theme;
      }
    },
    methods: {
      getTokens() {
        var that = this;
        var params = {'scope': 'btexexchange', 'code': 'btexexchange', 'table': 'tokenpairs', 'json': 'true', 'limit': -1, 'lower_bound': 0};
        EosUtil.getTableRow(params, function (rows) {
          var coins = [];
          for (var i = 0; i < rows.length; i++) {
            var params = {};
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
          that.$store.dispatch('setContractCoins', coins);
        });
      },
      getEntrust(account) {
        var that = this;
        var p1 = new Promise(function (resolve, reject) {
          var params = {
            'scope': account + ' ',
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
            'scope': account + ' ',
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
          that.sellOrder = results[0];
          that.buyOrder = results[1];
          that.megerData();
        }).catch(err => {
          // this.weui.alert(err, {
          //   buttons: [{
          //     label: that.$t('message.confirm'),
          //     type: 'primary'
          //   }]
          // });
          this.$message({
            type: 'error',
            text: err,
            duration: 3000
          });
        });
      },
      megerData() {
        var tokens = this.contractCoins;
        if (tokens && tokens.length > 0) {
          var userSellOrders = this.sellOrder;
          var userBuyOrders = this.buyOrder;
          var myOrders = [];
          var order;
          for (var i = 0; i < userBuyOrders.length; i++) {
            order = userBuyOrders[i];
            order.typeKey = 'buy';
            order.time = moment(new Date(parseInt(order.order_time))).format('YYYY-MM-DD HH:mm:ss');
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
          for (var j = 0; j < userSellOrders.length; j++) {
            order = userSellOrders[j];
            order.typeKey = 'sell';
            order.time = moment(new Date(parseInt(order.order_time))).format('YYYY-MM-DD HH:mm:ss');
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
          this.currentOrder = myOrders;
        }
      },
      // 撤单动作
      cancelOrderAction(orderId, orderType, tokenId) {
        if (this.account) {
          if (orderType === 'sell') {
            this.cancelOrder(orderId, 2, tokenId);
          } else {
            this.cancelOrder(orderId, 1, tokenId);
          }
        } else {
          // this.weui.alert(this.$t('message.alert_please_log_in_first'));
          this.$message({
            type: 'error',
            text: this.$t('message.alert_please_log_in_first'),
            duration: 3000
          });
        }
      },
      cancelOrder(orderId, oType, tokenId) {
        var that = this;
        if (this.scatter) {
          var eos = this.scatter.eos(that.selfUtil.network, Eos, { expireInSeconds: 60 });
          this.scatter.getIdentity({
            accounts: [that.selfUtil.network]
          }).then(identity => {
            var account = identity.accounts.find(x => x.blockchain === 'eos');
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
                      pair_id: tokenId,
                      o_id: orderId,
                      o_type: oType
                    }
                  }
                ]
              }, (err, res) => {
                if (!err) {
                  // 撤单成功
                  this.getEntrust(this.account.name);
                  // this.weui.alert(this.$t('message.alert_cancel_success'));
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
      // document.title = this.$t('message.current_entrust');
      // 获取账号详情
      if (this.identity) {
        var account = this.identity.accounts.find(x => x.blockchain === 'eos');
        this.account = account;
        this.getEntrust(account.name);
      }
      if (!this.contractCoins) {
        this.getTokens();
      }
    }
  };
</script>

<style lang="scss" scoped>
  .dark {
    padding: 10px;
    background-color: #1F3547;
    min-height: 100vh;
    box-sizing: border-box;
    .user-order{
      background: #2D4E69;
      border-radius: 3px;
      padding: 10px;
      position: relative;
      margin-bottom: 10px;
      .o-top{
        .o-type{
          font-size: 0.875rem;
          padding-right: 10px;
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
            line-height: 3em;
            font-size: 0.75rem;
            color: #5A81A3;
          }
          .info-value{
            font-size: 0.75rem;
            color: #FFFFFF;
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
        font-size: 0.875rem;
        color: #fff;
      }
    }
  }

  .light {
    background: #f8f8f8;
    padding: 10px;
    .user-order{
      background: #ffffff;
      border-radius: 3px;
      padding: 10px;
      position: relative;
      margin-bottom: 10px;
      .o-top{
        .o-type{
          font-size: 0.875rem;
          padding-right: 10px;
        }
        .o-type.buy{
          color: #14BC63;
        }
        .o-type.sell{
          color: #F87070;
        }
        .o-time{
          font-size: 0.75rem;
          color: #262626;
        }
      }
      .o-bottom{
        display: flex;
        .o-info{
          padding-top: 10px;
          flex: 1;
          .info-name{
            line-height: 3em;
            font-size: 0.75rem;
            color: #9F9F9F;
          }
          .info-value{
            font-size: 0.75rem;
            color: #262626;
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
        font-size: 0.875rem;
        color: #262626;
      }
    }
  }
</style>
