import {File} from '../../../models/chat';
export const NAME_SCHEMA = 'discover/ImageSchema';

import * as FileLocalSchemaOp from './FileLocalSchema';


export type ImageDateBeforeSchemaType = {
  id: string;
  image: Array<File>;
  lastKey: string;
};

export const imagedatebeforeSchema = {
  name: NAME_SCHEMA,
  properties: {
    id: 'string',
    image: {
      type: 'list',
      objectType: `${FileLocalSchemaOp.NAME_SCHEMA}`,
    },
    lastKey: {type: 'string', optional: true},
  },
  primaryKey: 'id',
};


// // get all
// export const getAllSchema = () =>
//   new Promise((resolve, reject) => {
//     connect()
//       .then(realm => {
//         realm.write(() => {
//           let allLists = realm.objects(imageSchema.name);
//           resolve(allLists);
//         });
//       })
//       .catch(error => reject(error));
//   });

// // insert data
// export const insertSchema = (data: any) =>
//   new Promise((resolve, reject) => {
//     connect()
//       .then(realm => {
//         const user = realm.objects(imageSchema.name).filtered(`id ==[c] "${data.id}"`);
//         if (user.length === 0) {
//           realm.write(() => {
//             realm.create(imageSchema.name, data);
//           });
//           resolve(data);
//         }
//         resolve(data);
//       })
//       .catch(error => {
//         console.log("error", error)
//       });
//   });

// //update data
// export const updateSchema = (data: any) =>
//   new Promise((resolve, reject) => {
//     connect()
//       .then(realm => {
//         realm.write(() => {
//           const user = realm.objects(imageSchema.name).filtered(`id ==[c] "${data.id}"`);
//           if (user.length > 0) {
//             let updatingImage: any = realm.objectForPrimaryKey(
//               imageSchema.name,
//               data.id,
//             );
//             updatingImage["file_name"] = data.username;
//             updatingImage["path_file"] = data.fullname;
//             updatingImage["path_file_thumb"] = data.avatarId;
//             resolve(data);
//           }
//           resolve(null);
//         });
//       })
//       .catch(error => reject(error));
//   });

// //get by id user
// export const getImageByIDSchema = (id: string) =>
//   new Promise((resolve, reject) => {
//     connect()
//       .then(realm => {
//         realm.write(() => {
//           let findImage = realm.objects(imageSchema.name).filtered(`id ==[c] "${id}"`)
//           resolve(findImage);
//         });
//       })
//       .catch(error => reject(error));
//   });

// //delete user
// export const deleteSchema = (id: string) =>
//   new Promise((resolve, reject) => {
//     connect()
//       .then(realm => {
//         realm.write(() => {
//           const findImage = realm.objects(imageSchema.name).filtered(`id ==[c] "${id}"`);
//           if (findImage.length > 0) {
//             let image = realm.objectForPrimaryKey(
//               imageSchema.name,
//               id,
//             );
//             realm.delete(image);
//             resolve(id);
//           }
//           resolve(null);
//         });
//       })
//       .catch(error => reject(error));
//   });

// //search user by name
// // export const searchSchema = (text: string) =>
// //   new Promise((resolve, reject) => {
// //     connect()
// //       .then(realm => {
// //         realm.write(() => {
// //           let user = realm.objects(imageSchema.name).filtered(`username LIKE "${text}*"`); //limit search
// //           resolve(user);
// //         });
// //       })
// //       .catch(error => reject(error));
// //   });

// export const getPagingSchema = (limit: number, page: number) =>
//   new Promise((resolve, reject) => {
//     connect()
//       .then(realm => {
//         realm.write(() => {
//           let allLists = realm.objects(imageSchema.name);
//           if (page === 1)
//             resolve(allLists.slice(0, limit)); // paging limit record
//           else
//             resolve(allLists.slice(limit * page - limit, limit * page));
//         });
//       })
//       .catch(error => reject(error));
//   });