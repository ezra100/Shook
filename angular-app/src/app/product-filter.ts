import * as moment from 'moment';
import {Moment} from 'moment';

import {Category, MongoRegExp} from '../../../types';

class StringQuery {
  query?: string = '';
  isRegexp: boolean = false;
  caseSensitive = false;
  toMongoRegexp(stringToRegexpArray: boolean = true): MongoRegExp|string
      |undefined {
    if (!this.query) {
      return undefined;
    }
    if (this.isRegexp) {
      return {
        $regex: this.query, $options: this.caseSensitive ? '' : 'i'
      }
    }
    if (stringToRegexpArray) {
      return {
        $regex: this.query
            .split(/\s+/)
            // escape regex characters
            .map((v: any) => v.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
            .join('|'),
            $options: 'gi'
      }
    }
    return this.query;
  }
}

export interface MongoProductFilter {
  owner?: string;
  date?: {$lt?: Date; $gte?: Date};
  title?: MongoRegExp|string;
  subtitle?: MongoRegExp|string;
  price?: {$gte?: number, $lte?: number};
  link?: MongoRegExp|string;
  category?: Category;
}

export class ProductFilter {
  owner?: string = '';
  date: {before?: Moment, after?: Moment} = {};
  price: {min?: number, max?: number} = {};
  title?: StringQuery = new StringQuery();
  subtitle?: StringQuery = new StringQuery();
  link?: StringQuery = new StringQuery();
  category?: Category;
  toMongoFilter(): MongoProductFilter {
    let filter: MongoProductFilter = {};
    if (this.owner) {
      filter.owner = this.owner;
    }
    if (this.date.before) {
      filter.date = { $lt: this.date.before.toDate() }
    }
    if (this.date.after) {
      filter.date = filter.date || {};
      filter.date.$gte = this.date.after.toDate();
    }
    if (this.title.query) {
      filter.title = this.title.toMongoRegexp();
    }
    if(this.subtitle.query){
      filter.subtitle = this.subtitle.toMongoRegexp();
    }
    if (this.link.query) {
      filter.link = this.link.toMongoRegexp();
    }
    if (this.category || this.category === 0) {
      filter.category = this.category;
    }
    if(this.price.min){
      filter.price = {$gte: this.price.min};
    }
    if(this.price.max){
      filter.price = filter.price || {};
      filter.price.$lte = this.price.max;
    }
    return filter;
  }

  stringify() {
    return JSON.stringify(this);
  }

  constructor(parseString?: string) {
    if (!parseString) {
      return;
    }
    let obj: ProductFilter = JSON.parse(parseString);
    if (obj.date) {
      this.date.after = obj.date.after && moment(<any>obj.date.after);
      this.date.before = obj.date.before && moment(<any>obj.date.before);
    }
    this.link = obj.link;
    this.owner = obj.owner;
    this.category = obj.category;
    this.price = obj.price || {};
    this.subtitle = obj.subtitle;
  }
}