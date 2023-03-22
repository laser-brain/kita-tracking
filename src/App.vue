<template>
  <v-app>
    <div class="flex row greeting">
      <h2 class="">
        {{ store.loggedIn ? `Hallo ${store.employee}` : "Login" }}
      </h2>
      <v-btn v-if="store.loggedIn" @click="store.logOut">Abmelden</v-btn>
    </div>
    <v-main>
      <router-view></router-view>
      <div class="nav" v-if="store.loggedIn">
        <router-link to="/tracking">Zeiterfassung</router-link>
        <router-link to="/check-ins">Check-Ins</router-link>
      </div>
    </v-main>
  </v-app>
</template>
<script setup lang="ts">
import useUsers from "@/stores/user-store";

const store = useUsers();
</script>
<style lang="scss">
* {
  font-family: "Roboto", sans-serif;
}

html,
body,
#app {
  height: 100%;
}

.flex {
  display: flex;
  &.row {
    flex-direction: row;
  }
  justify-content: space-between;
}

.v-application {
  width: 100%;
  height: auto;
  max-height: 100vh;
}

$nav-dist: 16px;
$nav-btn-padding-vertical: 16px;
$nav-btn-border: 1px;
$greeting-dist-top: 16vh;

.nav {
  display: flex;
  width: 100%;
  justify-content: space-around;
  margin: $nav-dist 0;

  a {
    border-radius: 8px;
    font-size: 1em;
    background-color: black;
    color: white;
    padding: $nav-btn-padding-vertical 32px;
    text-decoration: none;
    border: $nav-btn-border solid black;

    &:hover {
      background-color: white;
      color: black;
    }
  }
}

.container {
  position: relative;
  width: 100%;
  height: auto;
  height: calc(
    100vh -
      (
        8vh + 1.28em + $nav-btn-padding-vertical * 2 + $nav-btn-border * 2 +
          $nav-dist * 2 + 30px
      )
  );
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
}

.greeting {
  h2 {
    font-size: 1.28em;
  }
  margin: 4vh 2vw;
  text-align: center;
}

#app {
  width: 100vw;
  height: 100%;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
}
</style>
