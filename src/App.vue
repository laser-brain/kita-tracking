<template>
  <v-app>
    <div class="flex row greeting">
      <h2 class="">
        {{ store.loggedIn ? `Hallo ${store.username}` : "Login" }}
      </h2>
      <div class="flex">
        <v-btn v-if="store.loggedIn" @click="store.logOut">Abmelden</v-btn>
        <v-btn v-if="store.loggedIn" @click="router.push('/set-password')"
          >Passwort ändern</v-btn
        >
      </div>
    </div>
    <v-main>
      <router-view></router-view>
      <div class="nav" v-if="store.loggedIn">
        <router-link v-if="store.isEducator" to="/tracking"
          >Zeiterfassung</router-link
        >
        <router-link v-if="store.isAdmin" to="/tracking/overview"
          >Alle Daten</router-link
        >
        <router-link to="/check-ins">Bringen / Abholen</router-link>
        <router-link v-if="store.isParent" to="/check-ins/configuration"
          >Bedarf</router-link
        ><router-link
          v-if="store.isEducator && store.isAdmin"
          to="/check-ins/history"
          >Wochenübersichten</router-link
        ><router-link
          v-if="store.isEducator && store.isAdmin"
          to="/check-ins/burn-down"
          >Aktuelle Woche</router-link
        ><router-link
          v-if="store.isEducator && store.isAdmin"
          to="/check-ins/overview"
          >Bedarf</router-link
        >
      </div>
    </v-main>
  </v-app>
</template>
<script setup lang="ts">
import useUsers from "@/stores/user-store";
import router from "@/plugins/router";

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
  flex-direction: column;
  &.row {
    flex-direction: row;
  }
  justify-content: space-between;
}

.v-btn {
  margin: 0.25em;
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
        16vh + 1.28em + $nav-btn-padding-vertical * 2 + $nav-btn-border * 2 +
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

.scroll {
  margin-top: 32px;
  overflow: auto;
  position: relative;
  width: 96%;
  &.overflow {
    .screened {
      position: sticky;
      bottom: 0;
      opacity: 0.5;
      background-color: black;
      height: 54px;
    }

    .chevron-down {
      box-sizing: border-box;
      position: sticky;
      bottom: 8px;
      left: calc(50% - 32px);
      display: block;
      width: 32px;
      height: 32px;
      border: 2px solid;
      border-radius: 100px;
      animation-name: twitch;
      animation-duration: 8s;
      animation-iteration-count: infinite;
      animation-delay: 2s;
      background-color: white;

      &::after {
        content: "";
        display: block;
        box-sizing: border-box;
        position: absolute;
        width: 12px;
        height: 12px;
        border-bottom: 2px solid;
        border-right: 2px solid;
        transform: rotate(45deg);
        left: 8px;
        top: 5px;
      }
    }
  }
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
