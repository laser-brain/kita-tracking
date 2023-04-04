<template>
  <div class="container">
    <v-card v-for="pupil in pupils">
      <v-card-text>
        <h2>{{ pupil.name }}</h2>
        <hr />
        <v-text-field
          v-model="pupil.weeklyTimeRequired"
          label="Wöchentlicher Zeitbedarf in Stunden"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="flat" color="teal-darken-4">Speichern</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import useUsers from "@/stores/user-store";
import usePupils from "@/stores/pupils-store";
import { IPupil } from "@/database/documents";
import { Ref, onMounted, ref } from "vue";

const userStore = useUsers();
const pupils: Ref<IPupil[]> = ref([]);

onMounted(async () => {
  if (!userStore.isParent) {
    return;
  }
  const store = usePupils();
  pupils.value = await store.loadPupils(userStore.username);
});
</script>
<style scoped lang="scss">
hr {
  margin: 1em 0;
}
.v-card {
  width: 66vw;
  min-width: min(100vw, 400px);
}

.v-card-actions {
  display: flex;
  justify-content: flex-end;
  padding: 1em;
}
</style>
