import { createSlice } from '@reduxjs/toolkit'
import { BulletinPageTab } from '../../lib/AppConst'

const MessengerSlice = createSlice({
  name: 'Messenger',
  initialState: {
    message_generator: null,
    MessengerConnStatus: false,

    // bulletin publish
    ShowPublishFlag: false,
    ShowForwardFlag: false,
    ForwardBulletin: null,
    CurrentBulletinSequence: 0,
    CurrentQuoteList: [],
    CurrentFileList: [],

    // bulletin display
    activeTabBulletin: BulletinPageTab.Follow,
    MineBulletinList: [],
    FollowBulletinList: [],
    CurrentBulletin: null,
    RandomBulletin: null,


    // chat
    SessionList: [],
    CurrentSession: null,
    CurrentSessionMessageList: [],
    FriendRequestList: [],
    ComposeMemberList: [],
    ComposeSpeakerList: [],
  },
  reducers: {
    updateMessengerConnStatus: (state, action) => {
      state.MessengerConnStatus = action.payload
    },

    setPublishFlag: (state, action) => {
      state.ShowPublishFlag = action.payload
    },
    setForwardFlag: (state, action) => {
      state.ShowForwardFlag = action.payload
    },
    setForwardBulletin: (state, action) => {
      state.ForwardBulletin = action.payload
    },
    setCurrentBulletinSequence: (state, action) => {
      state.CurrentBulletinSequence = action.payload
    },
    setCurrentQuoteList: (state, action) => {
      state.CurrentQuoteList = action.payload
    },
    setCurrentFileList: (state, action) => {
      state.CurrentFileList = action.payload
    },

    setCurrentBulletin: (state, action) => {
      state.CurrentBulletin = action.payload
    },
    setRandomBulletin: (state, action) => {
      state.RandomBulletin = action.payload
    },
    setMineBulletinList: (state, action) => {
      state.MineBulletinList = action.payload
    },
    setFollowBulletinList: (state, action) => {
      state.FollowBulletinList = action.payload
    },
    setActiveTabBulletin: (state, action) => {
      state.activeTabBulletin = action.payload
    },

    setSessionList: (state, action) => {
      state.SessionList = action.payload
    },
    setCurrentSession: (state, action) => {
      state.CurrentSession = action.payload
    },
    setCurrentSessionMessageList: (state, action) => {
      state.CurrentSessionMessageList = action.payload
    },
    setFriendRequestList: (state, action) => {
      state.FriendRequestList = action.payload
    },
    setComposeMemberList: (state, action) => {
      state.ComposeMemberList = action.payload
    },
    setComposeSpeakerList: (state, action) => {
      state.ComposeSpeakerList = action.payload
    },
  }
})

export const {
  updateMessengerConnStatus,

  setPublishFlag,
  setForwardFlag,
  setForwardBulletin,
  setCurrentBulletinSequence,
  setCurrentQuoteList,
  setCurrentFileList,

  setCurrentBulletin,
  setRandomBulletin,
  setMineBulletinList,
  setFollowBulletinList,
  setActiveTabBulletin,

  setSessionList,
  setCurrentSession,
  setCurrentSessionMessageList,
  setFriendRequestList,
  setComposeMemberList,
  setComposeSpeakerList
} = MessengerSlice.actions
export default MessengerSlice.reducer