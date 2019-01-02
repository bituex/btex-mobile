<template>
  <div id="master">
    <div class="page">
      <div class="weui-cells">
        <a class="weui-cell weui-cell_access" href="javascript:;" @click="changeAction(12)">
          <div class="weui-cell__bd">
            <p>BT</p>
          </div>
          <div class="weui-cell__ft">
            0.006712
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'CoinCost',
    methods: {
      changeAction(currencyId) {
        var price = prompt(this.$t('message.please_enter_new_cost'));
        if (price !== null && price !== '' && parseFloat(price) > 0) {
          alert(price);
        }
      }
    }
  };
</script>

<style scoped>

</style>
