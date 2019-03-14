<template>
  <div id="master" :class="theme === 'light' ? 'light' : 'dark'">
    <div class="page">
      <div class="up-coin">
        <!--<div class="form-group">-->
          <!--<label for="coinName" class="required">基础币种</label>-->
          <!--<select class="form-control" v-model="joinCoin.base_id" style="background-color: #162C39" id="baseCoinName">-->
            <!--<option :value="item.id" v-for="(item, index) in basetokens" :key="index">{{item.sym_name}}</option>-->
          <!--</select>-->
        <!--</div>-->
        <div class="form-group">
          <label for="coinName" class="required">{{$t("message.coin_name")}}</label>
          <input type="text" class="form-control" v-model="joinCoin.name" id="coinName" :placeholder="$t('message.input_coin_name')">
        </div>
        <div class="form-group">
          <label for="contract" class="required">{{$t("message.contract")}}</label>
          <input type="text" class="form-control" v-model="joinCoin.contract" id="contract" :placeholder="$t('message.input_contract')">
        </div>
        <div class="form-group">
          <label>{{$t("message.upload_img")}}</label>
          <div>
            <div class="weui-uploader__bd">
              <ul class="weui-uploader__files" id="uploaderFiles">
                <li class="weui-uploader__file" v-if="joinCoin.imageUrl!=''" :style="'background-image:url('+ joinCoin.imageUrl +')'"></li>
              </ul>
              <div class="weui-uploader__input-box">
                <input class="weui-uploader__input" @change="uploadPicAction($event)" type="file" accept="image/*">
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="website">{{$t("message.website")}}</label>
          <input type="text" class="form-control" v-model="joinCoin.officialWebsite" id="website" :placeholder="$t('message.input_website')">
        </div>
        <div class="form-group">
          <label for="intro">{{$t("message.intro")}}</label>
          <textarea id="intro" class="form-control" v-model="joinCoin.coinInfo" rows="3" :placeholder="$t('message.input_intro')"></textarea>
        </div>
        <button type="submit" @click="onSubmit" class="weui-btn weui-btn_default yellow" style="margin-top: 36px">{{$t("message.up_coin")}}</button>
      </div>
    </div>
  </div>
</template>

