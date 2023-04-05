<template>
  <div class="container">
    <h3>Zeiterfassung Kinder</h3>
    <div>
      <v-switch
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
            <td></td>
            <td>Bedarfszeit</td>
            <td>Anwesenheit</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="3" class="query-row">
              <v-text-field
                id="query"
                v-model="query"
                label="Liste filtern (z.B. Name, Uhrzeit, ...)"
                hide-details="auto"
              />
            </td>
          </tr>
          <tr v-for="child in filter" :class="`child ${checkinClass(child)}`">
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
              <v-btn
                v-if="!child.pickupTime"
                @click="() => toggleCheckin(child)"
                ><v-icon v-if="child.checkedIn" icon="mdi-logout"></v-icon>
                <v-icon v-else icon="mdi-login"></v-icon>
                {{ child.checkedIn ? "Geht" : "Kommt" }}</v-btn
              >
              <v-btn
                @click="() => reset(child)"
                v-else
                prepend-icon="mdi-reload"
                >Reset</v-btn
              >
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
import { getMidnight } from "@/business/utility";
import { computed, onBeforeUnmount, onMounted, Ref, ref } from "vue";
import useChildren from "@/stores/children-store";
import { IChild, ITimeRequirement } from "@/database/documents";

const store = useChildren();
const daysOfWeek = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
const parseChildren = (children: IChild[]): IChildCheckinData[] => {
  const today = getMidnight(new Date());
  return children.map((child) => {
    console.log(child.weeklyTimeRequired.flatMap((req) => req.requirements));

    let requirementToday: ITimeRequirement | undefined =
      child.weeklyTimeRequired
        .flatMap((req) => req.requirements)
        .filter((item) => {
          console.log(item.day.valueOf(), today.valueOf());

          item.day.valueOf() === getMidnight(new Date()).valueOf();
        })[0];

    if (!requirementToday && child.autoApplyDefaultValues) {
      requirementToday = child.defaultTimeRequirement?.requirements.filter(
        (item) => daysOfWeek.indexOf(item.day as string) === today.getDay()
      )[0];
    }
    console.log(requirementToday);

    return {
      name: child.name,
      checkedIn: false,
      regularTime: requirementToday
        ? `${requirementToday.timeRequired} Stunden`
        : "unbekannt",
    };
  });
};

onMounted(async () => {
  const local = localStorage.getItem("checkin-data");
  let props: ICheckinProps = local
    ? JSON.parse(local)
    : { children: parseChildren(await store.loadChildren()) };

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
const showPickedUpChildren = ref(false);
const childrenFiltered: Ref<IChildCheckinData[]> = ref([]);
const checkIns: Ref<ICheckinProps> = ref({ date: new Date(), children: [] });
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

  return childrenFiltered.value;
});

const toggleCheckin = (child: IChildCheckinData) => {
  if (child.checkedIn) {
    child.checkedIn = false;
    child.pickupTime = new Date();
  } else {
    child.checkedIn = true;
    child.arrivalTime = new Date();
    child.pickupTime = undefined;
  }

  localStorage.setItem("checkin-data", JSON.stringify(checkIns.value));
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

interface IChildCheckinData {
  name: string;
  regularTime: string;
  checkedIn: boolean;
  arrivalTime?: Date;
  pickupTime?: Date;
}

interface ICheckinProps {
  children: IChildCheckinData[];
  dateStamp?: Date;
}

const reset = (child: IChildCheckinData) => {
  child.arrivalTime = undefined;
  child.pickupTime = undefined;
  child.checkedIn = false;
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
