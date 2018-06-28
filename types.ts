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
  username: string;  // key/id field
  email: string;
  gender: Gender;
  address: string;
  imageURL: string;
}

export interface UserAuthData {
  username: string;
  recoveryKey?: string;
  recoveryCreationDate?: Date;
  hashedPassword?: string;
  salt?: string;
}

export interface IMinProduct{
  _id?: string;
  username?: string;  // publisher of the product - must exist

  title: string;
  subtitle: string;
  link?: string;
}

export interface IProduct extends IMinProduct {
  _id: string;
  creationDate : Date;

  username: string;  // publisher of the product - must exist in users collection
}

export interface IReview {
  _id: string;
  creationDate : Date;
  username: string;  // publisher of the review
  productID: number;  // product.id
  title: string;
  fullReview: string;
  rating: number;  // 1-5 stars
  helpful: string[];
  helpfulCount? : number;
  notHelpful: string[];
  notHelpfulCount: number;
  // helpful and notHelpful must not intersect, must not have duplicates, and
  // usernames must exist
}

// a comment on a review
export interface IComment {
  _id: string;
  creationDate : Date;
  username: string;  // publisher of the comment
  reviewID: number;  // review.id
  comment: string;
  likes: string[];    // array of usernames of those who liked the comment
  likesCount? : number;
  dislike: string[];  // array of username of dislikes
  dislikeCount? : number;
  // likes and dislikes must not intersect, must not have duplicates, and
  // usernames must exist
}