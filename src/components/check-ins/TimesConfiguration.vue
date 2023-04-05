<template>
  <div class="header">
    <h2>Bedarfsmeldung der nächsten vier Wochen</h2>
  </div>
  <div class="container">
    <progress-overlay :show="dbLoading" />
    <v-card v-for="child in children">
      <v-card-text v-if="!dbLoading">
        <h2>{{ child.name }}</h2>
        <hr />

        <v-list>
          <v-list-group
            v-for="(req, index) in [child.defaultTimeRequirement as IWeeklyTime].concat(
              child.weeklyTimeRequired || []
            )"
            :key="index"
            :value="index"
          >
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                :title="
                  req === child.defaultTimeRequirement
                    ? `Regelbedarf (${sumHours(req.requirements)}/35 Std)`
                    : `${dayToString(
                        req.requirements.at(0)?.day
                      )} - ${dayToString(
                        req.requirements.at(-1)?.day
                      )} (${sumHours(req.requirements)}/35 Std)`
                "
              />
            </template>
            <div class="time-requirements">
              <div v-for="date in req.requirements">
                <v-text-field
                  v-model.number="date.timeRequired"
                  type="number"
                  min="0"
                  max="10"
                  :label="dayToString(date.day)"
                  @focus="$event.target.select()"
                  @change="maxSumRule(date, req.requirements)"
                ></v-text-field>
              </div>
            </div>
          </v-list-group>
        </v-list>
      </v-card-text>
      <v-card-actions class="right" v-if="!dbLoading">
        <v-switch
          label="Regelbedarf automatisch nutzen, sofern kein Wochenbedarf eingetragen ist"
          v-model="child.autoApplyDefaultValues"
          :color="child.autoApplyDefaultValues ? 'teal-darken-4' : 'gray'"
        />
        <v-btn variant="flat" color="teal-darken-4" @click="save"
          >Speichern</v-btn
        >
      </v-card-actions>
      <v-card-actions v-if="!dbLoading"
        ><span v-if="!child.autoApplyDefaultValues"
          >Hinweis: Bei gesetztem Regelbedarf muss der Bedarf nur noch in
          Ausnahmefällen die davon abweichen angepasst werden. Weitere
          Konfiguration ist dann sonst nicht mehr notwendig.</span
        ></v-card-actions
      >
    </v-card>
  </div>
</template>
<script setup lang="ts">
import ProgressOverlay from "../ProgressOverlay.vue";
import useUsers from "@/stores/user-store";
import useChildren from "@/stores/children-store";
import { IChild, ITimeRequirement } from "@/database/documents";
import { Ref, onMounted, ref } from "vue";
import { IWeeklyTime } from "@/database/documents";

const userStore = useUsers();
const children: Ref<IChild[]> = ref([]);
const store = useChildren();
const dbLoading = ref(true);

onMounted(async () => {
  if (!userStore.isParent) {
    dbLoading.value = false;
    return;
  }
  children.value = await store.loadChildren(userStore.username);
  dbLoading.value = false;
});

const sumHours = (requirements: ITimeRequirement[]) => {
  return requirements
    .map((date) => date.timeRequired)
    .reduce((prev, current) => prev + current, 0);
};

const maxSumRule = (
  date: ITimeRequirement,
  requirements: ITimeRequirement[]
) => {
  if (date.timeRequired > 10) {
    date.timeRequired = 10;
  }
  if (sumHours(requirements) > 35) {
    date.timeRequired += getMaxForInput(requirements);
  }
};

const dayToString = (day: Date | string | null | undefined): string => {
  if (!day) {
    return "";
  }
  return day instanceof Date
    ? (day as Date).toLocaleDateString()
    : day.toString();
};

const getMaxForInput = (reqirements: ITimeRequirement[]) => {
  const min = Math.min(10, 35 - sumHours(reqirements));
  return min;
};

const save = async () => {
  dbLoading.value = true;
  await store.save(children.value);
  dbLoading.value = false;
};
</script>
<style scoped lang="scss">
.header {
  display: flex;
  justify-content: center;
  padding: 0.5em;
}
.container {
  @media screen and (orientation: landscape) {
    flex-direction: row;
    justify-content: space-evenly;
  }
  align-items: flex-start;
  padding-top: 2em;
  height: 100%;
}

hr {
  margin: 1em 0;
}
.v-card {
  min-width: min(100vw, 400px);
}

.v-card-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 1em;

  &.right {
    justify-content: flex-end;
  }
}

.time-requirements {
  display: flex;
  flex-wrap: wrap;
  @media screen and (orientation: portrait) {
    justify-content: flex-end;
  }

  div {
    min-width: 90px;
    padding: 0 0.25em;
  }
}

.v-switch {
  display: flex;
  max-width: 64%;
}
</style>
