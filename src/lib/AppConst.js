const WalletPageTab = {
  Account: 'Account',
  Send: 'Send',
  Convert: 'Convert',
  Trade: 'Trade',
  Assets: 'Assets',
  Histroy: 'Histroy',
  Delete: '!!!Delete',
  Redeem: '!!!Redeem'
}

const ConsolePageTab = {
  Play: 'Play',
  Archive: 'Archive',
  Setting: 'Setting',
}

const BulletinPageTab = {
  Follow: 'Follow',
  Mine: 'Mine',
  Random: 'Random',
}

const OpenPageTab = {
  GenNew: 'Generate',
  Temp: 'Temp',
  Saved: 'Saved',
  Add: 'Add',
}

const SettingPageTab = {
  Me: 'Me',
  Contact: 'Contact',
  MessengerNetwork: 'Messenger Network',
}

const CommonDBSchame = {
  Avatars: `Address&, Hash, Size, SignedAt, UpdatedAt, IsSaved, [Hash+IsSaved]`,
  Contacts: `Address&, Nickname, UpdatedAt`,
  Follows: `[Local+Remote]&, Local, Remote, UpdatedAt`,
  Friends: `[Local+Remote]&, Local, Remote, UpdatedAt`,
  LocalAccounts: `Address&, Salt, CipherData, UpdatedAt`,

  Files: `Hash&, Size, UpdatedAt, ChunkLength, ChunkCursor`,

  Bulletins: `Hash&, Address, Sequence, Content, Quote, File, Json, SignedAt, PreHash, NextHash, IsMark, [Address+Sequence]`,

  ECDHS: `[SelfAddress+PairAddress+Partition+Sequence]&, SelfAddress, PairAddress, Partition, Sequence, AesKey, PrivateKey, PublicKey, SelfJson, PairJson`,
  Messages: `Hash&, Sour, Dest, Sequence, PreHash, Content, SignedAt, Json, Confirmed, Readed, IsObject, ObjectType, [Sour+Dest+Confirmed]`,
  ChatFiles: `EHash&, Hash, Size, Address1, Address2`,
  FriendRequests: `[Local+Remote]&, Local, Remote, UpdatedAt`,

  Channels: `Hash&, Name, CreatedBy, Speaker, CreatedAt, CreateJson, DeleteddAt, DeleteJson`,
  ChannelMessages: `Hash&, ChannelHash, Sequence, PreHash, Content, CreatedAt, Json, Confirmed, Readed, IsObject, ObjectType`,

  Groups: `Hash&, Name, CreatedBy, Member, CreatedAt, CreateJson, DeleteddAt, DeleteJson`,
  GroupMessages: `Hash&, GroupHash, Sequence, PreHash, Content, CreatedAt, Json, Confirmed, Readed, IsObject, ObjectType`,
}

export {
  OpenPageTab,
  BulletinPageTab,
  SettingPageTab,
  WalletPageTab,
  ConsolePageTab,
  CommonDBSchame
}