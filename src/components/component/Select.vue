<template>
  <div class="ui-select">
    <div class="select-value" @click="switchList">{{currentSelect}}<i class="arrow-more fa fa-angle-up" :class="{'is-reverse': showSelect}"></i></div>
    <div class="select-list" v-show="showSelect">
      <ul class="selects">
        <li v-for="(item, index) in selectsData" :key="index" @click="changeSelect(index)" >{{item.text}}</li>
      </ul>
      <div class="arrow"></div>
    </div>
  </div>
</template>

<script>
    export default {
        name: 'Select',
        data() {
          return {
            showSelect: false,
            currentSelect: ''
          };
        },
        props: {
          selectsData: Array
        },
        methods: {
          switchList() {
            this.showSelect = !this.showSelect;
          },
          changeSelect(index) {
            this.currentSelect = this.selectsData[index].text;
            this.switchList();
            this.$emit('on-select-change', this.selectsData[index].value);
          }
        },
        created() {
          this.currentSelect = this.selectsData[0].text;
        }
    };
</script>

<style scoped>
  .ui-select{
    position: relative;
  }
  .light .ui-select .select-value{
    border: 1px solid #E2E2E2;
    border-radius: 4px;
    height: 36px;
    padding: 0px 15px;
    display: flex;
    align-items: center;
    font-size: 13px;
  }
  .dark .ui-select .select-value{
    border: none;
    border-radius: 4px;
    height: 36px;
    padding: 0px 15px;
    display: flex;
    align-items: center;
    font-size: 13px;
    background: #182937;
    opacity: 0.4;
    color: #FFFFFF;
  }
  .ui-select .select-value .arrow-more{
    position: absolute;
    right: 10px;
    color: #9F9F9F;
    font-size: 20px;
    transition: transform .3s;
    transform: rotate(180deg);
  }
  .ui-select .select-value .arrow-more.is-reverse {
    transform: rotate(0deg);
  }
  .dark .ui-select .select-list{
    position: absolute;
    top: 45px;
    left: 0px;
    width: 100%;
    z-index: 10;
    border-radius: 4px;
    background: #182937;
    color: rgba(255, 255, 255, 0.4);
    padding: 0px 15px;
    font-size: 13px;
    box-sizing: border-box;
  }
  .light .ui-select .select-list{
    position: absolute;
    top: 45px;
    left: 0px;
    width: 100%;
    z-index: 10;
    border: 1px solid #E2E2E2;
    border-radius: 4px;
    background-color: #ffffff;
    padding: 0px 15px;
    font-size: 13px;
    box-sizing: border-box;
  }
  .ui-select .selects{
    list-style: none;
    display: block;
  }
  .light .ui-select .selects li{
    line-height: 36px;
    border-bottom: 1px solid #E2E2E2;
  }
  .dark .ui-select .selects li{
    line-height: 36px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  }
  .ui-select .selects li:last-child{
    border-bottom: none;
  }
  .light .ui-select .select-list .arrow{
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
    border-width: 6px;
    filter: drop-shadow(0 2px 12px rgba(0,0,0,.03));
    top: -7px;
    right: 8px;
    margin-right: 3px;
    border-top-width: 0;
    border-bottom-color: #E2E2E2;
    z-index: 11;
  }
  .dark .ui-select .select-list .arrow{
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
    border-width: 6px;
    filter: drop-shadow(0 2px 12px rgba(0,0,0,.03));
    top: -7px;
    right: 8px;
    margin-right: 3px;
    border-top-width: 0;
    border-bottom-color: #182937;
    z-index: 11;
  }
  .light .ui-select .select-list .arrow:after{
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
    content: " ";
    border-width: 6px;
    top: 1px;
    margin-left: -6px;
    border-top-width: 0;
    border-bottom-color: #fff;
  }
  .dark .ui-select .select-list .arrow:after{
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
    content: " ";
    border-width: 6px;
    top: 1px;
    margin-left: -6px;
    border-top-width: 0;
    border-bottom-color: #182937;
  }
</style>
