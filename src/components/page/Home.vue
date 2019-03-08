<template>
    <div class="page">
      <div class="home">
        <div class="top">
          <div class="activity" v-if="banners && banners.length > 0">
            <div class="swiper-container">
              <div class="swiper-wrapper">
                <div v-for='(i,index) in banners' :key='index' class="swiper-slide">
                  <a class="banner" :href="i.link_to">
                  <img class="img" :src="i.banner_img">
                  </a>
                </div>
              </div>
              <div class="swiper-pagination"></div>
            </div>
          </div>
          <div class="notice" v-if="marqueeList.length > 0">
            <div class="marquee">
              <div class="marquee_title">
                <!--<span>{{$t("message.notice")}}：</span>-->
                <!--<span></span>-->
                <img class="laba" src="../../assets/img/laba.png">
              </div>
              <div class="marquee_box">
                <ul class="marquee_list" :class="{marquee_top:animate}">
                  <li v-for="(item, index) in marqueeList" :key="index">
                    <a :href="item.link_to" style="color: #47a9ff">
                    <span>{{item.summary}}</span>
                    </a>
                  </li>
                </ul>
              </div>
              <a class="marquee_more" href="https://btexorg.zendesk.com/hc/zh-cn/sections/360002256931-%E9%80%9A%E7%9F%A5"></a>
            </div>
          </div>
          <div class="userinfo" v-if="identity">
            <div class="account">
              <div class="name">
                <div class="key">{{$t("message.account_title")}}</div>
                <div class="value">{{account.name}}</div>
              </div>
              <div class="money">
                <div class="key">{{$t("message.total_valuation")}}</div>
                <div class="value"><span v-if="!loadingValuation">{{valuation + 'EOS'}}</span><i v-if="loadingValuation" class="weui-loading"></i></div>
              </div>
            </div>
            <div class="cpunet">
              <div class="cpu">
                <div class="key">CPU&nbsp;{{cpuLimit}}%</div>
                <div class="value">
                  <WeuiProgress :color="'#3EB7FF'" :precent="cpuLimit"></WeuiProgress>
                </div>
              </div>
              <div class="net">
                <div class="key">NET&nbsp;{{netLimit}}%</div>
                <div class="value">
                  <WeuiProgress :color="'#FFEA3E'" :precent="netLimit"></WeuiProgress>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bituex">
          <div class="transfer">
            <div class="actions">
              <div class="action-txt">快捷法币交易</div>
              <div class="trans-action" @click="toWithDraw">{{$t("message.transfer")}} Bituex</div>
            </div>
            <p class="intro">USDT跨链兑换、在线买卖管理EOS资产</p>
          </div>
          <div class="upcoin" @click="toUpCoin">
            <img src="../../assets/img/upcoinicon.png"/>
            <p class="upcoin-title">{{$t("message.up_coin_self")}}</p>
          </div>
        </div>
        <div class="kuai1">
          <div class="usdt" @click="goTradeUsdt">
            <div class="first">
              <span class="usdt-eos">EOS/USDT</span>
              <span class="chg">{{usdtChange === null ? ('0.00 %') :
                (usdtChange+'%')}}</span>
            </div>
            <p class="intro">{{$t("message.steady_currency_trading")}}</p>
          </div>
          <div class="bouns" @click="goBouns">
            <img src="../../assets/img/bouns.png"/>
            <div class="right">
              <p class="boun">{{$t("message.mortgage_to_get_dividends")}}</p>
              <p class="rate">{{$t("message.annualized_return")}} {{yieldRate}}%</p>
            </div>
          </div>
        </div>
        <div class="coins-title">
          <div class="txt">{{$t("message.increase_list")}}</div>
          <div class="txt">TOP10</div>
        </div>
        <div class="coins" v-if="!loading">
          <div class="coin" v-for="(item, index) in coinInfo" :key="index" @click="toMarketChart(item.currencyId)">
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
          <!--<p class="more" @click="goMarket">{{$t("message.see_more")}}</p>-->
        </div>
        <loading v-if="loading" />
      </div>
    </div>
</template>

