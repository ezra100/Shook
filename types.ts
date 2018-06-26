export enum Gender { Male = 1, Female = 2 }
export enum UserType {Basic = 1, Admin = 2}

export interface User {

    userType : UserType;
    firstName: string;
    lastName: string;
    username: string; // key/id field
    email: string;
    gender: Gender;
    address: string;
    imageURL : string;
}

export interface UserAuthData {
    username: string;
    recoveryKey?: string;
    recoveryCreationDate?: Date;
    hashedPassword?: string;
    salt ?: string;
}

export interface IProduct{

}