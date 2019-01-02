<template>
  <transition name="mei-message-fade">
    <div v-if="show" :class="[
        'mei-message',
        type? `mei-message-${ type }` : '']"
    >
      <i v-if="type=='error'" class="mei-message-icon">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" t="1515656768815"
             style="" viewBox="0 0 1024 1024" version="1.1" p-id="2794" width="40" height="40"><path d="M512 958.016611c-245.919634 0-446.016611-200.064292-446.016611-446.016611 0-245.919634 200.095256-446.016611 446.016611-446.016611 245.952318 0 446.016611 200.064292 446.016611 446.016611S757.952318 958.016611 512 958.016611zM512 129.983389c-210.655557 0-382.016611 171.359333-382.016611 382.016611 0 210.624593 171.359333 382.016611 382.016611 382.016611 210.624593 0 382.016611-171.359333 382.016611-382.016611S722.624593 129.983389 512 129.983389z" p-id="2795"/><path d="M463.99957 304.00043c0 26.509985 21.490445 48.00043 48.00043 48.00043s48.00043-21.490445 48.00043-48.00043-21.490445-48.00043-48.00043-48.00043S463.99957 277.490445 463.99957 304.00043z" p-id="2796"/><path d="M512 768c-17.664722 0-32.00086-14.303454-32.00086-32.00086L479.99914 448c0-17.664722 14.336138-32.00086 32.00086-32.00086s32.00086 14.336138 32.00086 32.00086l0 287.99914C544.00086 753.696546 529.664722 768 512 768z" p-id="2797"/></svg>
      </i>
      <i v-if="type=='success'" class="mei-message-icon">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" t="1515656188050"
             style="" viewBox="0 0 1024 1024" version="1.1" p-id="2186" data-spm-anchor-id="a313x.7781069.0.i11" width="40" height="40"><path d="M887.904744 298.20852c-12.863647-12.063755-33.151673-11.487488-45.215428 1.408843L415.935493 753.983819 182.815858 524.287381c-12.607338-12.416396-32.8644-12.287381-45.280796 0.319957-12.416396 12.576374-12.256417 32.8644 0.352641 45.248112l256.479935 252.671415c0.096331 0.096331 0.223626 0.127295 0.319957 0.223626s0.127295 0.223626 0.223626 0.319957c2.016073 1.919742 4.448434 3.008628 6.784464 4.288456 1.152533 0.672598 2.143368 1.663432 3.359548 2.143368 3.775837 1.47249 7.775299 2.239699 11.743798 2.239699 4.192125 0 8.384249-0.832576 12.287381-2.496009 1.312512-0.543583 2.33603-1.663432 3.552211-2.368714 2.399677-1.408843 4.895686-2.59234 6.944443-4.67206 0.096331-0.096331 0.127295-0.25631 0.223626-0.352641 0.063647-0.096331 0.192662-0.127295 0.287273-0.223626L889.277463 343.420508C901.439269 330.591265 900.768391 310.335923 887.904744 298.20852z" p-id="2187" fill="#ffffff"/></svg>
      </i>
      <span class="mei-message-con">{{text}}</span>
    </div>
  </transition>
</template>

<script type="text/babel">
  var typeMap = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error'
  };
  export default {
    data() {
      return {
        show: false,
        text: '',
        type: ''
      };
    },
    computed: {
      iconClass() {
        return this.type
          ? `mei-message-icon mei-icon-${typeMap[this.type]}`
          : '';
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" >
  .mei-message{
    position: fixed;
    width: 300px;
    border-radius: 4px;
    position: fixed;
    left: 50%;
    top: 20px;
    /*height:40px;*/
    transform: translateX(-50%);
    background-color: #edf2fc;
    transition: opacity .3s,transform .4s;
    overflow: hidden;
    padding: 15px 15px 15px 20px;
    background-color:#ccc;
    color:#000;
    z-index: 9999;
  }
  .mei-message-success{
    background-color:rgb(87, 161, 87);
    color:#fff;
  }
  .mei-message-error{
    background-color:#ff5000;
    color:#fff;
  }
  .mei-message-warning{
    background-color:#ccc;
  }
  .mei-message-icon{
    display:inline-block;
    width:40px;
    height:40px;
    float:left;
  }
  .mei-message-con{
    line-height:40px;
    height:40px;
    display:inline;
    margin-left:10px;
  }
  .mei-message-fade-enter-active {
    transition: all 0.3s linear;
  }
  .mei-message-fade-leave-active {
    transition: all 0.3s linear;
  }
  .mei-message-fade-enter, .mei-message-fade-leave-to
    /* .slide-fade-leave-active for below version 2.1.8 */ {
    opacity: 0;
  }
</style>
