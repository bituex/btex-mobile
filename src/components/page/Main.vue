<template>
  <div id="master">
    <transition name="fade" mode="out-in">
      <router-view/>
    </transition>
    <WeuiTabbar :tabCurrent="tabCurrent"></WeuiTabbar>
  </div>
</template>

<script>
  import WeuiTabbar from '../weui/WeuiTabbar';
    export default {
      name: 'Main',
      data() {
        return {
          tabCurrent: 'home'
        };
      },
      components: {
        WeuiTabbar
      },
      created() {
        var path = this.$route.path;
        if (path.indexOf('/market') !== -1) {
          this.tabCurrent = 'market';
        } else if (path.indexOf('/trade') !== -1) {
          this.tabCurrent = 'trade';
        } else if (path.indexOf('/invest') !== -1) {
          this.tabCurrent = 'invest';
        } else if (path.indexOf('/my') !== -1) {
          this.tabCurrent = 'my';
        } else {
          this.tabCurrent = 'home';
        }
      }
    };
</script>

<style scoped>
  #master {
    position: relative;
  }
</style>
