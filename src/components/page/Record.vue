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
            // setTimeout(function () {
            //   that.loading = false;
            //   let resStr = '{"jsonrpc": "2.0", "id": null, "result": {"records": [{"total_price": 0.7119, "price": 0.0049, "buy_order_id": "154260258602271512", "sell_order_id": "154260313705243829", "create_date": "2018-11-19 04:52:26", "tx_id": "4735e9a07dcdf173c01c0f1f2e30d78cd8cd762be68e02e5fb3f70e097cf608e", "record_id": "154260314862865228", "sell_account": "4qpymvi2qoss", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 145.4285}, {"total_price": 4.1833, "price": 0.0049, "buy_order_id": "154260258602271512", "sell_order_id": "154260161341601907", "create_date": "2018-11-19 04:43:10", "tx_id": "ee3dc160db2f09e8b0158b760c0963a0e1246de3b81c5acf9527b4e2117a96d5", "record_id": "154260259232493312", "sell_account": "4qpymvi2qoss", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 854.5898}, {"total_price": 9.7901, "price": 0.0049, "buy_order_id": "154260250447741040", "sell_order_id": "154260161341601907", "create_date": "2018-11-19 04:42:04", "tx_id": "9e0b81fa190b7bdf4a8d907c1083e0e5d56d5a520387270ca7c7cb85df1d4a3d", "record_id": "154260252635417348", "sell_account": "4qpymvi2qoss", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 1999.9795}, {"total_price": 10.2298, "price": 0.00512, "buy_order_id": "154251085849319102", "sell_order_id": "154260079159415667", "create_date": "2018-11-19 04:13:15", "tx_id": "309b98ff295c1031747535e5d3847326bf6fd25ae5d8eff9beacbe3dd423bfe7", "record_id": "154260079730271191", "sell_account": "jiangsugg111", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 2000.0}, {"total_price": 10.5869, "price": 0.005897, "buy_order_id": "154251830790492563", "sell_order_id": "154251082827989704", "create_date": "2018-11-18 05:18:50", "tx_id": "6645fab55564f3b6dc53f9a8a83caa8f00d3ec026f0c7d1eb13468ca3fbe48ab", "record_id": "154251842189100354", "sell_account": "happyzhang52", "buy_account": "mmmaotouying", "currency_id": "154114185766125772", "quantity": 1797.1002}, {"total_price": 0.3309, "price": 0.003601, "buy_order_id": "154194364121966836", "sell_order_id": "154194388091671561", "create_date": "2018-11-11 13:44:42", "tx_id": "a995d03ac872deffbd36a646cf9f1ab3e6a77ebb2ae94a41ea3e2e06cfbc8801", "record_id": "154197279086758244", "sell_account": "renzhewudi55", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 91.9744}, {"total_price": 1.7267, "price": 0.003601, "buy_order_id": "154194364121966836", "sell_order_id": "154194378577161913", "create_date": "2018-11-11 13:43:08", "tx_id": "cb464816f02a51ad4397c7fa8a99d1c8ed26162cdf65b4b36578b1076b3adb54", "record_id": "154197242721618189", "sell_account": "renzhewudi55", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 480.0}, {"total_price": 1.5399, "price": 0.003601, "buy_order_id": "154194364121966836", "sell_order_id": "154194372169692336", "create_date": "2018-11-11 13:42:16", "tx_id": "d200762ee5bde764ec9478fc096732013fbff6a0b3c88de5820531d2e18092ac", "record_id": "154197224733793988", "sell_account": "chengchengtx", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 428.0558}, {"total_price": 1.9984, "price": 0.004001, "buy_order_id": "154194303325397420", "sell_order_id": "154194349211168434", "create_date": "2018-11-11 13:38:16", "tx_id": "f86d792885f5a9fceee8e6551e3d7e3aa5101a1ca047c242022dbfc2f6a3a48a", "record_id": "154197132185288893", "sell_account": "eossuzukicom", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 499.975}, {"total_price": 1.9984, "price": 0.004001, "buy_order_id": "154194247021939597", "sell_order_id": "154194260604537969", "create_date": "2018-11-11 13:23:28", "tx_id": "26c9f00be362a0a3eac4a70f7d30117221b945a6cb2a71519101b5fe85501090", "record_id": "154196812822796218", "sell_account": "mulingsarcii", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 499.975}, {"total_price": 0.0467, "price": 0.003801, "buy_order_id": "154194173054724084", "sell_order_id": "154194177841933613", "create_date": "2018-11-11 13:09:41", "tx_id": "eeafcd8a709e0b1ae60dae07d03e59cf02df6474e2ae40cff28997a08076b44f", "record_id": "154196650975052282", "sell_account": "eosggalibaba", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 12.2862}, {"total_price": 1.852, "price": 0.003801, "buy_order_id": "154194173054724084", "sell_order_id": "154194176650801085", "create_date": "2018-11-11 13:09:34", "tx_id": "93cbf9674f64c260a08c36ad171f854100445183d8356685bded964833ad540f", "record_id": "154196647567964621", "sell_account": "chengchengtx", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 487.7368}, {"total_price": 0.3465, "price": 0.004501, "buy_order_id": "154194081925156382", "sell_order_id": "154194083648966734", "create_date": "2018-11-11 12:54:06", "tx_id": "28cd7aa4568f2ff22a5189ced36be28c0062c99e812b915a1de54128a3054daa", "record_id": "154196329629138132", "sell_account": "chengchengtx", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 77.0495}, {"total_price": 4.1501, "price": 0.004501, "buy_order_id": "154194081925156382", "sell_order_id": "154194081375094778", "create_date": "2018-11-11 12:53:45", "tx_id": "c5c8291f954560f94eabd00fd9adea018f182710ee8f6171b0f8879d6f13cae6", "record_id": "154196322775032453", "sell_account": "heweiwallet2", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 922.951}, {"total_price": 0.7454, "price": 0.003603, "buy_order_id": "154192977899666433", "sell_order_id": "154193012042268560", "create_date": "2018-11-11 09:55:23", "tx_id": "88431e6012fe569611500961fb2cee92680509244eed4594a15dd21598a7e332", "record_id": "154194515640905053", "sell_account": "eosggalibaba", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 207.0883}, {"total_price": 2.2481, "price": 0.003603, "buy_order_id": "154192977899666433", "sell_order_id": "154192984682901629", "create_date": "2018-11-11 09:50:49", "tx_id": "292678b95b9ca1a1f8e8f09beebd7ae574789a2b16d53d0fb6e8694e0281db97", "record_id": "154194496950542068", "sell_account": "mulingsarcii", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 624.5688}, {"total_price": 0.8977, "price": 0.003603, "buy_order_id": "154192944857731674", "sell_order_id": "154192984682901629", "create_date": "2018-11-11 09:50:49", "tx_id": "292678b95b9ca1a1f8e8f09beebd7ae574789a2b16d53d0fb6e8694e0281db97", "record_id": "154194496946702433", "sell_account": "mulingsarcii", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 249.3755}, {"total_price": 2.4982, "price": 0.003603, "buy_order_id": "154192944857731674", "sell_order_id": "154192961812324501", "create_date": "2018-11-11 09:47:02", "tx_id": "11b36ec46f70ad26a5fe30111ce0d005ff8d096487791168935f3cd8bedb209a", "record_id": "154194457698074797", "sell_account": "mulingsarcii", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 694.0839}, {"total_price": 0.2036, "price": 0.003603, "buy_order_id": "154192944857731674", "sell_order_id": "154192944773482448", "create_date": "2018-11-11 09:44:12", "tx_id": "2927c010e697a92e5d3684e28622399aabf81463c5a0ff25274bd3a5d84b6022", "record_id": "154194447837408018", "sell_account": "eosggalibaba", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 56.5838}, {"total_price": 0.0463, "price": 0.004801, "buy_order_id": "154192898961934628", "sell_order_id": "154192906431978337", "create_date": "2018-11-11 09:37:48", "tx_id": "6584801d51be683e0422ef6de1fc08fcb0b42f8fb75456512e33ac6c8fc4aa69", "record_id": "154194410848897583", "sell_account": "eossuzukicom", "buy_account": "happyzhang52", "currency_id": "154114185766125772", "quantity": 9.6438}], "error": 0}}';
            //   let res = JSON.parse(resStr);
            //   if (res.result.error === 0) {
            //     let recordList = [];
            //     var tokens = that.contractCoins;
            //     for (var i = 0; i < res.result.records.length; i++) {
            //       let record = res.result.records[i];
            //       let token = Enumerable.from(tokens)
            //         .where(function (x) { return x.currencyId === record.currency_id; }).toArray();
            //       if (token) {
            //         record.token_name = token[0].asset_symbol;
            //         record.token_id = token[0].currencyId;
            //       } else {
            //         record.token_name = '';
            //         record.token_id = '';
            //       }
            //       recordList.push(record);
            //     }
            //     that.records.push(...recordList);
            //   }
            // }, 3000);
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
          console.log('change');
          if (this.currencyId === 'all' || this.currencyId === '') {
            // 查询全部
            console.log('change');
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
        // 设置标题
        // document.title = this.$t('message.history_deal');
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
