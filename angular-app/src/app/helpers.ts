import {ChatRoom, Chat} from '../../../types';

export namespace helpers {
  export function escapeRegExp(str: string): string {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  }
  export function compareChatRooms(roomA: ChatRoom, roomB: ChatRoom): number {
    if (!roomA.lastMsg) {
      if (!roomB.lastMsg) {
        return roomA.name.localeCompare(roomB.name);
      }
      return -1;
    }
    if (!roomB.lastMsg) {
      return 1;
    }
    return roomA.lastMsg.date.getTime() - roomB.lastMsg.date.getTime();
  }
  export function compareDMChats(chatA: Chat, chatB: Chat): number{
    if (!chatA.lastMessageDate) {
      if (!chatB.lastMessageDate) {
        return chatA.user._id.localeCompare(chatB.user._id);
      }
      return -1;
    }
    if (!chatB.lastMessageDate) {
      return 1;
    }
    return chatA.lastMessageDate.getTime() - chatB.lastMessageDate.getTime();
  }
}

