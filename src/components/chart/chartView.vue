<template>
  <div id="tv_chart_container" style="width: 100%;height: 100%;"></div>
</template>

<script>
  /* eslint-disable no-undef,new-cap */
  import {mapState} from 'vuex';
  export default {
    name: 'chartView',
    props: ['symbol', 'interval', 'url'],
    data() {
      return {
        symbolData: '',
        intervalData: '',
        tvWidget: null
      };
// eslint-disable-next-line no-undef
    },
    computed: mapState({
      lang: state => state.lang,
      theme: state => state.theme
    }),
    watch: {
      symbol(symbolNew) {
        // console.log(this.endTime, this.ending);
        this.symbolData = symbolNew;
        if (this.tvWidget) {
          this.tvWidget.setSymbol(this.symbolData, this.intervalData, function (a) {
            // console.log(a);
          });
        }
      },
      interval(intervalNew) {
        // console.log(this.endTime, this.ending);
        this.intervalData = intervalNew;
        if (this.tvWidget) {
          this.tvWidget.onChartReady(function () {
            this.tvWidget.setSymbol(this.symbolData, this.intervalData, function (a) {
              // console.log(a);
            });
          });
        }
      },
      lang(newLang) {
        if (newLang) {
          if (this.tvWidget) {
            if (this.lang === 'zh') {
              this.tvWidget.setLanguage('zh');
            } else {
              this.tvWidget.setLanguage('en');
            }
          }
        }
      }
    },
    mounted() {
      let that = this;
      let lang = 'en';
      if (this.lang === 'zh') {
        lang = 'zh';
      } else {
        lang = 'en';
      }
      // 颜色
      let overrides = {
        // 'paneProperties.background': '#1F3548',
        // 'symbolWatermarkProperties.color': '#1F3548',
        'paneProperties.legendProperties.showLegend': false
      };
      if (that.theme === 'dark') {
        overrides = {
          'paneProperties.background': '#1F3548',
          'symbolWatermarkProperties.color': '#1F3548',
          'paneProperties.legendProperties.showLegend': false
        };
      }

      let symbol = this.symbol;
      let interval = this.interval;
      let url = window.location.protocol + '//' + window.location.host + this.url;
      // let url = 'http://btex.rajasoft.cn' + this.url;
      this.symbolData = symbol;
      this.intervalData = interval;
      // eslint-disable-next-line new-cap
      that.tvWidget = window.tvWidget = new TradingView.widget({
        fullscreen: false,
        // height: 320,
        autosize: true,
        theme: that.theme,
        allow_symbol_change: true,
        symbol: symbol,
        interval: interval,
        container_id: 'tv_chart_container',
        // BEWARE: no trailing slash is expected in feed URL
        datafeed: new Datafeeds.UDFCompatibleDatafeed(url),
        library_path: '/btex_website/static/charting_library/',
        // library_path: '/static/charting_library/',
        locale: lang,
        // disabled_features: ['use_localstorage_for_settings', 'header_fullscreen_button', 'header_resolutions', 'control_bar', 'header_widget_dom_node', 'legend_context_menu', 'context_menus', 'header_screenshot', 'header_settings', 'header_symbol_search', 'header_chart_type', 'header_indicators', 'header_compare', 'header_undo_redo', 'header_saveload', 'volume_force_overlay'],
        // enabled_features: ['move_logo_to_main_pane'],
        disabled_features: ['use_localstorage_for_settings', 'control_bar', 'header_widget_dom_node', 'header_resolutions', 'legend_context_menu', 'format_button_in_legend', 'context_menus', 'header_screenshot', 'header_settings', 'header_symbol_search', 'header_chart_type', 'header_indicators', 'header_compare', 'header_undo_redo', 'header_saveload', 'volume_force_overlay', 'control_bar', 'timeframes_toolbar', 'header_fullscreen_button'],
        enabled_features: ['move_logo_to_main_pane'],
        overrides: overrides,
        custom_css_url: '/btex_website/static/css/chart.v6.css'
        // custom_css_url: '/static/css/chart.v5.css'
      });
      that.tvWidget.onChartReady(() => {
        var renderMa = [
          {length: 5, color: 'rgb(150, 95, 196)'},
          {length: 10, color: 'rgb(132, 170, 213)'},
          {length: 30, color: 'rgb(85, 178, 99)'},
          {length: 60, color: 'rgb(183, 36, 138)'}
        ];
        renderMa.forEach(function(val, index) {
          that.tvWidget.chart().createStudy('Moving Average', false, false, [val.length], null, {'Plot.color': val.color});
        });
        const button1 = that.tvWidget.createButton()
          .on('click', () => {
            button1[0].classList.add('active');
            button2[0].classList.remove('active');
            button3[0].classList.remove('active');
            button4[0].classList.remove('active');
            button5[0].classList.remove('active');
            button6[0].classList.remove('active');
            button7[0].classList.remove('active');
            button8[0].classList.remove('active');
            that.tvWidget.chart().setResolution('1', () => { // 1代表1分钟
              // console.log("set resolution callback");
            });
          });
        const button2 = that.tvWidget.createButton()
          .on('click', () => {
            button1[0].classList.remove('active');
            button2[0].classList.add('active');
            button3[0].classList.remove('active');
            button4[0].classList.remove('active');
            button5[0].classList.remove('active');
            button6[0].classList.remove('active');
            button7[0].classList.remove('active');
            button8[0].classList.remove('active');
            that.tvWidget.chart().setResolution('5', () => { // 1代表1分钟
              // console.log("set resolution callback");
            });
          });
        const button3 = that.tvWidget.createButton()
          .on('click', () => {
            button1[0].classList.remove('active');
            button2[0].classList.remove('active');
            button3[0].classList.add('active');
            button4[0].classList.remove('active');
            button5[0].classList.remove('active');
            button6[0].classList.remove('active');
            button7[0].classList.remove('active');
            button8[0].classList.remove('active');
            that.tvWidget.chart().setResolution('15', () => { // 1代表1分钟
              // console.log("set resolution callback");
            });
          });
        const button4 = that.tvWidget.createButton()
          .on('click', () => {
            button1[0].classList.remove('active');
            button2[0].classList.remove('active');
            button3[0].classList.remove('active');
            button4[0].classList.add('active');
            button5[0].classList.remove('active');
            button6[0].classList.remove('active');
            button7[0].classList.remove('active');
            button8[0].classList.remove('active');
            that.tvWidget.chart().setResolution('30', () => { // 1代表1分钟
              // console.log("set resolution callback");
            });
          });
        const button5 = that.tvWidget.createButton()
          .on('click', () => {
            button1[0].classList.remove('active');
            button2[0].classList.remove('active');
            button3[0].classList.remove('active');
            button4[0].classList.remove('active');
            button5[0].classList.add('active');
            button6[0].classList.remove('active');
            button7[0].classList.remove('active');
            button8[0].classList.remove('active');
            that.tvWidget.chart().setResolution('60', () => { // 1代表1分钟
              // console.log("set resolution callback");
            });
          });
        const button6 = that.tvWidget.createButton()
          .on('click', () => {
            button1[0].classList.remove('active');
            button2[0].classList.remove('active');
            button3[0].classList.remove('active');
            button4[0].classList.remove('active');
            button5[0].classList.remove('active');
            button6[0].classList.add('active');
            button7[0].classList.remove('active');
            button8[0].classList.remove('active');
            that.tvWidget.chart().setResolution('D', () => { // 1代表1分钟
              // console.log("set resolution callback");
            });
          });
        const button7 = that.tvWidget.createButton()
          .on('click', () => {
            button1[0].classList.remove('active');
            button2[0].classList.remove('active');
            button3[0].classList.remove('active');
            button4[0].classList.remove('active');
            button5[0].classList.remove('active');
            button6[0].classList.remove('active');
            button7[0].classList.add('active');
            button8[0].classList.remove('active');
            that.tvWidget.chart().setResolution('W', () => { // 1代表1分钟
              // console.log("set resolution callback");
            });
          });
        const button8 = that.tvWidget.createButton()
          .on('click', () => {
            button1[0].classList.remove('active');
            button2[0].classList.remove('active');
            button3[0].classList.remove('active');
            button4[0].classList.remove('active');
            button5[0].classList.remove('active');
            button6[0].classList.remove('active');
            button7[0].classList.remove('active');
            button8[0].classList.add('active');
            that.tvWidget.chart().setResolution('M', () => { // 1代表1分钟
              // console.log("set resolution callback");
            });
          });
        button1[0].innerHTML = '1' + that.$t('message.minute');
        button2[0].innerHTML = '5' + that.$t('message.minute');
        button3[0].innerHTML = '15' + that.$t('message.minute');
        button4[0].innerHTML = '30' + that.$t('message.minute');
        button5[0].innerHTML = '1' + that.$t('message.hour');
        button6[0].innerHTML = '1' + that.$t('message.day');
        button7[0].innerHTML = '1' + that.$t('message.week');
        button8[0].innerHTML = '1' + that.$t('message.month');
        // 默认
        if (that.interval === '1') {
          button1[0].classList.add('active');
        } else if (that.interval === '5') {
          button2[0].classList.add('active');
        } else if (that.interval === '15') {
          button3[0].classList.add('active');
        } else if (that.interval === '30') {
          button4[0].classList.add('active');
        } else if (that.interval === '60') {
          button5[0].classList.add('active');
        } else if (that.interval === 'D') {
          button6[0].classList.add('active');
        } else if (that.interval === 'W') {
          button7[0].classList.add('active');
        } else if (that.interval === 'M') {
          button8[0].classList.add('active');
        }
      });
    },
    beforeDestroy() {
      this.tvWidget.remove();
    }
  };
</script>

<style scoped>

</style>
