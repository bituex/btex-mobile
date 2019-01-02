<template>
  <div class="loading">
    <!--<div class="spinner"></div>-->
    <div class="weui-loadmore">
      <i class="weui-loading"></i>
      <span class="weui-loadmore__tips">{{$t("message.loading")}}</span>
    </div>
  </div>
</template>

<script>
    export default {
        name: 'Loading'
    };
</script>

<style scoped>
  .loading{
    /*padding: 20px 0px;*/
  }
  .weui-loadmore__tips{
    color: #818181;
  }
  .spinner {
    width: 30px;
    height: 30px;
    /*background-color: #67CF22;*/
    border-radius: 100%;
    margin: 0px auto;
    border: 5px dashed #0a8415;
    -webkit-animation: rotateplane 1s infinite linear;
    animation: rotateplane 1s infinite linear;
  }

  @-webkit-keyframes rotateplane {
    50% {
      -webkit-transform: rotate(180deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }

  @keyframes rotateplane {
    50% {
      transform: rotate(180deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
