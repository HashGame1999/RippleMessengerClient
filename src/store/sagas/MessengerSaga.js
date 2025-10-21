import Elliptic from 'elliptic'
import { Buffer } from 'buffer'
import Dexie from 'dexie'
import * as rippleKeyPairs from 'ripple-keypairs'
import { eventChannel, END } from 'redux-saga'
import { call, delay, put, select, fork, takeEvery, takeLatest } from 'redux-saga/effects'
import { setCurrentBulletin, setCurrentBulletinSequence, setCurrentFileList, setCurrentQuoteList, setCurrentSession, setCurrentSessionMessageList, setFollowBulletinList, setForwardBulletin, setForwardFlag, setFriendRequestList, setMineBulletinList, setPublishFlag, setRandomBulletin, setSessionList, updateMessengerConnStatus } from '../slices/MessengerSlice'
import { checkAvatarRequestSchema, checkAvatarSchema, checkBulletinRequestSchema, checkBulletinSchema, checkChatDHSchema, checkChatMessageSchema, checkFileRequestSchema, checkMessageObjectSchema, deriveJson } from '../../lib/MessageSchemaVerifier'
import MessageGenerator from '../../lib/MessageGenerator'
import { ActionCode, FileRequestType, GenesisHash, FileMaxSize, FileChunkSize, ObjectType, SessionType, DefaultPartition, MessageObjectType, PrivateChatECDHString } from '../../lib/MessengerConst'
import { AesDecrypt, AesDecryptBuffer, AesEncrypt, AesEncryptBuffer, ConsoleError, filesize_format, genAESKey, HalfSHA512, QuarterSHA512Message, safeAddItem } from '../../lib/AppUtil'

import { open, readFile, writeFile, remove, mkdir, stat, SeekMode } from '@tauri-apps/plugin-fs'
import * as path from '@tauri-apps/api/path'
import { BlobToUint32, DHSequence, FileEHash, FileHash, genNonce, Uint32ToBuffer } from '../../lib/MessengerUtil'
import { setFlashNoticeMessage } from '../slices/UserSlice'
import { CommonDBSchame } from '../../lib/AppConst'
import { ContactToggleIsFriend } from './UserSaga'

let CommonDB = null

function initCommonDB() {
  CommonDB = new Dexie('Common')
  CommonDB.version(1).stores(CommonDBSchame)
}

let switchClient = null
let switchEventChannel = null

let MG = null

function initMessageGenerator(seed) {
  const keypair = rippleKeyPairs.deriveKeypair(seed)
  MG = new MessageGenerator(keypair.publicKey, keypair.privateKey)
}

function createSwitchEventChannel(client) {
  return eventChannel((emit) => {
    const onOpen = () => {
      emit(updateMessengerConnStatus(true))
    }

    const onMessage = async (event) => {
      const data_type = typeof event.data
      if (data_type === 'string') {
        try {
          const json = JSON.parse(event.data)
          emit({ type: 'HandelReceiveMessage', payload: json })
        } catch (error) {
          emit({ type: 'SOCKET_ERROR', error: 'Invalid JSON format' })
        }
      } else if (data_type === 'object') {
        // emit({ type: 'HandelReceiveBolb', payload: event.data })
        console.log(typeof event.data)
        console.log(event.data)
        const nonce = await BlobToUint32(event.data.slice(0, 4))
        console.log(nonce)
        let content = event.data.slice(4)
        content = await content.arrayBuffer()
        content = Buffer.from(content)
        console.log(FileRequestList)
        for (let i = 0; i < FileRequestList.length; i++) {
          const request = FileRequestList[i]
          if (request.Nonce === nonce) {
            const base_dir = await path.appLocalDataDir()
            switch (request.Type) {
              case FileRequestType.Avatar:
                const content_hash = FileHash(content)
                if (request.Hash === content_hash) {
                  const avatar_dir = await path.join(base_dir, `Avatar`)
                  mkdir(avatar_dir, { recursive: true })
                  let avatar_path = `${avatar_dir}/${request.Address}.png`
                  await writeFile(avatar_path, content)
                  await CommonDB.Avatars
                    .where('Address')
                    .equals(request.Address)
                    .modify(tmp => {
                      tmp.IsSaved = true
                      tmp.UpdatedAt = Date.now()
                    })
                }
                break
              case FileRequestType.File:
                const file_dir = await path.join(base_dir, `File`, request.Hash.substring(0, 3), request.Hash.substring(3, 6))
                mkdir(file_dir, { recursive: true })
                let file_path = await path.join(file_dir, request.Hash)
                let file = await CommonDB.Files
                  .where('Hash')
                  .equals(request.Hash)
                  .first()
                if (file.ChunkCursor < file.ChunkLength && file.ChunkCursor + 1 === request.ChunkCursor) {
                  await writeFile(file_path, content, { append: true })
                  FileRequestList = FileRequestList.filter(r => r.Nonce !== request.Nonce)
                  let current_chunk_cursor = file.ChunkCursor + 1
                  await CommonDB.Files
                    .where('Hash')
                    .equals(request.Hash)
                    .modify(tmp => {
                      tmp.ChunkCursor = current_chunk_cursor
                      tmp.UpdatedAt = Date.now()
                    })
                  if (current_chunk_cursor < file.ChunkLength) {
                    emit({ type: 'FetchFile', payload: { hash: request.Hash } })
                  } else {
                    let hash = FileHash(await readFile(file_path))
                    console.log(current_chunk_cursor)
                    console.log(hash)
                    console.log(request.Hash)
                    if (hash !== request.Hash) {
                      await remove(file_path)
                      await CommonDB.Files
                        .where('Hash')
                        .equals(request.Hash)
                        .modify(tmp => {
                          tmp.ChunkCursor = 0
                          tmp.UpdatedAt = Date.now()
                        })
                    }
                    emit({ type: 'FetchFile', payload: { hash: request.Hash } })
                  }
                }
                break
              case FileRequestType.ChatFile:
                const chat_file_dir = await path.join(base_dir, `File`, request.Hash.substring(0, 3), request.Hash.substring(3, 6))
                mkdir(chat_file_dir, { recursive: true })
                let chat_file_path = await path.join(chat_file_dir, request.Hash)
                let chat_file = await CommonDB.Files
                  .where('Hash')
                  .equals(request.Hash)
                  .first()
                if (chat_file.ChunkCursor < chat_file.ChunkLength && chat_file.ChunkCursor + 1 === request.ChunkCursor) {
                  // TODO222 decrypted_content
                  console.log(chat_file)
                  console.log(request)
                  const decrypted_content = AesDecryptBuffer(content, request.AesKey)
                  await writeFile(chat_file_path, decrypted_content, { append: true })
                  FileRequestList = FileRequestList.filter(r => r.Nonce !== request.Nonce)
                  let current_chunk_cursor = chat_file.ChunkCursor + 1
                  await CommonDB.Files
                    .where('Hash')
                    .equals(request.Hash)
                    .modify(tmp => {
                      tmp.ChunkCursor = current_chunk_cursor
                      tmp.UpdatedAt = Date.now()
                    })
                  if (current_chunk_cursor < chat_file.ChunkLength) {
                    emit({ type: 'FetchChatFile', payload: { hash: request.Hash, size: request.Size, remote: request.Address } })
                  } else {
                    let hash = FileHash(await readFile(chat_file_path))
                    // console.log(current_chunk_cursor)
                    // console.log(hash)
                    // console.log(request.Hash)
                    if (hash !== request.Hash) {
                      await remove(chat_file_path)
                      await CommonDB.Files
                        .where('Hash')
                        .equals(request.Hash)
                        .modify(tmp => {
                          tmp.ChunkCursor = 0
                          tmp.UpdatedAt = Date.now()
                        })
                    }
                    emit({ type: 'FetchChatFile', payload: { hash: request.Hash, size: request.Size, remote: request.Address } })
                  }
                }
                break;
              default:
                break
            }
          }
        }
      }
    }

    const onClose = () => {
      emit(updateMessengerConnStatus(false))
      emit(END)
    }

    const onError = (errorEvent) => {
      emit({ type: 'SOCKET_ERROR', error: errorEvent.message || 'WebSocket error' })
    }


    client.addEventListener('open', onOpen)
    client.addEventListener('message', onMessage)
    client.addEventListener('close', onClose)
    client.addEventListener('error', onError)


    return () => {
      client.removeEventListener('open', onOpen)
      client.removeEventListener('message', onMessage)
      client.removeEventListener('close', onClose)
      client.removeEventListener('error', onError)

      if (client.readyState === WebSocket.OPEN) {
        client.close()
      }
    }
  })
}

