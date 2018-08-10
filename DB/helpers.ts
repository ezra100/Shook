
export let userPermitedFields = [
  'firstName',
  'lastName',
  'email',
  'gender',
  'address',
  'imageURL',
];

export let productPermitedFields = [
  'title',
  'subtitle',
  'link?',
  'price',
];

export let reviewPermitedFields = [
  'title',
  'fullReview',
  'rating',
];

export let commentPermitedFields = ['comment'];

export let messagePermitedFields = ['content'];

export let chatRoomPermitedFields = ['name', 'admins'];

export function stripObject(object : any, permitedFields : string[]) : any{
    let newObj: any = {};
    for(let field of permitedFields){
        if(object[field] !== undefined && object[field] !== null){
            newObj[field] = object[field];
        }
    }
    return newObj;
}