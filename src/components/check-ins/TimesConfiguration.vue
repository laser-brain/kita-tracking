<template>
  <div class="container">
    <h3>Bedarfsmeldung der nächsten vier Wochen</h3>
    <progress-overlay :show="dbLoading" />
    <div class="data">
      <v-card v-for="(child, childIndex) in children">
        <v-card-text v-if="!dbLoading">
          <h2>{{ child.name }}</h2>
          <hr />
          <v-list>
            <v-list-group
              v-for="(req, itemIndex) in itemsComputed(child)"
              :key="itemIndex"
              :value="itemIndex"
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  :title="
                    req === child.defaultTimeRequirement
                      ? `Regelbedarf (${summaryComputed[childIndex][itemIndex]}/35 Std)`
                      : `${dayToString(
                          req.requirements.at(0)?.day
                        )} - ${dayToString(req.requirements.at(-1)?.day)} (${
                          summaryComputed[childIndex][itemIndex]
                        }/35 Std)`
                  "
                />
              </template>
              <div class="time-requirements">
                <div v-for="(date, dateIndex) in req.requirements">
                  <div class="flex row">
                    <label>{{
                      `${dayToString(date.day, true)} (${
                        date.timeRequired
                      } Std)`
                    }}</label>
                    <div class="flex row">
                      <label
                        :for="`absence_${childIndex}_${itemIndex}_${dateIndex}`"
                        >Abwesend</label
                      >
                      <v-switch
                        :id="`absence_${childIndex}_${itemIndex}_${dateIndex}`"
                        v-if="itemIndex > 0"
                        v-model="date.absent"
                        :color="date.absent ? 'red' : 'gray'"
                        hide-details
                        inset
                        @change="
                          () => toggleAbsence(childIndex, itemIndex, dateIndex)
                        "
                      />
                    </div>
                  </div>
                  <div class="inputs">
                    <v-text-field
                      type="time"
                      class="time"
                      label="Von"
                      min="07:30"
                      max="16:00"
                      step="900"
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
                      min="07:30"
                      max="16:00"
                      step="900"
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
            class="stretch"
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
    <v-snackbar
      v-model="showError"
      :absolute="true"
      location="top"
      timeout="-1"
    >
      {{ errorMessage }}

      <template v-slot:actions>
        <v-btn variant="text" @click="showError = false"> Verstanden </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
<script setup lang="ts">
import ProgressOverlay from "../ProgressOverlay.vue";
import useUsers from "@/stores/user-store";
import useChildren from "@/stores/children-store";
import { IChild, ITimeRequirement, IWeeklyTime } from "@/database/documents";
import { Ref, computed, onMounted, ref } from "vue";
import { sumHours, updateTimeFromString } from "@/business/utility";

const userStore = useUsers();
const children: Ref<IChild[]> = ref([]);
const store = useChildren();
const dbLoading = ref(true);

const weeklyMax = 35;
const dailyMax = 8.5;
const dailyStartMinimum = new Date();
dailyStartMinimum.setHours(7);
dailyStartMinimum.setMinutes(30);
dailyStartMinimum.setSeconds(0);
dailyStartMinimum.setMilliseconds(0);

const showError = ref(false);
const errorMessage = ref("");

const daysOfWeek = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

const configId = "config.weekly-data-hidden";

const hideWeeklyRequirements = ref(localStorage.getItem(configId) === "true");

const validateTimespan = (
  date: ITimeRequirement,
  requirements: ITimeRequirement[]
) => {
  if (!date.startTime) {
    date.timeRequired = 0;
    return;
  }

  let start = updateTimeFromString(new Date(), date.startTime);
  if (start < dailyStartMinimum) {
    start = dailyStartMinimum;
    date.startTime = start.toLocaleTimeString().substring(0, 5);
  }

  if (!date.endTime) {
    date.timeRequired = 0;
    return;
  }
  const end = updateTimeFromString(new Date(), date.endTime);
  let difference = getDifference(start, end);
  if (difference < 0) {
    date.endTime = "";
    date.timeRequired = 0;
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

const getDifference = (startTime: Date, endTime: Date) => {
  if (!startTime || !endTime) {
    return 0;
  }

  return (endTime.valueOf() - startTime.valueOf()) / (1000 * 60 * 60);
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

const summaryComputed = computed(() => {
  return children.value.map((child) => {
    return itemsComputed(child).map((item) => sumHours(item.requirements) || 0);
  });
});

const maxSumRule = (
  date: ITimeRequirement,
  requirements: ITimeRequirement[]
) => {
  if (date.timeRequired > dailyMax) {
    date.timeRequired = dailyMax;
  }
  if (sumHours(requirements) > weeklyMax) {
    date.timeRequired += getMaxForInput(requirements);
    showError.value = true;
    errorMessage.value =
      "Die maximal erlaubte Wochenstundenzahl wurde überschritten. Die letzte Eingabe wurde entsprechend korrigiert!";
  }
};

const dayToString = (
  day: Date | string | null | undefined,
  includeWeekday: boolean = false
): string => {
  if (!day) {
    return "";
  }
  if (day instanceof Date) {
    let dateString = (day as Date).toLocaleDateString();
    if (includeWeekday) {
      dateString = `${daysOfWeek[(day as Date).getDay() - 1]} ${dateString}`;
    }
    return dateString;
  }
  return day.toString();
};

const getMaxForInput = (requirements: ITimeRequirement[]) => {
  const min = Math.min(dailyMax, weeklyMax - sumHours(requirements));
  return min;
};

const toggleWeeklyDisplay = () => {
  localStorage.setItem(configId, hideWeeklyRequirements.value.toString());
};

const toggleAbsence = (
  childIndex: number,
  itemIndex: number,
  dateIndex: number
) => {
  const dayRequirement =
    children.value[childIndex].weeklyTimeRequired[itemIndex - 1].requirements[
      dateIndex
    ];
  if (dayRequirement.absent) {
    dayRequirement.startTime = undefined;
    dayRequirement.endTime = undefined;
    dayRequirement.timeRequired = 0;
  }
};

const save = async () => {
  dbLoading.value = true;
  showError.value = false;
  const result = await store.save(children.value);
  if (result.length === 0) {
    showError.value = true;
    errorMessage.value =
      "Die maximal erlaubte Wochenstundenzahl wurde überschritten. Bitte prüfe die eingetragenen Zeiten!";
  } else {
    children.value = result;
  }
  dbLoading.value = false;
};
</script>
<style scoped lang="scss">
.data {
  display: flex;
  flex-wrap: wrap;
  @media screen and (orientation: landscape) {
    flex-direction: row;
    justify-content: space-evenly;
  }
  align-items: flex-start;
  height: 100%;
  width: 100%;

  overflow: auto;
  position: relative;
}
hr {
  margin: 1em 0;
}

.v-card {
  width: min(100vw, 512px);
  margin-top: 2em;
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

  span {
    max-width: 640px;
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
  &.stretch {
    width: 100%;
  }
}

.flex {
  align-items: center;
  label {
    margin-right: 8px;
  }
}
</style>
