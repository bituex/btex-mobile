<template>
  <div id='master' :class="theme === 'light' ? 'light' : 'dark'">
    <div class='page' >
      <div class="filter">
        <div class="coins" @click="showCoinAction">{{sysName}}/{{baseSysName}}&nbsp;&nbsp;<i class="fa fa-angle-down"></i></div>
        <div class="actions">
          <div class="action" v-bind:class="{ 'active': actionType=='sell' }" @click="changeTypeAction('sell')">{{$t("message.sell")}}</div>
          <div class="action" v-bind:class="{ 'active': actionType=='buy' }" @click="changeTypeAction('buy')">{{$t("message.buy")}}</div>
        </div>
      </div>
      <div class='user-order' v-for='(item,index) in records' :key='index'>
        <div class='o-top'>
          <span class='o-type buy' v-if='item.buy_account == account.name'>{{$t('message.buy')}}</span>
          <span class='o-type sell' v-if='item.sell_account == account.name'>{{$t('message.sell')}}</span>
          <span class='o-time'>{{item.token_name}}/{{getBaseToken(item.token_base_id)}}</span>
          <span class='o-time'>{{item.create_date}}</span>
        </div>
        <div class='o-bottom'>
          <div class='o-info'>
            <div class='info-name'>{{$t('message.deal_price')}}({{getBaseToken(item.token_base_id)}})</div>
            <div class='info-value'>{{item.price}}</div>
          </div>
          <div class='o-info'>
            <div class='info-name'>{{$t('message.deal_quantity')}}({{item.token_name}})</div>
            <div class='info-value'>{{item.quantity}}</div>
          </div>
          <div class='o-info'>
            <div class='info-name'>{{$t('message.deal_amount')}}({{getBaseToken(item.token_base_id)}})</div>
            <div class='info-value'>{{item.total_price}}</div>
          </div>
        </div>
        <div class='o-bottom'>
          <div class='o-info'>
            <div class='info-name'>{{$t('message.feel_amount')}}({{getBaseToken(item.token_base_id)}})</div>
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
      <div class='user-order-none' v-if='records.length==0 && !loading'>
        <p>{{$t('message.no_deal')}}</p>
      </div>
    </div>
    <loading v-if='loading && !isLast' />
    <CoinSelect :show-coins="showCoin" @on-showcoins-change="showCoinChange" @on-select="selectCoin"></CoinSelect>
  </div>
</template>

