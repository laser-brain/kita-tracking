import * as Realm from "realm-web";

export type ObjectId = Realm.BSON.ObjectID;

export interface ITrackingDataDocument {
  _id?: ObjectId;
  employee: string;
  running: boolean;
  startTime: Date;
  endTime?: Date;
  duration?: string;
}

export interface IEmployee {
  _id?: ObjectId;
  name: string;
}

export interface IChild {
  _id?: ObjectId;
  name: string;
  defaultTimeRequirement?: IWeeklyTime;
  weeklyTimeRequired: IWeeklyTime[];
  autoApplyDefaultValues: boolean;
}

export interface IWeeklyTime {
  requirements: ITimeRequirement[];
}

export interface ITimeRequirement {
  day: Date | string;
  startTime?: string;
  endTime?: string;
  timeRequired: number;
}
