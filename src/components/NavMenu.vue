<template>
  <v-dialog v-model="dialog" transition="dialog-top-transition">
    <template v-slot:activator="{ props }">
      <v-btn
        class="menu"
        color="teal-darken-4"
        dark
        v-bind="props"
        size="x-large"
        :icon="dialog ? 'mdi-window-close' : 'mdi-menu'"
      ></v-btn>
    </template>

    <div class="menu-buttons">
      <router-link
        v-if="store.isEducator"
        to="/tracking"
        @click.native="closeDialog"
        >Zeiterfassung</router-link
      >
      <router-link
        v-if="store.isAdmin"
        to="/tracking/overview"
        @click.native="closeDialog"
        >Alle Daten</router-link
      >
      <router-link to="/check-ins" @click.native="closeDialog"
        >Bringen / Abholen</router-link
      >
      <router-link
        v-if="store.isParent"
        to="/check-ins/configuration"
        @click.native="closeDialog"
        >Bedarf</router-link
      ><router-link
        v-if="store.isEducator && store.isAdmin"
        to="/check-ins/history"
        @click.native="closeDialog"
        >Wochenübersichten</router-link
      ><router-link
        v-if="store.isEducator && store.isAdmin"
        to="/check-ins/burn-down"
        @click.native="closeDialog"
        >Aktuelle Woche</router-link
      ><router-link
        v-if="store.isEducator && store.isAdmin"
        to="/check-ins/overview"
        @click.native="closeDialog"
        >Bedarf</router-link
      >
    </div>
  </v-dialog>
</template>
<script setup lang="ts">
import { ref } from "vue";
import useUsers from "@/stores/user-store";

const store = useUsers();
const dialog = ref(false);

const closeDialog = () => {
  dialog.value = false;
};
</script>
<style scoped lang="scss">
.v-dialog {
  height: 100%;
  @media screen and (orientation: landscape) {
    max-width: 32vw;
  }
}

.menu {
  position: fixed;
  bottom: 2em;
  right: 2em;
}

.menu-buttons {
  display: grid;
  width: 100%;
  margin: 1em 0;

  a {
    border-radius: 8px;
    font-size: 1em;
    background-color: black;
    text-align: center;
    color: white;
    padding: 1em 2em;
    margin: 1em;
    text-decoration: none;
    border: 2px solid black;

    &:hover {
      background-color: white;
      color: black;
    }
  }
}
</style>
