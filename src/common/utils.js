var axios = require('axios');
export default {
  checkMobile: function (mobile) {
    var phoneReg = /^((13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])+\d{8})$/;
    if (!phoneReg.test(mobile)) {
      return false;
    }
    return true;
  },
  copyToClipboard: function (text) {
    if (text.indexOf('-') !== -1) {
      let arr = text.split('-');
      text = arr[0] + arr[1];
    }
    var textArea = document.createElement('textarea');
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? '成功复制到剪贴板' : '该浏览器不支持点击复制到剪贴板';
      alert(msg);
    } catch (err) {
      alert('该浏览器不支持点击复制到剪贴板');
    }
    document.body.removeChild(textArea);
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
      let numpow = Math.pow(10, 4);
      return Math.floor(num * numpow) / numpow;
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
