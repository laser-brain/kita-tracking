<template>
  <div class="container flex col start offset">
    <progress-overlay :show="showLoader" fullscreen />
    <v-card>
      <v-card-text>
        <h2>Neues Passwort vergeben</h2>
        <v-text-field
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="Neues Passwort*"
          clearable
          :rules="[rules.required]"
          :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append="() => (showPassword = !showPassword)"
          @keyup.enter="updatePassword"
        />
      </v-card-text>
      <v-card-actions>
        <v-container>
          <v-row>
            <v-spacer />
            <v-btn
              class="bg-teal-darken-4"
              color="on-primary"
              width="50%"
              @click="updatePassword"
              >Aktualisieren
            </v-btn>
          </v-row>
        </v-container>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import ProgressOverlay from "@/components/ProgressOverlay.vue";
import { ref } from "vue";
import useUser from "@/stores/user-store";

const store = useUser();

const password = ref("");
const showLoader = ref(false);
const showPassword = ref(false);

const rules = {
  required: (value: string) => !!value || "Pflichtfeld.",
};

const updatePassword = async () => {
  showLoader.value = true;
  await store.updatePassword(password.value);
  store.navigateStartPage();
};
</script>
<style scoped lang="scss">
.flex {
  display: flex;
  flex-direction: column;

  &.offset {
    margin: 32px 0;
  }
}

.container {
  height: 100%;
}

.v-card {
  width: calc(100% - 4em);
  margin: 1em 4em;
}

h2 {
  margin-bottom: 32px;
}
</style>
