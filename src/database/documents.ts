export interface ITrackingDataDocument {
  _id?: string;
  employee: string;
  running: boolean;
  startTime: Date;
  duration?: Date;
}

export interface IEmployee {
  _id?: string;
  name: string;
}
