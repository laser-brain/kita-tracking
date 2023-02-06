<template>
  <div :class="`btn ${show ? 'stop' : 'play'}`"></div>
</template>
<script setup lang="ts">
interface IVisibility {
  show: boolean;
}
defineProps<IVisibility>();
</script>
<style scoped lang="scss">
.btn {
  width: 100px;
  height: 100px;
  background: radial-gradient(
    rgba(128, 0, 0, 0.8) 60%,
    rgba(255, 255, 255, 1) 62%
  );
  border-radius: 50%;
  position: relative;
  display: block;
  margin: 100px auto;
  box-shadow: 0px 0px 25px 3px rgba(128, 0, 0, 0.8);
}

.btn::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translateX(-50%) translateY(-50%);
  transform: translateX(-50%) translateY(-50%);
  transform-origin: center center;
  width: 32px;
  height: 32px;
  background-color: #fff;
  z-index: 100;
  -webkit-transition: all 400ms cubic-bezier(0.55, 0.055, 0.675, 0.19);
  transition: all 400ms cubic-bezier(0.55, 0.055, 0.675, 0.19);
}
</style>
