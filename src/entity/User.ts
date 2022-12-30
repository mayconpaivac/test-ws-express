import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class User {
    id: string;
    name: string;
    email: string;
    password: string;
}