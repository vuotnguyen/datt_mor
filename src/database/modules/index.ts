import * as DiscoverModule from './DiscoverScreen';
import * as ProfileModule from './ProfileScreen';
import * as ListChatModule from './ListChatScreen';
import * as IndividualChatModule from './IndividualChatScreen';
import * as IndividualChatGroupModule from './IndividualChatGroupScreen';
export const modulesArr = [
  ...DiscoverModule.discoverModuleArr,
  ...ProfileModule.ProfileModuleArr,
  ...ListChatModule.listChatModuleArr,
  ...IndividualChatModule.IndividualChatModuleArr,
  ...IndividualChatGroupModule.IndividualChatModuleArr
]; //define new module here

export { DiscoverModule, ProfileModule, ListChatModule, IndividualChatModule, IndividualChatGroupModule };
