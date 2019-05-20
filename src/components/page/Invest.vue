<template>
  <div class="page" :class="theme === 'light' ? 'light' : 'dark'">
      <div class="bonus-index">
        <div class="bonus-all-title">{{$t("message.bonus_pool")}}(EOS)
          <img class="questions" v-if="theme === 'dark'" @click="questionAction" src="../../assets/img/pollques.png"/>
          <img class="questions" v-if="theme === 'light'" @click="questionAction" src="../../assets/img/pollques_light.png"/>
        </div>
        <div class="bonus-all"><ICountUp class="myCounter" :startVal="startVal"
                                         :endVal="indexesData.bonus_pool_eos"
                                         :decimals="decimals"
                                         :duration="duration"/></div>
        <div class="mortgage-total">{{$t("message.mortgage_total")}}&nbsp;{{mortgageBt}}&nbsp;BT</div>

        <div class="bonus-info-box">
          <div class="have-bonus-title">{{$t("message.my_mortgage")}}(BT)</div>
          <div class="have-bonus">{{totalMortgage}}</div>
          <div class="user-bonus">
            <div class="user-bonus-current">
              <div class="user-bonus-c-title">{{$t("message.estimate_bonus")}}(EOS)</div>
              <div class="user-bonus-c-value">{{totalIncom}}</div>
            </div>
            <div class="user-bonus-history">
              <div class="user-bonus-c-title">{{$t("message.history_bonus")}}(EOS)</div>
              <div class="user-bonus-c-value">{{userHistoryData.bonus_history_eos}}</div>
            </div>
          </div>
          <div class="index-text2">{{$t("message.annualized_return")}} {{yieldRate}}%，{{$t("message.bouns_day")}}{{bounsDay}} {{$t("message.day")}}</div>
          <div class="index-text">{{$t("message.per_10000bt_mortgages_one_day_expected_revenue")}}：<span style="font-weight: bold;">{{indexNum}}&nbsp;EOS</span></div>
          <div class="bonus-btn" @click="mortgageAction"><span class="involveText">{{$t("message.immediately_mortgage")}}</span></div>
        </div>
      </div>
      <div class="bonus-list">
        <div class="title-name">
          <span>{{$t("message.mortgage_list")}}</span>
        </div>
        <div class="lists">
          <div class="boun" v-for="(item,index) in userMortgagess" :key="index">
            <div class="o-action" @click="redeemAction(item.id)">{{$t("message.redeem")}}</div>
            <div class="o-top">
              <span class="o-time">{{item.mortgage_time_date}}</span>
            </div>
            <div class="o-bottom">
              <div class="o-info">
                <div class="info-name">{{$t("message.mortgage")}}(BT)</div>
                <div class="info-value">{{item.mortgage_bt}}</div>
              </div>
              <div class="o-info">
                <div class="info-name">{{$t("message.bonus")}}(EOS)</div>
                <div class="info-value">{{item.incom_num}}</div>
              </div>
            </div>
          </div>
          <div v-if="userMortgagess.length == 0" style="font-size: 14px;text-align: center;color: #878787; padding: 10px 0px;">{{$t("message.no_mortgage")}}</div>
        </div>
      </div>
      <el-dialog title="" :visible.sync="dialogBonusVisible" @close="resetActionData">
        <div class="actionBox">
          <div class="actionName">{{actionType=='mortgage'?$t("message.mortgage"):$t("message.redeem")}}&nbsp;BT</div>
          <el-input :placeholder="$t('message.num_input')" v-model="actionQuantity">
            <template slot="append">BT</template>
          </el-input>
          <div class="quik-num-btns">
            <span @click="quickQuan(1)" v-bind:class="{active: this.quickQuantityType==1,'mortgage': actionType=='mortgage'}">25%</span>
            <span @click="quickQuan(2)" v-bind:class="{active: this.quickQuantityType==2,'mortgage': actionType=='mortgage'}">50%</span>
            <span @click="quickQuan(3)" v-bind:class="{active: this.quickQuantityType==3,'mortgage': actionType=='mortgage'}">75%</span>
            <span @click="quickQuan(4)" v-bind:class="{active: this.quickQuantityType==4,'mortgage': actionType=='mortgage'}">100%</span>
          </div>
          <div class="userCount">
            <div class="bt" v-if="actionType=='mortgage'">{{$t("message.can_mortgage")}}&nbsp;{{userAccountInfo.bt}}&nbsp;BT</div>
            <div class="bt" v-if="actionType=='redeem'">{{$t("message.can_redeem")}}&nbsp;{{actionRedeem.mortgage_bt}}&nbsp;BT</div>
            <div class="eos" v-if="actionType=='redeem'">{{$t("message.can_bonus")}}&nbsp;≈&nbsp;{{sumIncome(actionQuantity, actionRedeem.mortgage_time)}}&nbsp;EOS</div>
          </div>
          <div class="actionBtn mortgage" @click="actionClick('mortgage')" v-if="actionType=='mortgage'">{{$t("message.confirm")}}</div>
          <div class="actionBtn redeem" @click="actionClick('redeem')" v-if="actionType=='redeem'">{{$t("message.confirm")}}</div>
        </div>
      </el-dialog>
    </div>