function* SendMessage(payload) {
  console.log('!!!send message', payload)
  // TODO que SendMessage
  // ??? yield delay(1000)
  try {
    if (switchClient.readyState === WebSocket.OPEN) {
      switchClient.send(payload.msg)
    } else {
      // yield put({ 
      //   type: WS_ERROR, 
      //   payload: { 
      //     message: '无法发送消息，WebSocket未连接',
      //     code: switchClient.readyState
      //   } 
      // })
    }
  } catch (error) {
    // yield put({ 
    //   type: WS_ERROR, 
    //   payload: { 
    //     message: '消息发送失败', 
    //     error: error.message 
    //   } 
    // })
  }
}

export function* test() {
}

function* handelMessengerEvent(action) {
  {
    yield put(action)
    const seed = yield select(state => state.User.Seed)
    const address = yield select(state => state.User.Address)
    if (!seed) {
      MG = null
      return
    }
    if (MG === null) {
      yield call(initMessageGenerator, seed)
    }
    if (CommonDB === null) {
      yield call(initCommonDB)
    }

    if (action.type === updateMessengerConnStatus.type && action.payload === true) {
      // connnected
      let msg = MG.genDeclare()
      yield call(SendMessage, { msg: msg })
    } else if (action.type === updateMessengerConnStatus.type && action.payload === false) {
      //   // disconnnected
      //   yield call([switchClient, switchClient.disconnect])
    } else if (action.type === 'HandelReceiveMessage') {
      console.log('received message', action.payload)
      let json = action.payload
      if (json.Action && (json.To === undefined || json.To === address)) {
        let ob_address = rippleKeyPairs.deriveAddress(json.PublicKey)
        switch (json.Action) {
          // request action
          case ActionCode.BulletinRequest:
            if (checkBulletinRequestSchema(json)) {
              let bulletin = yield call(() => CommonDB.Bulletins
                .where({ Address: json.Address, Sequence: json.Sequence })
                .first())
              if (bulletin) {
                yield call(SendMessage, { msg: JSON.stringify(bulletin.Json) })
              } else if (json.Address === address) {
                // pull self bulletin from server
                const last_bulletin = yield call(() => CommonDB.Bulletins
                  .where('Address').equals(json.Address)
                  .sortBy('Sequence')
                  .then(records => records[records.length - 1]))
                if (last_bulletin === undefined) {
                  if (json.Sequence > 1) {
                    let msg = MG.genBulletinRequest(address, 1, address)
                    yield call(SendMessage, { msg: msg })
                  }
                } else if (last_bulletin.Sequence + 1 < json.Sequence) {
                  let msg = MG.genBulletinRequest(address, last_bulletin.Sequence + 1, address)
                  yield call(SendMessage, { msg: msg })
                }
              }
            }
            break
          case ActionCode.FileRequest:
            console.log(json.Hash)
            if (checkFileRequestSchema(json)) {
              switch (json.FileType) {
                case FileRequestType.Avatar:
                  let avatar = yield call(() => CommonDB.Avatars
                    .where('Hash')
                    .equals(json.Hash)
                    .first())
                  if (avatar) {
                    const avatar_dir = yield call(() => path.appCacheDir())
                    // console.log(avatar_dir)
                    const avatar_path = yield call(() => path.join(avatar_dir, `/Avatar/${avatar.Address}.png`))
                    // console.log(avatar_path)
                    const content = yield call(() => readFile(avatar_path))
                    // console.log(content.length)
                    const nonce = Uint32ToBuffer(json.Nonce)
                    // console.log(nonce.length)
                    yield call(SendMessage, { msg: Buffer.concat([nonce, content]) })
                  }
                  break
                case FileRequestType.File:
                  let file = yield call(() => CommonDB.Files
                    .where('Hash')
                    .equals(json.Hash)
                    .first())
                  console.log(file)
                  if (file !== undefined && file.ChunkCursor === file.ChunkLength) {
                    const base_dir = yield call(() => path.appLocalDataDir())
                    console.log(base_dir)
                    const file_path = yield call(() => path.join(base_dir, `File`, json.Hash.substring(0, 3), json.Hash.substring(3, 6), json.Hash))
                    console.log(file_path)
                    const nonce = Uint32ToBuffer(json.Nonce)
                    console.log(nonce.length)
                    if (file.Size <= FileChunkSize) {
                      const content = yield call(() => readFile(file_path))
                      yield call(SendMessage, { msg: Buffer.concat([nonce, content]) })
                    } else {
                      const fileHandle = yield call(() => open(file_path, { read: true }))
                      try {
                        const start = (json.ChunkCursor - 1) * FileChunkSize
                        fileHandle.seek(start, SeekMode.Start)
                        const length = Math.min(FileChunkSize, file.Size - start)
                        const buffer = new Uint8Array(length)
                        const bytesRead = yield call(() => fileHandle.read(buffer))
                        if (bytesRead > 0) {
                          const chunk = buffer.slice(0, bytesRead)
                          yield call(SendMessage, { msg: Buffer.concat([nonce, chunk]) })
                        }
                      } finally {
                        yield call(() => fileHandle.close())
                      }
                    }
                  }
                  break
                case FileRequestType.ChatFile:
                  console.log(json)
                  let chat_file = yield call(() => CommonDB.ChatFiles
                    .where('EHash')
                    .equals(json.Hash)
                    .first())
                  console.log(chat_file)
                  if (chat_file !== undefined) {
                    let file = yield call(() => CommonDB.Files
                      .where('Hash')
                      .equals(chat_file.Hash)
                      .first())
                    console.log(file)
                    if (file !== undefined && file.ChunkLength === file.ChunkCursor) {
                      const base_dir = yield call(() => path.appLocalDataDir())
                      console.log(base_dir)
                      const file_path = yield call(() => path.join(base_dir, `File`, file.Hash.substring(0, 3), file.Hash.substring(3, 6), file.Hash))
                      console.log(file_path)
                      const nonce = Uint32ToBuffer(json.Nonce)
                      console.log(nonce)
                      console.log(file.Size)
                      console.log(FileChunkSize)

                      if (file.Size <= FileChunkSize) {
                        const content = yield call(() => readFile(file_path))
                        let ob_address = rippleKeyPairs.deriveAddress(json.PublicKey)
                        const ecdh_sequence = DHSequence(DefaultPartition, json.Timestamp, address, ob_address)
                        let ecdh = yield call(() => CommonDB.ECDHS
                          .where({ SelfAddress: address, PairAddress: ob_address, Partition: DefaultPartition, Sequence: ecdh_sequence })
                          .first())
                        console.log(ecdh)
                        if (ecdh !== undefined && ecdh.AesKey !== undefined) {
                          const encrypted_content = AesEncryptBuffer(content, ecdh.AesKey)
                          // TODO222 encrypted_content
                          // console.log(content)
                          // console.log(encrypted_content)
                          yield call(SendMessage, { msg: Buffer.concat([nonce, encrypted_content]) })
                        }
                        yield call(SendMessage, { msg: Buffer.concat([nonce, content]) })
                      } else {
                        const fileHandle = yield call(() => open(file_path, { read: true }))
                        try {
                          const start = (json.ChunkCursor - 1) * FileChunkSize
                          fileHandle.seek(start, SeekMode.Start)
                          const length = Math.min(FileChunkSize, file.Size - start)
                          const buffer = new Uint8Array(length)
                          const bytesRead = yield call(() => fileHandle.read(buffer))
                          if (bytesRead > 0) {
                            const chunk = buffer.slice(0, bytesRead)
                            // let ob_address = rippleKeyPairs.deriveAddress(json.PublicKey)
                            const ecdh_sequence = DHSequence(DefaultPartition, json.Timestamp, address, ob_address)
                            let ecdh = yield call(() => CommonDB.ECDHS
                              .where({ SelfAddress: address, PairAddress: ob_address, Partition: DefaultPartition, Sequence: ecdh_sequence })
                              .first())
                            console.log(ecdh)
                            if (ecdh !== undefined && ecdh.AesKey !== undefined) {
                              const encrypted_chunk = AesEncryptBuffer(chunk, ecdh.AesKey)
                              // TODO222 encrypted_chunk
                              // console.log(chunk)
                              // console.log(encrypted_chunk)
                              yield call(SendMessage, { msg: Buffer.concat([nonce, encrypted_chunk]) })
                            }
                          }
                        } finally {
                          yield call(() => fileHandle.close())
                        }
                      }
                    }
                  }
                  break

                default:
                  break
              }
            }
            break
          case ActionCode.AvatarRequest:
            if (checkAvatarRequestSchema(json)) {
              let avatar = yield call(() => CommonDB.Avatars
                .where('Address')
                .equals(json.Address)
                .first())
              if (avatar !== undefined) {
                yield call(SendAvatarResponse, { hash: avatar.Hash, size: avatar.Size, timestamp: avatar.SignedAt })
              }
            }
            break
          case ActionCode.ChatMessageSync:
            // TODO ChatMessageSync pair
            let msg_list = yield call(() => CommonDB.Messages
              .where({ Sour: address, Dest: ob_address })
              .reverse()
              .sortBy('Sequence')
            )
            console.log(msg_list)
            let unSyncMessageList = msg_list.filter(tmp => tmp.Sequence > json.PairSequence)
            console.log(unSyncMessageList)
            if (unSyncMessageList.length > 0) {
              for (let i = 0; i < unSyncMessageList.length; i++) {
                const msg = unSyncMessageList[i];
                yield call(SendMessage, { msg: JSON.stringify(msg.Json) })
              }
            }
            break
          default:
            break
        }
      } else if (json.ObjectType) {
        let timestamp = Date.now()
        let ob_address = rippleKeyPairs.deriveAddress(json.PublicKey)
        switch (json.ObjectType) {
          case ObjectType.ChatMessage:
            if (checkChatMessageSchema(json)) {
              if (ob_address !== address) {
                let msg_from = yield call(() => CommonDB.Friends
                  .where('[Local+Remote]')
                  .equals([address, ob_address])
                  .first())
                if (msg_from !== undefined) {
                  const ecdh_sequence = DHSequence(DefaultPartition, json.Timestamp, address, ob_address)
                  let ecdh = yield call(() => CommonDB.ECDHS
                    .where({ SelfAddress: address, PairAddress: ob_address, Partition: DefaultPartition, Sequence: ecdh_sequence })
                    .first())
                  if (ecdh === undefined || ecdh.AesKey === undefined) {
                    const ec = new Elliptic.ec('secp256k1')
                    const ecdh_sk = HalfSHA512(PrivateChatECDHString + seed + address + ecdh_sequence)
                    const key_pair = ec.keyFromPrivate(ecdh_sk, 'hex')
                    const ecdh_pk = key_pair.getPublic('hex')
                    const self_json = MG.genFriendECDHRequest(DefaultPartition, ecdh_sequence, ecdh_pk, '', ob_address, timestamp)
                    yield call(() => CommonDB.ECDHS.add({
                      SelfAddress: address,
                      PairAddress: ob_address,
                      Partition: DefaultPartition,
                      Sequence: ecdh_sequence,
                      // AesKey: aes_key,
                      PrivateKey: ecdh_sk,
                      PublicKey: ecdh_pk,
                      SelfJson: self_json,
                      // PairJson: json
                    }))
                    yield call(SendMessage, { msg: JSON.stringify(self_json) })
                  } else {
                    let content = AesDecrypt(json.Content, ecdh.AesKey)
                    let content_json = deriveJson(content)
                    if (content_json && checkMessageObjectSchema(content_json)) {
                      content = content_json
                    }
                    let hash = QuarterSHA512Message(json)
                    let to_save = {
                      Hash: hash,
                      Sour: ob_address,
                      Dest: address,
                      Sequence: json.Sequence,
                      PreHash: json.PreHash,
                      Content: content,
                      SignedAt: json.Timestamp,
                      CreatedAt: timestamp,
                      Json: json,
                      Confirmed: 0,
                      Readed: 0
                    }
                    if (typeof content === 'string') {
                      to_save.IsObject = false
                    } else if (typeof content === 'object') {
                      to_save.IsObject = true
                      to_save.ObjectType = content.ObjectType
                    }

                    let [last_msg] = yield call(() => CommonDB.Messages
                      .where({ Sour: ob_address, Dest: address })
                      .reverse()
                      .sortBy('Sequence')
                    )
                    const CurrentSession = yield select(state => state.Messenger.CurrentSession)
                    if (last_msg === undefined) {
                      if (json.Sequence === 1 && json.PreHash === GenesisHash) {
                        // first msg, save
                        yield call(() => safeAddItem(CommonDB, 'Messages', 'Hash', to_save))
                        if (CurrentSession && CurrentSession.type === SessionType.Private && CurrentSession.remote === ob_address) {
                          yield call(RefreshPrivateChatMessageList)
                        }
                      } else {
                        // request first msg
                        yield call(RequestChatSync, { payload: { local: address, remote: ob_address } })
                      }
                    } else {
                      // (last_msg !== undefined)
                      if (last_msg.Sequence + 1 === json.Sequence && last_msg.Hash === json.PreHash) {
                        // chained msg, save
                        yield call(() => safeAddItem(CommonDB, 'Messages', 'Hash', to_save))
                        if (CurrentSession && CurrentSession.type === SessionType.Private && CurrentSession.remote === ob_address) {
                          yield call(RefreshPrivateChatMessageList)
                        }
                      } else if (last_msg.Sequence + 1 < json.Sequence) {
                        // unchained msg, request next msg
                        yield call(RequestChatSync, { payload: { local: address, remote: ob_address } })
                      }
                    }
                  }
                }
              } else {
                // sync self message
                let msg_to = yield call(() => CommonDB.Friends
                  .where('[Local+Remote]')
                  .equals([address, json.To])
                  .first())
                if (msg_to !== undefined) {
                  const ecdh_sequence = DHSequence(DefaultPartition, json.Timestamp, address, json.To)
                  let ecdh = yield call(() => CommonDB.ECDHS
                    .where({ SelfAddress: address, PairAddress: json.To, Partition: DefaultPartition, Sequence: ecdh_sequence })
                    .first())
                  if (ecdh === undefined || ecdh.AesKey === undefined) {
                    const ec = new Elliptic.ec('secp256k1')
                    const ecdh_sk = HalfSHA512(PrivateChatECDHString + seed + address + ecdh_sequence)
                    const key_pair = ec.keyFromPrivate(ecdh_sk, 'hex')
                    const ecdh_pk = key_pair.getPublic('hex')
                    const self_json = MG.genFriendECDHRequest(DefaultPartition, ecdh_sequence, ecdh_pk, '', json.To, timestamp)
                    yield call(() => CommonDB.ECDHS.add({
                      SelfAddress: address,
                      PairAddress: json.To,
                      Partition: DefaultPartition,
                      Sequence: ecdh_sequence,
                      // AesKey: aes_key,
                      PrivateKey: ecdh_sk,
                      PublicKey: ecdh_pk,
                      SelfJson: self_json,
                      // PairJson: json
                    }))
                    yield call(SendMessage, { msg: JSON.stringify(self_json) })
                  } else {
                    let content = AesDecrypt(json.Content, ecdh.AesKey)
                    let content_json = deriveJson(content)
                    if (content_json && checkMessageObjectSchema(content_json)) {
                      content = content_json
                    }
                    let hash = QuarterSHA512Message(json)
                    let to_save = {
                      Hash: hash,
                      Sour: address,
                      Dest: json.To,
                      Sequence: json.Sequence,
                      PreHash: json.PreHash,
                      Content: content,
                      SignedAt: json.Timestamp,
                      CreatedAt: timestamp,
                      Json: json,
                      Confirmed: 0,
                      Readed: 0
                    }
                    if (typeof content === 'string') {
                      to_save.IsObject = false
                    } else if (typeof content === 'object') {
                      to_save.IsObject = true
                      to_save.ObjectType = content.ObjectType
                    }

                    let [last_msg] = yield call(() => CommonDB.Messages
                      .where({ Sour: address, Dest: json.To })
                      .reverse()
                      .sortBy('Sequence')
                    )
                    if (last_msg === undefined) {
                      if (json.Sequence === 1 && json.PreHash === GenesisHash) {
                        // first msg, save
                        yield call(() => safeAddItem(CommonDB, 'Messages', 'Hash', to_save))
                      } else {
                        // request first msg
                        yield call(RequestChatSync, { payload: { local: address, remote: json.To } })
                      }
                    } else {
                      // (last_msg !== undefined)
                      if (last_msg.Sequence + 1 === json.Sequence && last_msg.Hash === json.PreHash) {
                        // chained msg, save
                        yield call(() => safeAddItem(CommonDB, 'Messages', 'Hash', to_save))
                      } else if (last_msg.Sequence + 1 < json.Sequence) {
                        // unchained msg, request next msg
                        yield call(RequestChatSync, { payload: { local: address, remote: json.To } })
                      }
                    }
                  }
                }
              }
            }
            break
          case ObjectType.Bulletin:
            if (checkBulletinSchema(json)) {
              let bulletin = yield call(() => CommonDB.Bulletins
                .where({ Address: ob_address, Sequence: json.Sequence })
                .first())
              if (bulletin === undefined) {
                // TODO filter bulletin
                let quote = []
                if (json.Quote) {
                  quote = json.Quote
                }
                let file = []
                if (json.File) {
                  file = json.File
                  for (let i = 0; i < file.length; i++) {
                    const f = file[i]
                    console.log(f)
                    let chunk_length = Math.ceil(f.Size / FileChunkSize)
                    yield call(() => safeAddItem(CommonDB, 'Files', 'Hash', {
                      Hash: f.Hash,
                      Size: f.Size,
                      ChunkLength: chunk_length,
                      ChunkCursor: 0,
                      UpdatedAt: Date.now()
                    }))
                    yield fork(FetchFile, { payload: { hash: f.Hash } })
                  }
                }
                let new_bulletin = {
                  Hash: QuarterSHA512Message(json),
                  Address: ob_address,
                  Sequence: json.Sequence,
                  Content: json.Content,
                  Quote: quote,
                  File: file,
                  Json: json,
                  SignedAt: json.Timestamp,
                  CreatedAt: Date.now(),
                  PreHash: json.PreHash,
                  IsMark: false
                }
                let result = yield call(() => safeAddItem(CommonDB, 'Bulletins', 'Hash', new_bulletin))
                yield put(setRandomBulletin(new_bulletin))
                let bulletin_request = MG.genBulletinRequest(ob_address, json.Sequence + 1, ob_address)
                yield call(SendMessage, { msg: bulletin_request })
              }
            }
            break
          case ObjectType.Avatar:
            if (checkAvatarSchema(json)) {
              let db_avatar = yield call(() => CommonDB.Avatars
                .where('Address')
                .equals(ob_address)
                .first())
              if (db_avatar !== undefined) {
                if (db_avatar.Hash !== json.Hash && db_avatar.UpdatedAt < json.Timestamp) {
                  yield call(() => CommonDB.Avatars
                    .where('Address')
                    .equals(ob_address)
                    .modify(a => {
                      a.Hash = json.Hash
                      a.Size = json.Size
                      a.UpdatedAt = Date.now()
                      a.SignedAt = json.Timestamp
                      a.IsSaved = false
                    }))
                  yield call(RequestAvatarFile, { address: ob_address, hash: json.Hash })
                } else {
                  db_avatar.IsSaved === false
                  yield call(RequestAvatarFile, { address: ob_address, hash: json.Hash })
                }
              } else {
                yield call(() => CommonDB.Avatars.add({
                  Address: ob_address,
                  Hash: json.Hash,
                  Size: json.Size,
                  UpdatedAt: Date.now(),
                  SignedAt: json.Timestamp,
                  IsSaved: false
                }))
                yield call(RequestAvatarFile, { address: ob_address, hash: json.Hash })
              }
            }
            break
          case ObjectType.ChatDH:
            if (checkChatDHSchema(json)) {
              let friend = yield call(() => CommonDB.Friends
                .where('[Local+Remote]')
                .equals([address, ob_address])
                .first())
              console.log(friend)
              if (friend !== undefined) {
                let ecdh = yield call(() => CommonDB.ECDHS
                  .where({ SelfAddress: address, PairAddress: ob_address, Partition: DefaultPartition, Sequence: json.Sequence })
                  .first())
                if (ecdh === undefined) {
                  const ec = new Elliptic.ec('secp256k1')
                  const ecdh_sk = HalfSHA512(PrivateChatECDHString + seed + address + json.Sequence)
                  const self_key_pair = ec.keyFromPrivate(ecdh_sk, 'hex')
                  const ecdh_pk = self_key_pair.getPublic('hex')
                  const self_json = MG.genFriendECDHRequest(DefaultPartition, json.Sequence, ecdh_pk, json.DHPublicKey, ob_address, timestamp)
                  const pair_key_pair = ec.keyFromPublic(json.DHPublicKey, 'hex')
                  const shared_key = self_key_pair.derive(pair_key_pair.getPublic()).toString('hex')
                  const aes_key = genAESKey(shared_key, address, ob_address, json.Sequence)
                  yield call(() => CommonDB.ECDHS.add({
                    SelfAddress: address,
                    PairAddress: ob_address,
                    Partition: DefaultPartition,
                    Sequence: json.Sequence,
                    AesKey: aes_key,
                    PrivateKey: ecdh_sk,
                    PublicKey: ecdh_pk,
                    SelfJson: self_json,
                    PairJson: json
                  }))
                  yield call(SendMessage, { msg: JSON.stringify(self_json) })
                } else {
                  const ec = new Elliptic.ec('secp256k1')
                  const self_key_pair = ec.keyFromPrivate(ecdh.PrivateKey, 'hex')
                  const self_json = MG.genFriendECDHRequest(DefaultPartition, json.Sequence, ecdh.PublicKey, json.DHPublicKey, ob_address, timestamp)
                  const pair_key_pair = ec.keyFromPublic(json.DHPublicKey, 'hex')
                  const shared_key = self_key_pair.derive(pair_key_pair.getPublic()).toString('hex')
                  const aes_key = genAESKey(shared_key, address, ob_address, json.Sequence)
                  yield call(() => CommonDB.ECDHS
                    .where({ SelfAddress: address, PairAddress: ob_address, Partition: DefaultPartition, Sequence: json.Sequence })
                    .modify(tmp => {
                      tmp.AesKey = aes_key
                      tmp.SelfJson = self_json
                      tmp.PairJson = json
                    }))
                  if (json.Pair) {
                  } else {
                    yield call(SendMessage, { msg: JSON.stringify(self_json) })
                  }
                }
              } else {
                // Strangers
                // friend request
                let friend_request = yield call(() => CommonDB.FriendRequests
                  .where('[Local+Remote]')
                  .equals([address, ob_address])
                  .first())
                console.log(friend_request)
                if (friend_request === undefined) {
                  yield call(() => CommonDB.FriendRequests.add({
                    Local: address,
                    Remote: ob_address,
                    UpdatedAt: json.Timestamp
                  }))
                } else {
                  yield call(() => CommonDB.FriendRequests
                    .where('[Local+Remote]')
                    .equals([address, ob_address])
                    .modify(tmp => {
                      tmp.UpdatedAt = tmp.UpdatedAt > json.Timestamp ? tmp.UpdatedAt : json.Timestamp
                    }))
                }
                yield call(LoadFriendRequestList)
              }
            }
            break
          default:
            break
        }
      }
    } else if (action.type === 'FetchFile') {
      console.log(action.payload)
      yield fork(FetchFile, { payload: { hash: action.payload.hash } })
    }
  }
}

