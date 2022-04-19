import { User } from "./chat";

export interface Construction {
    construction_id: string;
    construction_address: string;
    SK: string;
    PK: string;
    construction_name: string;
  }
  export interface WorkItem {
    work_item_id?: string;
    work_item_name: string;
    work_item_end_date: string;
    work_item_start_date: string;
    delete?: boolean
  }
  export interface UserUpdate {
    PK?: string,
    SK?: string,
    email?: string,
    delete?: false
  }
  export interface S {
    S: string
  }
  export interface Construction1 {
    name: string;
    address: string;
    workItems: WorkItem1[];
    users: User[];
  }
  export interface WorkItem1 {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    
  }