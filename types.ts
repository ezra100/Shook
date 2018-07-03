export enum Gender {
  Male = 1,
  Female = 2
}
export enum UserType {
  Basic = 1,
  ExternalWebsite = 2,
  Mod = 3,
  Admin = 4
}

export interface User {
  userType: UserType;
  firstName: string;
  lastName: string;
  _id: string;  // username
  email: string;
  gender: Gender;
  address: string;
  imageURL: string;
  follows: string[];
  basket : string[]
}

export interface UserAuthData {
  _id: string;
  recoveryKey?: string;
  recoveryCreationDate?: Date;
  hashedPassword?: string;
  salt?: string;
}



export interface IProduct{
  title: string;
  subtitle: string;
  link?: string;
  _id: string;
  creationDate : Date;
  price : number;
  owner: string;  // publisher of the product - must exist in users collection
}

export interface IReview {
  _id: string;
  creationDate : Date;
  owner: string;  // publisher of the review
  productID: string;  // product.id
  title: string;
  fullReview: string;
  rating: number;  // 1-5 stars
  likes: string[];
  likesCount? : number;
  dislikes: string[];
  dislikesCount: number;

}

// a comment on a review
export interface IComment {
  _id: string;
  creationDate : Date;
  owner: string;  // publisher of the comment
  reviewID: string;  // review.id
  comment: string;
  likes: string[];    // array of usernames of those who liked the comment
  likesCount? : number;
  dislikes: string[];  // array of username of dislikes
  dislikesCount? : number;
  // likes and dislikes must not intersect, must not have duplicates, and
  // usernames must exist
}