let FileRequestList = []
function genFileNonce() {
  let nonce = genNonce()
  for (let i = 0; i < FileRequestList.length; i++) {
    const r = FileRequestList[i];
    if (r.Nonce === nonce) {
      return genFileNonce()
    }
  }
  return nonce
}

function* FetchFile({ payload }) {
  console.log(payload)
  let file = yield call(() => CommonDB.Files
    .where('Hash')
    .equals(payload.hash)
    .first())
  console.log(file)
  if (file !== undefined && file.ChunkCursor < file.ChunkLength) {
    let nonce = genFileNonce()
    let tmp = {
      Type: FileRequestType.File,
      Nonce: nonce,
      Hash: file.Hash,
      ChunkCursor: file.ChunkCursor + 1,
      // Address: address,
      Timestamp: Date.now()
    }
    console.log(tmp)
    let prev_request = FileRequestList.filter(r => r.Hash === file.Hash)
    console.log(prev_request)
    if (prev_request.length === 0) {
      FileRequestList.push(tmp)
      let file_request = MG.genFileRequest(FileRequestType.File, file.Hash, nonce, file.ChunkCursor + 1)
      console.log(prev_request)
      yield call(SendMessage, { msg: file_request })
    }
  }
}

// TODO SlowCompleteFetchFile
export function* SlowCompleteFetchFile() {
  let file = yield call(() => CommonDB.Files
    .where('Hash')
    .equals(payload.Hash)
    .first())
}

