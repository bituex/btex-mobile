import Eos from 'eosjs';
import util from './utils';

export default {
  getTableRows: function (params, rowList, callback) {
    let options = {
      httpEndpoint: util.httpEndpoint
    };
    let eos = Eos(options);
    eos.getTableRows(params)
      .then((res, err) => {
        if (!err) {
          var nowList = rowList.concat(res.rows);
          if (res.more) {
            var lastid = res.rows[res.rows.length - 1].id;
            params.lower_bound = lastid;
            this.getTableRows(params, nowList, callback);
          } else {
            callback(nowList);
          }
        }
      });
  },
  getTableRow: function (params, callback) {
    let options = {
      httpEndpoint: util.httpEndpoint
    };
    let eos = Eos(options);
    eos.getTableRows(params)
      .then((res, err) => {
        if (!err) {
          callback(res.rows);
        } else {
          callback();
        }
      });
  },
  runContract: function (account, name, permission, actor) {
    let options = {
      httpEndpoint: util.httpEndpoint
    };
    let eos = Eos(options);
    eos.transaction(
      {
        actions: [
          {
            account: account, // 合约名
            name: name, // 方法名，该方法在官方的hello合约中有
            authorization: [{
              actor: actor,
              permission: permission
            }],
            data: {
              user: 'axay'
            }
          }
        ]
      }
    ).then(result => {
    });
  },
  // 获取BT币种
  getEosBt: function (callback) {
    let currencyId = '154114185766125772';
    let params = {'scope': 'btexexchange', 'code': 'btexexchange', 'table': 'tokenpairs', 'json': 'true', 'limit': 1, 'lower_bound': currencyId};

    this.getTableRow(params, function (rows) {
      if (rows && rows.length > 0) {
        let eosInfo = {
          btPrice: rows[0].price
        };
        callback(eosInfo);
      } else {
        let eosInfo = {
          btPrice: 0
        };
        callback(eosInfo);
      }
    });
    // Eos 相关信息
    // let options = {
    //   httpEndpoint: util.httpEndpoint
    // };
    // let eos = Eos(options);
    // var p1 = new Promise(function (resolve, reject) {
    //   eos.getCurrencyStats('eosbtextoken', 'BT').then(function (r) {
    //     var btSupply = r.BT.supply.split(' ')[0];
    //     resolve(btSupply);
    //   });
    // });
    // var p2 = new Promise(function (resolve, reject) {
    //   eos.getCurrencyBalance('eosio.token', 'eosbtexfunds', 'EOS').then(function (eFund) {
    //     var eosFundReserve = 0;
    //     if (eFund && eFund.length > 0) {
    //       eosFundReserve = parseFloat(eFund[0].toString().split(' ')[0]);
    //     }
    //     resolve(eosFundReserve);
    //   });
    // });
    // var p3 = new Promise(function (resolve, reject) {
    //   eos.getCurrencyBalance('eosio.token', 'eosbtextoken', 'EOS').then(function (e) {
    //     var eosReserve = 0;
    //     if (e && e.length > 0) {
    //       eosReserve = parseFloat(e[0].toString().split(' ')[0]);
    //     }
    //     resolve(eosReserve);
    //   });
    // });
    // var p4 = new Promise(function (resolve, reject) {
    //   eos.getCurrencyBalance('eosbtextoken', 'btexmortgage', 'BT').then(function (eChange) {
    //     var eosChange = 0;
    //     if (eChange && eChange.length > 0) {
    //       eosChange = parseFloat(eChange[0].toString().split(' ')[0]);
    //     }
    //     resolve(eosChange);
    //   });
    // });
    // // 同时执行p1和p2，并在它们都完成后执行then:
    // Promise.all([p1, p2, p3, p4]).then(function (results) {
    //   var btPrice = (results[1] + results[2] + 8918.9433) / ((results[0] - results[3]) * 0.2);
    //   let eosInfo = {
    //     btPrice: btPrice.toFixed(6),
    //     eosReserve: results[1] + results[2] + 8918.9433,
    //     btSupply: results[0] - results[3]
    //   };
    //   callback(eosInfo);
    // });
  },
  getContractSupply: function (code, symbol, callback) {
    let options = {
      httpEndpoint: util.httpEndpoint
    };
    let eos = Eos(options);
    eos.getCurrencyStats(code, symbol).then(function (r) {
      callback(r);
    });
  },
  getAccount: function (account, callback) {
    let options = {
      httpEndpoint: util.httpEndpoint
    };
    let eos = Eos(options);
    eos.getAccount(account, callback);
  },
  getTotalEos: function (account, coins, callback) {
    let options = {
      httpEndpoint: util.httpEndpoint
    };
    let eos = Eos(options);
    let promiss = [];
    for (let i = 0; i < coins.length; i++) {
      let p = new Promise(function (resolve, reject) {
        eos.getCurrencyBalance(coins[i].contractName, account, coins[i].asset_symbol).then(function (e) {
          if (e.length > 0) {
            let btNum = e[0].toString().split(' ')[0];
            resolve(btNum);
          } else {
            resolve(0);
          }
        }).catch(err => {
          console.log(err);
          resolve(0);
        });
      });
      promiss.push(p);
    }
    Promise.all(promiss).then(function (results) {
      // 分析获取  对应的人民币价格
      let blances = [];
      for (var i = 0; i < results.length; i++) {
        let blance = {};
        let valuation = parseFloat(results[i]) * coins[i].newPrice;
        blance.valuation = valuation;
        blance.blance = parseFloat(results[i]).toFixed(coins[i].asset_precision);
        blance.currencyId = coins[i].currencyId;
        blances.push(blance);
      }
      callback(null, blances);
    }).catch(err => {
      callback(err);
    });
  }
};