<script>
  import CoinSelect from '../component/CoinSelect.vue';
  import EosUtil from '../../common/EosUtils';
  import moment from 'moment';
  import Enumerable from 'linq';
    export default {
      name: 'Record',
      data() {
        return {
          account: null,
          page: 1,
          limit: 20,
          records: [],
          loading: false,
          isLast: false,
          showCoin: false,
          currencyId: '',
          actionType: '',
          sysName: this.$t('message.all'),
          baseSysName: this.$t('message.all')
        };
      },
      components: {
        CoinSelect
      },
      watch: {
        identity: function (newIdentity) {
          if (newIdentity) {
            var account = newIdentity.accounts.find(x => x.blockchain === 'eos');
            this.account = account;
            if (this.contractCoins) {
              this.page = 1;
              this.records = [];
              this.isLast = false;
              this.resetData();
            } else {
              this.getTokens();
            }
          }
        },
        contractCoins: function (newTokens) {
          // 处理数据
          this.page = 1;
          this.records = [];
          this.isLast = false;
          this.resetData();
        },
        currencyId: function (newCurrencyId) {
          if (newCurrencyId !== '') {
            this.page = 1;
            this.records = [];
            this.isLast = false;
            this.resetData();
          }
        },
        actionType: function (newType) {
          if (newType !== '') {
            this.page = 1;
            this.records = [];
            this.isLast = false;
            this.resetData();
          }
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
        changeTypeAction(typeStr) {
          this.actionType = typeStr;
        },
        showCoinAction() {
          this.showCoin = true;
        },
        showCoinChange(val) {
          this.showCoin = val;
        },
        selectCoin(currency) {
          // 重新搜索
          this.currencyId = currency.currencyId;
          this.sysName = currency.asset_symbol;
          this.baseSysName = this.getBaseToken(currency.base_id);
        },
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
        getRecord(data) {
          var that = this;
          if (this.account && this.contractCoins && !this.isLast) {
            this.loading = true;
            this.selfUtil.apiAxios('POST', this.selfUtil.host + '/service/api/user/record', {'params': data}, res => {
              that.loading = false;
              if (res.result.error === 0) {
                that.page = that.page + 1;
                var recordList = [];
                var tokens = that.contractCoins;
                for (var i = 0; i < res.result.records.length; i++) {
                  var record = res.result.records[i];
                  record.create_date = moment.utc(record.create_date).local().format('MM-DD HH:mm');
                  var token = Enumerable.from(tokens)
                    .where(function (x) { return x.currencyId === record.currency_id; }).toArray();
                  if (token && token.length > 0) {
                    record.token_name = token[0].asset_symbol;
                    record.token_id = token[0].currencyId;
                    record.token_base_id = token[0].base_id;
                    recordList.push(record);
                  } else {
                    // 已下架的币种
                  }
                }
                if (recordList.length < 20) {
                  that.isLast = true;
                }
                that.records = that.records.concat(recordList);
              }
            });
          }
        },
        scroll() {
          var that = this;
          // 距离底部200px时加载一次
          var distance = document.documentElement.offsetHeight - document.body.scrollTop - document.documentElement.scrollTop - window.innerHeight;
          var bottomOfWindow = distance <= 200;
          if (bottomOfWindow && that.loading === false) {
            that.resetData();
          }
        },
        resetData() {
          var that = this;
          if (this.currencyId === 'all' || this.currencyId === '') {
            // 查询全部
            if (this.actionType === 'sell') {
              var asdata = {
                account: that.account.name,
                limit: that.limit,
                page: that.page,
                record_type: 'sell'
              };
              that.getRecord(asdata);
            } else if (this.actionType === 'buy') {
              var abdata = {
                account: that.account.name,
                limit: that.limit,
                page: that.page,
                record_type: 'buy'
              };
              that.getRecord(abdata);
            } else {
              var data = {
                account: that.account.name,
                limit: that.limit,
                page: that.page
              };
              that.getRecord(data);
            }
          } else {
            // 查询当前币种
            if (this.actionType === 'sell') {
              var csdata = {
                account: that.account.name,
                limit: that.limit,
                page: that.page,
                currency_id: this.currencyId,
                record_type: 'sell'
              };
              that.getRecord(csdata);
            } else if (this.actionType === 'buy') {
              var cbdata = {
                account: that.account.name,
                limit: that.limit,
                page: that.page,
                currency_id: this.currencyId,
                record_type: 'buy'
              };
              that.getRecord(cbdata);
            } else {
              var cadata = {
                account: that.account.name,
                limit: that.limit,
                page: that.page,
                currency_id: this.currencyId
              };
              that.getRecord(cadata);
            }
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
      mounted() {
        var that = this;
        window.onscroll = function () {
          that.scroll();
        };
      },
      beforeMount() {
        // 在页面挂载前就发起请求
        // this.getRecord();
      },
      created() {
        // 获取账号详情
        if (this.identity) {
          var account = this.identity.accounts.find(x => x.blockchain === 'eos');
          this.account = account;
          if (!this.contractCoins) {
            this.getTokens();
          } else {
            this.resetData();
          }
        }
      }
    };
</script>

<style lang='scss' scoped>
  .dark{
    background-color: #1F3547;
    min-height: 100vh;
    box-sizing: border-box;
    .page {
      padding: 10px;
      padding-top: 50px;
      .filter{
        display: flex;
        position: fixed;
        top: 0px;
        width: 100%;
        left: 0px;
        padding: 10px;
        box-sizing: border-box;
        z-index: 100;
        background: #1F3547;
        .coins{
          flex: 1;
          font-size: 1rem;
          color: #FFFFFF;
        }
        .actions{
          flex: 1;
          .action{
            border: 1px solid #5A81A3;
            border-radius: 3px;
            font-size: 0.75rem;
            color: #5A81A3;
            text-align: center;
            margin-left: 10px;
            max-width: 40px;
            padding: 2px 10px;
            float: right;
          }
          .active{
            background: #5A81A3;
            color: #FFFFFF;
          }
        }
      }
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
          padding: 6px 10px;
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
  }
  .light {
    background-color: #f8f8f8;
    .page {
      padding: 10px;
      padding-top: 50px;
      .filter{
        display: flex;
        position: fixed;
        top: 0px;
        width: 100%;
        left: 0px;
        padding: 10px;
        box-sizing: border-box;
        z-index: 100;
        background-color: #f8f8f8;
        .coins{
          flex: 1;
          font-size: 1rem;
          color: #262626;
        }
        .actions{
          flex: 1;
          .action{
            border: 1px solid #5A81A3;
            border-radius: 3px;
            font-size: 0.75rem;
            color: #5A81A3;
            text-align: center;
            margin-left: 10px;
            max-width: 40px;
            padding: 2px 10px;
            float: right;
          }
          .active{
            background: #5A81A3;
            color: #FFFFFF;
          }
        }
      }
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
              font-size: 0.75rem;
              color: #9F9F9F;
            }
            .info-value{
              font-size: 0.75rem;
              color: #262626;
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
              color: #262626;
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
          padding: 6px 10px;
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
  }
</style>