export function* ConnectSwitch() {
  try {
    if (switchClient && switchClient.readyState === WebSocket.OPEN) {
      return
    }
    let ChatServer = localStorage.getItem('ChatServer')
    switchClient = new WebSocket(ChatServer)
    switchEventChannel = yield call(createSwitchEventChannel, switchClient)
    yield takeEvery(switchEventChannel, handelMessengerEvent)
  } catch (error) {
    console.log(error)
    yield put(updateMessengerConnStatus(false))
  }
}

export function* DisconnectSwitch() {
  try {
    if (switchClient === null || switchClient.readyState !== WebSocket.OPEN) {
      return
    }
    yield call([switchClient, switchClient.close])
    switchClient = null
    switchEventChannel = null
  } catch (error) {
    console.log(error)
    yield put(updateMessengerConnStatus(false))
  }
}

// avatar
export function* RequestAvatar({ payload }) {
  if (CommonDB === null) {
    yield call(initCommonDB)
  }
  const seed = yield select(state => state.User.Seed)
  if (!seed) {
    MG = null
    return
  }
  if (MG === null) {
    yield call(initMessageGenerator, seed)
  }
  let timestamp = Date.now()
  let avatar = yield call(() => CommonDB.Avatars
    .where('Address')
    .equals(payload.address)
    .first())
  if (avatar === undefined) {
    let avatar_request = MG.genAvatarRequest(payload.address, payload.to)
    yield call(SendMessage, { msg: avatar_request })
  } else if (avatar.UpdatedAt < timestamp - 3600 * 1000) {
    yield call(() => CommonDB.Avatars
      .where('Address')
      .equals(payload.address)
      .modify(a => {
        a.UpdatedAt = timestamp
      }))
    let avatar_request = MG.genAvatarRequest(payload.address, payload.to)
    yield call(SendMessage, { msg: avatar_request })
  }
}

