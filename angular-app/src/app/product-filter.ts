import {MongoRegExp} from '../../../types';

class StringQuery {
  query?: string;
  isRegexp: boolean = false;
  caseSensitive = false;
  toMongoRegexp(stringToRegexpArray: boolean = true): MongoRegExp|string|undefined {
    if (!this.query) {
      return undefined;
    }
    if (this.isRegexp) {
      return {
        $regex: this.query, $options: this.caseSensitive ? '' : 'i'
      }
    }
    if(stringToRegexpArray){
        return  {$regex:
            this.query
                .split(/\s+/)
                // escape regex characters
                .map(
                    (v: any) =>
                        v.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
                .join('|'),
            $options: 'gi'}
    }
    return this.query;
  }
}

export interface MongoProductFilter {
  owner?: string, date?: {$lt?: Date, $gte?: Date}, title?: MongoRegExp|string,
      link?: MongoRegExp|string,
}

export class ProductFilter {
  owner?: string;
  date: {before?: Date, after?: Date} = {};
  title?: StringQuery = new StringQuery();
  link?: StringQuery = new StringQuery();
  toMongoFilter(): MongoProductFilter {
    let filter: MongoProductFilter = {};
    if (this.owner) {
      filter.owner = this.owner;
    }
    if (this.date.before) {
      filter.date = { $lt: this.date.before }
    }
    if (this.date.after) {
      filter.date = filter.date || {};
      filter.date.$gte = this.date.after;
    }
    if (this.title.query) {
      filter.title = this.title.toMongoRegexp();
    }
    if(this.link.query){
        filter.link = this.link.toMongoRegexp();
    }
    return filter;
  }

}