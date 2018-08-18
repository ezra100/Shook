
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

export enum Category {
  Animals,
  Apparel,
  Arts,
  Baby,
  Business,
  Cameras,
  Electronics,
  Food,
  Furniture,
  Hardware,
  Health,
  Home,
  Luggage,
  Mature,
  Media,
  Office,
  Religious,
  Software,
  Sporting,
  Toys,
  Vehicles,
}

export let categoryNames = [
  'Animals & Pet Supplies',
  'Apparel & Accessories',
  'Arts & Entertainment',
  'Baby & Toddler',
  'Business & Industrial',
  'Cameras & Optics',
  'Electronics',
  'Food, Beverages & Tobacco',
  'Furniture',
  'Hardware',
  'Health & Beauty',
  'Home & Garden',
  'Luggage & Bags',
  'Mature',
  'Media',
  'Office Supplies',
  'Religious & Ceremonial',
  'Software',
  'Sporting Goods',
  'Toys & Games',
  'Vehicles & Parts',
];

export interface User {
  userType: UserType;
  firstName: string;
  lastName: string;
  _id: string;  // username
  email: string;
  gender: Gender;
  address: string;
  imageURL: string;
  follows?: string[];
  basket?: {productID: string, quantity: number}[];
  isAuthorized?: boolean;
}

export interface UserAuthData {
  _id?: string;
  recoveryKey?: string;
  recoverydate?: Date;
  hashedPassword?: string;
  salt?: string;
}



export interface Product {
  title?: string;
  subtitle?: string;
  link?: string;
  _id?: string;
  date?: Date;
  price?: number;
  owner?: string;  // publisher of the product - must exist in users collection
  category?: Category;
}

export interface Review {
  _id?: string;
  date?: Date;
  owner: string;      // publisher of the review
  productID: string;  // product.id
  title: string;
  fullReview: string;
  rating: number;  // 1-5 stars
  likes?: string[];
  likesCount?: number;
  dislikes?: string[];
  dislikesCount?: number;
}

// a comment on a review
export interface IComment {
  _id?: string;
  date?: Date;
  owner: string;      // publisher of the comment
  productID: string;  // review.id
  comment: string;
  likes?: string[];  // array of usernames of those who liked the comment
  likesCount?: number;
  dislikes?: string[];  // array of username of dislikes
  dislikesCount?: number;
  // likes and dislikes must not intersect, must not have duplicates, and
  // usernames must exist
}

export interface Message {
  _id?: string;
  from: string;
  // roomID exists only before insertion and when sending a single message via
  // socket.io
  roomID?: string;
  content: string;
  date?: Date;
}

// direct message, user-2-user
export interface DMessage {
  from: string;
  to: string;
  content: string;
  date?: Date;
}

export interface ChatRoom {
  _id?: string;
  name: string;
  admins: string[];
  members?: string[];
  memberRequests?: string[];
  owner: string;
  connected?: number;

  messages: Message[];
  //created on extraction from DB
  lastMsg?: Message;
}

export interface Order {
  _id?: string, owner: string,
      products: {productID: string, quantity: number, currentPrice: number}[],
      orderDate: Date, paid: boolean
}

export interface MongoRegExp {
  $regex: string, $options?: string
}
export namespace filters {
  export interface ProductFilter {
    owner?: string, before?: Date, after?: Date, title?: MongoRegExp|string,
        link?: MongoRegExp|string,
  }
}

export type Chat = {
  messages: DMessage[],
  user: Partial<User>,
  lastMessageDate: Date
};