export function* RequestAvatarFile(payload) {
  if (CommonDB === null) {
    yield call(initCommonDB)
  }
  const seed = yield select(state => state.User.Seed)
  if (!seed) {
    MG = null
    return
  }
  if (MG === null) {
    yield call(initMessageGenerator, seed)
  }

  let nonce = genFileNonce()
  let tmp = {
    Type: FileRequestType.Avatar,
    Nonce: nonce,
    Hash: payload.hash,
    Address: payload.address,
    Timestamp: Date.now()
  }
  FileRequestList.push(tmp)

  let avatar_file_request = MG.genFileRequest(FileRequestType.Avatar, payload.hash, nonce, 1)
  yield call(SendMessage, { msg: avatar_file_request })
}

export function* SendAvatarResponse(payload) {
  if (CommonDB === null) {
    yield call(initCommonDB)
  }
  const seed = yield select(state => state.User.Seed)
  const address = yield select(state => state.User.Address)
  if (!seed) {
    MG = null
    return
  }
  if (MG === null) {
    yield call(initMessageGenerator, seed)
  }

  let avatar_json = MG.genAvatarJson(payload.hash, payload.size, payload.timestamp)
  yield call(SendMessage, { msg: JSON.stringify(avatar_json) })
}

// bulletin
function* RequestNextBulletin({ payload }) {
  if (CommonDB === null) {
    yield call(initCommonDB)
  }
  const seed = yield select(state => state.User.Seed)
  if (!seed) {
    MG = null
    return
  }
  if (MG === null) {
    yield call(initMessageGenerator, seed)
  }
  let [bulletin] = yield call(() => CommonDB.Bulletins
    .where('Address')
    .equals(payload.address)
    .reverse()
    .sortBy('Sequence'))
  let request_sequence = 1
  if (bulletin !== undefined) {
    request_sequence = bulletin.Sequence + 1
  }
  let bulletin_request = MG.genBulletinRequest(payload.address, request_sequence, payload.address)
  yield call(SendMessage, { msg: bulletin_request })
}

function* LoadMineBulletin() {
  if (CommonDB === null) {
    yield call(initCommonDB)
  }
  const seed = yield select(state => state.User.Seed)
  const address = yield select(state => state.User.Address)
  if (!seed) {
    MG = null
    return
  }

  let bulletins = yield call(() => CommonDB.Bulletins
    .orderBy('Sequence')
    .reverse()
    .filter(record => record.Address === address)
    .toArray())
  console.log(bulletins)
  if (bulletins.length > 0) {
    yield put(setCurrentBulletinSequence(bulletins[0].Sequence))
  } else {
    yield put(setCurrentBulletinSequence(0))
  }
  yield put(setMineBulletinList(bulletins))
}

function* LoadFollowBulletin() {
  if (CommonDB === null) {
    yield call(initCommonDB)
  }
  const seed = yield select(state => state.User.Seed)
  const address = yield select(state => state.User.Address)
  if (!seed) {
    MG = null
    return
  }

  let follows = yield call(() => CommonDB.Follows
    .where('Local')
    .equals(address)
    .toArray())
  if (follows.length > 0) {
    let follow_address_list = []
    for (let i = 0; i < follows.length; i++) {
      const follow = follows[i]
      follow_address_list.push(follow.Remote)
      yield fork(RequestNextBulletin, { payload: { address: follow.Remote } })
    }

    let bulletins = yield call(() => CommonDB.Bulletins
      .where('Address')
      .anyOf(follow_address_list)
      .sortBy('SignedAt')
    )
    bulletins = bulletins.reverse()
    yield put(setFollowBulletinList(bulletins))
  } else {
    yield put(setFollowBulletinList([]))
  }
}

function* LoadBulletin(action) {
  if (CommonDB === null) {
    yield call(initCommonDB)
  }
  const seed = yield select(state => state.User.Seed)
  if (!seed) {
    MG = null
    return
  }

  let bulletin = yield call(() => CommonDB.Bulletins
    .where('Hash')
    .equals(action.payload.hash)
    .first())
  yield put(setCurrentBulletin(bulletin))
}

