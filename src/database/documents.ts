import * as Realm from "realm-web";

export type ObjectId = Realm.BSON.ObjectID;

export interface ITrackingDataDocument {
  _id?: Realm.BSON.ObjectID;
  employee: string;
  running: boolean;
  startTime: Date;
  duration?: Date;
}

export interface IEmployee {
  _id?: string;
  name: string;
}
