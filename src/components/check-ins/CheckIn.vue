<template>
  <div class="container">
    <h3>Zeiterfassung Kinder</h3>
    <div>
      <v-switch
        v-if="enableAllChildren"
        v-model="showPickedUpChildren"
        label="Abgeholte Kinder anzeigen"
        color="#004d40"
        hide-details
      />
    </div>
    <div :class="`scroll ${lastChildIsVisible ? '' : 'overflow'}`">
      <table>
        <thead>
          <tr>
            <td v-if="!user.isParent"></td>
            <td></td>
            <td>Bedarfszeit</td>
            <td>Anwesenheit</td>
          </tr>
        </thead>
        <tbody>
          <tr v-if="enableAllChildren">
            <td colspan="4" class="query-row">
              <v-text-field
                id="query"
                v-model="query"
                label="Liste filtern (z.B. Name, Uhrzeit, ...)"
                hide-details="auto"
              />
            </td>
          </tr>
          <tr
            v-for="(child, index) in filter"
            :class="`child ${checkinClass(child)}`"
          >
            <td v-if="!user.isParent">
              <span>{{ index + 1 }}</span>
            </td>
            <td style="max-width: 64px" :title="child.name">
              <span>
                {{ child.name }}
              </span>
            </td>
            <td>
              {{ child.regularTime }}
              <hr />
              <span v-if="!child.pickupTime">Ankunft</span>
              {{ child.arrivalTime?.toLocaleTimeString() }}
              <span v-if="!child.checkedIn || child.pickupTime"
                >&nbsp;-&nbsp;</span
              >
              {{ child.pickupTime?.toLocaleTimeString() }}
            </td>
            <td>
              <div class="flex">
                <v-btn
                  v-if="!child.pickupTime"
                  :disabled="checkinButtonDisabled"
                  @click="() => toggleCheckin(child, index)"
                  ><progress-overlay :show="checkinButtonDisabled" />
                  <v-icon v-if="child.checkedIn" icon="mdi-logout"></v-icon>
                  <v-icon v-else icon="mdi-login"></v-icon>
                  {{ child.checkedIn ? "Abgeholt" : "Gebracht" }}</v-btn
                >
                <v-btn
                  @click="() => reset(child)"
                  v-else
                  v-if="!user.isParent"
                  prepend-icon="mdi-reload"
                  >Reset</v-btn
                >
                <v-btn
                  v-if="child.pickupTime && user.isParent"
                  @click="() => reset(child, false)"
                  :disabled="resetEnabledTimespans[index] === '00:00'"
                  prepend-icon="mdi-reload"
                  >Zurücksetzen</v-btn
                >
                <span
                  v-if="child.pickupTime && resetEnabledTimespans[index] === '00:00' && user.isParent"
                  >Zurücksetzen ist nur innerhalb von 2 Minuten möglich</span
                >
                <span v-else v-if="child.pickupTime && user.isParent">
                  Noch {{resetEnabledTimespans[index]}} lang möglich
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="screened"></div>
      <i class="chevron-down" />
    </div>
  </div>
</template>
<script setup lang="ts">
import ProgressOverlay from "@/components/ProgressOverlay.vue";
import { getMidnight } from "@/business/utility";
import { computed, onBeforeUnmount, onMounted, Ref, ref } from "vue";
import useChildren from "@/stores/children-store";
import useUsers from "@/stores/user-store";
import { addMinutes } from "date-fns";
import {
  IChild,
  IChildCheckinData,
  ITimeRequirement,
} from "@/database/documents";
import { daysOfWeek } from "@/business/check-ins";

interface ICheckinProps {
  children: IChildCheckinData[];
  dateStamp?: Date;
}

const store = useChildren();
const user = useUsers();

const enableAllChildren = user.isAdmin || user.isEducator;

const setupTimerInterval = (checkinData: IChildCheckinData, index:number) => {
  const interval = setInterval(() => {
      if(!checkinData.arrivalTime){
        clearInterval(interval);
        return;
      }
      const diffMS =  (addMinutes(checkinData.arrivalTime, 2).valueOf() || 0) - new Date().valueOf();
      const diffDate = new Date(diffMS);
      diffDate.setHours(0);
      const remaining = diffDate.toLocaleTimeString().substring(3);
      resetEnabledTimespans.value[index] = diffDate.getMinutes() > 2 ? "00:00" : remaining;
      if(remaining === "00:00") {
        clearInterval(interval);
      }
    }, 1000);
}