function* RequestRandomBulletin() {
  yield put(setRandomBulletin(null))
  const seed = yield select(state => state.User.Seed)
  if (!seed) {
    MG = null
    return
  }
  if (MG === null) {
    yield call(initMessageGenerator, seed)
  }
  let random_bulletin_request = MG.genBulletinRandomRequest()
  yield call(SendMessage, { msg: random_bulletin_request })
}

function* PublishBulletin(action) {
  if (CommonDB === null) {
    yield call(initCommonDB)
  }
  const seed = yield select(state => state.User.Seed)
  const address = yield select(state => state.User.Address)
  const quote = yield select(state => state.Messenger.CurrentQuoteList)
  const file = yield select(state => state.Messenger.CurrentFileList)
  if (!seed) {
    MG = null
    return
  }
  if (MG === null) {
    yield call(initMessageGenerator, seed)
  }
  const last_bulletin = yield call(() => CommonDB.Bulletins
    .where('Address').equals(address)
    .sortBy('Sequence')
    .then(records => records[records.length - 1]))
  let bulletin_json
  let timestamp = Date.now()
  if (last_bulletin === undefined) {
    bulletin_json = MG.genBulletinJson(1, GenesisHash, quote, file, action.payload.content, timestamp)
  } else {
    bulletin_json = MG.genBulletinJson(last_bulletin.Sequence + 1, last_bulletin.Hash, quote, file, action.payload.content, timestamp)
  }
  let new_bulletin = {
    Hash: QuarterSHA512Message(bulletin_json),
    Address: address,
    Sequence: bulletin_json.Sequence,
    Content: bulletin_json.Content,
    Quote: quote,
    File: file,
    Json: bulletin_json,
    SignedAt: timestamp,
    CreatedAt: timestamp,
    PreHash: bulletin_json.PreHash,
    IsMark: false
  }
  let result = yield call(() => CommonDB.Bulletins.add(new_bulletin))
  yield put(setCurrentBulletinSequence(bulletin_json.Sequence))
  yield put(setCurrentQuoteList([]))
  yield put(setCurrentFileList([]))
  yield call(LoadMineBulletin)
  yield call(SendMessage, { msg: JSON.stringify(bulletin_json) })
}

function* BulletinQuoteAdd({ payload }) {
  const old_list = yield select(state => state.Messenger.CurrentQuoteList)
  for (let i = 0; i < old_list.length; i++) {
    const quote = old_list[i]
    if (quote.Hash === payload.Hash) {
      return
    }
  }
  const new_list = [...old_list, payload]
  if (new_list.length > 8) {
    new_list.shift()
  }
  yield put(setCurrentQuoteList(new_list))
}

function* BulletinQuoteDel({ payload }) {
  const old_list = yield select(state => state.Messenger.CurrentQuoteList)
  let new_list = [...old_list]
  new_list = new_list.filter(q => q.Hash != payload.Hash)
  yield put(setCurrentQuoteList(new_list))
}

function* BulletinReply({ payload }) {
  yield call(BulletinQuoteAdd, { payload: payload })
  yield put(setPublishFlag(true))
}

function* BulletinQuote({ payload }) {
  yield call(BulletinQuoteAdd, { payload: payload })
  yield put(setFlashNoticeMessage({ message: 'quote success', duration: 3000 }))
}

function* saveLocalFile(hash, content) {
  const base_dir = yield call(() => path.appLocalDataDir())
  const file_dir = yield call(() => path.join(base_dir, `File`, hash.substring(0, 3), hash.substring(3, 6)))
  yield call(() => mkdir(file_dir, { recursive: true }))
  const save_file_path = yield call(() => path.join(file_dir, hash))
  yield call(() => writeFile(save_file_path, content))
}

function* BulletinFileAdd({ payload }) {
  const file_path = payload.file_path
  const fileNameWithExt = yield call(() => path.basename(file_path))
  const ext = yield call(() => path.extname(fileNameWithExt))
  const name = yield call(() => path.basename(fileNameWithExt, ext))
  const file_info = yield call(() => stat(file_path))
  if (file_info.size > FileMaxSize) {
    yield put(setFlashNoticeMessage({ message: `file size too large(more than ${filesize_format(FileMaxSize)})...`, duration: 3000 }))
  } else {
    const content = yield call(() => readFile(file_path))
    const hash = FileHash(content)

    let chunk_length = Math.ceil(file_info.size / FileChunkSize)
    let file = yield call(() => CommonDB.Files
      .where('Hash')
      .equals(hash)
      .first())
    if (file === undefined) {
      yield call(() => saveLocalFile(hash, content))
      let result = yield call(() => CommonDB.Files.add({
        Hash: hash,
        Size: file_info.size,
        UpdatedAt: Date.now(),
        ChunkLength: chunk_length,
        ChunkCursor: chunk_length
      }))
    } else if (file.ChunkCursor < file.ChunkLength) {
      yield call(() => saveLocalFile(hash, content))
      let updatedCount = yield call(() => CommonDB.Files
        .where('Hash')
        .equals(hash)
        .modify(tmp => {
          tmp.ChunkCursor = chunk_length
          tmp.UpdatedAt = Date.now()
        }))
    } else {
      // file exist
    }

    let new_file = {
      Name: name,
      Ext: ext,
      Size: file_info.size,
      Hash: hash
    }
    const old_list = yield select(state => state.Messenger.CurrentFileList)
    for (let i = 0; i < old_list.length; i++) {
      const file = old_list[i]
      if (file.Hash === new_file.Hash) {
        return
      }
    }
    const new_list = [...old_list, new_file]
    if (new_list.length > 8) {
      new_list.shift()
    }
    yield put(setCurrentFileList(new_list))
  }
}

function* BulletinFileDel({ payload }) {
  const old_list = yield select(state => state.Messenger.CurrentFileList)
  console.log(payload)
  let new_list = [...old_list]
  new_list = new_list.filter(f => f.Hash != payload.Hash)
  yield put(setCurrentFileList(new_list))
}

function* BulletinMarkToggle({ payload }) {
  let updatedCount = yield call(() => CommonDB.Bulletins
    .where('Hash')
    .equals(payload.hash)
    .modify(tmp => {
      tmp.IsMark = !tmp.IsMark
    }))
}

// chat
export function* LoadSessionList() {
  if (CommonDB === null) {
    yield call(initCommonDB)
  }
  const address = yield select(state => state.User.Address)
  if (!address) {
    return
  }
  let friends = yield call(() => CommonDB.Friends
    .where('Local')
    .equals(address)
    .toArray())
  console.log(friends)
  let session_list = []
  for (let i = 0; i < friends.length; i++) {
    const friend = friends[i]
    session_list.push({ type: SessionType.Private, address: friend.Remote, updated_at: Date.now() })
  }
  console.log(session_list)
  yield put(setSessionList(session_list))
}

function* RequestChatSync({ payload }) {
  if (CommonDB === null) {
    yield call(initCommonDB)
  }
  const seed = yield select(state => state.User.Seed)
  if (!seed) {
    MG = null
    return
  }
  if (MG === null) {
    yield call(initMessageGenerator, seed)
  }

  let [current_self_msg] = yield call(() => CommonDB.Messages
    .where({ Sour: payload.local, Dest: payload.remote })
    .reverse()
    .sortBy('Sequence')
  )
  let self_sequence = 0
  if (current_self_msg !== undefined) {
    self_sequence = current_self_msg.Sequence
  }

  let [current_pair_msg] = yield call(() => CommonDB.Messages
    .where({ Sour: payload.remote, Dest: payload.local })
    .reverse()
    .sortBy('Sequence')
  )
  let pair_sequence = 0
  if (current_pair_msg !== undefined) {
    pair_sequence = current_pair_msg.Sequence
  }

  let chat_sync_request = MG.genChatMessageSync(payload.remote, pair_sequence, self_sequence)
  yield call(SendMessage, { msg: chat_sync_request })
}

