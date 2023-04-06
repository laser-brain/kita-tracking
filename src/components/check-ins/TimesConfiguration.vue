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
            v-for="(req, index) in itemsComputed(child)"
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
                <label>{{
                  `${dayToString(date.day)} (${date.timeRequired} Std)`
                }}</label>
                <div class="inputs">
                  <v-text-field
                    type="time"
                    class="time"
                    label="Von"
                    v-model="date.startTime"
                    hide-details
                    @change="validateTimespan(date, req.requirements)"
                    @focus="$event.target.select()"
                  />
                  <span>&nbsp;-&nbsp;</span>
                  <v-text-field
                    type="time"
                    class="time"
                    label="Bis"
                    v-model="date.endTime"
                    hide-details
                    @change="validateTimespan(date, req.requirements)"
                    @focus="$event.target.select()"
                  />
                </div>
              </div>
            </div>
          </v-list-group>
        </v-list>
      </v-card-text>
      <v-card-actions class="col" v-if="!dbLoading">
        <v-switch
          label="Wochenbedarf ausblenden"
          v-model="hideWeeklyRequirements"
          :color="hideWeeklyRequirements ? 'teal-darken-4' : 'gray'"
          @change="toggleWeeklyDisplay" />
        <v-switch
          label="Regelbedarf automatisch nutzen, sofern kein Wochenbedarf eingetragen ist"
          v-model="child.autoApplyDefaultValues"
          :color="child.autoApplyDefaultValues ? 'teal-darken-4' : 'gray'"
      /></v-card-actions>
      <v-card-actions class="right" v-if="!dbLoading">
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
import { IChild, ITimeRequirement, IWeeklyTime } from "@/database/documents";
import { Ref, onMounted, ref } from "vue";
import { updateTimeFromString } from "@/business/utility";

const userStore = useUsers();
const children: Ref<IChild[]> = ref([]);
const store = useChildren();
const dbLoading = ref(true);

const weeklyMax = 35;
const dailyMax = 8.5;

const configId = "config.weekly-data-hidden";

const hideWeeklyRequirements = ref(localStorage.getItem(configId) === "true");

const validateTimespan = (
  date: ITimeRequirement,
  requirements: ITimeRequirement[]
) => {
  if (!date.startTime || !date.endTime) {
    return;
  }
  let difference = getDifference(date.startTime, date.endTime);
  if (difference < 0) {
    date.endTime = "";
    return;
  }

  date.timeRequired = difference;

  maxSumRule(date, requirements);
  if (date.timeRequired !== difference) {
    const start = updateTimeFromString(new Date(), date.startTime);
    const end = new Date(start.valueOf() + date.timeRequired * 60 * 60 * 1000);
    date.endTime = end.toLocaleTimeString().substring(0, 5);
  }
};

const getDifference = (startTime: string, endTime: string) => {
  if (!startTime || !endTime) {
    return 0;
  }

  const start = updateTimeFromString(new Date(), startTime);
  const end = updateTimeFromString(new Date(), endTime);

  return (end.valueOf() - start.valueOf()) / (1000 * 60 * 60);
};

const itemsComputed = (child: IChild) => {
  const result = [child.defaultTimeRequirement as IWeeklyTime];
  if (!hideWeeklyRequirements.value) {
    return result.concat(child.weeklyTimeRequired || []);
  }
  return result;
};

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
  if (date.timeRequired > dailyMax) {
    date.timeRequired = dailyMax;
  }
  if (sumHours(requirements) > weeklyMax) {
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
  const min = Math.min(dailyMax, weeklyMax - sumHours(reqirements));
  return min;
};

const toggleWeeklyDisplay = () => {
  localStorage.setItem(configId, hideWeeklyRequirements.value.toString());
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

  &.col {
    flex-direction: column;
    align-items: flex-start;
  }
}

.time-requirements {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  .inputs {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding-bottom: 1em;
  }
}

.v-switch {
  display: flex;
  width: 100%;
}
</style>
