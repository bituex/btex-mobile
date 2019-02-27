<template>
  <div id="master">
    <div class="page">
      <div class="add-coin">
        <button class="weui-btn" @click="addCoinAction">{{$t("message.up_coin_self")}}</button>
      </div>
      <div class="coins">
        <div class="coin" v-for="(item,index) in coins" :key="index">
          <div class="top">
            <div class="coin-name">{{item.asset_symbol}}</div>
            <div class="coin-action">
              <div class="o-action" @click="transferAction(item.currencyId)">{{$t("message.coin_transfer")}}</div>
              <div class="o-action" @click="delCoin(item.currencyId)">{{$t("message.coin_offline")}}</div>
            </div>
          </div>
          <div class="bottom">
            <div class="contract">
              <div class="key">{{$t("message.contract")}}</div>
              <div class="value">{{item.contractName}}</div>
            </div>
            <div class="user">
              <div class="key">{{$t("message.coin_user")}}</div>
              <div class="value">{{item.creator}}</div>
            </div>
            <div class="amount">
              <div class="key">{{$t("message.mortgage_amount")}}</div>
              <div class="value">{{item.pledge}}</div>
            </div>
          </div>
        </div>
      </div>
      <!--<div class="coins-none" v-if="coins.length === 0">{{$t("message.coin_user_no")}}</div>-->
    </div>
    <el-dialog title="" :visible.sync="dialogTransVisible" @close="resetActionData">
      <div class="actionBox">
        <div class="actionName">{{$t("message.coin_user_transfer")}}</div>
        <input type="text" class="form-control" v-model="transferParams.newCreator" :placeholder="$t('message.coin_user_new')">
        <div class="userCount">{{$t("message.coin_user_right")}}</div>
        <div class="userCount error" v-if="transferParams.error != ''">{{transferParams.error}}</div>
        <div class="actionBtn mortgage" @click="transferCoin">{{$t("message.confirm")}}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Eos from 'eosjs';
  import EosUtil from '../../common/EosUtils';
  import ElDialog from '../element/dialog';
  import ElInput from '../element/input';
  import Enumerable from 'linq';
  export default {
    name: 'CoinList',
    data: function () {
      return {
        coins: [],
        account: null,
        transferParams: {
          id: '',
          newCreator: '',
          error: ''
        },
        dialogTransVisible: false
        // 是否登录
      };
    },
    components: {
      ElDialog,
      ElInput
    },
    watch: {
      identity: function (newIdentity) {
        if (newIdentity) {
          // console.log(newIdentity);
          var account = newIdentity.accounts.find(x => x.blockchain === 'eos');
          this.account = account;
          if (this.contractCoins) {
            this.coins = Enumerable.from(this.contractCoins)
              .where(function (x) { return x.creator === account.name; }).toArray();
            // this.coins = this.contractCoins;
          }
        }
      },
      contractCoins: function (newCoins) {
        if (newCoins && this.account) {
          var accountName = this.account.name;
          this.coins = Enumerable.from(newCoins)
            .where(function (x) { return x.creator === accountName; }).toArray();
          // this.coins = newCoins;
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
      }
    },
    methods: {
      addCoinAction() {
        this.$router.push('/upcoin');
      },
      transferAction(id) {
        this.transferParams.id = id;
        this.dialogTransVisible = true;
      },
      transferCoin() {
        var that = this;
        var id = this.transferParams.id;
        var newCreator = this.transferParams.newCreator;
        if (id !== '' && newCreator !== '') {
          this.dialogTransVisible = false;
          this.weui.confirm(this.$t('message.confirm_is_transfer_coin'), {
            buttons: [{
              label: that.$t('message.cancel'),
              type: 'default',
              onClick: function() {
                console.log('no');
              }
            }, {
              label: that.$t('message.confirm'),
              type: 'primary',
              onClick: function() {
                console.log('yes');
                if (that.scatter) {
                  var eos = that.scatter.eos(that.selfUtil.network, Eos, {expireInSeconds: 60});
                  var account = that.scatter.identity.accounts.find(x => x.blockchain === 'eos');
                  eos.transaction(
                    {
                      actions: [
                        {
                          account: 'btexexchange',
                          name: 'settpcreator',
                          authorization: [
                            {
                              actor: account.name,
                              permission: account.authority
                            }
                          ],
                          data: {
                            creator: account.name,
                            pair_id: id,
                            new_creator: newCreator
                          }
                        }
                      ]
                    }, (err, res) => {
                      if (!err) {
                        that.getCoins();
                        // that.weui.alert(that.$t('message.alert_coin_transfer_success'), {
                        //   buttons: [{
                        //     label: that.$t('message.confirm'),
                        //     type: 'primary'
                        //   }]
                        // });
                        that.$message({
                          type: 'success',
                          text: that.$t('message.alert_coin_transfer_success'),
                          duration: 3000
                        });
                      } else {
                        if (typeof (err) === 'string') {
                          // that.weui.alert(that.$t('message.alert_coin_transfer_error') + ':' + err, {
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
                              text: this.$t('message.alert_coin_transfer_error') + ':' + errMsg,
                              duration: 3000
                            });
                          }
                        } else {
                          // that.weui.alert(that.$t('message.alert_coin_transfer_error') + ':' + err.message, {
                          //   buttons: [{
                          //     label: that.$t('message.confirm'),
                          //     type: 'primary'
                          //   }]
                          // });
                          that.$message({
                            type: 'error',
                            text: that.$t('message.alert_coin_transfer_error') + ':' + err.message,
                            duration: 3000
                          });
                        }
                      }
                    }
                  );
                } else {
                  // that.weui.alert(this.$t('message.alert_no_scatter'), {
                  //   buttons: [{
                  //     label: that.$t('message.confirm'),
                  //     type: 'primary'
                  //   }]
                  // });
                  that.$message({
                    type: 'error',
                    text: this.$t('message.alert_no_scatter'),
                    duration: 3000
                  });
                }
              }
            }]
          });
        } else {
          that.transferParams.error = that.$t('message.alert_coin_user_transfer');
        }
      },
      delCoin(id) {
        var that = this;
        this.weui.confirm(this.$t('message.confirm_is_offline_coin'), {
          buttons: [{
            label: that.$t('message.cancel'),
            type: 'default',
            onClick: function() {
              console.log('no');
            }
          }, {
            label: that.$t('message.confirm'),
            type: 'primary',
            onClick: function() {
              console.log('yes');
              if (that.scatter) {
                var eos = that.scatter.eos(that.selfUtil.network, Eos, {expireInSeconds: 60});
                var account = that.scatter.identity.accounts.find(x => x.blockchain === 'eos');
                eos.transaction(
                  {
                    actions: [
                      {
                        account: 'btexexchange',
                        name: 'deltokenpair',
                        authorization: [
                          {
                            actor: account.name,
                            permission: account.authority
                          }
                        ],
                        data: {
                          creator: account.name,
                          pair_id: id
                        }
                      }
                    ]
                  }, (err, res) => {
                    if (!err) {
                      that.getCoins();
                      // that.weui.alert(that.$t('message.alert_offline_coin_success'), {
                      //   buttons: [{
                      //     label: that.$t('message.confirm'),
                      //     type: 'primary'
                      //   }]
                      // });
                      that.$message({
                        type: 'success',
                        text: that.$t('message.alert_offline_coin_success'),
                        duration: 3000
                      });
                    } else {
                      if (typeof (err) === 'string') {
                        // that.weui.alert(that.$t('message.alert_offline_coin_error') + ':' + err, {
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
                            text: this.$t('message.alert_offline_coin_error') + ':' + errMsg,
                            duration: 3000
                          });
                        }
                      } else {
                        // that.weui.alert(that.$t('message.alert_offline_coin_error') + ':' + err.message, {
                        //   buttons: [{
                        //     label: that.$t('message.confirm'),
                        //     type: 'primary'
                        //   }]
                        // });
                        that.$message({
                          type: 'error',
                          text: that.$t('message.alert_offline_coin_error') + ':' + err.message,
                          duration: 3000
                        });
                      }
                    }
                  }
                );
              } else {
                // that.weui.alert(this.$t('message.alert_no_scatter'), {
                //   buttons: [{
                //     label: that.$t('message.confirm'),
                //     type: 'primary'
                //   }]
                // });
                that.$message({
                  type: 'error',
                  text: this.$t('message.alert_no_scatter'),
                  duration: 3000
                });
              }
            }
          }]
        });
      },
      getCoins() {
        var that = this;
        var params = {
          'scope': 'btexexchange',
          'code': 'btexexchange',
          'table': 'tokenpairs',
          'json': 'true',
          'limit': -1,
          'lower_bound': 0
        };
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
      }
    },
    created() {
      // 设置标题
      // document.title = this.$t('message.service_coin');
      // 获取账号详情
      if (this.identity) {
        var account = this.identity.accounts.find(x => x.blockchain === 'eos');
        this.account = account;
        // 显示币种
        if (this.contractCoins) {
          this.coins = Enumerable.from(this.contractCoins)
            .where(function (x) { return x.creator === account.name; }).toArray();
          // this.coins = this.contractCoins;
        } else {
          this.getCoins();
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  .add-coin{
    padding: 30px 30px;
    background-color: #1F3547;
    button{
      background: #F9AA44;
      font-size: 14px;
      color: #fff;
      padding: 10px;
      line-height: 1.6em;
    }
  }
  .coins {
    padding: 4px 0px;
    .coin {
      margin-bottom: 4px;
      background-color: #1F3547;
      padding: 10px 15px;
      .top {
        display: flex;
        .coin-name {
          font-size: 1rem;
          color: #FFFFFF;
          flex: 1;
          line-height: 26px;
        }
        .coin-action {
          width: 140px;
          display: flex;
          .o-action {
            flex: 1;
            border: 1px solid #47A9FF;
            border-radius: 3px;
            font-size: 0.75rem;
            color: #47A9FF;
            text-align: center;
            margin-left: 20px;
            line-height: 26px;
          }
        }
      }
      .bottom {
        margin-top: 20px;
        display: flex;
        .contract {
          flex: 1;
        }
        .user {
          flex: 1;
        }
        .amount {
          flex: 1;
        }
        .contract .key, .user .key, .amount .key {
          font-size: 0.75rem;
          color: #FFFFFF;
          opacity: 0.5;
        }
        .contract .value, .user .value, .amount .value {
          font-size: 0.75rem;
          color: #FFFFFF;
          opacity: 0.5;
        }
      }
    }
  }

  .coins-none {
    padding: 10px;
    text-align: center;
    font-size: 0.875rem;
    color: #fff;
  }
  .el-dialog{
    .actionBox{
      padding: 10px;
      .actionName{
        font-size: 1.5rem;
        color: #ffffff;
        text-align: center;
        padding-bottom: 30px;
      }
      .userCount{
        display: flex;
        opacity: 0.51;
        font-size: 0.75rem;
        color: #ffffff;
      }
      .userCount.error{
        color: red;
      }
      .actionBtn{
        background: #F87070;
        border-radius: 4px;
        text-align: center;
        cursor: pointer;
        padding: 10px 0px;
        margin: 30px 0px 20px 0px;
        color: #fff;
        font-size: 0.875rem;
      }
      .actionBtn.mortgage{
        background: #F9AA44;
      }
      .form-control {
        display: block;
        width: 100%;
        padding: 10px 12px;
        font-size: 0.875rem;
        line-height: 1.42857143;
        color: #fff;
        background: #192937;
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
    }
  }
</style>