const parseChildren = (children: IChild[]): IChildCheckinData[] => {
  const midnight = getMidnight();
  return children.map((child, index) => {
    resetEnabledTimespans.value.push("[berechne ...]");
    const lastHistoryElement = child.checkinHistory.at(-1);
    if (lastHistoryElement?.arrivalTime) {
      if (lastHistoryElement.arrivalTime > midnight) {
        setupTimerInterval(lastHistoryElement, index);
        return lastHistoryElement;
      }
    }

    let requirementToday: ITimeRequirement | undefined =
      child.weeklyTimeRequired
        .flatMap((req) => req.requirements)
        .filter((item) => {
          item.day.valueOf() === midnight.valueOf();
        })[0];

    if (!requirementToday && child.autoApplyDefaultValues) {
      requirementToday = child.defaultTimeRequirement?.requirements.filter(
        (item) =>
          daysOfWeek.indexOf(item.day as string) === midnight.getDay() - 1
      )[0];
    }

    return {
      name: child.name,
      checkedIn: false,
      regularTime: requirementToday
        ? `${requirementToday.startTime || "Nicht konfiguriert!"} - ${
            requirementToday.endTime || "Nicht konfiguriert!"
          }`
        : "unbekannt",
    };
  });
};

onMounted(async () => {
  const props: ICheckinProps = {
    children: parseChildren(
      await store.loadChildren(enableAllChildren ? undefined : user.username)
    ),
  };

  props.children.forEach((child) => {
    child.arrivalTime = child.arrivalTime
      ? new Date(child.arrivalTime)
      : child.arrivalTime;
    child.pickupTime = child.pickupTime
      ? new Date(child.pickupTime)
      : child.pickupTime;
  });

  if (!props.dateStamp) {
    checkIns.value = props;
    return;
  }

  const today = getMidnight();
  const checkDate = getMidnight(props.dateStamp);

  if (checkDate < today) {
    props.dateStamp = today;
  }
  checkIns.value = props;
});

const query: Ref<string> = ref("");
const showPickedUpChildren = ref(user.isParent);
const checkinButtonDisabled = ref(false);
const childrenFiltered: Ref<IChildCheckinData[]> = ref([]);
const checkIns: Ref<ICheckinProps> = ref({ date: new Date(), children: [] });
const resetEnabledTimespans: Ref<string[]> = ref([]);

const filter = computed(() => {
  childrenFiltered.value = checkIns.value.children.filter(
    (child) => showPickedUpChildren.value || !child.pickupTime
  );

  if (query.value) {
    const formatted = query.value.trim();
    childrenFiltered.value = childrenFiltered.value.filter((child) => {
      return (
        child.name.toLowerCase().indexOf(formatted.toLowerCase()) !== -1 ||
        child.regularTime.indexOf(formatted) !== -1 ||
        (child.arrivalTime &&
          child.arrivalTime.toLocaleTimeString().indexOf(formatted) !== -1) ||
        (child.pickupTime &&
          child.pickupTime.toLocaleTimeString().indexOf(formatted) !== -1)
      );
    });
  }

  const arrivedChildren = childrenFiltered.value.filter(
    (child) => child.arrivalTime && !child.pickupTime
  );
  const pickedUpChildren = childrenFiltered.value.filter(
    (child) => child.arrivalTime && child.pickupTime
  );
  const notArrivedYetChildren = childrenFiltered.value.filter(
    (child) => !child.arrivalTime
  );
  return arrivedChildren.concat(notArrivedYetChildren).concat(pickedUpChildren);
});

const sortByTruthy = (a: any, b: any, mod?: number) => {
  if (a && b) {
    return 0;
  } else if (a && !b) {
    return 1;
  }

  return -1;
};

const sortAlphabetical = (a: string, b: string) => {
  return a > b ? 1 : -1;
};