</template>
<script>
  import Eos from 'eosjs';
  import ICountUp from 'vue-countup-v2';
  import ElDialog from '../element/dialog';
  import ElInput from '../element/input';
  import EosUtil from '../../common/EosUtils';
  import Enumerable from 'linq';
  import moment from 'moment';

  export default {
    name: 'Invest',
    components: {
      ICountUp,
      ElDialog,
      ElInput
    },
    data: function () {
      return {
        dialogBonusVisible: false,
        actionType: 'mortgage', // mortgage 抵押，redeem 赎回
        quickQuantityType: 0,
        actionQuantity: '',
        actionRedeemId: '',
        actionRedeem: {
          mortgage_bt: 0
        },
        // 定时器
        timeIntever: null,
        // 递增数字
        startVal: 0,
        decimals: 4,
        duration: 0,
        // 用户信息
        account: null,
        // 用户的账户信息
        userAccountInfo: {
          eos: 0,
          bt: 0
        },
        // 总抵押
        mortgageBt: 0,
        // 链上Indexes表数据
        indexesData: {
          bonus_pool_eos: 0,
          bonus_history_eos: 0,
          mortgage_history_bt: 0
        },
        // 用户历史统计表
        userHistoryData: {
          bonus_history_eos: 0,
          mortgage_history_bt: 0,
          owner: ''
        },
        userMortgagess: [],
        // 总营收 和 总收益
        totalMortgage: '0.0000',
        totalIncom: '0.0000',
        // 页面数据
        tabCurrent: 'invest',
        // BT 价格
        btPrice: 0
      };
    },
    computed: {
      identity: function () {
        return this.$store.state.identity;
      },
      scatter: function () {
        return this.$store.state.scatter;
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
          let lva = ((this.indexNum * 365) / (10000 * this.btPrice) * 100);
          return parseFloat(lva).toFixed(2);
        }
      },
      // 已分红多少天
      bounsDay() {
        var date1 = new Date('2018-10-10'); // 开始时间
        var date2 = new Date(); // 结束时间
        var date3 = date2.getTime() - date1.getTime(); // 时间差的毫秒数
        var days = Math.floor(date3 / (24 * 3600 * 1000));
        return days;
      },
      theme () {
        return this.$store.state.theme;
      }
    },
    watch: {
      identity: function (newIdentity) {
        if (newIdentity) {
          let account = newIdentity.accounts.find(x => x.blockchain === 'eos');
          this.account = account;
        }
      },
      account: function (newAccount) {
        if (newAccount) {
          // 获取EOS数量
          this.getEosCount(newAccount.name);
          // 获取BT数量
          this.getBTCount(newAccount.name);
          // 获取用户的历史数据统计表
          this.getUserHistoryData(newAccount.name);
          // 获取用户的抵押记录
          this.getUserMortgages(newAccount.name);
        }
      }
    },
    methods: {
      questionAction() {
        var that = this;
        this.weui.alert(that.$t('message.bonus_intro'), {
          title: that.$t('message.mortgage_intro'),
          buttons: [{
            label: that.$t('message.confirm'),
            type: 'primary'
          }]
        });
      },
      resetActionData() {
        this.actionType = 'mortgage'; // mortgage 抵押，redeem 赎回
        this.quickQuantityType = 0;
        this.actionQuantity = '';
        this.actionRedeemId = '';
        this.actionRedeem = {
          mortgage_bt: 0
        };
      },
      // 计算收益
      sumIncome(btNum, time) {
        if (btNum === '') {
          return 0;
        }
        let days = new Date().getTime() - parseInt(time);
        let day = parseInt(days / (1000 * 60 * 60 * 24));
        let mortgageBtF = parseFloat(this.mortgageBt);
        let eosF = parseFloat(this.indexesData.bonus_pool_eos);
        if (mortgageBtF > 0 && eosF > 0) {
          let incomeEos = (parseFloat(btNum) / mortgageBtF) * (day / 180) * eosF;
          return incomeEos.toFixed(4);
        } else {
          return 0;
        }
      },
      // 操作按钮
      actionClick(actionType) {
        var that = this;
        let orderQuantity = parseFloat(this.actionQuantity);
        if (actionType === 'redeem') {
          // 赎回
          if (this.account) {
            if (orderQuantity <= parseFloat(this.actionRedeem.mortgage_bt)) {
              that.redeemOrder(this.actionRedeemId, orderQuantity.toFixed(4));
            } else {
              // this.weui.alert(this.$t('message.alert_redeem_num_less_current_num'), {
              //   buttons: [{
              //     label: that.$t('message.confirm'),
              //     type: 'primary'
              //   }]
              // });
              this.$message({
                type: 'error',
                text: this.$t('message.alert_redeem_num_less_current_num'),
                duration: 3000
              });
            }
          } else {
            // this.weui.alert(this.$t('message.alert_please_log_in_first'), {
            //   buttons: [{
            //     label: that.$t('message.confirm'),
            //     type: 'primary'
            //   }]
            // });
            this.$message({
              type: 'error',
              text: this.$t('message.alert_please_log_in_first'),
              duration: 3000
            });
          }
        } else if (actionType === 'mortgage') {
          // 抵押
          if (this.account) {
            if (orderQuantity >= 100 && orderQuantity <= this.userAccountInfo.bt) {
              that.mortgageOrder('eosbtexbonus', orderQuantity.toFixed(4), 'mortgage');
            } else {
              // this.weui.alert(this.$t('message.alert_mortgage_num_less_user_num_and100'), {
              //   buttons: [{
              //     label: that.$t('message.confirm'),
              //     type: 'primary'
              //   }]
              // });
              this.$message({
                type: 'error',
                text: this.$t('message.alert_mortgage_num_less_user_num_and100'),
                duration: 3000
              });
            }
          } else {
            // this.weui.alert(this.$t('message.alert_please_log_in_first'), {
            //   buttons: [{
            //     label: that.$t('message.confirm'),
            //     type: 'primary'
            //   }]
            // });
            this.$message({
              type: 'error',
              text: this.$t('message.alert_please_log_in_first'),
              duration: 3000
            });
          }
        }
        that.dialogBonusVisible = false;
      },
      async mortgageOrder(to, amount, memo) {
        var that = this;
        if (this.scatter) {
          const eos = this.scatter.eos(this.selfUtil.network, Eos, { expireInSeconds: 60 });
          this.scatter.getIdentity({
            accounts: [this.selfUtil.network]
          }).then(identity => {
            let account = identity.accounts.find(x => x.blockchain === 'eos');
            eos.transaction(
              {
                actions: [
                  {
                    account: 'eosbtextoken',
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
                      quantity: amount + ' BT',
                      memo: memo
                    }
                  }
                ]
              }, (err, res) => {
                if (!err) {
                  that.getUserMortgages(that.currentAccount);
                  // this.weui.alert(this.$t('message.alert_mortgage_success'), {
                  //   buttons: [{
                  //     label: that.$t('message.confirm'),
                  //     type: 'primary'
                  //   }]
                  // });
                  this.$message({
                    type: 'success',
                    text: this.$t('message.alert_mortgage_success'),
                    duration: 3000
                  });
                } else {
                  if (typeof (err) === 'string') {
                    // this.weui.alert(this.$t('message.alert_mortgage_error') + ':' + err, {
                    //   buttons: [{
                    //     label: that.$t('message.confirm'),
                    //     type: 'primary'
                    //   }]
                    // });
                    err = JSON.parse(err);
                    if (err.code === 500) {
                      var errMsg = '';
                      err.error.details.forEach(function (item, index) {
                        errMsg += item.message + ';';
                      });
                      this.$message({
                        type: 'error',
                        text: this.$t('message.alert_mortgage_error') + ':' + errMsg,
                        duration: 3000
                      });
                    }
                  } else {
                    // this.weui.alert(this.$t('message.alert_mortgage_error') + ':' + err.message, {
                    //   buttons: [{
                    //     label: that.$t('message.confirm'),
                    //     type: 'primary'
                    //   }]
                    // });
                    this.$message({
                      type: 'error',
                      text: this.$t('message.alert_mortgage_error') + ':' + err.message,
                      duration: 3000
                    });
                  }
                }
              });
          }).catch(error => {
            // this.weui.alert(this.$t('alert_get_user_error') + ':' + error.message, {
            //   buttons: [{
            //     label: that.$t('message.confirm'),
            //     type: 'primary'
            //   }]
            // });
            this.$message({
              type: 'error',
              text: this.$t('alert_get_user_error') + ':' + error.message,
              duration: 3000
            });
          });
        } else {
          // this.weui.alert(this.$t('message.alert_no_scatter'), {
          //   buttons: [{
          //     label: that.$t('message.confirm'),
          //     type: 'primary'
          //   }]
          // });
          this.$message({
            type: 'error',
            text: this.$t('message.alert_no_scatter'),
            duration: 3000
          });
        }
      },
      async redeemOrder(id, amount) {
        var that = this;
        if (this.scatter) {
          const eos = this.scatter.eos(this.selfUtil.network, Eos, { expireInSeconds: 60 });
          var account = this.scatter.identity.accounts.find(x => x.blockchain === 'eos');
          eos.transaction(
            {
              actions: [
                {
                  account: 'eosbtexbonus',
                  name: 'redeembt',
                  authorization: [
                    {
                      actor: account.name,
                      permission: account.authority
                    }
                  ],
                  data: {
                    owner: account.name,
                    quantity: amount + ' BT',
                    m_id: id
                  }
                }
              ]
            }, (err, res) => {
              if (!err) {
                that.getUserMortgages(that.currentAccount);
                that.getUserHistoryData(that.currentAccount);
                // that.weui.alert(this.$t('message.alert_redeem_success'), {
                //   buttons: [{
                //     label: that.$t('message.confirm'),
                //     type: 'primary'
                //   }]
                // });
                that.$message({
                  type: 'success',
                  text: this.$t('message.alert_redeem_success'),
                  duration: 3000
                });
              } else {
                if (typeof (err) === 'string') {
                  // that.weui.alert(this.$t('message.alert_redeem_error') + ':' + err, {
                  //   buttons: [{
                  //     label: that.$t('message.confirm'),
                  //     type: 'primary'
                  //   }]
                  // });
                  err = JSON.parse(err);
                  if (err.code === 500) {
                    var errMsg = '';
                    err.error.details.forEach(function (item, index) {
                      errMsg += item.message + ';';
                    });
                    this.$message({
                      type: 'error',
                      text: this.$t('message.alert_redeem_error') + ':' + errMsg,
                      duration: 3000
                    });
                  }
                } else {
                  // that.weui.alert(this.$t('message.alert_redeem_error') + ':' + err.message, {
                  //   buttons: [{
                  //     label: that.$t('message.confirm'),
                  //     type: 'primary'
                  //   }]
                  // });
                  that.$message({
                    type: 'error',
                    text: this.$t('message.alert_redeem_error') + ':' + err.message,
                    duration: 3000
                  });
                }
              }
            }
          );
        } else {
          // this.weui.alert(this.$t('message.alert_no_scatter'), {
          //   buttons: [{
          //     label: that.$t('message.confirm'),
          //     type: 'primary'
          //   }]
          // });
          this.$message({
            type: 'error',
            text: this.$t('message.alert_no_scatter'),
            duration: 3000
          });
        }
      },
      // 赎回动作
      redeemAction(id) {
        this.actionType = 'redeem';
        if (id !== '') {
          // 获取选中抵押
          let userMortgages = this.userMortgagess;
          this.actionRedeemId = id;
          let currentMortgage = Enumerable.from(userMortgages)
            .single(function (x) { return x.id === id; });
          if (currentMortgage) {
            this.actionRedeem = currentMortgage;
            this.dialogBonusVisible = true;
          }
        } else {
          // 全部赎回；
        }
      },
      // 抵押动作
      mortgageAction() {
        this.actionType = 'mortgage';
        this.dialogBonusVisible = true;
      },
      quickQuan(num) {
        this.quickQuantityType = num;
        if (this.actionType === 'mortgage') {
          // 抵押
          if (num === 1) {
            this.actionQuantity = parseFloat(this.userAccountInfo.bt * 0.25).toFixed(4);
          } else if (num === 2) {
            this.actionQuantity = parseFloat(this.userAccountInfo.bt * 0.5).toFixed(4);
          } else if (num === 3) {
            this.actionQuantity = parseFloat(this.userAccountInfo.bt * 0.75).toFixed(4);
          } else if (num === 4) {
            this.actionQuantity = parseFloat(this.userAccountInfo.bt).toFixed(4);
          } else {
            this.actionQuantity = 0;
          }
        } else if (this.actionType === 'redeem') {
          // 赎回
          if (this.actionRedeem) {
            if (num === 1) {
              this.actionQuantity = parseFloat(this.actionRedeem.mortgage_bt * 0.25).toFixed(4);
            } else if (num === 2) {
              this.actionQuantity = parseFloat(this.actionRedeem.mortgage_bt * 0.5).toFixed(4);
            } else if (num === 3) {
              this.actionQuantity = parseFloat(this.actionRedeem.mortgage_bt * 0.75).toFixed(4);
            } else if (num === 4) {
              this.actionQuantity = parseFloat(this.actionRedeem.mortgage_bt).toFixed(4);
            } else {
              this.actionQuantity = 0;
            }
          } else {
            this.actionQuantity = 0;
          }
        }
      },
      // 获取用户EOS数量
      getEosCount(account) {
        var that = this;
        let options = {
          httpEndpoint: this.selfUtil.httpEndpoint
        };
        let eos = Eos(options);
        eos.getCurrencyBalance('eosio.token', account, 'EOS').then(function (e) {
          if (e.length > 0) {
            let eosNum = e[0].toString().split(' ')[0];
            that.userAccountInfo.eos = eosNum;
          } else {
            that.userAccountInfo.eos = 0;
          }
        });
      },
      // 获取用户BT数量
      getBTCount(account) {
        var that = this;
        let options = {
          httpEndpoint: this.selfUtil.httpEndpoint
        };
        let eos = Eos(options);
        eos.getCurrencyBalance('eosbtextoken', account, 'BT').then(function (e) {
          if (e.length > 0) {
            let btNum = e[0].toString().split(' ')[0];
            that.userAccountInfo.bt = btNum;
          } else {
            that.userAccountInfo.bt = 0;
          }
        });
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
        EosUtil.getTableRow(params, function (rows) {
          if (rows && rows.length > 0) {
            that.indexesData.bonus_pool_eos = rows[0].bonus_pool_eos.toString().split(' ')[0];
            that.indexesData.bonus_history_eos = rows[0].bonus_history_eos.toString().split(' ')[0];
            that.indexesData.mortgage_history_bt = rows[0].mortgage_history_bt.toString().split(' ')[0];
          }
        });
      },
      // 获取用户的历史统计数据
      getUserHistoryData(accountName) {
        var that = this;
        var params = {'scope': 'eosbtexbonus', 'code': 'eosbtexbonus', 'table': 'profits', 'json': 'true', 'limit': 1, 'index_position': 1, 'key_type': 'name', 'lower_bound': accountName};
        EosUtil.getTableRow(params, function (rows) {
          if (rows && rows.length > 0 && rows[0].owner === accountName) {
            that.userHistoryData.bonus_history_eos = rows[0].bonus_history_eos.toString().split(' ')[0];
            that.userHistoryData.mortgage_history_bt = rows[0].mortgage_history_bt.toString().split(' ')[0];
            that.userHistoryData.owner = rows[0].owner.toString();
          }
        });
      },
      // 获取BT价格
      getBTPrice() {
        var that = this;
        var params = {'scope': 'btexexchange', 'code': 'btexexchange', 'table': 'tokenpairs', 'json': 'true', 'limit': 1, 'index_position': 1, 'lower_bound': '154114185766125772'};
        EosUtil.getTableRow(params, function (rows) {
          if (rows && rows.length > 0 && rows[0].id === '154114185766125772') {
            that.btPrice = rows[0].price;
          }
        });
      },
      // 获取用户的抵押纪录
      getUserMortgages(accountName) {
        var that = this;
        var params = {'scope': accountName + ' ', 'code': 'eosbtexbonus', 'table': 'mortgages', 'json': 'true', 'limit': -1};
        EosUtil.getTableRow(params, function (rows) {
          if (rows && rows.length > 0) {
            let mortgages = [];
            let totalBt = 0;
            let totalEos = 0;
            for (let i = 0; i < rows.length; i++) {
              let mortgage = {};
              mortgage.mortgage_bt = parseFloat(rows[i].mortgage_bt.toString().split(' ')[0]).toFixed(4);
              mortgage.mortgage_total_bt = parseFloat(rows[i].mortgage_total_bt.toString().split(' ')[0]).toFixed(4);
              mortgage.bonus_extracted_eos = parseFloat(rows[i].bonus_extracted_eos.toString().split(' ')[0]).toFixed(4);
              mortgage.mortgage_time_date = moment(new Date(parseInt(rows[i].mortgage_time))).format('YYYY-MM-DD HH:mm:ss');
              mortgage.mortgage_time = rows[i].mortgage_time;
              mortgage.id = rows[i].id;
              totalBt += parseFloat(mortgage.mortgage_bt);
              let incomNum = that.sumIncome(mortgage.mortgage_bt, mortgage.mortgage_time);
              mortgage.incom_num = incomNum;
              totalEos += parseFloat(incomNum);
              mortgages.push(mortgage);
            }
            that.totalMortgage = parseFloat(totalBt).toFixed(4);
            that.totalIncom = parseFloat(totalEos).toFixed(4);
            that.userMortgagess = mortgages;
          }
        });
      }
    },
    created() {
      // 设置标题
      // document.title = this.$t('message.invest');
      // 获取用户信息
      if (this.identity) {
        let account = this.identity.accounts.find(x => x.blockchain === 'eos');
        this.account = account;
      }
      var that = this;
      // 获取总抵押
      that.getTotalMortgage();
      // 获取统计表数据
      that.getIndexesData();
      // 获取BT价格
      that.getBTPrice();
      this.timeIntever = setInterval(function () {
        that.getTotalMortgage();
        that.getIndexesData();
        that.getBTPrice();
        if (that.account) {
          that.getUserHistoryData(that.account.name);
          that.getUserMortgages(that.account.name);
          that.getBTCount(that.account.name);
        }
      }, 5000);
    },
    beforeDestroy() {
      window.clearInterval(this.timeIntever);
      // window.clearInterval(this.prizeIntever);
    }
  };
