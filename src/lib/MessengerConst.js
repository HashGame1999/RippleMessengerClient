const DefaultBulletinCacheSize = 0

//1000*60*60*24=86400000
//const Epoch = Date.parse('2011-11-11 11:11:11')
const Epoch = 1320981071000

//const GenesisHash = QuarterSHA512Message('obeTvR9XDbUwquA6JPQhmbgaCCaiFa2rvf')
const GenesisAddress = 'obeTvR9XDbUwquA6JPQhmbgaCCaiFa2rvf'
const GenesisHash = 'F4C2EB8A3EBFC7B6D81676D79F928D0E'

const MessageInterval = 1000

const PrivateChatECDHString = 'private-chat-ecdh'
const PrivateChatAESString = 'private-chat-ecdh-to-aes-256'

//constant
const ActionCode = {
  Declare: 100,
  ObjectResponse: 101,
  AvatarRequest: 102,
  FileRequest: 103,

  BulletinRequest: 200,
  BulletinRandomRequest: 201,

  BulletinAddressListRequest: 203,
  BulletinAddressListResponse: 204,

  BulletinReplyListRequest: 205,
  BulletinReplyListResponse: 206,

  ChatMessageSync: 301,
  // ChatMessageSyncFromServer: 302,
  ChatFileRequest: 303,
  // ChatFileChunkRequest: 304,
  // ObjectResponse

  // GroupRequest: 401,
  // GroupManageSync: 402,
  // GroupDH: 403,
  GroupMessageSyncRequest: 401,
  GroupMessageSyncResponse: 402,
  // GroupFileRequest: 405
}

const ObjectType = {
  Nothing: 0,
  Avatar: 1,

  Bulletin: 101,

  ChatDH: 201,
  ChatMessage: 202,

  GroupCreate: 301,
  GroupDelete: 302,
  GroupMessage: 303,

  ChannelCreate: 401,
  ChannelDelete: 402,
  ChannelMessage: 403,

  // GroupManage: 301,
  // GroupMessage: 302,
  // GroupFileChunk: 303
}

const FileRequestType = {
  Avatar: 1,
  File: 2,
  ChatFile: 3
}

const MessageObjectType = {
  NotObject: 0,
  Bulletin: 1,
  ChatFile: 2
}

const SessionType = {
  Private: 0,
  Group: 1,
  Channel: 2
}

const DefaultPartition = 90 * 24 * 3600

const NonceMax = 2 ** 32 - 1
const FileChunkSize = 1024 * 1024
const FileMaxSize = 64 * 1024 * 1024
const BulletinFileExtRegex = /jpg|png|jpeg|txt|md/i

//Bulletin
const BulletinPageSize = 50
const BulletinPreviewSize = 256
const BulletinTabSession = '<BT>'
const BulletinMarkSession = '<BM>'
const BulletinHistorySession = '<BH>'
const BulletinAddressSession = '<BA>'

//Message
const MessagePageSize = 50

export {
  DefaultBulletinCacheSize,
  Epoch,
  GenesisAddress,
  GenesisHash,
  MessageInterval,
  PrivateChatECDHString,
  PrivateChatAESString,
  NonceMax,
  FileChunkSize,
  FileMaxSize,
  ActionCode,
  DefaultPartition,
  BulletinFileExtRegex,
  ObjectType,
  FileRequestType,
  MessageObjectType,
  SessionType,
  BulletinPageSize,
  BulletinPreviewSize,
  BulletinTabSession,
  BulletinMarkSession,
  BulletinHistorySession,
  BulletinAddressSession,
  MessagePageSize
}