<script>
  import Eos from 'eosjs';
  import {mapState} from 'vuex';
  import Enumerable from 'linq';
  export default {
    name: 'UpCoin',
    data: function () {
      return {
        joinCoin: {
          base_id: '',
          name: '',
          contract: '',
          imageUrl: '',
          officialWebsite: '',
          coinInfo: ''
        },
        account: null,
        // 用户的账户信息
        userAccountInfo: {
          eos: 0,
          bt: 0,
          exchange: 0
        }
      };
    },
    computed: mapState({
      identity: state => state.identity,
      scatter: state => state.scatter,
      basetokens: state => state.basetokens,
      theme () {
        return this.$store.state.theme;
      }
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
        }
      },
      basetokens: function (newBaseToken) {
        let baseTokens = Enumerable.from(this.basetokens).where((x) => {
          return x.contract === 'eosio.token' && x.sym_name === 'EOS';
        }).toArray();
        if (baseTokens && baseTokens.length > 0) {
          this.joinCoin.base_id = baseTokens[0].id;
        }
      }
    },
    methods: {
      async onSubmit() {
        // 判断登录
        var that = this;
        if (this.joinCoin.base_id !== '' && this.joinCoin.name !== '' && this.joinCoin.contract !== '') {
          if (that.account) {
            var currencyId = new Date().getTime() + Math.random().toString().substr(3, 5);
            var memo = 'currency:' + that.joinCoin.base_id + ',' + currencyId + ',' + that.joinCoin.contract + ',' + that.joinCoin.name;
            if (this.scatter) {
              const eos = this.scatter.eos(this.selfUtil.network, Eos, { expireInSeconds: 60 });
              var account = this.scatter.identity.accounts.find(x => x.blockchain === 'eos');
              var amount = 2000;
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
                        to: 'btexexchange',
                        quantity: parseFloat(amount).toFixed(4) + ' BT',
                        memo: memo
                      }
                    }
                  ]
                }, (err, res) => {
                  if (!err) {
                    // 上币成功
                    that.joinCoinForm(currencyId, amount);
                  } else {
                    if (typeof (err) === 'string') {
                      // this.weui.alert(this.$t('message.alert_up_coin_error') + err, {
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
                          text: this.$t('message.alert_up_coin_error') + ':' + errMsg,
                          duration: 3000
                        });
                      }
                    } else {
                      // this.weui.alert(this.$t('message.alert_up_coin_error') + err.message, {
                      //   buttons: [{
                      //     label: that.$t('message.confirm'),
                      //     type: 'primary'
                      //   }]
                      // });
                      this.$message({
                        type: 'error',
                        text: this.$t('message.alert_up_coin_error') + err.message,
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
        } else {
          // this.weui.alert(this.$t('message.alert_coin_name_notnull'), {
          //   buttons: [{
          //     label: that.$t('message.confirm'),
          //     type: 'primary'
          //   }]
          // });
          this.$message({
            type: 'error',
            text: this.$t('message.alert_coin_name_notnull'),
            duration: 3000
          });
        }
      },
      // 上币成功后的回调函数
      joinCoinForm(currencyId, amount) {
        let that = this;
        let data = {};
        data.contract_name = that.joinCoin.contract;
        data.currency_id = currencyId;
        data.asset_symbol = that.joinCoin.name;
        data.assetPrecision = 4;
        data.icon = that.joinCoin.imageUrl;
        data.website = that.joinCoin.officialWebsite;
        data.intro = that.joinCoin.coinInfo;
        data.account_name = that.account.name;
        data.pledge_bt = amount;
        // console.log(params);
        // 发送
        this.selfUtil.apiAxios('POST', this.selfUtil.host + '/service/api/currency/create', {'params': data}, res => {
          // console.log(res);
          if (res.result.error === 0) {
            // that.weui.alert(that.$t('message.alert_up_coin_success'), {
            //   buttons: [{
            //     label: that.$t('message.confirm'),
            //     type: 'primary'
            //   }]
            // });
            that.$message({
              type: 'success',
              text: that.$t('message.alert_up_coin_success'),
              duration: 3000
            });
            that.$router.push('/market');
          }
        });
      },
      // 上传图像
      uploadPicAction(event) {
        console.log(event);
        var file = event.target.files[0];
        var that = this;
        // 创建读取文件的对象
        var reader = new FileReader();
        // 创建文件读取相关的变量
        var imgFile;
        reader.onload = function (e) {
          imgFile = e.target.result;
          that.joinCoin.imageUrl = imgFile;
          // console.log(that.joinCoin.imageUrl);
        };
        // 正式读取文件
        reader.readAsDataURL(file);
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
      }
    },
    created() {
      // 设置标题
      // document.title = this.$t('message.up_coin');
      // 获取账号详情
      if (this.identity) {
        let account = this.identity.accounts.find(x => x.blockchain === 'eos');
        this.account = account;
        // 获取EOS数量
        this.getEosCount(this.account.name);
        // 获取BT数量
        this.getBTCount(this.account.name);
      }
      if (this.basetokens) {
        let baseTokens = Enumerable.from(this.basetokens).where((x) => {
          return x.contract === 'eosio.token' && x.sym_name === 'EOS';
        }).toArray();
        if (baseTokens && baseTokens.length > 0) {
          this.joinCoin.base_id = baseTokens[0].id;
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  .dark{
    background-color: #1F3547;
    min-height: 100vh;
    box-sizing: border-box;
    .page {
      padding: 15px;
      box-sizing: border-box;
      .up-coin {
        border-radius: 6px;
        .form-group {
          margin-bottom: 15px;
          label {
            display: inline-block;
            max-width: 100%;
            margin-bottom: 5px;
            font-size: 14px;
            color: #ffffff;
            font-weight: 400;
          }
          label.required:after{
            content: "*";
            color: #f56c6c;
            margin-left: 4px;
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
          .weui-uploader__input-box{
            border: 1px solid #466E91;
            border-radius: 4px;
          }
        }
        .weui-btn.yellow {
          background-color: #F9AA44;
          color: #ffffff;
        }
        .weui-btn.yellow:active{
          background-color: #f69c28;
        }
      }
    }
  }
  .light {
    background-color: #ffffff;
    .page {
      padding: 15px;
      box-sizing: border-box;
      .up-coin {
        border-radius: 6px;
        .form-group {
          margin-bottom: 15px;
          label {
            display: inline-block;
            max-width: 100%;
            margin-bottom: 5px;
            font-size: 14px;
            color: #262626;
            font-weight: 400;
          }
          label.required:after{
            content: "*";
            color: #f56c6c;
            margin-left: 4px;
          }
          .form-control {
            display: block;
            width: 100%;
            padding: 10px 12px;
            font-size: 14px;
            line-height: 1.42857143;
            color: #262626;
            background-color: transparent;
            border: 1px solid #9F9F9F;
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
          .weui-uploader__input-box{
            border: 1px solid #9F9F9F;
            border-radius: 4px;
          }
        }
        .weui-btn.yellow {
          background-color: #F9AA44;
          color: #ffffff;
        }
        .weui-btn.yellow:active{
          background-color: #f69c28;
        }
      }
    }
  }
</style>
