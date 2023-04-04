import * as Realm from "realm-web";

export type ObjectId = Realm.BSON.ObjectID;

export interface ITrackingDataDocument {
  _id?: Realm.BSON.ObjectID;
  employee: string;
  running: boolean;
  startTime: Date;
  endTime?: Date;
  duration?: string;
}

export interface IEmployee {
  _id?: string;
  name: string;
}

export interface IPupil {
  name: string;
  weeklyTimeRequired: number;
}
