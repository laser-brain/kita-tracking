<template>
  <div :class="`toggle-btn ${running ? 'stop' : 'play'}`"></div>
</template>
<script setup lang="ts">
interface IVisibility {
  running: boolean;
}
defineProps<IVisibility>();
</script>
<style scoped lang="scss">
.toggle-btn {
  width: 100px;
  height: 100px;
  min-height: 100px;
  min-width: 100px;
  border-radius: 50%;
  position: relative;
  display: block;
  &.play {
    background: radial-gradient(
      rgba(0, 128, 0, 0.8) 60%,
      rgba(255, 255, 255, 1) 62%
    );
    box-shadow: 0px 0px 25px 3px rgba(0, 128, 0, 0.8);
  }
  &.stop {
    background: radial-gradient(
      rgba(128, 0, 0, 0.8) 60%,
      rgba(255, 255, 255, 1) 62%
    );
    box-shadow: 0px 0px 25px 3px rgba(128, 0, 0, 0.8);
  }
}

.toggle-btn::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center center;
  z-index: 100;
  -webkit-transition: all 400ms cubic-bezier(0.55, 0.055, 0.675, 0.19);
  transition: all 400ms cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

.toggle-btn {
  &.play::after {
    -webkit-transform: translateX(-40%) translateY(-50%);
    transform: translateX(-40%) translateY(-50%);
    width: 0;
    height: 0;
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
    border-left: 25px solid #fff;
  }
  &.stop::after {
    -webkit-transform: translateX(-50%) translateY(-50%);
    transform: translateX(-50%) translateY(-50%);
    width: 32px;
    height: 32px;
    background-color: #fff;
  }
}

/* pulse wave */
.toggle-btn.play:before {
  content: "";
  position: absolute;
  width: 150%;
  height: 150%;
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
  -webkit-animation: pulsate1 2s;
  animation: pulsate1 2s;
  -webkit-animation-direction: forwards;
  animation-direction: forwards;
  -webkit-animation-iteration-count: infinite;
  animation-iteration-count: infinite;
  -webkit-animation-timing-function: steps;
  animation-timing-function: steps;
  opacity: 1;
  border-radius: 50%;
  border: 5px solid rgba(255, 255, 255, 0.75);
  top: -25%;
  left: -25%;
  background: rgba(198, 16, 0, 0);
}

@-webkit-keyframes pulsate1 {
  0% {
    -webkit-transform: scale(0.6);
    transform: scale(0.6);
    opacity: 1;
    box-shadow: inset 0px 0px 25px 3px rgba(255, 255, 255, 0.75),
      0px 0px 25px 10px rgba(255, 255, 255, 0.75);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
    opacity: 0;
    box-shadow: none;
  }
}

@keyframes pulsate1 {
  0% {
    -webkit-transform: scale(0.6);
    transform: scale(0.6);
    opacity: 1;
    box-shadow: inset 0px 0px 25px 3px rgba(255, 255, 255, 0.75),
      0px 0px 25px 10px rgba(255, 255, 255, 0.75);
  }
  100% {
    -webkit-transform: scale(1, 1);
    transform: scale(1);
    opacity: 0;
    box-shadow: none;
  }
}
</style>
