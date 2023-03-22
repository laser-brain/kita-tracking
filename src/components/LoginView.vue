<template>
  <div class="flex col start offset">
    <v-card>
      <v-card-text>
        <v-text-field
          v-model="user"
          label="Benutzer*"
          clearable
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="Passwort*"
          clearable
          :rules="[rules.required]"
          :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append="() => (showPassword = !showPassword)"
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
              @click="login"
              >Einloggen
            </v-btn>
          </v-row>
        </v-container>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import useUser from "@/stores/user-store";

const user = ref("");
const password = ref("");
const showLoader = ref(false);
const showPassword = ref(false);

const store = useUser();

const rules = {
  required: (value: string) => !!value || "Pflichtfeld.",
};

const login = async () => {
  showLoader.value = true;
  store.logIn(user.value, password.value);
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

.v-card {
  width: 100vw;
}
</style>
