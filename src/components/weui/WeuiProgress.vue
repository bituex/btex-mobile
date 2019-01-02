<template>
  <div class="weui-progress">
    <div class="weui-progress__bar">
      <div class="weui-progress__inner-bar js_progress" :style="'width: '+precent+'%;background-color:'+color"></div>
    </div>
    <!--<a href="javascript:;" class="weui-progress__opr">-->
      <!--<i class="weui-icon-cancel"></i>-->
    <!--</a>-->
  </div>
</template>

<script>
export default {
  name: 'WeuiProgress',
  props: ['color', 'precent']
};
</script>

<style scoped>

</style>
