<template>
  <div v-show="show" :class="`overlay ${fullscreen ? 'window' : 'element'}`">
    <label v-if="label">{{ label }}&nbsp;</label>
    <v-progress-circular indeterminate color="teal-darken-4" />
  </div>
</template>
<script setup lang="ts">
interface IProgressOverlayProps {
  show: boolean;
  fullscreen?: boolean;
  label?: string;
}
defineProps<IProgressOverlayProps>();
</script>
<style scoped lang="scss">
.overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  opacity: 0.8;
  z-index: 3;
  background-color: black;

  &.element {
    width: 100%;
    height: 100%;
    position: absolute;
  }

  &.window {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
  }
}

label {
  color: white;
  font-weight: bold;
}
</style>