const toggleCheckin = async (checkinData: IChildCheckinData, index: number) => {
  checkinButtonDisabled.value = true;
  if (checkinData.checkedIn) {
    checkinData.checkedIn = false;
    checkinData.pickupTime = new Date();
    setupTimerInterval(checkinData, index);
  } else {
    checkinData.checkedIn = true;
    checkinData.arrivalTime = new Date();
    checkinData.pickupTime = undefined;
  }
  try {
    await store.updateCheckin(checkinData);
  }
  finally {
    checkinButtonDisabled.value = false;
  }
};

const lastChildIsVisible = ref(false);
onMounted(() => {
  const container = document.querySelector(".scroll") as HTMLElement;
  container.addEventListener("scroll", checkLastChildVisibility);
  document
    .querySelector("#query")
    ?.addEventListener("keyup", checkLastChildVisibility);
  document
    .querySelector("#query")
    ?.addEventListener("focus", checkLastChildVisibility);
  const child = document.querySelector(".child:last-child") as HTMLElement;

  if (!child) {
    lastChildIsVisible.value =
      childrenFiltered.value.length === 0 ? true : false;
    return;
  }
  lastChildIsVisible.value =
    container.scrollTop >
    child.scrollHeight * childrenFiltered.value.length - container.offsetHeight;
});
onBeforeUnmount(() => {
  const container = document.querySelector(".scroll") as HTMLElement;
  container.removeEventListener("scroll", checkLastChildVisibility);
  document
    .querySelector("#query")
    ?.removeEventListener("keyup", checkLastChildVisibility);
  document
    .querySelector("#query")
    ?.removeEventListener("focus", checkLastChildVisibility);
});
const checkLastChildVisibility = () => {
  const container = document.querySelector(".scroll") as HTMLElement;
  const child = document.querySelector(".child:last-child") as HTMLElement;

  if (!child) {
    lastChildIsVisible.value = true;
    return;
  }
  lastChildIsVisible.value =
    container.scrollTop >
    child.scrollHeight * childrenFiltered.value.length - container.offsetHeight;
};

const reset = async (child: IChildCheckinData, fullReset: boolean = true) => {
  child.pickupTime = undefined;

  if(fullReset) {
    child.arrivalTime = undefined;
    child.checkedIn = false;
  }
  else {
    child.checkedIn = true;
  }
  await store.updateCheckin(child, true, fullReset);
};

const checkinClass = (child: IChildCheckinData) => {
  return child.checkedIn ? "checked-in" : child.pickupTime ? "checked-out" : "";
};
</script>
<style scoped lang="scss">
.overflow-y {
  overflow-y: hidden;
  text-overflow: ellipsis;
  white-space: pre;
}

.v-btn  {
max-width: 256px;
}
span {
max-width: 256px;
}

.flex {
  justify-content: center;
  align-items: center;
}

$borderWidth: 1px;
$borderInner: $borderWidth solid black;
$borderOuter: 2 * $borderWidth solid black;

table {
  width: 100%;
  border-spacing: 0px;

  tr {
    transition: background-color 256ms ease-in-out;
    &.checked-in {
      color: white;
      background-color: #004d40;
      .v-btn {
        color: black;

        i {
          transform: scaleX(-1);
        }
      }
    }
    &.checked-out {
      color: white;
      background-color: brown;
      .v-btn {
        color: black;
      }
    }
  }

  td {
    background-color: transparent;
    border-top: $borderInner;
    border-bottom: $borderInner;
    &:first-child {
      border-left: $borderOuter;
    }
    &:last-child {
      border-right: $borderOuter;
    }
    padding: 8px;
    text-align: center;
  }

  thead {
    background-color: white;
    z-index: 1;
    position: sticky;
    top: 0;
    td {
      border-top: $borderOuter;
    }
  }
  tbody {
    tr:last-child {
      td {
        border-bottom: $borderOuter;
      }
    }
  }
}

@keyframes twitch {
  0% {
    transform: translateY(0);
  }
  7% {
    transform: translateY(8px);
  }
  15% {
    transform: translateY(-8px);
  }
  22% {
    transform: translateY(8px);
  }
  30% {
    transform: translateY(0);
  }
}
</style>
