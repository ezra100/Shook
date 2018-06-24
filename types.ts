export enum Gender { Male = 1, Female = 2 }

export interface User {

    // used to remember the class type when the client sends back
    // the object for update/deletion/client type etc.
    firstName: string;
    lastName: string;
    username: string; // key/id field
    email: string;
    gender: Gender;
    address: string;
    image? : string;
}

export interface UserAuthData {
    username: string;
    recoveryKey?: string;
    recoveryCreationDate?: Date;
    hashedPassword?: string;
    salt ?: string;
}



