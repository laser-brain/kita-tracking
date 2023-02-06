<template>
  <div class="container">
    <h3>Check-Ins</h3>
    <div :class="`scroll ${lastChildIsVisible ? '' : 'overflow'}`">
      <table>
        <thead>
          <tr>
            <td></td>
            <td>Bedarfszeit</td>
            <td>Anwesend</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="3" class="query-row">
              <v-text-field
                id="query"
                v-model="query"
                label="Suche ..."
                hide-details="auto"
              />
            </td>
          </tr>
          <tr v-for="child in filter" :class="`child ${checkinClass(child)}`">
            <td>{{ child.img }}</td>
            <td>{{ child.regularTime }}</td>
            <td>
              <v-switch
                v-model="child.checkedIn"
                hide-details
                inset
                :color="'teal-darken-4'"
                border
                :label="child.checkedIn ? 'Ja' : 'Nein'"
              ></v-switch>
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
import { computed, onBeforeUnmount, onMounted, Ref, ref } from "vue";

const query: Ref<string> = ref("");
const childrenFiltered: Ref<IChild[]> = ref([]);
const filter = computed(() => {
  childrenFiltered.value = children;

  if (query.value) {
    childrenFiltered.value = children.filter(
      (child) =>
        child.img.toLowerCase().indexOf(query.value.toLowerCase()) !== -1
    );
  }
  return childrenFiltered.value;
});
const lastChildIsVisible = ref(false);
onMounted(() => {
  const container = document.querySelector(".scroll") as HTMLElement;
  container.addEventListener("scroll", checkLastChildVisibility);
  document
    .querySelector("#query")
    ?.addEventListener("keyup", checkLastChildVisibility);
  const child = document.querySelector(".child:last-child") as HTMLElement;

  if (!child) {
    lastChildIsVisible.value = false;
    return;
  }
  lastChildIsVisible.value =
    container.scrollTop >
    child.scrollHeight * childrenFiltered.value.length - container.offsetHeight;
});
onBeforeUnmount(() => {
  const container = document.querySelector(".scroll") as HTMLElement;
  container.removeEventListener("scroll", checkLastChildVisibility);
});
const checkLastChildVisibility = () => {
  const container = document.querySelector(".scroll") as HTMLElement;
  const child = document.querySelector(".child:last-child") as HTMLElement;

  if (!child) {
    lastChildIsVisible.value = false;
    return;
  }
  lastChildIsVisible.value =
    container.scrollTop >
    child.scrollHeight * childrenFiltered.value.length - container.offsetHeight;
};

interface IChild {
  img: string;
  regularTime: string;
  checkedIn: boolean;
}
const children: IChild[] = [
  {
    img: "Biene",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: false,
  },
  {
    img: "Hase",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: true,
  },
  {
    img: "Maus",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: true,
  },
  {
    img: "Biene",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: false,
  },
  {
    img: "Hase",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: true,
  },
  {
    img: "Maus",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: true,
  },
  {
    img: "Biene",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: false,
  },
  {
    img: "Hase",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: true,
  },
  {
    img: "Maus",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: true,
  },
  {
    img: "Biene",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: false,
  },
  {
    img: "Hase",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: true,
  },
  {
    img: "Maus",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: true,
  },
  {
    img: "Biene",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: false,
  },
  {
    img: "Hase",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: true,
  },
  {
    img: "Maus",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: true,
  },
  {
    img: "Biene",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: false,
  },
  {
    img: "Hase",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: true,
  },
  {
    img: "Maus",
    regularTime: "08:30 - 15:30 (7h)",
    checkedIn: true,
  },
];

const checkinClass = (child: IChild) => {
  return child.checkedIn ? "checked-in" : "";
};
</script>
<style scoped lang="scss">
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
      background-color: burlywood;
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