</script>

<style lang="scss" scoped>
  .page.dark {
    padding: 15px 15px;
    .bonus-index {
      .bonus-all-title{
        font-size: 16px;
        color: #FFFFFF;
        text-align: center;
        .questions{
          width: 18px;
          height: auto;
          margin-left: 10px;
          vertical-align: middle;
        }
      }
      .bonus-all{
        font-size: 30px;
        color: #FFFFFF;
        text-align: center;
      }
      .mortgage-total{
        opacity: 0.5;
        font-size: 12px;
        color: #FFFFFF;
        text-align: center;
      }
      .bonus-info-box{
        margin-top: 20px;
        background-image: linear-gradient(-225deg, #2EB8FF 0%, #2AA1F8 41%, #1B4EE1 100%);
        border-radius: 6px;
        padding: 15px;
        margin-bottom: 35px;
        text-align: center;
        position: relative;
        .have-bonus-title{
          font-size: 16px;
          color: #FFFFFF;
        }
        .have-bonus{
          font-size: 26px;
          color: #FFFFFF;
          padding: 10px 0px;
        }
        .user-bonus{
          display: flex;
          text-align: center;
          padding-bottom: 20px;
          .user-bonus-current,.user-bonus-history{
            flex: 1;
            .user-bonus-c-title{
              opacity: 0.5;
              font-size: 12px;
              color: #ffffff;
              text-align: center;
              line-height: 1.5em;
            }
            .user-bonus-c-value{
              font-size: 14px;
              color: #ffffff;
              text-align: center;
              line-height: 1.5em;
            }
          }
          .user-bonus-current{
            border-right: 1px solid #f8f8f854;
          }
          .user-bonus-history{
            border-left: 1px solid #f8f8f854;;
          }
        }
        .index-text2{
          opacity: 0.5;
          font-size: 12px;
          color: #ffffff;;
          text-align: center;
          /*padding: 5px 0px;*/
        }
        .index-text{
          opacity: 0.5;
          font-size: 12px;
          color: #ffffff;;
          text-align: center;
          padding: 5px 0px 15px 0px;
        }
        .bonus-btn {
          background: #F9AA44;
          border-radius: 4px;
          font-size: 16px;
          color: #FFFFFF;
          padding: 10px 10px;
          text-align: center;
          position: absolute;
          bottom: -23px;
          left: 15px;
          right: 15px;
        }
      }
    }
    .bonus-list {
      .title-name{
        font-size: 12px;
        color: #FFFFFF;
        opacity: 0.5;
        padding: 10px 0px;
      }
      .lists {
        padding-bottom: 55px;
        .boun {
          background: #2D4E69;
          border-radius: 3px;
          padding: 15px 20px;
          position: relative;
          margin-bottom: 10px;
          .o-top {
            .o-time {
              font-size: 14px;
              color: #ffffff;
            }
          }
          .o-bottom {
            display: flex;
            .o-info {
              padding-top: 10px;
              flex: 1;
              .info-name {
                line-height: 3em;
                font-size: 12px;
                color: #5A81A3;
              }
              .info-value {
                font-size: 14px;
                color: #ffffff;
              }
            }
            .o-info:nth-child(1) {
              flex: 1.2;
            }
          }
          .o-action {
            position: absolute;
            top: 15px;
            right: 20px;
            padding: 3px 10px;
            cursor: pointer;
            border: 1px solid #47A9FF;
            font-size: 12px;
            color: #47A9FF;
            border-radius: 4px;
          }
        }
      }
    }
    .el-dialog{
      .actionBox{
        padding: 10px;
        .actionName{
          font-size: 24px;
          color: #ffffff;
          text-align: center;
          padding-bottom: 30px;
        }
        .quik-num-btns{
          display: flex;
          padding: 10px 0px;
          span{
            flex: 1;
            margin-right: 10px;
            display: table-cell;
            background: rgba(71,169,255,0.16);
            color: rgba(255,255,255,0.43);
            border-radius: 4px;
            text-align: center;
            cursor: pointer;
            vertical-align: middle;
            padding: 4px;
            font-size: 12px;
          }
          span:nth-child(4) {
            margin-right: 0px;
          }
          /*span.mortgage{*/
            /*background: rgba(249,170,68,0.66);*/
            /*color: rgba(4,16,46,0.43);*/
          /*}*/
          span.active{
            color: #fff;
            background: #47A9FF;;
          }
          /*span.mortgage.active{*/
            /*background: #F9AA44;*/
            /*color: #fff;*/
          /*}*/
        }
        .userCount{
          display: flex;
          .bt{
            flex: 1;
            font-size: 12px;
            color: #ffffff;
          }
          .eos{
            flex: 1;
            font-size: 12px;
            color: #ffffff;
          }
        }
        .actionBtn{
          background: #F9AA44;
          border-radius: 4px;
          text-align: center;
          cursor: pointer;
          padding: 10px 0px;
          margin: 30px 0px 20px 0px;
          color: #fff;
          font-size: 14px;
        }
        /*.actionBtn.mortgage{*/
          /*background: #F9AA44;*/
        /*}*/
        /*.actionBtn.redeem{*/
          /*background: #F87070;*/
        /*}*/
        .el-input-group{
          background-color: #1F3547;
          opacity: 1;
          border: 1px solid #182937;
        }
      }
    }
  }
  .page.light {
    padding: 15px 15px;
    .bonus-index {
      .bonus-all-title{
        font-size: 16px;
        color: #262626;
        text-align: center;
        .questions{
          width: 18px;
          height: auto;
          margin-left: 10px;
          vertical-align: middle;
        }
      }
      .bonus-all{
        font-size: 30px;
        color: #262626;
        text-align: center;
      }
      .mortgage-total{
        opacity: 0.5;
        font-size: 12px;
        color: #262626;
        text-align: center;
      }
      .bonus-info-box{
        margin-top: 20px;
        background-image: linear-gradient(-225deg, #2EB8FF 0%, #2AA1F8 41%, #1B4EE1 100%);
        border-radius: 6px;
        padding: 15px;
        margin-bottom: 35px;
        text-align: center;
        position: relative;
        .have-bonus-title{
          font-size: 16px;
          color: #FFFFFF;
        }
        .have-bonus{
          font-size: 26px;
          color: #FFFFFF;
          padding: 10px 0px;
        }
        .user-bonus{
          display: flex;
          text-align: center;
          padding-bottom: 20px;
          .user-bonus-current,.user-bonus-history{
            flex: 1;
            .user-bonus-c-title{
              opacity: 0.5;
              font-size: 12px;
              color: #ffffff;
              text-align: center;
              line-height: 1.5em;
            }
            .user-bonus-c-value{
              font-size: 14px;
              color: #ffffff;
              text-align: center;
              line-height: 1.5em;
            }
          }
          .user-bonus-current{
            border-right: 1px solid #f8f8f854;
          }
          .user-bonus-history{
            border-left: 1px solid #f8f8f854;;
          }
        }
        .index-text2{
          opacity: 0.5;
          font-size: 12px;
          color: #ffffff;;
          text-align: center;
          /*padding: 5px 0px;*/
        }
        .index-text{
          opacity: 0.5;
          font-size: 12px;
          color: #ffffff;;
          text-align: center;
          padding: 5px 0px 15px 0px;
        }
        .bonus-btn {
          background: #F9AA44;
          border-radius: 4px;
          font-size: 16px;
          color: #FFFFFF;
          padding: 10px 10px;
          text-align: center;
          position: absolute;
          bottom: -23px;
          left: 15px;
          right: 15px;
        }
      }
    }
    .bonus-list {
      .title-name{
        font-size: 12px;
        color: #262626;
        opacity: 0.5;
        padding: 10px 0px;
      }
      .lists {
        padding-bottom: 55px;
        .boun {
          background: #ffffff;
          border-radius: 3px;
          padding: 15px 20px;
          position: relative;
          margin-bottom: 10px;
          .o-top {
            .o-time {
              font-size: 14px;
              color: #262626;
            }
          }
          .o-bottom {
            display: flex;
            .o-info {
              padding-top: 10px;
              flex: 1;
              .info-name {
                line-height: 3em;
                font-size: 12px;
                color: #9F9F9F;
              }
              .info-value {
                font-size: 14px;
                color: #262626;
              }
            }
            .o-info:nth-child(1) {
              flex: 1.2;
            }
          }
          .o-action {
            position: absolute;
            top: 15px;
            right: 20px;
            padding: 3px 10px;
            cursor: pointer;
            border: 1px solid #47A9FF;
            font-size: 12px;
            color: #47A9FF;
            border-radius: 4px;
          }
        }
      }
    }
    .el-dialog{
      .actionBox{
        padding: 10px;
        .actionName{
          font-size: 24px;
          color: #262626;
          text-align: center;
          padding-bottom: 30px;
        }
        .quik-num-btns{
          display: flex;
          padding: 10px 0px;
          span{
            flex: 1;
            margin-right: 10px;
            display: table-cell;
            background: rgba(71, 169, 255, 0.16);
            color: rgba(0,0,0,0.43);
            border-radius: 4px;
            text-align: center;
            cursor: pointer;
            vertical-align: middle;
            padding: 4px;
            font-size: 12px;
          }
          span:nth-child(4) {
            margin-right: 0px;
          }
          /*span.mortgage{*/
          /*background: rgba(249,170,68,0.66);*/
          /*color: rgba(4,16,46,0.43);*/
          /*}*/
          span.active{
            color: #fff;
            background: #47A9FF;
          }
          /*span.mortgage.active{*/
          /*background: #F9AA44;*/
          /*color: #fff;*/
          /*}*/
        }
        .userCount{
          display: flex;
          .bt{
            flex: 1;
            font-size: 12px;
            color: #9F9F9F;
          }
          .eos{
            flex: 1;
            font-size: 12px;
            color: #9F9F9F;
          }
        }
        .actionBtn{
          background: #F9AA44;
          border-radius: 4px;
          text-align: center;
          cursor: pointer;
          padding: 10px 0px;
          margin: 30px 0px 20px 0px;
          color: #fff;
          font-size: 14px;
        }
        /*.actionBtn.mortgage{*/
        /*background: #F9AA44;*/
        /*}*/
        /*.actionBtn.redeem{*/
        /*background: #F87070;*/
        /*}*/
        .el-input-group{
          background-color: #ffffff;
          opacity: 1;
        }
      }
    }
  }
</style>
