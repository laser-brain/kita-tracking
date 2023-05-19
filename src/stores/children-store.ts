import { getFriday, getMidnight, sumHours } from "@/business/utility";
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
            { day: "Montag", timeRequired: 0, absent: false },
            { day: "Dienstag", timeRequired: 0, absent: false },
            { day: "Mittwoch", timeRequired: 0, absent: false },
            { day: "Donnerstag", timeRequired: 0, absent: false },
            { day: "Freitag", timeRequired: 0, absent: false },
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
            absent: false,
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

  const save = async (children: IChild[]): Promise<IChild[]> => {
    for (let child of children) {
      for (let req of child.weeklyTimeRequired) {
        for (let i = 0; i < req.requirements.length; i++) {
          if (
            !req.requirements[i].absent &&
            req.requirements[i].timeRequired === 0
          ) {
            req.requirements[i].startTime =
              child.defaultTimeRequirement?.requirements[i].startTime;
            req.requirements[i].endTime =
              child.defaultTimeRequirement?.requirements[i].endTime;
            req.requirements[i].timeRequired =
              child.defaultTimeRequirement?.requirements[i].timeRequired || 0;
          }
        }
      }
    }

    const timeSumValidation = children.map((child) =>
      child.weeklyTimeRequired.map((req) => sumHours(req.requirements))
    );
    const childrenValidated = timeSumValidation.map((weekSum) =>
      weekSum.filter((sum) => sum > 35)
    );
    if (
      childrenValidated.filter((childSums) => childSums.length > 0).length === 0
    ) {
      await updateChildren(await dbStore.getDbUser(), children);
      return children;
    }
    return [];
  };

  return {
    loadChildren,
    updateCheckin,
    save,
  };
});

export default store;
