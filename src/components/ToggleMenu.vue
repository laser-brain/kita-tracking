<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      fullscreen
      :scrim="false"
      transition="dialog-bottom-transition"
    >
      <template v-slot:activator="{ props }">
        <v-btn color="teal-darken-4" dark v-bind="props" @click="open">
          Alle Zeiten heute
        </v-btn>
      </template>
      <v-card>
        <v-toolbar dark color="teal-darken-4">
          <v-toolbar-title>Heute Erfasste Zeiten</v-toolbar-title>
          <v-btn icon dark @click="dialog = false">
            <v-icon color="white" icon="mdi-close"></v-icon>
          </v-btn>
        </v-toolbar>
        <v-divider></v-divider>
        <v-list lines="two" subheader>
          <v-list-item
            v-for="(item, index) in locals"
            :key="index"
            :title="formatTimeSpan(item.date)"
            subtitle="[TODO: Zeit von-bis, bearbeiten?]"
          >
            <template v-slot:append>
              <v-btn
                v-if="!item.deleted"
                icon
                color="error"
                @click="removeEntry(index)"
              >
                <v-icon>mdi-delete-forever</v-icon>
              </v-btn>
              <v-btn
                v-else
                icon
                color="teal-darken-4"
                @click="restoreEntry(index)"
              >
                <v-icon>mdi-undo-variant</v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script setup lang="ts">
import { ref, Ref } from "vue";

interface IDialogProps {
  data: Date[];
}

interface ITimeEntry {
  date: Date;
  deleted: boolean;
}
const props = defineProps<IDialogProps>();
type indexEvents = "delete" | "restore";
type voidEvents = "init" | "finalize";
const emit = defineEmits<{
  (e: indexEvents, index: number): void;
  (e: voidEvents): void;
}>();

const locals: Ref<ITimeEntry[]> = ref(
  props.data.map((item) => {
    return {
      date: item,
      deleted: false,
    };
  })
);
const dialog = ref(false);

const restoreEntry = (index: number) => {
  const item = locals.value.at(index);
  if (item) {
    item.deleted = false;
    emit("restore", index);
  }
};

const removeEntry = (index: number) => {
  const item = locals.value.at(index);
  if (item) {
    item.deleted = true;
    emit("delete", index);
  }
};

const open = () => {
  emit("init");
};

const formatTimeSpan = (date: Date) => {
  return `${formatNumber(
    date.getHours() + date.getTimezoneOffset() / 60
  )}:${formatNumber(date.getMinutes())}:${formatNumber(date.getSeconds())}`;
};

const formatNumber = (input: number) => {
  return input.toLocaleString("de-DE", { minimumIntegerDigits: 2 });
};
</script>
