import Ajv from 'ajv'
import { ConsoleWarn } from './AppUtil'
import { ActionCode, MessageObjectType, ObjectType } from './MessengerConst'

const ajv = new Ajv({ allErrors: true })

// client schema
// >>>declare<<<
const DeclareSchema = {
  "type": "object",
  "required": ["Action", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 5,
  "properties": {
    "Action": {
      "type": "number",
      "const": ActionCode.Declare
    },
    "URL": {
      "type": "string"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vDeclareSchema = ajv.compile(DeclareSchema)
function checkDeclareSchema(json) {
  try {
    if (vDeclareSchema(json)) {
      ConsoleWarn(`DeclareSchema ok`)
      return true
    } else {
      ConsoleWarn(`DeclareSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

const ObjectResponseSchema = {
  "type": "object",
  "required": ["Action", "Object", "To", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 6,
  "properties": {
    "Action": {
      "type": "number",
      "const": ActionCode.ObjectResponse
    },
    "Object": {
      "type": "object"
    },
    "To": {
      "type": "string"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}

// >>>avatar<<<
const AvatarRequestSchema = {
  "type": "object",
  "required": ["Action", "Address", "To", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 6,
  "properties": {
    "Action": {
      "type": "number",
      "const": ActionCode.AvatarRequest
    },
    "Address": {
      "type": "string"
    },
    "To": {
      "type": "string"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vAvatarRequestSchema = ajv.compile(AvatarRequestSchema)
function checkAvatarRequestSchema(json) {
  try {
    if (vAvatarRequestSchema(json)) {
      ConsoleWarn(`AvatarRequestSchema ok`)
      return true
    } else {
      ConsoleWarn(`AvatarRequestSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

const AvatarSchema = {
  "type": "object",
  "required": ["ObjectType", "Hash", "Size", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 9,
  "properties": {
    "ObjectType": {
      "type": "number",
      "const": ObjectType.Avatar
    },
    "Hash": {
      "type": "string"
    },
    "Size": {
      "type": "number"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vAvatarSchema = ajv.compile(AvatarSchema)
function checkAvatarSchema(json) {
  try {
    if (vAvatarSchema(json)) {
      ConsoleWarn(`AvatarSchema ok`)
      return true
    } else {
      ConsoleWarn(`AvatarSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

// >>>file<<<
const FileRequestSchema = {
  "type": "object",
  "required": ["Action", "FileType", "Hash", "Nonce", "ChunkCursor", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 9,
  "properties": {
    "Action": {
      "type": "number",
      "const": ActionCode.FileRequest
    },
    "FileType": {
      "type": "number"
    },
    "To": {
      "type": "string"
    },
    "Hash": {
      "type": "string"
    },
    "Nonce": {
      "type": "number"
    },
    "ChunkCursor": {
      "type": "number"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vFileRequestSchema = ajv.compile(FileRequestSchema)
function checkFileRequestSchema(json) {
  try {
    if (vFileRequestSchema(json)) {
      ConsoleWarn(`FileRequestSchema ok`)
      return true
    } else {
      ConsoleWarn(`FileRequestSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

// >>>bulletin<<<
const BulletinSchema = {
  "type": "object",
  "required": ["ObjectType", "Sequence", "PreHash", "Content", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 9,
  "properties": {
    "ObjectType": {
      "type": "number",
      "const": ObjectType.Bulletin
    },
    "Sequence": {
      "type": "number"
    },
    "PreHash": {
      "type": "string"
    },
    "Content": {
      "type": "string"
    },
    "Quote": {
      "type": "array",
      "minItems": 1,
      // "maxItems": 8,
      "items": {
        "type": "object",
        "required": ["Address", "Sequence", "Hash"],
        "properties": {
          "Address": { "type": "string" },
          "Sequence": { "type": "number" },
          "Hash": { "type": "string" }
        }
      }
    },
    "File": {
      "type": "array",
      "minItems": 1,
      // "maxItems": 8,
      "items": {
        "type": "object",
        "required": ["Name", "Ext", "Size", "Hash"],
        "properties": {
          "Name": { "type": "string" },
          "Ext": { "type": "string" },
          "Size": { "type": "number" },
          "Hash": { "type": "string" }
        }
      }
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vBulletinSchema = ajv.compile(BulletinSchema)
function checkBulletinSchema(json) {
  try {
    if (vBulletinSchema(json)) {
      ConsoleWarn(`BulletinSchema ok`)
      return true
    } else {
      ConsoleWarn(`BulletinSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

const BulletinRequestSchema = {
  "type": "object",
  "required": ["Action", "Address", "Sequence", "To", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 7,
  "properties": {
    "Action": {
      "type": "number",
      "const": ActionCode.BulletinRequest
    },
    "Address": {
      "type": "string"
    },
    "Sequence": {
      "type": "number"
    },
    "To": {
      "type": "string"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vBulletinRequestSchema = ajv.compile(BulletinRequestSchema)
function checkBulletinRequestSchema(json) {
  try {
    if (vBulletinRequestSchema(json)) {
      ConsoleWarn(`BulletinRequestSchema ok`)
      return true
    } else {
      ConsoleWarn(`BulletinRequestSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

const BulletinRandomRequestSchema = {
  "type": "object",
  "required": ["Action", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 4,
  "properties": {
    "Action": {
      "type": "number",
      "const": ActionCode.BulletinRandomRequest
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}

// BulletinCount DESC
const BulletinAddressListRequestSchema = {
  "type": "object",
  "required": ["Action", "Page", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 5,
  "properties": {
    "Action": {
      "type": "number",
      "const": ActionCode.BulletinAddressListRequest
    },
    "Page": {
      "type": "number"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}

const BulletinAddressListResponseSchema = {
  "type": "object",
  "required": ["Action", "Page", "List", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 6,
  "properties": {
    "Action": {
      "type": "number",
      "const": ActionCode.BulletinAddressListResponse
    },
    "Page": {
      "type": "number"
    },
    "List": {
      "type": "array",
      "minItems": 1,
      // "maxItems": 8,
      "items": {
        "type": "object",
        "required": ["Address", "Count"],
        "maxProperties": 2,
        "properties": {
          "Address": { "type": "string" },
          "Count": { "type": "number" }
        }
      }
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}

// Timestamp DESC
const BulletinReplyListRequestSchema = {
  "type": "object",
  "required": ["Action", "Hash", "Page", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 6,
  "properties": {
    "Action": {
      "type": "number",
      "const": ActionCode.BulletinReplyListRequest
    },
    "Hash": {
      "type": "string"
    },
    "Page": {
      "type": "number"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}

let BulletinReplyListResponseSchema = {
  "type": "object",
  "required": ["Action", "Hash", "Page", "List"],
  "maxProperties": 4,
  "properties": {
    "Action": {
      "type": "number",
      "const": ActionCode.BulletinReplyListResponse
    },
    "Hash": {
      "type": "string"
    },
    "Page": {
      "type": "number"
    },
    "List": {
      "type": "array",
      "minItems": 1,
      // "maxItems": 8,
      "items": {
        "type": "object",
        "required": ["Address", "Sequence", "Hash", "Content", "Timestamp"],
        "maxProperties": 5,
        "properties": {
          "Address": { "type": "string" },
          "Sequence": { "type": "number" },
          "Hash": { "type": "string" },
          "Content": { "type": "string" },
          "Timestamp": { "type": "number" }
        }
      }
    }
  }
}

// >>>chat<<<
// ChatDH
const ChatDHSchema = {
  "type": "object",
  "required": ["ObjectType", "Partition", "Sequence", "DHPublicKey", "Pair", "To", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 9,
  "properties": {
    "ObjectType": {
      "type": "number",
      "const": ObjectType.ChatDH
    },
    "Partition": {
      "type": "number"
    },
    "Sequence": {
      "type": "number"
    },
    "DHPublicKey": {
      "type": "string"
    },
    "Pair": {
      "type": "string"
    },
    "To": {
      "type": "string"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vChatDHSchema = ajv.compile(ChatDHSchema)
function checkChatDHSchema(json) {
  try {
    if (vChatDHSchema(json)) {
      ConsoleWarn(`ChatDHSchema ok`)
      return true
    } else {
      ConsoleWarn(`ChatDHSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

const ChatMessageSchema = {
  "type": "object",
  "required": ["ObjectType", "Sequence", "PreHash", "Content", "To", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 9,
  "properties": {
    "ObjectType": {
      "type": "number",
      "const": ObjectType.ChatMessage
    },
    "Sequence": {
      "type": "number"
    },
    "PreHash": {
      "type": "string"
    },
    "Confirm": {
      "type": "object",
      "required": ["Sequence", "Hash"],
      "maxProperties": 2,
      "properties": {
        "Sequence": { "type": "number" },
        "Hash": { "type": "string" }
      }
    },
    "Content": {
      "type": "string"
    },
    "To": {
      "type": "string"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vChatMessageSchema = ajv.compile(ChatMessageSchema)
function checkChatMessageSchema(json) {
  try {
    if (vChatMessageSchema(json)) {
      ConsoleWarn(`ChatMessageSchema ok`)
      return true
    } else {
      ConsoleWarn(`ChatMessageSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}
// const ChatMessageSchema = {
//   "type": "object",
//   "required": ["ObjectType", "Sequence", "PreHash", "Content", "To", "Timestamp", "PublicKey", "Signature"],
//   "maxProperties": 9,
//   "properties": {
//     "ObjectType": {
//       "type": "number",
//       "const": ObjectType.ChatMessage
//     },
//     "Sequence": {
//       "type": "number"
//     },
//     "PreHash": {
//       "type": "string"
//     },
//     "Confirm": {
//       "type": "object",
//       "required": ["Sequence", "Hash"],
//       "maxProperties": 2,
//       "properties": {
//         "Sequence": { "type": "number" },
//         "Hash": { "type": "string" }
//       }
//     },
//     "Content": {
//       "anyOf": [
//         { "type": "string" },
//         {
//           "type": "object",
//           "maxProperties": 4,
//           "required": ["ObjectType", "Address", "Sequence", "Hash"],
//           "properties": {
//             "ObjectType": {
//               "type": "number",
//               "const": MessageObjectType.Bulletin
//             },
//             "Address": {
//               "type": "string"
//             },
//             "Sequence": {
//               "type": "number"
//             },
//             "Hash": {
//               "type": "string"
//             }
//           }
//         },
//         {
//           "type": "object",
//           "required": ["ObjectType", "Name", "Ext", "Size", "Hash", "EHash", "Timestamp"],
//           "maxProperties": 7,
//           "properties": {
//             "ObjectType": {
//               "type": "number",
//               "const": MessageObjectType.ChatFile
//             },
//             "Name": {
//               "type": "string"
//             },
//             "Ext": {
//               "type": "string"
//             },
//             "Size": {
//               "type": "number"
//             },
//             "Hash": {
//               "type": "string"
//             }
//           }
//         }
//       ]
//     },
//     "To": {
//       "type": "string"
//     },
//     "Timestamp": {
//       "type": "number"
//     },
//     "PublicKey": {
//       "type": "string"
//     },
//     "Signature": {
//       "type": "string"
//     }
//   }
// }

const ChatMessageSyncSchema = {
  "type": "object",
  "required": ["Action", "To", "PairSequence", "SelfSequence", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 7,
  "properties": {
    "Action": {
      "type": "number",
      "const": ActionCode.ChatMessageSync
    },
    "To": {
      "type": "string"
    },
    "PairSequence": {
      "type": "number"
    },
    "SelfSequence": {
      "type": "number"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vChatMessageSyncSchema = ajv.compile(ChatMessageSyncSchema)
function checkChatMessageSyncSchema(json) {
  try {
    if (vChatMessageSyncSchema(json)) {
      ConsoleWarn(`ChatMessageSyncSchema ok`)
      return true
    } else {
      ConsoleWarn(`ChatMessageSyncSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

// >>>group<<<
// Action>>>
const GroupSyncSchema = {
  "type": "object",
  "required": ["Action", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 5,
  "properties": {
    "Action": {
      "type": "number",
      "const": ActionCode.GroupSync
    },
    "To": {
      "type": "string"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vGroupSyncSchema = ajv.compile(GroupSyncSchema)
function checkGroupSyncSchema(json) {
  try {
    if (vGroupSyncSchema(json)) {
      ConsoleWarn(`GroupSyncSchema ok`)
      return true
    } else {
      ConsoleWarn(`GroupSyncSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

const GroupMessageSyncSchema = {
  "type": "object",
  "required": ["Action", "GroupHash", "Address", "CurrentSequence", "To", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 8,
  "properties": {
    "Action": {
      "type": "number",
      "const": ActionCode.GroupMessageSync
    },
    "GroupHash": {
      "type": "string"
    },
    "Address": {
      "type": "string"
    },
    "CurrentSequence": {
      "type": "number"
    },
    "To": {
      "type": "string"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vGroupMessageSyncSchema = ajv.compile(GroupMessageSyncSchema)
function checkGroupMessageSyncSchema(json) {
  try {
    if (vGroupMessageSyncSchema(json)) {
      ConsoleWarn(`GroupMessageSyncSchema ok`)
      return true
    } else {
      ConsoleWarn(`GroupMessageSyncSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

// Object>>>
const GroupCreateSchema = {
  "type": "object",
  "required": ["ObjectType", "Hash", "Member", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 6,
  "properties": {
    "ObjectType": {
      "type": "number",
      "const": ObjectType.GroupCreate
    },
    "Hash": {
      "type": "string"
    },
    "Member": {
      "type": "array",
      "minItems": 3,
      "maxItems": 16,
      "items": {
        "type": "string"
      }
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vGroupCreateSchema = ajv.compile(GroupCreateSchema)
function checkGroupCreateSchema(json) {
  try {
    if (vGroupCreateSchema(json)) {
      ConsoleWarn(`GroupCreateSchema ok`)
      return true
    } else {
      ConsoleWarn(`GroupCreateSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

const GroupDeleteSchema = {
  "type": "object",
  "required": ["ObjectType", "Hash", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 7,
  "properties": {
    "ObjectType": {
      "type": "number",
      "const": ObjectType.GroupDelete
    },
    "Hash": {
      "type": "string"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vGroupDeleteSchema = ajv.compile(GroupDeleteSchema)
function checkGroupDeleteSchema(json) {
  try {
    if (vGroupDeleteSchema(json)) {
      ConsoleWarn(`GroupDeleteSchema ok`)
      return true
    } else {
      ConsoleWarn(`GroupDeleteSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

const GroupMessageSchema = {
  "type": "object",
  "required": ["ObjectType", "GroupHash", "Sequence", "PreHash", "Content", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 9,
  "properties": {
    "ObjectType": {
      "type": "number",
      "const": ObjectType.GroupMessage
    },
    "GroupHash": {
      "type": "string"
    },
    "Sequence": {
      "type": "number"
    },
    "PreHash": {
      "type": "string"
    },
    "Confirm": {
      "type": "object",
      "required": ["Address", "Sequence", "Hash"],
      "maxProperties": 2,
      "properties": {
        "Address": { "type": "number" },
        "Sequence": { "type": "number" },
        "Hash": { "type": "string" }
      }
    },
    "Content": {
      "type": "string"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vGroupMessageSchema = ajv.compile(GroupMessageSchema)
function checkGroupMessageSchema(json) {
  try {
    if (vGroupMessageSchema(json)) {
      ConsoleWarn(`GroupMessageSchema ok`)
      return true
    } else {
      ConsoleWarn(`GroupMessageSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

// >>>channel<<<
// Action>>>
const ChannelSyncSchema = {
  "type": "object",
  "required": ["Action", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 5,
  "properties": {
    "Action": {
      "type": "number",
      "const": ActionCode.ChannelSync
    },
    "To": {
      "type": "string"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vChannelSyncSchema = ajv.compile(ChannelSyncSchema)
function checkChannelSyncSchema(json) {
  try {
    if (vChannelSyncSchema(json)) {
      ConsoleWarn(`ChannelSyncSchema ok`)
      return true
    } else {
      ConsoleWarn(`ChannelSyncSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

const ChannelMessageSyncSchema = {
  "type": "object",
  "required": ["Action", "ChannelHash", "Address", "CurrentSequence", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 8,
  "properties": {
    "Action": {
      "type": "number",
      "const": ActionCode.ChannelMessageSync
    },
    "ChannelHash": {
      "type": "string"
    },
    "Address": {
      "type": "string"
    },
    "CurrentSequence": {
      "type": "number"
    },
    "To": {
      "type": "string"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vChannelMessageSyncSchema = ajv.compile(ChannelMessageSyncSchema)
function checkChannelMessageSyncSchema(json) {
  try {
    if (vChannelMessageSyncSchema(json)) {
      ConsoleWarn(`ChannelMessageSyncSchema ok`)
      return true
    } else {
      ConsoleWarn(`ChannelMessageSyncSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

// Object>>>
const ChannelCreateSchema = {
  "type": "object",
  "required": ["ObjectType", "Hash", "ChannelName", "Speaker", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 7,
  "properties": {
    "ObjectType": {
      "type": "number",
      "const": ObjectType.ChannelCreate
    },
    "Hash": {
      "type": "string"
    },
    "ChannelName": {
      "type": "string"
    },
    "Speaker": {
      "type": "array",
      "minItems": 1,
      "maxItems": 16,
      "items": {
        "type": "string"
      }
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vChannelCreateSchema = ajv.compile(ChannelCreateSchema)
function checkChannelCreateSchema(json) {
  try {
    if (vChannelCreateSchema(json)) {
      ConsoleWarn(`ChannelCreateSchema ok`)
      return true
    } else {
      ConsoleWarn(`ChannelCreateSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

const ChannelDeleteSchema = {
  "type": "object",
  "required": ["ObjectType", "Hash", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 5,
  "properties": {
    "ObjectType": {
      "type": "number",
      "const": ObjectType.ChannelDelete
    },
    "Hash": {
      "type": "string"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vChannelDeleteSchema = ajv.compile(ChannelDeleteSchema)
function checkChannelDeleteSchema(json) {
  try {
    if (vChannelDeleteSchema(json)) {
      ConsoleWarn(`ChannelDeleteSchema ok`)
      return true
    } else {
      ConsoleWarn(`ChannelDeleteSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}

const ChannelMessageSchema = {
  "type": "object",
  "required": ["ObjectType", "ChannelHash", "Sequence", "PreHash", "Content", "Timestamp", "PublicKey", "Signature"],
  "maxProperties": 9,
  "properties": {
    "ObjectType": {
      "type": "number",
      "const": ObjectType.ChannelMessage
    },
    "ChannelHash": {
      "type": "string"
    },
    "Sequence": {
      "type": "number"
    },
    "PreHash": {
      "type": "string"
    },
    "Confirm": {
      "type": "object",
      "required": ["Address", "Sequence", "Hash"],
      "maxProperties": 2,
      "properties": {
        "Address": { "type": "number" },
        "Sequence": { "type": "number" },
        "Hash": { "type": "string" }
      }
    },
    "Content": {
      "type": "string"
    },
    "Timestamp": {
      "type": "number"
    },
    "PublicKey": {
      "type": "string"
    },
    "Signature": {
      "type": "string"
    }
  }
}
const vChannelMessageSchema = ajv.compile(ChannelMessageSchema)
function checkChannelMessageSchema(json) {
  try {
    if (vChannelMessageSchema(json)) {
      ConsoleWarn(`ChannelMessageSchema ok`)
      return true
    } else {
      ConsoleWarn(`ChannelMessageSchema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}
//client

// MessageObject
const MessageObjectBulletinSchema = {
  "type": "object",
  "required": ["ObjectType", "Address", "Sequence", "Hash"],
  "maxProperties": 4,
  "properties": {
    "ObjectType": {
      "type": "number",
      "const": MessageObjectType.Bulletin
    },
    "Address": {
      "type": "string"
    },
    "Sequence": {
      "type": "number"
    },
    "Hash": {
      "type": "string"
    }
  }
}

const MessageObjectChatFileSchema = {
  "type": "object",
  "required": ["ObjectType", "Name", "Ext", "Size", "Hash"],
  "maxProperties": 7,
  "properties": {
    "ObjectType": {
      "type": "number",
      "const": MessageObjectType.ChatFile
    },
    "Name": {
      "type": "string"
    },
    "Ext": {
      "type": "string"
    },
    "Size": {
      "type": "number"
    },
    "Hash": {
      "type": "string"
    }
  }
}

const vMessageObjectBulletinSchema = ajv.compile(MessageObjectBulletinSchema)
const vMessageObjectChatFileSchema = ajv.compile(MessageObjectChatFileSchema)

function checkMessageObjectSchema(json) {
  try {
    if (vMessageObjectBulletinSchema(json) || vMessageObjectChatFileSchema(json)) {
      ConsoleWarn(`MessageObject schema ok`)
      return true
    } else {
      ConsoleWarn(`MessageObject schema invalid`)
      return false
    }
  } catch (e) {
    return false
  }
}
// MessageObject end

function deriveJson(str) {
  try {
    let json = JSON.parse(str)
    return json
  } catch (e) {
    ConsoleWarn(`not a json`)
    return false
  }
}

export {
  deriveJson,
  checkDeclareSchema,

  checkAvatarRequestSchema,
  checkAvatarSchema,

  checkFileRequestSchema,

  checkBulletinRequestSchema,
  checkBulletinSchema,

  checkChatDHSchema,
  checkChatMessageSchema,
  checkChatMessageSyncSchema,

  // group
  checkGroupSyncSchema,
  checkGroupMessageSyncSchema,
  checkGroupCreateSchema,
  checkGroupDeleteSchema,
  checkGroupMessageSchema,

  // channel
  checkChannelSyncSchema,
  checkChannelMessageSyncSchema,
  checkChannelCreateSchema,
  checkChannelDeleteSchema,
  checkChannelMessageSchema,

  checkMessageObjectSchema,
}