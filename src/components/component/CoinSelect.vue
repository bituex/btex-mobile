<template>
  <div class="coins-marks" @click="closeCoinAction" v-if="showCoins">
    <div class="coins">
      <div class="coins-group"></div>
      <div class="search">
        <input type="text" @click.stop="" v-model="searchTxt" class="form-control" id="coinName" :placeholder="$t('message.search')">
      </div>
      <div class="coins-list">
        <ul>
          <li @click="currencyChange('all')">
            <span class="coin-name">全部</span>
          </li>
          <li @click="currencyChange(item.currencyId)" v-for="(item,index) in coinInfoShow" :key="index" v-if="!loading">
            <span class="coin-name">{{item.asset_symbol}}/{{getBaseToken(item.base_id)}}</span>
          </li>
        </ul>
      </div>
      <loading v-if="loading" />
    </div>
  </div>
</template>

<script>
  import Enumerable from 'linq';
  import EosUtil from '../../common/EosUtils';
  import {mapState} from 'vuex';
    export default {
      name: 'CoinMenu',
      data() {
        return {
          timeIntever: null,
          coinInfoShow: [],
          coinInfo: [], // 总条目
          eosCnyPrice: 0,
          myShowCoins: this.showCoins,
          loading: false,
          searchTxt: ''
        };
      },
      props: {
        showCoins: Boolean,
        currencyId: String
      },
      computed: mapState({
        contractCoins: state => state.contractCoins,
        serverCoins: state => state.serverCoins,
        basetokens: state => state.basetokens
      }),
      watch: {
        showCoins(val) {
          this.myShowCoins = val;
        },
        myShowCoins(val) {
          this.$emit('on-showcoins-change', val);
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
        searchTxt: function (txt) {
          if (txt && txt !== '') {
            // 搜索
            this.handleFind();
          }
        }
      },
      methods: {
        // picket
        closeCoinAction() {
          this.showCoins = false;
        },
        // 获取币种
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
          let showList = Enumerable.from(coinInfo).where(function (x) {
            return x.tradable;
          }).orderBy('x=>x.currencyId').orderByDescending('x=>x.volumePrice').orderByDescending('x=>x.sort').toArray();
          this.coinInfo = showList;
          this.handleFind();
        },
        // 获取币种
        getCoins() {
          var that = this;
          var p1 = new Promise(function (resolve, reject) {
            var params = {'scope': 'btexexchange', 'code': 'btexexchange', 'table': 'tokenpairs', 'json': 'true', 'limit': -1, 'lower_bound': 0};
            EosUtil.getTableRows(params, [], function (rows) {
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
            // that.weui.alert(err, {
            //   buttons: [{
            //     label: that.$t('message.confirm'),
            //     type: 'primary'
            //   }]
            // });
            that.$message({
              type: 'error',
              text: err,
              duration: 3000
            });
          });
        },
        // 切换币种
        currencyChange(currencyId) {
          this.myShowCoins = false;
          if (currencyId !== 'all') {
            let currency = Enumerable.from(this.coinInfo)
              .singleOrDefault(function (x) { return x.currencyId === currencyId; });
            this.$emit('on-select', currency);
          } else {
            this.$emit('on-select', {currencyId: 'all', asset_symbol: this.$t('message.all')});
          }
        },
        handleFind() {
          let coinInfo = this.coinInfo;
          let txt = this.searchTxt;
          let selectCoins = Enumerable.from(coinInfo);
          if (txt !== '') {
            selectCoins = selectCoins.where(function (x) {
              return x.asset_symbol.toLowerCase().indexOf(txt.toLowerCase()) !== -1;
            });
            this.coinInfoShow = selectCoins.toArray();
          } else {
            this.coinInfoShow = coinInfo;
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
        // 获取币种
        if (this.contractCoins && this.serverCoins) {
          this.mergeData(this.contractCoins, this.serverCoins);
        } else {
          this.loading = true;
          this.getCoins();
        }
        // var that = this;
        // this.timeIntever = setInterval(function () {
        //   that.getCoins();
        // }, 5000);
      },
      beforeDestroy() {
        // window.clearInterval(this.timeIntever);
      }
    };
</script>

<style lang="scss" scoped>
  .coins-marks{
    position: fixed;
    width: 100%;
    top: 0px;
    left: 0px;
    bottom: 0px;
    z-index: 9999;
    background-color: rgba(0,0,0,0.5);
    .coins{
      width: 70%;
      height: 100%;
      position: absolute;
      top: 0px;
      left: 0px;
      bottom: 0px;
      background-color: #1F3548;
      z-index: 9999;
      padding: 15px;
      box-sizing: border-box;
      padding-bottom: 50px;
      .search{
        .form-control {
          display: block;
          width: 100%;
          padding: 8px 12px;
          font-size: 0.875rem;
          line-height: 1.42857143;
          color: #fff;
          background: #192937;
          background-image: url("../../assets/img/searchh.png");
          border: none;
          border-radius: 4px;
          -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
          -webkit-transition: border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;
          -o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
          transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
          box-sizing: border-box;
          outline:none;
          background-repeat: no-repeat;
          background-size: 15px;
          background-position: 10px center;
          padding-left: 30px;
        }
      }
      .coins-list{
        padding: 0px;
        font-size: 0.8125rem;
        height: 100%;
        overflow-y: auto;
        box-sizing: border-box;
        .tableText {
          font-size: 0.75rem;
          color: #aaa;
        }
        li{
          line-height: 40px;
          list-style: none;
          display: flex;
          padding: 0px 10px;
          .coin-name{
          flex: 2;
          text-align: left;
          }
          .coin-price{
          flex: 1;
          text-align: right;
          }
          .coin-change{
          flex: 1;
          text-align: right;
          padding-left: 10px;
          }
          .coin-change.red{
          color: #FF8181;
          }
          .coin-change.green{
          color: #14BC63;
          }
          span{
            color: #828688;
          }
        }
        li.active{
          span{
            color: #fff;
          }
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
    }
  }
</style>
