<template>
  <div class="coins-marks" @click="closeCoinAction" v-if="showCoins">
    <div class="coins">
      <div class="coins-group"></div>
      <div class="coins-list">
        <div class="tabs">
          <div class="group">
            <div class="group-item" :class="{'on': groupCurrent==10001}" @click.stop="changeGroup(10001)">
              {{$t("message.favorite")}}
            </div>
            <div class="group-item" v-for="(baseToken, index) in basetokens" :key="index" :class="{'on': groupCurrent==(baseToken.id+20000)}" @click.stop="changeGroup(baseToken.id+20000)">
              {{baseToken.sym_name}}
            </div>
          </div>
        </div>
        <ul class="list-header">
          <li>
            <span class="coin-name">
              {{$t("message.trading")}}
            </span>
            <span class="coin-price" @click.stop="sortAction('price')">
              {{$t("message.price")}}
              <span class="caret-wrapper" :class="{ 'up': sortAsc && sortField == 'price', 'down': !sortAsc && sortField == 'price' }"><i class="sort-caret ascending"></i><i class="sort-caret descending"></i></span>
            </span>
            <span class="coin-change" @click.stop="sortAction('increase')">
              {{$t("message.increase")}}
              <span class="caret-wrapper" :class="{ 'up': sortAsc && sortField == 'increase', 'down': !sortAsc && sortField == 'increase' }"><i class="sort-caret ascending"></i><i class="sort-caret descending"></i></span>
            </span>
          </li>
        </ul>
        <ul class="list-body">
          <li v-bind:class="{ 'active': item.currencyId==currencyId }" @click="currencyChange(item.currencyId)" v-for="(item,index) in coinInfoShow" :key="index" v-if="!loading">
          <span class="coin-name">{{item.asset_symbol}}/{{getBaseToken(item.base_id)}}</span>
          <span class="coin-price">{{item.newPrice}}</span>
          <span class="coin-change" v-bind:class="{ 'green': item.change>0, 'red': item.change<0 }">{{item.change+'%'}}</span>
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
          sortAsc: false,
          sortField: '',
          groupCurrent: 0,
          coinGroups: [],
          account: null
        };
      },
      props: {
        showCoins: Boolean,
        currencyId: String,
        groupNow: Number,
        favorite: Boolean
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
        showCoins(val) {
          this.myShowCoins = val;
        },
        myShowCoins(val) {
          this.$emit('on-showcoins-change', val);
        },
        groupNow(val) {
          this.groupCurrent = 20000 + val;
        },
        favorite(val) {
          this.getFavoriteCoins();
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
        groupCurrent: function (newGroup) {
          if (newGroup !== '') {
            this.handleFind();
          } else {
            this.coinInfoShow = this.coinInfo;
          }
        },
        coinInfo: function(newCoinInfo) {
          if (newCoinInfo) {
            this.handleFind();
          }
        }
      },
      methods: {
        sortAction(field) {
          this.sortField = field;
          this.sortAsc = !this.sortAsc;
          if (field === 'volume') {
            if (this.sortAsc) {
              this.coinInfo = Enumerable.from(this.coinInfo).orderBy('x=>x.volume').toArray();
            } else {
              this.coinInfo = Enumerable.from(this.coinInfo).orderByDescending('x=>x.volume').toArray();
            }
          } else if (field === 'price') {
            if (this.sortAsc) {
              this.coinInfo = Enumerable.from(this.coinInfo).orderBy('x=>x.newPrice').toArray();
            } else {
              this.coinInfo = Enumerable.from(this.coinInfo).orderByDescending('x=>x.newPrice').toArray();
            }
          } else if (field === 'increase') {
            if (this.sortAsc) {
              this.coinInfo = Enumerable.from(this.coinInfo).orderBy('x=>x.change').toArray();
            } else {
              this.coinInfo = Enumerable.from(this.coinInfo).orderByDescending('x=>x.change').toArray();
            }
          } else {
          }
        },
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
              let change = parseFloat(coinInfo[i].change);
              if (change > 999) {
                coinInfo[i].change = 999;
              } else if (change < -999) {
                coinInfo[i].change = -999;
              } else {
                coinInfo[i].change = change;
              }
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
            that.$message({
              type: 'error',
              text: err,
              duration: 3000
            });
          });
        },
        // 获取EOS价格信息
        getEosInfo() {
          let that = this;
          that.eosCnyPrice = parseFloat(window.btex.eos_market_price) * parseFloat(window.btex.us_dollar_exchange_rate);
        },
        // 切换币种
        currencyChange(currencyId) {
          this.myShowCoins = false;
          let currency = Enumerable.from(this.coinInfo)
            .singleOrDefault(function (x) { return x.currencyId === currencyId; });
          this.$emit('on-select', currency);
        },
        changeGroup(groupName) {
          this.groupCurrent = groupName;
        },
        handleFind() {
          let coinInfo = this.coinInfo;
          let key = this.groupCurrent;
          let selectCoins = Enumerable.from(coinInfo);
          if (parseInt(key) === 10001) {
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
        this.groupCurrent = 20000 + this.groupNow;
        // var that = this;
        // this.timeIntever = setInterval(function () {
        //   that.getCoins();
        // }, 5000);
      },
      beforeDestroy() {
        console.log('beforeDestroy');
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
      width: 80%;
      height: 100%;
      position: absolute;
      top: 0px;
      left: 0px;
      bottom: 0px;
      background-color: #1F3548;
      z-index: 9999;
      .coins-list{
        padding: 0px;
        font-size: 13px;
        height: 100%;
        overflow-y: auto;
        box-sizing: border-box;
        .tabs{
          display: flex;
          padding: 0px 15px;
          background-color: #1F3547;
          height: 36px;
          position: absolute;
          top: 0px;
          width: 100%;
          box-sizing: border-box;
          z-index: 100;
          .group{
            flex: 1;
            display: block;
            overflow-x: auto;
            white-space: nowrap;
            padding: 8px 0px 0px 0px;
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
        }
        .list-header{
          position: absolute;
          top: 36px;
          width: 100%;
          background-color: #1F3548;
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
          li{
            /*line-height: 1em;*/
          }
        }
        .list-body{
          margin-top: 76px;
        }
        .tableText {
          font-size: 12px;
          color: #aaa;
        }
        li{
          line-height: 40px;
          list-style: none;
          display: flex;
          padding: 0px 10px;
          .coin-name{
          flex: 1;
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
      }
    }
  }
</style>
