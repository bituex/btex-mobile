var axios = require('axios');
export default {
  checkMobile: function (mobile) {
    var phoneReg = /^((13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])+\d{8})$/;
    if (!phoneReg.test(mobile)) {
      return false;
    }
    return true;
  },
  apiAxios: function (method, url, params, success, error) {
    let lang = window.lang;
    if (lang === 'CN') {
      lang = 'zh_CN';
    } else {
      lang = 'en_US';
    }
    params.params.lang = lang;
    axios({
      method: method,
      url: url,
      timeout: 20000,
      data: method === 'POST' || method === 'PUT' ? params : null,
      params: method === 'GET' || method === 'DELETE' ? params : null,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(function (res) {
        var returnData = res.data;
        success(returnData);
      })
      .catch(function (err) {
        if (err.message) {
          // alert(err.message);
          console.log(err.message);
        }
      });
  },
  apiAxiosOld: function (method, url, params, success, error) {
    axios({
      method: method,
      url: url,
      timeout: 20000,
      data: method === 'POST' || method === 'PUT' ? params : null,
      params: method === 'GET' || method === 'DELETE' ? params : null,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      transformRequest: [function (data) {
        let ret = '';
        for (let it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&';
        }
        return ret;
      }]
    })
      .then(function (res) {
        var returnData = res.data;
        success(returnData);
      })
      .catch(function (err) {
        if (err.message) {
          // alert(err.message);
          console.log(err.message);
        }
      });
  },
  checkAccount: function (account) {
    var accountReg = /(^[1-5a-z]{12}$)/;
    if (!accountReg.test(account)) {
      return false;
    }
    return true;
  },
  checkEos: function (eos) {
    var eosReg = /(^EOS.{50}$)/;
    if (!eosReg.test(eos)) {
      return false;
    }
    return true;
  },
  checkNumber: function(num) {
    if (num < 10) {
      num = '0' + num;
    }
    return num;
  },
  formatNnum: function(num) {
    if (num < 10000) {
      return num.toFixed(4);
    } else {
      return parseFloat(num / 1000).toFixed(2) + ' k';
    }
  },
  computedCnyPrice: function(num, eosPrice) {
    let sum = parseFloat(num) * parseFloat(eosPrice);
    sum = sum.toFixed(4);
    return sum;
  },
  getUrlParam: function(paraName) {
    var url = document.location.toString();
    var arrObj = url.split('?');
    if (arrObj.length > 1) {
      var arrPara = arrObj[1].split('&');
      var arr;
      for (var i = 0; i < arrPara.length; i++) {
        arr = arrPara[i].split('=');
        if (arr != null && arr[0] === paraName) {
          return arr[1];
        }
      }
      return '';
    } else {
      return '';
    }
  },
  // httpEndpoint: 'https://user-api.eoseoul.io',
  httpEndpoint: '',
  network: null,
  host: ''
};