<script>
  import Eos from 'eosjs';
  import Swiper from 'swiper';
  import Enumerable from 'linq';
  import WeuiProgress from '../weui/WeuiProgress';
  import EOSUtil from '../../common/EosUtils';
  // import {mapState} from 'vuex';

  export default {
    name: 'Home',
    mounted: function () {
      if (!this.banners) {
        this.getBanner();
      } else {
        this.initSwiper();
      }
    },
    data() {
      return {
        mySwiper: null,
        // 滚动公告
        marqueeIntever: null,
        marqueeList: [],
        animate: false,
        // 页面数据
        account: {name: ''},
        accountInfo: null,
        cpuLimit: 0,
        netLimit: 0,
        coinInfo: [],
        valuation: 0,
        loading: false,
        loadingValuation: false,
        // 总抵押
        mortgageBt: 0,
        // 链上Indexes表数据
        indexesData: {
          bonus_pool_eos: 0,
          bonus_history_eos: 0,
          mortgage_history_bt: 0
        },
        btPrice: 0,
        usdtChange: 0
      };
    },
    components: {
      WeuiProgress
    },
    watch: {
      accountInfo: function (newAccountInfo) {
        if (newAccountInfo) {
          var cpuLimit = parseFloat(newAccountInfo.cpu_limit.used / newAccountInfo.cpu_limit.max * 100);
          var netLimit = parseFloat(newAccountInfo.net_limit.used / newAccountInfo.net_limit.max * 100);
          if (cpuLimit > 100) {
            this.cpuLimit = 100;
          } else {
            this.cpuLimit = cpuLimit.toFixed(2);
          }
          if (netLimit > 100) {
            this.netLimit = 100;
          } else {
            this.netLimit = netLimit.toFixed(2);
          }
        }
      },
      identity: function (newIdentity) {
        if (newIdentity) {
          // console.log(newIdentity);
          var account = newIdentity.accounts.find(x => x.blockchain === 'eos');
          this.account = account;
          // 获取账号详情
          this.getAccountInfo();
          if (this.contractCoins && this.serverCoins) {
            this.mergeData(this.contractCoins, this.serverCoins);
          }
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
      notices: function (newNotice) {
        this.marqueeList = newNotice;
      }
    },
    methods: {
      initSwiper() {
        this.mySwiper = new Swiper('.swiper-container', {
          loop: true, // 循环模式选项
          // 如果需要分页器
          autoplay: {
            delay: 3000,
            stopOnLastSlide: false,
            disableOnInteraction: false
          },
          speed: 300,
          pagination: {
            el: '.swiper-pagination'
          }
        });
      },
      toMarketChart(id) {
        this.$router.push('/market/chart/' + id);
      },
      goTradeUsdt() {
        this.$router.push('/trade/100000000000000000');
      },
      goBouns() {
        this.$router.push('/invest');
      },
      toUpCoin() {
        this.$router.push('/upcoin');
      },
      toWithDraw() {
        this.$router.push('/withdraw');
      },
      goMarket() {
        this.$router.push('/market');
      },
      getColor(change) {
        var newClass;
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
      showMarquee: function () {
        this.animate = true;
        setTimeout(() => {
          this.marqueeList.push(this.marqueeList[0]);
          this.marqueeList.shift();
          this.animate = false;
        }, 500);
      },
      getAccountInfo() {
        var that = this;
        EOSUtil.getAccount(this.account.name, function (err, response) {
          if (err) {
            that.$message({
              type: 'error',
              text: err,
              duration: 3000
            });
          } else {
            that.accountInfo = response;
          }
        });
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
          } else {
            coinInfo[i].highPrice = 0;
            coinInfo[i].lowPrice = 0;
            coinInfo[i].volume = 0;
            coinInfo[i].volumePrice = 0;
            coinInfo[i].change = 0;
            coinInfo[i].group_id = 0;
            coinInfo[i].st = false;
            coinInfo[i].sort = 0;
            coinInfo[i].grade = 0;
            coinInfo[i].tradable = false;
            coinInfo[i].icon = '';
          }
          // 获取BT 价格
          if (coinInfo[i].currencyId === '154114185766125772') {
            this.btPrice = coinInfo[i].newPrice;
          }
          // 获取USDT 涨跌幅
          if (coinInfo[i].currencyId === '100000000000000000') {
            this.usdtChange = coinInfo[i].change;
          }
        }
        let showList = Enumerable.from(coinInfo).where(function (x) {
          return x.tradable && x.volume > 0;
          // return true;
        }).orderByDescending('x=>x.change').orderByDescending('x=>x.sort').toArray();
        this.coinInfo = Enumerable.from(showList).take(10).toArray();
        // 获取EOS估值
        if (this.blances) {
          // console.log(this.blances);
          let valuation = Enumerable.from(this.blances)
            .select(o => o.valuation).sum();
          // console.log(valuation);
          that.valuation = valuation.toFixed(4);
          that.loadingValuation = false;
        } else {
          if (this.account.name !== '') {
            let baseTokens = Enumerable.from(this.basetokens).where(function (x) {
              return x.sym_name === 'EOS';
            }).toArray();
            let coinALL = Enumerable.from(coinInfo).where(function (x) {
              return x.base_id === baseTokens[0].id;
            }).toArray();
            coinALL.unshift({contractName: 'eosio.token', asset_symbol: 'EOS', newPrice: 1, asset_precision: 4, currencyId: 0});
            EOSUtil.getTotalEos(this.account.name, coinALL, function (err, blances) {
              if (err) {
                that.$message({
                  type: 'error',
                  text: err,
                  duration: 3000
                });
              } else {
                that.$store.dispatch('setBlances', blances);
                let valuation = Enumerable.from(blances)
                  .select(o => o.valuation).sum();
                that.valuation = valuation.toFixed(4);
              }
              that.loadingValuation = false;
            });
          }
        }
      },
      getBanner() {
        var that = this;
        that.selfUtil.apiAxios('POST', that.selfUtil.host + '/service/api/ad/banner/top', {'params': {}}, res => {
          if (res.result.error === 0) {
            // 获取成功， 拼接，链上数据
            // resolve(res.result.records);
            that.$store.dispatch('setBanners', res.result.records);
            that.$nextTick(function () {
              that.initSwiper();
            });
          }
        });
      },
      getNotice() {
        var that = this;
        that.selfUtil.apiAxios('POST', that.selfUtil.host + '/service/api/ad/notice/top', {'params': {}}, res => {
          if (res.result.error === 0) {
            // 获取成功， 拼接，链上数据
            // resolve(res.result.records);
            that.$store.dispatch('setNotices', res.result.records);
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
      },

      // 获取总抵押BT数据
      getTotalMortgage() {
        var that = this;
        let options = {
          httpEndpoint: this.selfUtil.httpEndpoint
        };
        let eos = Eos(options);
        eos.getCurrencyBalance('eosbtextoken', 'eosbtexbonus', 'BT').then(function (e) {
          if (e.length > 0) {
            let btNum = e[0].toString().split(' ')[0];
            that.mortgageBt = btNum;
          } else {
            that.mortgageBt = 0;
          }
        });
      },
      // 获取系统表统计数据
      getIndexesData() {
        var that = this;
        var params = {'scope': 'eosbtexbonus', 'code': 'eosbtexbonus', 'table': 'indexes', 'json': 'true', 'limit': 1, 'lower_bound': 0};
        EOSUtil.getTableRow(params, function (rows) {
          if (rows && rows.length > 0) {
            that.indexesData.bonus_pool_eos = rows[0].bonus_pool_eos.toString().split(' ')[0];
            that.indexesData.bonus_history_eos = rows[0].bonus_history_eos.toString().split(' ')[0];
            that.indexesData.mortgage_history_bt = rows[0].mortgage_history_bt.toString().split(' ')[0];
          }
        });
      }
    },
    computed: {
      identity() {
        return this.$store.state.identity;
      },
      basetokens () {
        return this.$store.state.basetokens;
      },
      contractCoins () {
        return this.$store.state.contractCoins;
      },
      serverCoins () {
        return this.$store.state.serverCoins;
      },
      blances () {
        return this.$store.state.blances;
      },
      banners () {
        return this.$store.state.banners;
      },
      notices () {
        return this.$store.state.notices;
      },
      indexNum() {
        let mortgageBtF = parseFloat(this.mortgageBt);
        let eosF = parseFloat(this.indexesData.bonus_pool_eos);
        if (mortgageBtF > 0 && eosF > 0) {
          let incomeEos = (10000 / mortgageBtF) * (1 / 180) * eosF;
          return incomeEos.toFixed(4);
        } else {
          return 0;
        }
      },
      // 年化收益率
      yieldRate() {
        if (this.btPrice === 0) {
          return '--';
        } else {
          console.log(this.indexNum);
          console.log(this.btPrice);
          let lva = ((this.indexNum * 365) / (10000 * this.btPrice) * 100);
          return parseFloat(lva).toFixed(2);
        }
      }
    },
    created() {
      // 设置标题
      // document.title = this.$t('message.btex');
      // 广告和公告
      if (!this.notices) {
        this.getNotice();
      } else {
        this.marqueeList = this.notices;
      }
      this.marqueeIntever = setInterval(this.showMarquee, 3000);
      // let that = this;
      // this.timeIntever = setInterval(function () {
      //   that.getCoins();
      // }, 10000);
      // 获取账号详情
      if (this.identity) {
        let account = this.identity.accounts.find(x => x.blockchain === 'eos');
        this.account = account;
        // 获取账号详情
        this.getAccountInfo();
      }
      // 获取币种
      if (this.contractCoins && this.serverCoins) {
        this.mergeData(this.contractCoins, this.serverCoins);
      } else {
        this.getCoins();
      }
      // 获取抵押数据
      this.getIndexesData();
      this.getTotalMortgage();
    },
    beforeDestroy() {
      window.clearInterval(this.marqueeIntever);
    }
  };
</script>

<style lang="scss" scoped>
    .page {
      position: relative;
      overflow: auto;
      .home {
        position: relative;
        overflow: auto;
        padding-bottom: 50px;
        .top {
          padding: 15px 0px;
          background: #1F3547;
          .activity {
            margin: 0px;
            .banner{
              padding: 0px 15px;
              box-sizing: border-box;
              display: block;
              .img {
                width: 100%;
                height: auto;
                border-radius: 8px;
              }
            }
          }
          .notice {
            margin: 0px 15px 0px 15px;
            .marquee {
              align-items: center;
              color: #47A9FF;
              display: flex;
              margin: 0 auto;
              box-sizing: border-box;
            }
            .marquee_title {
              padding-right: 0px;
              height: 30px;
              line-height: 30px;
              align-items: center;
              padding: 6px 0px;
              padding-right: 6px;
              box-sizing: border-box;
              .laba{
                width: auto;
                height: 16px;
                /*vertical-align: middle;*/
              }
            }
            .marquee_box {
              display: block;
              position: relative;
              height: 30px;
              overflow: hidden;
              flex: 1;
            }
            .marquee_list {
              display: block;
              position: absolute;
              top: 0;
              left: 0;
            }
            .marquee_top {
              transition: all 0.5s;
              margin-top: -30px
            }
            .marquee_list li {
              height: 30px;
              /*line-height: 30px;*/
              padding: 6px 0px;
              box-sizing: border-box;
              font-size: 0.875rem;
              /*vertical-align: middle;*/
            }
            .marquee_list li span {
              padding: 0 2px;
            }
            .marquee_more:after {
              content: "...";
              font-weight: 900;
              display: inline-block;
              transform: rotate(90deg);
              position: relative;
              right: -10px;
              color: #818181;
            }
          }
          .userinfo {
            margin: 15px 15px 0px 15px;
            .account {
              display: flex;
              .name {
                flex: 1;
                .key {
                  font-size: 0.875rem;
                  color: #818181;
                }
                .value {
                  font-size: 0.875rem;
                  color: #FFFFFF;
                  padding: 8px 0px;
                }
              }
              .money {
                flex: 1;
                .key {
                  font-size: 0.875rem;
                  color: #818181;
                }
                .value {
                  font-size: 0.875rem;
                  color: #FFFFFF;
                  padding: 8px 0px;
                }
              }
            }
            .cpunet {
              margin-top: 10px;
              display: flex;
              .cpu {
                flex: 1;
                padding-right: 50px;
                .key {
                  font-size: 0.875rem;
                  color: #818181;
                }
                .value {
                  padding: 8px 0px;
                }
              }
              .net {
                flex: 1;
                padding-right: 50px;
                .key {
                  font-size: 0.875rem;
                  color: #818181;
                }
                .value {
                  padding: 8px 0px;
                }
              }
            }
          }
        }
        .bituex{
          margin-top: 4px;
          display: flex;
          .transfer{
            background-color: #1F3547;
            padding: 15px;
            flex: 1;
            .actions{
              display: flex;
              justify-content: space-between;
              .action-txt{
                font-size: 16px;
                color: #FFFFFF;
              }
              .trans-action{
                background: #47A9FF;
                border-radius: 15.5px;
                color: #ffffff;
                font-size: 12px;
                padding: 0px 10px;
                line-height: 25px;
              }
            }
            .intro{
              padding-top: 10px;
              font-size: 12px;
              color: #5A81A3;
            }
          }
          .upcoin{
            background-color: #1F3547;
            margin-left: 4px;
            padding: 15px 30px;
            img{
              width: 25px;
              height: 25px;
              display: block;
              margin: 0 auto;
            }
            .upcoin-title{
              font-size: 12px;
              color: #FFFFFF;
              text-align: center;
              padding-top: 10px;
            }
          }
        }
        .kuai1{
          margin-top: 4px;
          display: flex;
          .usdt{
            background-color: #1F3547;
            padding: 15px;
            flex: 1;
            .first{
              .usdt-eos{
                font-size: 16px;
                color: #FFFFFF;
              }
              .chg{
                font-size: 14px;
                color: #5AB36D;
              }
            }
            .intro{
              padding-top: 8px;
              font-size: 12px;
              color: #5A81A3;
            }
          }
          .bouns{
            background-color: #1F3547;
            margin-left: 4px;
            flex: 1;
            padding: 20px 15px;
            display: flex;
            align-items: center;
            img{
              width: 25px;
            }
            .right{
              display: inline-block;
              flex: 1;
              p{
                /*padding: 5px 0px 5px 5px;*/
                /*line-height: 1em;*/
                padding-left: 10px;
              }
              .boun{
                font-size: 12px;
                color: #FFFFFF;
              }
              .rate{
                font-size: 12px;
                color: #5A81A3;
                padding-top: 10px;
              }
            }
          }
        }
        .coins-title{
          display: flex;
          font-size: 0.875rem;
          color: #5A81A3;
          padding: 10px 15px;
          border-bottom: 1px solid #2C4962;
          margin-top: 4px;
          background-color: #1F3547;
          .txt{
            flex: 1;
          }
          .txt:nth-child(2){
            text-align: right;
          }
        }
        .coins {
          padding: 15px;
          background-color: #1f3547;
          .coin {
            margin-bottom: 15px;
            display: flex;
            .pair {
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
              .coin-name {
                font-size: 1rem;
                color: #FFFFFF;
              }
              .volume {
                font-size: 0.75rem;
                color: #818181;
              }
            }
            .price {
              flex: 1;
              padding-top: 2px;
              .price-eos {
                font-size: 0.875rem;
                color: #14BC63;
              }
              .price-cny {
                font-size: 0.75rem;
                color: #818181;
              }
            }
            .increase {
              flex: 1;
              padding: 7.2px 0px;
              .increase-value {
                background: #5AB36D;
                border-radius: 6px;
                font-size: 0.875rem;
                color: #FFFFFF;
                text-align: center;
                padding: 4px 0px;
              }
            }
          }
          .more {
            text-align: center;
            font-size: 0.75rem;
            color: #fff;
            padding: 10px 0px;
          }
        }
      }
    }
</style>