function* LoadCurrentSession({ payload }) {
  if (CommonDB === null) {
    yield call(initCommonDB)
  }
  const seed = yield select(state => state.User.Seed)
  if (!seed) {
    MG = null
    return
  }
  if (MG === null) {
    yield call(initMessageGenerator, seed)
  }
  let timestamp = Date.now()
  console.log(payload)
  switch (payload.type) {
    case SessionType.Private:
      const self_seed = yield select(state => state.User.Seed)
      const self_address = yield select(state => state.User.Address)
      const pair_address = payload.address
      const ecdh_sequence = DHSequence(DefaultPartition, timestamp, self_address, pair_address)
      let session = { type: SessionType.Private, remote: pair_address, partition_sequence: ecdh_sequence }

      console.log(self_address)
      let ecdh = yield call(() => CommonDB.ECDHS
        .where({ SelfAddress: self_address, PairAddress: pair_address, Partition: DefaultPartition, Sequence: ecdh_sequence })
        .first())
      if (ecdh === undefined) {
        const ec = new Elliptic.ec('secp256k1')
        const ecdh_sk = HalfSHA512(PrivateChatECDHString + self_seed + self_address + ecdh_sequence)
        console.log(ecdh_sk)
        const key_pair = ec.keyFromPrivate(ecdh_sk, 'hex')
        console.log(key_pair)
        const ecdh_pk = key_pair.getPublic('hex')
        let self_json = MG.genFriendECDHRequest(DefaultPartition, ecdh_sequence, ecdh_pk, '', pair_address, timestamp)
        yield call(() => CommonDB.ECDHS.add({
          SelfAddress: self_address,
          PairAddress: pair_address,
          Partition: DefaultPartition,
          Sequence: ecdh_sequence,
          // AesKey:'',
          PrivateKey: ecdh_sk,
          PublicKey: ecdh_pk,
          SelfJson: self_json,
          // PairJson:
        }))
        yield fork(SendMessage, { msg: JSON.stringify(self_json) })
      } else {
        console.log(ecdh)
        if (ecdh.AesKey !== undefined) {
          // aes ready, handsake already done, ready to chat
          session.aes_key = ecdh.AesKey
        } else {
          // my-sk-pk exist, aes not ready
          // send self-not-ready-json
          yield fork(SendMessage, { msg: JSON.stringify(ecdh.SelfJson) })
        }
      }

      let [current_msg] = yield call(() => CommonDB.Messages
        .where({ Sour: self_address, Dest: pair_address })
        .reverse()
        .sortBy('Sequence')
      )
      if (current_msg !== undefined) {
        session.current_sequence = current_msg.Sequence
        session.current_hash = current_msg.Hash
      } else {
        session.current_sequence = 0
        session.current_hash = GenesisHash
      }
      console.log(session)
      yield put(setCurrentSession(session))

      yield call(RefreshPrivateChatMessageList)

      yield call(RequestChatSync, { payload: { local: self_address, remote: pair_address } })
    default:
      break
  }
}

export function* LoadFriendRequestList() {
  const seed = yield select(state => state.User.Seed)
  const address = yield select(state => state.User.Address)
  if (!seed) {
    MG = null
    return
  }
  if (MG === null) {
    yield call(initMessageGenerator, seed)
  }
  if (CommonDB === null) {
    yield call(initCommonDB)
  }
  const friend_request_list = yield call(() => CommonDB.FriendRequests
    .where('Local')
    .equals(address)
    .reverse()
    .sortBy('UpdatedAt'))
  yield put(setFriendRequestList(friend_request_list))
}

function* AcceptFriendRequest({ payload }) {
  console.log(payload)
  if (CommonDB === null) {
    yield call(initCommonDB)
  }
  let contact = yield call(() => CommonDB.Contacts
    .where('Address')
    .equals(payload.remote)
    .first())
  if (contact === undefined) {
    let tmp = {
      Address: payload.remote,
      Nickname: payload.remote,
      UpdatedAt: Date.now()
    }
    yield call(() => safeAddItem(CommonDB, 'Contacts', 'Address', tmp))
  }
  const address = yield select(state => state.User.Address)
  yield call(() => CommonDB.FriendRequests
    .where('[Local+Remote]')
    .equals([address, payload.remote])
    .delete())
  yield call(ContactToggleIsFriend, { payload: { contact_address: payload.remote } })
  yield call(LoadFriendRequestList)
}

// private chat
function* SendContent({ payload }) {
  console.log(payload)
  if (CommonDB === null) {
    yield call(initCommonDB)
  }
  const seed = yield select(state => state.User.Seed)
  if (!seed) {
    MG = null
    return
  }
  if (MG === null) {
    yield call(initMessageGenerator, seed)
  }
  let timestamp = Date.now()
  const self_address = yield select(state => state.User.Address)
  const CurrentSession = yield select(state => state.Messenger.CurrentSession)
  console.log(CurrentSession)
  switch (CurrentSession.type) {
    case SessionType.Private:
      if (CurrentSession.aes_key !== undefined) {
        let content = AesEncrypt(payload.content, CurrentSession.aes_key)

        let last_confirmed_msg = null
        let confirmed_message_list = yield call(() => CommonDB.Messages
          .where({ Sour: CurrentSession.remote, Dest: self_address, Confirmed: 1 })
          .reverse()
          .sortBy('Sequence')
        )
        if (confirmed_message_list.length > 0) {
          last_confirmed_msg = confirmed_message_list[0]
        }

        let confirm_msg = null
        let unconfirm_message_list = yield call(() => CommonDB.Messages
          .where({ Sour: CurrentSession.remote, Dest: self_address, Confirmed: 0 })
          .reverse()
          .sortBy('Sequence')
        )
        console.log(unconfirm_message_list)
        if (unconfirm_message_list.length > 0
          && (last_confirmed_msg === null
            || unconfirm_message_list[0].Sequence > last_confirmed_msg.Sequence)) {
          confirm_msg = {
            Sequence: unconfirm_message_list[0].Sequence,
            Hash: unconfirm_message_list[0].Hash
          }
        }
        console.log(confirm_msg)

        if (confirm_msg !== null) {
          yield call(() => CommonDB.Messages
            .where('Hash')
            .equals(confirm_msg.Hash)
            .modify(tmp => { tmp.Confirmed = 1 }))
        }

        let msg_json = MG.genChatMessage(CurrentSession.current_sequence + 1, CurrentSession.current_hash, confirm_msg, content, CurrentSession.remote, timestamp)
        let hash = QuarterSHA512Message(msg_json)
        console.log(msg_json)
        console.log(hash)

        let to_save = {
          Hash: hash,
          Sour: self_address,
          Dest: CurrentSession.remote,
          Sequence: CurrentSession.current_sequence + 1,
          PreHash: CurrentSession.current_hash,
          Content: payload.content,
          SignedAt: timestamp,
          CreatedAt: timestamp,
          Json: msg_json,
          Confirmed: 0,
          Readed: 1
        }
        if (typeof payload.content === 'string') {
          to_save.IsObject = false
        } else if (typeof payload.content === 'object') {
          to_save.IsObject = true
          to_save.ObjectType = payload.content.ObjectType
        }
        yield call(() => safeAddItem(CommonDB, 'Messages', 'Hash', to_save))

        let tmp_session = { ...CurrentSession }
        tmp_session.current_sequence = CurrentSession.current_sequence + 1
        tmp_session.current_hash = hash
        console.log(tmp_session)
        yield put(setCurrentSession(tmp_session))

        yield call(RefreshPrivateChatMessageList)

        yield call(SendMessage, { msg: JSON.stringify(msg_json) })
      } else {
        ConsoleError('aeskey not ready...')
      }
      break;

    default:
      break;
  }
}

