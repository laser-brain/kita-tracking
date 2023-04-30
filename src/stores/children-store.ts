import { getMidnight } from "@/business/utility";
import {
  IChild,
  IChildCheckinData,
  ITimeRequirement,
} from "@/database/documents";
import {
  addCheckinData,
  getChildren as getChildren,
  updateChildren,
} from "@/database/mongodb.connect";
import useDatabase from "@/stores/database-store";
import { defineStore } from "pinia";

const getFriday = (date: Date) => {
  const result = getMidnight(date);
  while (result.getDay() !== 5) {
    result.setDate(result.getDate() + 1);
  }

  return result;
};

const store = defineStore("children", () => {
  const dbStore = useDatabase();

  const loadChildren = async (username?: string): Promise<IChild[]> => {
    const data = await getChildren(await dbStore.getDbUser(), username);

    data.forEach((child) => {
      if (!child.weeklyTimeRequired) {
        child.weeklyTimeRequired = [];
      }
      if (!child.defaultTimeRequirement) {
        child.defaultTimeRequirement = {
          requirements: [
            { day: "Montag", timeRequired: 0 },
            { day: "Dienstag", timeRequired: 0 },
            { day: "Mittwoch", timeRequired: 0 },
            { day: "Donnerstag", timeRequired: 0 },
            { day: "Freitag", timeRequired: 0 },
          ],
        };
      }
      child.weeklyTimeRequired = child.weeklyTimeRequired.filter((timeReq) => {
        const lastDay = timeReq.requirements.at(-1);
        if (lastDay) {
          return (
            getMidnight(lastDay.day as Date).valueOf() >
            getMidnight(getFriday(new Date())).valueOf()
          );
        }
      });
      while (child.weeklyTimeRequired.length < 4) {
        const previousFriday =
          child.weeklyTimeRequired.length === 0
            ? getFriday(new Date())
            : (child.weeklyTimeRequired.at(-1)?.requirements.at(-1)
                ?.day as Date);

        if (!previousFriday) {
          console.error("Unexpected error on days calculation");
          return;
        }

        const requirements: ITimeRequirement[] = [];
        for (let i = 0; i < 5; i++) {
          const date = new Date(previousFriday);
          date.setDate(previousFriday.getDate() + 3 + i);
          const req: ITimeRequirement = {
            day: date,
            timeRequired: 0,
          };
          if (child.autoApplyDefaultValues && child.defaultTimeRequirement) {
            req.timeRequired =
              child.defaultTimeRequirement.requirements[i].timeRequired;
            req.startTime =
              child.defaultTimeRequirement.requirements[i].startTime;
            req.endTime = child.defaultTimeRequirement.requirements[i].endTime;
          }
          requirements.push(req);
        }
        child.weeklyTimeRequired.push({
          requirements: requirements,
        });

        if (!child.checkinHistory) {
          child.checkinHistory = [];
        }
      }
    });
    return data;
  };

  const updateCheckin = async (
    checkinData: IChildCheckinData,
    reset: boolean = false
  ) => {
    return addCheckinData(await dbStore.getDbUser(), checkinData, reset);
  };

  const save = async (children: IChild[]) => {
    return updateChildren(await dbStore.getDbUser(), children);
  };

  return {
    loadChildren,
    updateCheckin,
    save,
  };
});

export default store;
