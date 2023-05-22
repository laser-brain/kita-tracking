<template>
  <div class="container">
    <h1>Einstellungen</h1>
    <div class="flex row">
      <v-card>
        <v-card-text>
          <h2>Push-Benachrichtigungen</h2>
          <label
            >Push-Benachrichtigungen sind {{ active ? "aktiv" : "nicht aktiv" }}
            <v-icon v-if="active" class="active" icon="mdi-check" />
            <v-icon v-else icon="mdi-window-close" /></label
        ></v-card-text>
        <v-card-actions class="settings">
          <v-btn
            v-if="active"
            @click="toggleSubscription"
            class="settings bg-red-darken-4"
            color="on-primary"
            >Deaktivieren</v-btn
          >
          <v-btn
            v-else
            @click="toggleSubscription"
            class="settings bg-teal-darken-4"
            color="on-primary"
            >Aktivieren</v-btn
          ></v-card-actions
        >
      </v-card>
      <progress-overlay :show="loading" />
    </div>
    <div class="flex row">
      <update-password />
    </div>
  </div>
</template>
<script setup lang="ts">
import ProgressOverlay from "@/components/ProgressOverlay.vue";
import UpdatePassword from "@/components/UpdatePassword.vue";
import useSubscriptions from "@/stores/subscriptions-store";
import { Ref, ref, onMounted } from "vue";
import { ISubscription } from "@/database/documents";

const subscriptions = useSubscriptions();

const active: Ref<boolean | undefined> = ref();
const loading = ref(true);

onMounted(async () => {
  checkStatus(await subscriptions.getSubscription());
});

const toggleSubscription = async () => {
  loading.value = true;
  if (active.value) {
    checkStatus(await subscriptions.unsubscribe());
  } else {
    checkStatus(await subscriptions.subscribe());
  }
};

const checkStatus = (userSubscription: ISubscription | null) => {
  active.value = userSubscription !== null;
  loading.value = false;
};
</script>
<style lang="scss">
.row {
  align-items: center;
  justify-content: flex-start;
  position: relative;

  .v-card {
    margin: 1em 2em;
    width: 512px;
  }

  .v-btn.settings {
    margin: 0.75em;
  }

  label {
    margin: 1em 0.25em;

    .v-icon {
      color: red;
      &.active {
        color: green;
      }
    }
  }
}

h2 {
  margin-bottom: 32px;
}
</style>