function* RefreshPrivateChatMessageList() {
  const self_address = yield select(state => state.User.Address)
  const CurrentSession = yield select(state => state.Messenger.CurrentSession)
  let current_msg_list = yield call(() => CommonDB.Messages
    .where(['Sour', 'Dest', 'Confirmed'])
    .anyOf([[self_address, CurrentSession.remote, 0],
    [self_address, CurrentSession.remote, 1],
    [CurrentSession.remote, self_address, 0],
    [CurrentSession.remote, self_address, 1]])
    .sortBy('SignedAt'))
  console.log(current_msg_list)
  yield put(setCurrentSessionMessageList(current_msg_list))
}

function* SendFile({ payload }) {
  console.log(payload)
  const self_address = yield select(state => state.User.Address)
  const CurrentSession = yield select(state => state.Messenger.CurrentSession)

  const file_path = payload.file_path
  // console.log(file_path)
  const fileNameWithExt = yield call(() => path.basename(file_path))
  // console.log(fileNameWithExt)
  const ext = yield call(() => path.extname(fileNameWithExt))
  const name = yield call(() => path.basename(fileNameWithExt, ext))
  const file_info = yield call(() => stat(file_path))
  // console.log(file_info)
  if (file_info.size > FileMaxSize) {
    yield put(setFlashNoticeMessage({ message: `file size too large(more than ${filesize_format(FileMaxSize)})...`, duration: 3000 }))
  } else {
    switch (CurrentSession.type) {
      case SessionType.Private:
        const content = yield call(() => readFile(file_path))
        const hash = FileHash(content)
        const ehash = FileEHash(self_address, CurrentSession.remote, hash)
        console.log(hash)
        console.log(ehash)

        let chunk_length = Math.ceil(file_info.size / FileChunkSize)
        let file = yield call(() => CommonDB.Files
          .where('Hash')
          .equals(hash)
          .first())
        if (file === undefined) {
          yield call(() => saveLocalFile(hash, content))
          let result = yield call(() => CommonDB.Files.add({
            Hash: hash,
            Size: file_info.size,
            UpdatedAt: Date.now(),
            ChunkLength: chunk_length,
            ChunkCursor: chunk_length
          }))
        } else if (file.ChunkCursor < file.ChunkLength) {
          yield call(() => saveLocalFile(hash, content))
          let updatedCount = yield call(() => CommonDB.Files
            .where('Hash')
            .equals(hash)
            .modify(tmp => {
              tmp.ChunkCursor = chunk_length
              tmp.UpdatedAt = Date.now()
            }))
        } else {
          // file exist
        }

        let chat_file = yield call(() => CommonDB.ChatFiles
          .where('EHash')
          .equals(ehash)
          .first())
        if (chat_file === undefined) {
          yield call(() => saveLocalFile(hash, content))
          let result = yield call(() => CommonDB.ChatFiles.add({
            EHash: ehash,
            Hash: hash,
            Size: file_info.size,
            Address1: self_address > CurrentSession.remote ? self_address : CurrentSession.remote,
            Address2: self_address > CurrentSession.remote ? CurrentSession.remote : self_address
          }))
        }

        yield call(SendContent, {
          payload: {
            content: {
              ObjectType: MessageObjectType.ChatFile,
              Name: name,
              Ext: ext,
              Size: file_info.size,
              Hash: hash
            }
          }
        })
        break;

      default:
        break;
    }
  }
}

function* FetchChatFile({ payload }) {
  const self_address = yield select(state => state.User.Address)
  const ehash = FileEHash(self_address, payload.remote, payload.hash)
  let chat_file = yield call(() => CommonDB.ChatFiles
    .where('EHash')
    .equals(ehash)
    .first())
  if (chat_file === undefined) {
    let result = yield call(() => CommonDB.ChatFiles.add({
      EHash: ehash,
      Hash: payload.hash,
      Size: payload.size,
      Address1: self_address > payload.remote ? self_address : payload.remote,
      Address2: self_address > payload.remote ? payload.remote : self_address
    }))
  }

  let chunk_length = Math.ceil(payload.size / FileChunkSize)
  let file = yield call(() => CommonDB.Files
    .where('Hash')
    .equals(payload.hash)
    .first())
  if (file === undefined) {
    let result = yield call(() => CommonDB.Files.add({
      Hash: payload.hash,
      Size: payload.size,
      UpdatedAt: Date.now(),
      ChunkLength: chunk_length,
      ChunkCursor: 0
    }))
  }

  file = yield call(() => CommonDB.Files
    .where('Hash')
    .equals(payload.hash)
    .first())
  if (file.ChunkCursor < file.ChunkLength) {
    let timestamp = Date.now()
    const ecdh_sequence = DHSequence(DefaultPartition, timestamp, self_address, payload.remote)
    let ecdh = yield call(() => CommonDB.ECDHS
      .where({ SelfAddress: self_address, PairAddress: payload.remote, Partition: DefaultPartition, Sequence: ecdh_sequence })
      .first())
    console.log(ecdh)
    if (ecdh !== undefined && ecdh.AesKey !== undefined) {
      let nonce = genFileNonce()
      let tmp = {
        Type: FileRequestType.ChatFile,
        Nonce: nonce,
        EHash: ehash,
        Hash: payload.hash,
        Size: payload.size,
        ChunkCursor: file.ChunkCursor + 1,
        Address: payload.remote,
        AesKey: ecdh.AesKey,
        Timestamp: timestamp
      }
      let prev_request = FileRequestList.filter(r => r.EHash === ehash)
      if (prev_request.length === 0) {
        console.log(prev_request)
        console.log(tmp)
        FileRequestList.push(tmp)
        let file_request = MG.genFileRequest(FileRequestType.ChatFile, ehash, nonce, file.ChunkCursor + 1, payload.remote)
        yield call(SendMessage, { msg: file_request })
      }
    }
  } else {
    // file exist
  }
}

function* ShowForwardBulletin({ payload }) {
  yield put(setForwardBulletin(payload))
  yield put(setForwardFlag(true))
}

function* ForwardBulletin({ payload }) {
  yield put(setForwardFlag(false))
  yield call(LoadCurrentSession, { payload: { type: SessionType.Private, address: payload.friend } })
  const forward_bulletin = yield select(state => state.Messenger.ForwardBulletin)
  console.log(forward_bulletin)
  yield call(SendContent, {
    payload: {
      content: forward_bulletin
    }
  })
  yield put(setFlashNoticeMessage({ message: `bulletin forward to ${payload.friend}`, duration: 3000 }))
}

export function* watchMessenger() {
  yield takeEvery('ConnectSwitch', ConnectSwitch)
  yield takeEvery('DisConnectSwitch', DisconnectSwitch)

  yield takeEvery('LoadMineBulletin', LoadMineBulletin)
  yield takeEvery('LoadFollowBulletin', LoadFollowBulletin)
  yield takeLatest('PublishBulletin', PublishBulletin)
  yield takeLatest('LoadBulletin', LoadBulletin)
  yield takeLatest('RequestRandomBulletin', RequestRandomBulletin)

  yield takeLatest('RequestAvatar', RequestAvatar)
  yield takeLatest('RequestAvatarFile', RequestAvatarFile)

  yield takeLatest('FetchFile', FetchFile)

  yield takeLatest('BulletinFileAdd', BulletinFileAdd)
  yield takeLatest('BulletinFileDel', BulletinFileDel)

  yield takeLatest('BulletinQuoteAdd', BulletinQuoteAdd)
  yield takeLatest('BulletinQuoteDel', BulletinQuoteDel)
  yield takeLatest('BulletinReply', BulletinReply)
  yield takeLatest('BulletinQuote', BulletinQuote)

  yield takeLatest('BulletinMarkToggle', BulletinMarkToggle)

  // chat
  yield takeLatest('LoadSessionList', LoadSessionList)
  yield takeLatest('LoadCurrentSession', LoadCurrentSession)
  yield takeLatest('SendContent', SendContent)
  yield takeLatest('SendFile', SendFile)
  yield takeLatest('AcceptFriendRequest', AcceptFriendRequest)
  yield takeLatest('FetchChatFile', FetchChatFile)
  yield takeLatest('ShowForwardBulletin', ShowForwardBulletin)
  yield takeLatest('ForwardBulletin', ForwardBulletin)
}