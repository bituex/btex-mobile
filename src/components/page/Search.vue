<template>
  <div class="page">
    <div class="weui-search-bar" :class="{'weui-search-bar_focusing': focusing}" id="searchBar">
      <form class="weui-search-bar__form" style="border-radius: 4px;">
        <div class="weui-search-bar__box">
          <i class="weui-icon-search"></i>
          <input type="search" class="weui-search-bar__input" id="searchInput" v-model="searchTxt" v-focus :placeholder="$t('message.search')" required/>
          <a href="javascript:" class="weui-icon-clear" id="searchClear" @click="clearAction"></a>
        </div>
        <label class="weui-search-bar__label" id="searchText" @click="focusAction">
          <i class="weui-icon-search"></i>
          <span>{{$t("message.search")}}</span>
        </label>
      </form>
      <a href="javascript:" class="weui-search-bar__cancel-btn" id="searchCancel" @click="clearAction">{{$t("message.revoke")}}</a>
    </div>
    <div class="weui-cells searchbar-result" id="searchResult">
      <div class="coins" v-if="!loading">
        <div class="coin" v-for="(item, index) in coinInfoShow" :key="index" @click="toMarketChart(item.currencyId)">
        <div class="pair">
          <img v-if="item.icon" class="logo" :src="''+item.icon"/>
          <img v-else class="logo" src="../../assets/img/eosio_EOS.png"/>
          <p class="coin-name">{{item.asset_symbol}}/{{getBaseToken(item.base_id)}}</p>
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
      <loading v-if="loading" />
    </div>
  </div>
</template>

<script>
  import Enumerable from 'linq';
  import EOSUtil from '../../common/EosUtils';
  import {mapState} from 'vuex';
  export default {
    name: 'Search',
    data() {
      return {
        focusing: false,
        searchTxt: '',
        coinInfo: [],
        coinInfoShow: [],
        loading: false
      };
    },
    directives: {
      focus: {
        // 当绑定元素插入到 DOM 中。
        update: function (el) {
          // 聚焦元素
          el.focus();
        }
      }
    },
    computed: mapState({
      contractCoins: state => state.contractCoins,
      serverCoins: state => state.serverCoins,
      basetokens: state => state.basetokens
    }),
    watch: {
      coinInfo: function(newCoinInfo) {
        if (newCoinInfo && this.searchTxt !== '') {
          this.handleFind();
        }
      },
      searchTxt: function(txt) {
        if (txt && txt !== '') {
          this.handleFind();
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
      }
    },
    methods: {
      focusAction () {
        this.focusing = true;
      },
      clearAction () {
        this.focusing = false;
        this.searchTxt = '';
      },
      toMarketChart(id) {
        this.$router.replace('/market/chart/' + id);
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
      getCoins() {
        var that = this;
        that.loading = true;
        var p1 = new Promise(function (resolve, reject) {
          var params = {'scope': 'btexexchange', 'code': 'btexexchange', 'table': 'tokenpairs', 'json': 'true', 'limit': 200, 'lower_bound': 0};
          EOSUtil.getTableRows(params, [], function (rows) {
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
      mergeData(coinInfo, coinServer) {
        // 合并总数据
        for (var i = 0; i < coinInfo.length; i++) {
          var queryResult = Enumerable.from(coinServer)
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
            coinInfo[i].grade = parseInt(queryResult[0].grade);
            coinInfo[i].tradable = queryResult[0].tradable;
            coinInfo[i].icon = queryResult[0].icon;
          }
        }
        var showList = Enumerable.from(coinInfo).where(function (x) {
          return x.tradable;
        }).orderByDescending('x=>x.volumePrice').orderByDescending('x=>x.sort').toArray();
        this.coinInfo = showList;
      },
      handleFind() {
        var coinInfo = this.coinInfo;
        var txt = this.searchTxt;
        var selectCoins = Enumerable.from(coinInfo);
        this.coinInfoShow = selectCoins.where(function (x) {
          return x.asset_symbol.toLowerCase().indexOf(txt.toLowerCase()) !== -1;
        }).toArray();
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
      // document.title = this.$t('message.search');
      // 获取币种
      if (this.contractCoins && this.serverCoins) {
        this.mergeData(this.contractCoins, this.serverCoins);
      } else {
        this.getCoins();
      }
    }
  };
</script>

<style lang="scss" scoped>
 #searchInput{
   color: #B2B2B2;
   height: 40px;
   box-sizing: border-box;
 }
 #searchResult{
   .coins {
     padding: 15px;
     background-color: #1F3547;
     height: calc(100% - 45px);
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
