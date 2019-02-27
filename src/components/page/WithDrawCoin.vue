<template>
  <div id="master">
    <div class="page">
      <div class="up-coin">
        <div class="form-group">
          <label class="required">{{$t("message.coin")}}</label>
          <div class="weui-cells">
            <div class="weui-cell weui-cell_access selectCoin">
              <div class="weui-cell__bd">{{coinName}}</div>
              <div class="weui-cell__ft" @click="selectCoin">
                <span>{{$t("message.coin_select")}}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="required">{{$t("message.to_select")}}</label>
          <div class="weui-cells weui-cells_form">
            <div class="weui-cell weui-cell_access address">
              <div class="weui-cell__bd">
                <input class="weui-input" type="text" value="bituexwallet" readonly="readonly">
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>{{$t("message.tag")}}(MEMO)<span style="color: red;font-size: 12px">&nbsp;&nbsp;{{$t("message.tag_error")}}</span></label>
          <div class="weui-cells weui-cells_form">
            <div class="weui-cell weui-cell_access address">
              <div class="weui-cell__bd">
                <input class="weui-input" type="text" v-model="memo" :placeholder="$t('message.tag_place')">
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>{{$t("message.quantity")}}</label>
          <div class="weui-cells weui-cells_form">
            <div class="weui-cell weui-cell_vcode quantity">
              <div class="weui-cell__bd">
                <input class="weui-input" type="number" v-model="quantity" :placeholder="quantityPlacehoder">
              </div>
              <div class="weui-cell__ft">
                <button class="weui-vcode-btn" @click="totalClick">{{$t("message.all")}}</button>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="margin-top: 80px">
          <p class="notice">标签(MEMO)可在注册Bituex后充币页面查看</p>
          <p class="bituexwebsite"><a href="https://www.bituex.com">EOS、USDT、BT交易首选交易所——Bituex</a></p>
        </div>
        <button type="submit" @click="onSubmit" class="weui-btn weui-btn_default yellow" style="">{{$t("message.submit")}}</button>
      </div>
    </div>
  </div>
</template>

