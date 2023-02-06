<template>
  <label class="my-switch-wrap">
    <input type="checkbox" :checked="refValue" @click="emit('toggle')" />
    <div class="my-switch"></div>
  </label>
</template>
<script setup lang="ts">
import { toRefs } from "vue";
interface IToggleProps {
  value: boolean;
}
const props = defineProps<IToggleProps>();
const { value: refValue } = toRefs(props);

const emit = defineEmits(["toggle"]);
</script>
<style scoped lang="scss">
$width: 40px;
$padding: 8px;
$height: calc($width / 4 + $padding);

//toggle code begins!
.my-switch-wrap {
  display: inline-block;
  cursor: pointer;
  background: #15273b;
  padding: $padding;
  width: $width;
  height: $height;
  border-radius: calc($height);
  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
}
.my-switch {
  height: 100%;
  display: grid;
  grid-template-columns: 0fr 1fr 1fr;
  background: #15273b;
  transition: 0.2s;
  //ICYMI, pseudo elements are treated as grid items
  &::after {
    content: "";
    border-radius: 50%;
    background: #ccc;
    grid-column: 2;
    transition: background 0.2s;
  }
}
input:checked {
  + .my-switch {
    grid-template-columns: 1fr 1fr 0fr;
    &::after {
      background-color: #52cf71;
    }
  }
}
</style>
