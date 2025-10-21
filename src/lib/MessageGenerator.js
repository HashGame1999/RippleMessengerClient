import { QuarterSHA512Message } from './AppUtil'
import { ActionCode, ObjectType } from './MessengerConst'
import { Sign } from './MessengerUtil'

export default class MessageGenerator {
  constructor(public_key, private_key) {
    this.PublicKey = public_key
    this.PrivateKey = private_key
  }

  sign(msg) {
    return Sign(msg, this.PrivateKey)
  }

  signJson(json) {
    let sig = Sign(JSON.stringify(json), this.PrivateKey)
    json.Signature = sig
    return json
  }

  genQrcode(server) {
    let json = {
      Relay: server,
      Timestamp: Date.now(),
      PublicKey: this.PublicKey
    }
    return JSON.stringify(this.signJson(json))
  }

  genDeclare() {
    let json = {
      Action: ActionCode.Declare,
      Timestamp: Date.now(),
      PublicKey: this.PublicKey
    }
    return JSON.stringify(this.signJson(json))
  }

  // avatar
  genAvatarRequest(address, to) {
    let json = {
      Action: ActionCode.AvatarRequest,
      Address: address,
      To: to,
      Timestamp: Date.now(),
      PublicKey: this.PublicKey
    }
    return JSON.stringify(this.signJson(json))
  }

  genAvatarJson(hash, size, timestamp) {
    let json = {
      ObjectType: ObjectType.Avatar,
      Hash: hash,
      Size: size,
      Timestamp: timestamp,
      PublicKey: this.PublicKey
    }
    return this.signJson(json)
  }

  // bulletin
  genBulletinRandomRequest() {
    let json = {
      Action: ActionCode.BulletinRandomRequest,
      Timestamp: Date.now(),
      PublicKey: this.PublicKey
    }
    return JSON.stringify(this.signJson(json))
  }

  genBulletinAddressListRequest(page) {
    let json = {
      Action: ActionCode.BulletinAddressListRequest,
      Page: page,
      Timestamp: Date.now(),
      PublicKey: this.PublicKey
    }
    return JSON.stringify(this.signJson(json))
  }

  genBulletinReplyListRequest(hash, page) {
    let json = {
      Action: ActionCode.BulletinReplyListRequest,
      Hash: hash,
      Page: page,
      Timestamp: Date.now(),
      PublicKey: this.PublicKey
    }
    return JSON.stringify(this.signJson(json))
  }

  genBulletinRequest(address, sequence, to) {
    let json = {
      Action: ActionCode.BulletinRequest,
      Address: address,
      Sequence: sequence,
      To: to,
      Timestamp: Date.now(),
      PublicKey: this.PublicKey
    }
    return JSON.stringify(this.signJson(json))
  }

  genFileRequest(type, hash, nonce, chunk_cursor, to) {
    let json = {
      Action: ActionCode.FileRequest,
      To: to,
      FileType: type,
      Hash: hash,
      Nonce: nonce,
      ChunkCursor: chunk_cursor,
      Timestamp: Date.now(),
      PublicKey: this.PublicKey
    }
    return JSON.stringify(this.signJson(json))
  }

  genObjectResponse(object, to) {
    let object_hash = QuarterSHA512Message(object)
    let timestamp = Date.now()
    let tmp_json = {
      Action: ActionCode.ObjectResponse,
      ObjectHash: object_hash,
      To: to,
      Timestamp: timestamp,
      PublicKey: this.PublicKey
    }
    tmp_json = this.signJson(tmp_json)
    let json = {
      Action: ActionCode.ObjectResponse,
      Object: object,
      To: to,
      Timestamp: timestamp,
      PublicKey: this.PublicKey,
      Signature: tmp_json.Signature
    }
    return JSON.stringify(json)
  }

  // not a message, a bulletin json
  genBulletinJson(sequence, pre_hash, quote, file, content, timestamp) {
    // quote = JSON.stringify(quote)
    // quote = JSON.parse(quote)
    // file = JSON.stringify(file)
    // file = JSON.parse(file)
    let content_hash = QuarterSHA512Message(content)
    let tmp_json = {
      ObjectType: ObjectType.Bulletin,
      Sequence: sequence,
      PreHash: pre_hash,
      Quote: quote,
      File: file,
      ContentHash: content_hash,
      Timestamp: timestamp,
      PublicKey: this.PublicKey
    }
    if (quote === null || quote.length == 0) {
      delete tmp_json["Quote"]
    }
    if (file === null || file.length == 0) {
      delete tmp_json["File"]
    }
    let sig = this.sign(JSON.stringify(tmp_json))

    let json = {
      ObjectType: ObjectType.Bulletin,
      Sequence: sequence,
      PreHash: pre_hash,
      Quote: quote,
      File: file,
      Content: content,
      Timestamp: timestamp,
      PublicKey: this.PublicKey,
      Signature: sig
    }
    if (quote === null || quote.length == 0) {
      delete json["Quote"]
    }
    if (file === null || file.length == 0) {
      delete json["File"]
    }

    return json
  }

  // chat
  genFriendECDHRequest(partition, sequence, ecdh_pk, pair, address, timestamp) {
    let json = {
      ObjectType: ObjectType.ChatDH,
      Partition: partition,
      Sequence: sequence,
      DHPublicKey: ecdh_pk,
      Pair: pair,
      To: address,
      Timestamp: timestamp,
      PublicKey: this.PublicKey
    }
    return this.signJson(json)
  }

  genChatMessageSync(pair_address, pair_sequence, self_sequence) {
    let json = {
      Action: ActionCode.ChatMessageSync,
      To: pair_address,
      PairSequence: pair_sequence,
      SelfSequence: self_sequence,
      Timestamp: Date.now(),
      PublicKey: this.PublicKey,
    }
    return JSON.stringify(this.signJson(json))
  }

  genChatMessage(sequence, pre_hash, confirm, content, dest_address, timestamp) {
    let json = {
      ObjectType: ObjectType.ChatMessage,
      Sequence: sequence,
      PreHash: pre_hash,
      Confirm: confirm,
      Content: content,
      To: dest_address,
      Timestamp: timestamp,
      PublicKey: this.PublicKey,
    }
    if (confirm === null) {
      delete json["Confirm"]
    }
    return this.signJson(json)
  }

  // Group

  // Channel
  genChannelCreate(channel_id, channel_name, speaker) {
    let json = {
      ObjectType: ObjectType.ChannelCreate,
      ChannelID: channel_id,
      ChannelName: channel_name,
      Speaker: speaker,
      Timestamp: Date.now(),
      PublicKey: this.PublicKey,
    }
    return JSON.stringify(this.signJson(json))
  }

  genChannelDelete(channel_id) {
    let json = {
      ObjectType: ObjectType.ChannelDelete,
      ChannelID: channel_id,
      Timestamp: Date.now(),
      PublicKey: this.PublicKey,
    }
    return JSON.stringify(this.signJson(json))
  }

  genChannelMessage(channel_id, sequence, pre_hash, confirm, content, timestamp) {
    let json = {
      ObjectType: ObjectType.ChannelMessage,
      ChannelID: channel_id,
      Sequence: sequence,
      PreHash: pre_hash,
      Confirm: confirm,
      Content: content,
      Timestamp: timestamp,
      PublicKey: this.PublicKey,
    }
    if (confirm === null) {
      delete json["Confirm"]
    }
    return this.signJson(json)
  }
}