<script>
  import Eos from 'eosjs';
  import {mapState} from 'vuex';
  export default {
    name: 'WithDrawCoin',
    data: function () {
      return {
        account: null,
        coinName: 'EOS',
        toAccount: 'bituexwallet',
        memo: '',
        quantity: '',
        quantityPlacehoder: '',
        // 用户的账户信息
        userAccountInfo: {
          eos: 0,
          bt: 0,
          usdt: 0
        }
      };
    },
    computed: mapState({
      identity: state => state.identity,
      scatter: state => state.scatter
    }),
    watch: {
      identity: function (newIdentity) {
        if (newIdentity) {
          // console.log(newIdentity);
          let account = newIdentity.accounts.find(x => x.blockchain === 'eos');
          this.account = account;
          // 获取EOS数量
          this.getEosCount(this.account.name);
          // 获取BT数量
          this.getBTCount(this.account.name);
          // 获取USDT数量
          this.getUSDTCount(this.account.name);
        }
      },
      coinName: function (ncoinName) {
        if (ncoinName) {
          if (ncoinName === 'EOS') {
            this.quantityPlacehoder = this.$t('message.can_user') + this.userAccountInfo.eos;
          } else if (ncoinName === 'BT') {
            this.quantityPlacehoder = this.$t('message.can_user') + this.userAccountInfo.bt;
          } else if (ncoinName === 'USDT') {
            this.quantityPlacehoder = this.$t('message.can_user') + this.userAccountInfo.usdt;
          } else {
            this.quantityPlacehoder = this.$t('message.can_user');
          }
        }
      }
    },
    methods: {
      async onSubmit() {
        // 判断登录
        let that = this;
        if (this.quantity !== '' && this.memo !== '') {
          if (that.account) {
            if (this.scatter) {
              const eos = this.scatter.eos(this.selfUtil.network, Eos, { expireInSeconds: 60 });
              var account = this.scatter.identity.accounts.find(x => x.blockchain === 'eos');
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
                        to: that.toAccount,
                        quantity: parseFloat(that.quantity).toFixed(4) + ' ' + that.coinName,
                        memo: that.memo
                      }
                    }
                  ]
                }, (err, res) => {
                  if (!err) {
                    // 上币成功
                    this.$message({
                      type: 'success',
                      text: this.$t('message.alert_withdraw_coin_success'),
                      duration: 3000
                    });
                    this.$router.back(-1);
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
                          text: this.$t('message.alert_withdraw_coin_error') + ':' + errMsg,
                          duration: 3000
                        });
                      }
                    } else {
                      this.$message({
                        type: 'error',
                        text: this.$t('message.alert_withdraw_coin_error') + err.message,
                        duration: 3000
                      });
                    }
                  }
                }
              );
            } else {
              this.$message({
                type: 'error',
                text: this.$t('message.alert_no_scatter'),
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
        } else {
          this.$message({
            type: 'error',
            text: this.$t('message.alert_withdraw_coin_params'),
            duration: 3000
          });
        }
      },
      // 获取用户EOS数量
      getEosCount(account) {
        var that = this;
        let network = this.selfUtil.network;
        if (network) {
          let options = {
            httpEndpoint: that.selfUtil.httpEndpoint
          };
          let eos = Eos(options);
          eos.getCurrencyBalance('eosio.token', account, 'EOS').then(function (e) {
            if (e.length > 0) {
              let eosNum = e[0].toString().split(' ')[0];
              that.userAccountInfo.eos = eosNum;
            } else {
              that.userAccountInfo.eos = 0;
            }
            if (that.coinName === 'EOS') {
              that.quantityPlacehoder = that.$t('message.can_user') + that.userAccountInfo.eos;
            }
          });
        }
      },
      // 获取用户BT数量
      getBTCount(account) {
        var that = this;
        let network = this.selfUtil.network;
        if (network) {
          let options = {
            httpEndpoint: that.selfUtil.httpEndpoint
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
        }
      },
      // 获取用户BT数量
      getUSDTCount(account) {
        var that = this;
        let network = this.selfUtil.network;
        if (network) {
          let options = {
            httpEndpoint: that.selfUtil.httpEndpoint
          };
          let eos = Eos(options);
          eos.getCurrencyBalance('eosbtextoken', account, 'USDT').then(function (e) {
            if (e.length > 0) {
              let btNum = e[0].toString().split(' ')[0];
              that.userAccountInfo.usdt = btNum;
            } else {
              that.userAccountInfo.usdt = 0;
            }
          });
        }
      },
      selectCoin() {
        let that = this;
        this.weui.picker([
          {
            label: 'EOS',
            value: 'EOS'
          },
          {
            label: 'BT',
            value: 'BT'
          },
          {
            label: 'USDT',
            value: 'USDT'
          }
        ], {
          defaultValue: ['EOS'],
          onConfirm: function (result) {
            that.coinName = result[0].value;
            console.log(result);
          },
          id: 'singleLinePicker'
        });
      },
      totalClick() {
        if (this.coinName === 'USDT') {
          this.quantity = this.userAccountInfo.usdt;
        } else if (this.coinName === 'BT') {
          this.quantity = this.userAccountInfo.bt;
        } else if (this.coinName === 'EOS') {
          this.quantity = this.userAccountInfo.eos;
        }
      }
    },
    created() {
      // 获取账号详情
      if (this.identity) {
        let account = this.identity.accounts.find(x => x.blockchain === 'eos');
        this.account = account;
        // 获取EOS数量
        this.getEosCount(this.account.name);
        // 获取BT数量
        this.getBTCount(this.account.name);
        // 获取USDT数量
        this.getUSDTCount(this.account.name);
      }
    }
  };
</script>

<style lang="scss" scoped>
  .page {
    padding: 15px;
    box-sizing: border-box;
    background: #1F3547;
    min-height: 100vh;
    .up-coin {
      border-radius: 6px;
      margin-top: 20px;
      .form-group {
        margin-bottom: 15px;
        label {
          display: inline-block;
          max-width: 100%;
          margin-bottom: 5px;
          font-size: 13px;
          color: #ffffff;
          font-weight: 400;
        }
        label.required:after{
          content: "*";
          color: #f56c6c;
          margin-left: 4px;
        }
        .weui-cells{
          margin-top: 0px;
        }
        .weui-cells{
          font-size: 13px;
        }
        .selectCoin{
          background: #162C39;
          border-radius: 4px;
        }
        .address{
          border-bottom:  1px solid #2C4962;
          padding: 10px 0px;
        }
        .quantity{
          border-bottom:  1px solid #2C4962;
          padding: 10px 0px;
          color: #ffffff;
        }
        .address:hover,.quantity:hover {
          background-color: transparent;
        }
        .weui-vcode-btn{
          height: auto;
          line-height: 1em;
          color: #ffffff;
          border-left: none;
          font-size: 13px;
        }
        .notice{
          font-size: 12px;
          color: #FFFFFF;
          text-align: center;
        }
        .bituexwebsite{
          text-align: center;
        }
        .bituexwebsite a{
          font-size: 12px;
          color: #5A81A3;
          text-align: center;
        }
        .form-control {
          display: block;
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          line-height: 1.42857143;
          color: #fff;
          background-color: transparent;
          border: 1px solid #466E91;
          border-radius: 4px;
          -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
          -webkit-transition: border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;
          -o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
          transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
          box-sizing: border-box;
          outline:none;
        }
        textarea.form-control {
          height: auto;
        }
      }
      .weui-btn.yellow {
        background-color: #F9AA44;
        color: #ffffff;
        font-size: 14px;
      }
      .weui-btn.yellow:active{
        background-color: #f69c28;
      }
    }
  }
</style>
