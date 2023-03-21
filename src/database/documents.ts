export interface ITrackingDataDocument {
  _id?: string;
  employee: string;
  startTime: Date;
  duration: Date;
}

export interface IEmployee {
  _id?: string;
  name: string;
}
